import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import { COLUMNS, COLUMN_NAMES } from '../config/columns.js'
import { TAG_ALIASES } from '../config/tagAliases.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = resolve(__dirname, '../blogs')
const OUTPUT_FILE = resolve(__dirname, '../config/content.json')
const COLUMNS_FILE = resolve(__dirname, '../config/columns.json')
const ID_MAP_FILE = resolve(__dirname, '../config/id-map.json')

/**
 * 解析文件顶部的 YAML front matter（--- 包裹的块）
 * 返回 { tag, date, detail, column } 及 front matter 之后的正文
 *
 * 注意：column 等新增字段走 catch-all 分支，无需在此登记。
 */
function parseFrontMatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  const [, frontRaw, body] = match
  const meta = {}

  for (const line of frontRaw.split(/\r?\n/)) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue

    const key = line.slice(0, colonIdx).trim()
    const rawVal = line.slice(colonIdx + 1).trim()

    if (key === 'tag') {
      // 支持 ["a","b"] / ['a','b'] 两种风格，统一用正则提取所有引号内的字符串
      const items = []
      const re = /["']([^"']+)["']/g
      let m
      while ((m = re.exec(rawVal)) !== null) {
        items.push(m[1])
      }
      meta.tag = items
    } else if (key === 'date') {
      // 去掉可能存在的引号，如 '2025-02-16'
      meta.date = rawVal.replace(/^['"]|['"]$/g, '')
    } else {
      // detail / column 等其他字段：仅去掉首尾普通引号（保留反引号内容）
      meta[key] = rawVal.replace(/^['"]|['"]$/g, '')
    }
  }

  return { meta, body }
}

/**
 * 从正文中提取第一段有效文字作为 summary（去除 markdown 语法符号，截取前 120 字符）
 */
function extractSummary(body) {
  const lines = body.split(/\r?\n/)
  for (const line of lines) {
    const stripped = line
      .replace(/^#+\s*/, '') // 去掉标题 #
      .replace(/`[^`]*`/g, '') // 去掉行内代码
      .replace(/\*\*([^*]+)\*\*/g, '$1') // 去掉加粗
      .replace(/\*([^*]+)\*/g, '$1') // 去掉斜体
      .trim()
    if (stripped.length > 10) {
      return stripped.slice(0, 120) + (stripped.length > 120 ? '…' : '')
    }
  }
  return ''
}

/**
 * 读取 id 冻结表。
 * 解析失败时必须中止而不是静默重建——否则会重新分配全部 id，让已发布链接集体错位。
 */
function loadIdMap() {
  if (!existsSync(ID_MAP_FILE)) {
    console.warn('⚠️ 未找到 id-map.json，将首次建立冻结表（此步不可逆，请确认已有提交快照）')
    return {}
  }
  try {
    const parsed = JSON.parse(readFileSync(ID_MAP_FILE, 'utf-8'))
    if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
      throw new Error('顶层结构应为对象')
    }
    return parsed
  } catch (e) {
    console.error(`❌ id-map.json 解析失败：${e.message}`)
    console.error('   已中止生成，避免重新分配 id 导致已发布链接失效。请先修复该文件。')
    process.exit(1)
  }
}

/**
 * 计算本次的文件 → id 映射。
 *
 * 规则（顺序即优先级）：
 *   1. 文件已有映射 → 沿用原 id
 *   2. 映射表中已从目录消失的条目 → 保留，id 永不回收（回收会让旧链接指向无关新文）
 *   3. 新文件 → 分配 max(全部已分配 id) + 1
 *
 * 本函数只决定 id，不决定顺序。日期排序在后续单独进行，二者解耦。
 */
function buildIdMap(filenames, prevMap) {
  const next = {}
  const used = new Set()
  const warnings = []
  const assigned = []

  for (const f of filenames) {
    const id = prevMap[f]
    if (!Number.isInteger(id)) continue
    if (used.has(id)) {
      warnings.push(`id 冲突：${f} 争用已被占用的 id ${id}`)
      continue
    }
    next[f] = id
    used.add(id)
  }

  let maxId = 0
  for (const [f, id] of Object.entries(prevMap)) {
    if (!Number.isInteger(id)) continue
    if (id > maxId) maxId = id
    if (!(f in next)) next[f] = id
  }
  for (const id of Object.values(next)) used.add(id)

  for (const f of filenames) {
    if (f in next) continue
    maxId += 1
    while (used.has(maxId)) maxId += 1
    next[f] = maxId
    used.add(maxId)
    assigned.push({ filename: f, id: maxId })
  }

  return { next, assigned, warnings }
}

/** 按 id 升序重排映射表，保证文件内容稳定、diff 可读 */
function sortIdMap(map) {
  const out = {}
  Object.entries(map)
    .sort((a, b) => a[1] - b[1])
    .forEach(([k, v]) => {
      out[k] = v
    })
  return out
}

/** 仅在内容变化时写盘，避免无意义的时间戳变更与空 diff */
function writeIfChanged(file, data) {
  const next = JSON.stringify(data, null, 2) + '\n'
  if (existsSync(file) && readFileSync(file, 'utf-8') === next) return false
  writeFileSync(file, next, 'utf-8')
  return true
}

function run() {
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))

  if (files.length === 0) {
    console.warn('⚠️ blogs 目录下没有找到任何 .md 文件')
    process.exit(0)
  }

  const prevMap = loadIdMap()
  const { next: idMap, assigned, warnings } = buildIdMap(files, prevMap)

  const result = files.map((filename) => {
    const filePath = resolve(DOCS_DIR, filename)
    const raw = readFileSync(filePath, 'utf-8')
    const { meta, body } = parseFrontMatter(raw)

    const title = basename(filename, '.md')
    const summary = meta.detail || extractSummary(body)

    return {
      id: idMap[filename],
      title,
      date: meta.date || '',
      column: meta.column || '',
      tag: meta.tag || [],
      summary,
      filename
    }
  })

  // 按日期降序（新→旧）；无日期排在最后。
  // 注意：这里只重排数组顺序，绝不重写 id。
  result.sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title, 'zh-CN')
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  writeIfChanged(OUTPUT_FILE, result)
  writeIfChanged(ID_MAP_FILE, sortIdMap(idMap))

  const columnsMeta = COLUMNS.map((c) => ({
    slug: c.slug,
    name: c.name,
    desc: c.desc,
    count: result.filter((p) => p.column === c.name).length
  }))
  writeIfChanged(COLUMNS_FILE, columnsMeta)

  console.log(`✅ 已生成 ${result.length} 条记录 → ${OUTPUT_FILE}`)

  if (assigned.length > 0) {
    console.log(`🆕 本次新分配 id ${assigned.length} 个（其余 id 均未变动）：`)
    assigned.forEach((a) => console.log(`   [${a.id}] ${a.filename}`))
  } else {
    console.log('🔒 id 全部沿用冻结表，无变动')
  }

  warnings.forEach((w) => console.warn(`⚠️ ${w}`))

  // 标签同义词应在 Markdown 源文件里统一，不能只在列表页兼容旧查询参数。
  const legacyTags = result.flatMap((p) =>
    p.tag
      .filter((tag) => Object.hasOwn(TAG_ALIASES, tag))
      .map((tag) => ({ filename: p.filename, tag }))
  )
  if (legacyTags.length > 0) {
    console.warn(`⚠️ ${legacyTags.length} 处使用了已停用的同义标签：`)
    legacyTags.forEach(({ filename, tag }) =>
      console.warn(`   「${tag}」应改为「${TAG_ALIASES[tag]}」← ${filename}`)
    )
  }

  // column 校验：写错字必须报警，否则会静默产生一个没有导航入口的孤儿栏目
  const unknown = result.filter((p) => p.column && !COLUMN_NAMES.includes(p.column))
  if (unknown.length > 0) {
    console.warn(`⚠️ ${unknown.length} 篇的 column 值不在合法栏目表中（会被筛掉）：`)
    unknown.forEach((p) => console.warn(`   「${p.column}」← ${p.filename}`))
    console.warn(`   合法值：${COLUMN_NAMES.join(' / ')}`)
  }

  const missing = result.filter((p) => !p.column)
  if (missing.length > 0) {
    console.warn(`⚠️ ${missing.length} 篇未标注 column（不会出现在任何栏目中）：`)
    missing.slice(0, 5).forEach((p) => console.warn(`   ${p.filename}`))
    if (missing.length > 5) console.warn(`   …… 另有 ${missing.length - 5} 篇`)
  }

  // 栏目的守恒关系：页签计数合计 = 总数 − 未分类。
  // 「未分类」必须把「未填」和「值非法」合并计数——只算未填的话，
  // 把 column 写成错别字时末行仍显示「未分类 0」，看不出已经有文章掉出全部页签。
  const unclassified = missing.length + unknown.length
  const counted = columnsMeta.reduce((sum, c) => sum + c.count, 0)
  console.log(
    `📚 栏目分布：${columnsMeta.map((c) => `${c.name} ${c.count}`).join(' · ')} · 未分类 ${unclassified}`
  )
  if (unclassified > 0) {
    console.log(`   ↳ 未填 ${missing.length} 篇 · 值非法 ${unknown.length} 篇`)
    console.log(`   ↳ 页签计数合计 ${counted} / 总数 ${result.length}`)
  }
}

run()

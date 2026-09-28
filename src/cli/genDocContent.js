import { readdirSync, readFileSync, writeFileSync, existsSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { fileURLToPath } from 'url'
import { COLUMNS, COLUMN_NAMES } from '../config/columns.js'
import { TAG_ALIASES } from '../config/tagAliases.js'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = resolve(__dirname, '../blogs')
const OUTPUT_FILE = resolve(__dirname, '../config/content.json')
const COLUMNS_FILE = resolve(__dirname, '../config/columns.json')

/**
 * 解析文件顶部的 YAML front matter（--- 包裹的块）
 * 返回 front matter 元数据及正文
 *
 * slug、column 等字段走 catch-all 分支。
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

  const result = files.map((filename) => {
    const filePath = resolve(DOCS_DIR, filename)
    const raw = readFileSync(filePath, 'utf-8')
    const { meta, body } = parseFrontMatter(raw)

    const title = basename(filename, '.md')
    const summary = meta.detail || extractSummary(body)

    return {
      slug: meta.slug || '',
      title,
      date: meta.date || '',
      column: meta.column || '',
      tag: meta.tag || [],
      summary,
      filename
    }
  })

  const seenSlugs = new Map()
  const errors = []
  for (const post of result) {
    const slugKey = post.slug.toLowerCase()
    if (!/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(post.slug)) {
      errors.push(`${post.filename}: slug 缺失或格式非法（须以英文字母开头，仅允许小写英文字母、数字和中划线）`)
    } else if (seenSlugs.has(slugKey)) {
      errors.push(`${post.filename}: slug「${post.slug}」与 ${seenSlugs.get(slugKey)} 重复`)
    }
    seenSlugs.set(slugKey, post.filename)

  }
  if (errors.length) {
    errors.forEach((error) => console.error(`❌ ${error}`))
    process.exit(1)
  }

  // 按日期降序（新→旧）；无日期排在最后。
  // 这里只重排数组顺序，不改变文章的 slug。
  result.sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title, 'zh-CN')
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })

  writeIfChanged(OUTPUT_FILE, result)

  const columnsMeta = COLUMNS.map((c) => ({
    slug: c.slug,
    name: c.name,
    desc: c.desc,
    count: result.filter((p) => p.column === c.name).length
  }))
  writeIfChanged(COLUMNS_FILE, columnsMeta)

  console.log(`✅ 已生成 ${result.length} 条记录 → ${OUTPUT_FILE}`)

  console.log('🔒 slug 来自文章 front matter')

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

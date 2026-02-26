import { readdirSync, readFileSync, writeFileSync } from 'fs'
import { resolve, basename, dirname } from 'path'
import { fileURLToPath } from 'url'

const __dirname = dirname(fileURLToPath(import.meta.url))
const DOCS_DIR = resolve(__dirname, '../blogs')
const OUTPUT_FILE = resolve(__dirname, '../config/content.json')

/**
 * 解析文件顶部的 YAML front matter（--- 包裹的块）
 * 返回 { tag, date, detail } 及 front matter 之后的正文
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
      // detail 等其他字段：仅去掉首尾普通引号（保留反引号内容）
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

function run() {
  const files = readdirSync(DOCS_DIR).filter((f) => f.endsWith('.md'))

  if (files.length === 0) {
    console.warn('⚠️  blogs 目录下没有找到任何 .md 文件')
    process.exit(0)
  }

  const result = files.map((filename, index) => {
    const filePath = resolve(DOCS_DIR, filename)
    const raw = readFileSync(filePath, 'utf-8')
    const { meta, body } = parseFrontMatter(raw)

    const title = basename(filename, '.md')
    const summary = meta.detail || extractSummary(body)

    return {
      id: index + 1,
      title,
      date: meta.date || '',
      tag: meta.tag || [],
      summary,
      filename
    }
  })

  writeFileSync(OUTPUT_FILE, JSON.stringify(result, null, 2), 'utf-8')
  console.log(`✅ 已生成 ${result.length} 条记录 → ${OUTPUT_FILE}`)
  result.forEach((item) => console.log(`   [${item.id}] ${item.title}  (${item.date})`))
}

run()

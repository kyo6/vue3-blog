/**
 * 博客栏目（column）定义 —— 唯一事实来源
 *
 * column 是「体裁轴」：按读者拿到这篇要做什么划分，**单选**。
 * tag 是「主题轴」：按内容主题划分，**多选**。
 *
 * 两条轴互不替代。不要用 column 承担主题筛选，也不要为了凑主题新增栏目。
 * 新增/改名栏目只改本文件，其余文件（含 genDocContent.js 的校验）均引用此处。
 *
 * 判据备忘（易混的三类）：
 *   教程     = 有可执行顺序、有前置条件、走完能得到可运行产物
 *   学习笔记 = 提炼出的规则/模板/清单，无执行顺序，查阅用
 *   「如何」二字不是判据，标题带「如何」的文章按上述实质归类。
 *
 * 两次实际归类中沉淀下来的口径（2026-09-26 定，避免以后漂移）：
 *   1. 样式合集 / 可套用速查（CSS 大赏、css 小技巧、Tailwind Docs Layout 等）归【教程】，
 *      即使它没有严格的前置条件和执行顺序——「照抄就能用」在这个博客里算教程。
 *   2. 转述他人的分享 / 对外部项目的横向调研归【技术研究】，不归项目复盘——
 *      项目复盘限定为「我自己做过的事的过程与结论」。
 */
export const COLUMNS = [
  { slug: 'tech', name: '技术研究', desc: '理解机制——读完「懂了」' },
  { slug: 'howto', name: '教程', desc: '照步骤做出来——读完「跑通了」' },
  { slug: 'retro', name: '项目复盘', desc: '看我做过的事的过程与结论' },
  { slug: 'notes', name: '学习笔记', desc: '备查 / 套用——不必通读' },
  { slug: 'translate', name: '译文精选', desc: '读译作' },
  { slug: 'essay', name: '随笔', desc: '读个人观点' }
]

/** 全部合法栏目名，用于 front matter 校验 */
export const COLUMN_NAMES = COLUMNS.map((c) => c.name)

/** 全部合法 slug，用于 URL 查询参数 */
export const COLUMN_SLUGS = COLUMNS.map((c) => c.slug)

/**
 * 校验 front matter 里的 column 值是否合法。
 *
 * 本函数严格全等比较，首尾空格也算不合法；但**生成脚本属于宽松侧**——
 * genDocContent.js 会先 trim 再比对，所以「column: 技术研究 」这种带尾随空格的写法
 * 不会报错。真正需要报警的是错别字（如「技术研发」），那会走到 unknown 分支。
 */
export function isValidColumn(name) {
  return COLUMN_NAMES.includes(name)
}

/** 栏目名 → slug（用于 URL）。未知栏目返回空串，由调用方决定降级策略。 */
export function columnSlug(name) {
  const hit = COLUMNS.find((c) => c.name === name)
  return hit ? hit.slug : ''
}

/** slug → 栏目名。供列表页从 URL 反查。 */
export function columnName(slug) {
  const hit = COLUMNS.find((c) => c.slug === slug)
  return hit ? hit.name : ''
}

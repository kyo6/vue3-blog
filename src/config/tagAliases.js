/** 已停用的同义标签 → 现用标签；兼容旧筛选链接并供内容生成时检查。 */
export const TAG_ALIASES = {
  Skill: 'Skills',
  端到端测试: 'E2E',
  'Web Layout': '布局',
  'AI Coding': 'AI 编程'
}

export function canonicalTag(tag) {
  if (typeof tag !== 'string') return ''
  return Object.hasOwn(TAG_ALIASES, tag) ? TAG_ALIASES[tag] : tag
}

<template>
  <div class="markdown-viewer" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

const props = defineProps({
  markdown: {
    type: String,
    default: ''
  }
})

// HTML 转义函数
const escapeHtml = (str) => {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

// 配置 markdown-it
const md = new MarkdownIt({
  html: true,
  linkify: true,
  typographer: true,
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return (
          '<pre class="hljs"><code>' +
          hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
          '</code></pre>'
        )
      } catch (err) {
        console.error('Error highlighting code:', err)
      }
    }
    return '<pre class="hljs"><code>' + escapeHtml(str) + '</code></pre>'
  }
})

const renderedHtml = computed(() => {
  try {
    if (!props.markdown) {
      console.warn('No markdown content provided')
      return '<p>No content</p>'
    }
    const result = md.render(props.markdown)
    console.log('Markdown rendered successfully, output length:', result.length)
    return result
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return '<p style="color: red;">Error rendering markdown: ' + error.message + '</p>'
  }
})
</script>

<style scoped>
.markdown-viewer {
  font-size: 14px;
  line-height: 1.8;
  color: #333;
}

/* 标题样式 */
.markdown-viewer :deep(h1) {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin: 20px 0 15px 0;
  padding-bottom: 10px;
  border-bottom: 2px solid #6b59e0;
}

.markdown-viewer :deep(h2) {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 18px 0 12px 0;
  padding-bottom: 8px;
  border-bottom: 1px solid #e0e0e0;
}

.markdown-viewer :deep(h3) {
  font-size: 16px;
  font-weight: 600;
  color: #6b59e0;
  margin: 15px 0 10px 0;
}

.markdown-viewer :deep(h4) {
  font-size: 14px;
  font-weight: 600;
  color: #666;
  margin: 12px 0 8px 0;
}

/* 段落和文本 */
.markdown-viewer :deep(p) {
  margin: 10px 0;
  line-height: 1.8;
  color: #666;
}

/* 列表样式 */
.markdown-viewer :deep(ul),
.markdown-viewer :deep(ol) {
  margin: 10px 0;
  padding-left: 25px;
}

.markdown-viewer :deep(li) {
  margin: 5px 0;
  line-height: 1.6;
  color: #666;
}

/* 代码块样式 */
.markdown-viewer :deep(pre) {
  background: #f6f8fa;
  border: 1px solid #e1e4e8;
  border-radius: 6px;
  padding: 16px;
  margin: 15px 0;
  overflow-x: auto;
  font-size: 13px;
  line-height: 1.5;
}

.markdown-viewer :deep(code) {
  font-family: 'Courier New', Consolas, Monaco, monospace;
  font-size: 13px;
}

/* 行内代码 */
.markdown-viewer :deep(p code),
.markdown-viewer :deep(li code) {
  background: #f3f4f6;
  padding: 2px 6px;
  border-radius: 3px;
  color: #d73a49;
  font-size: 0.9em;
}

/* 强调文本 */
.markdown-viewer :deep(strong) {
  font-weight: 600;
  color: #333;
}

.markdown-viewer :deep(em) {
  font-style: italic;
}

/* 分隔线 */
.markdown-viewer :deep(hr) {
  border: none;
  border-top: 2px solid #e0e0e0;
  margin: 20px 0;
}

/* 引用块 */
.markdown-viewer :deep(blockquote) {
  border-left: 4px solid #6b59e0;
  padding-left: 16px;
  margin: 15px 0;
  color: #666;
  font-style: italic;
}

/* 链接 */
.markdown-viewer :deep(a) {
  color: #6b59e0;
  text-decoration: none;
  transition: color 0.2s;
}

.markdown-viewer :deep(a:hover) {
  color: #5648c0;
  text-decoration: underline;
}

/* 表格样式 */
.markdown-viewer :deep(table) {
  border-collapse: collapse;
  width: 100%;
  margin: 15px 0;
}

.markdown-viewer :deep(th),
.markdown-viewer :deep(td) {
  border: 1px solid #e0e0e0;
  padding: 8px 12px;
  text-align: left;
}

.markdown-viewer :deep(th) {
  background: #f6f8fa;
  font-weight: 600;
  color: #333;
}

.markdown-viewer :deep(tr:hover) {
  background: #f9fafb;
}
</style>

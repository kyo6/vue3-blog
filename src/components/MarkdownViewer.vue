<template>
  <div class="markdown-viewer" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import githubCssUrl from 'highlight.js/styles/github.css?url'
import githubDarkCssUrl from 'highlight.js/styles/github-dark.css?url'

let hljsStyleLink = null

const updateHljsTheme = () => {
  const isDark = document.documentElement.classList.contains('dark')
  if (!hljsStyleLink) {
    hljsStyleLink = document.createElement('link')
    hljsStyleLink.rel = 'stylesheet'
    document.head.appendChild(hljsStyleLink)
  }
  hljsStyleLink.href = isDark ? githubDarkCssUrl : githubCssUrl
}

let observer = null

onMounted(() => {
  updateHljsTheme()
  observer = new MutationObserver(updateHljsTheme)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
})

onUnmounted(() => {
  observer?.disconnect()
  hljsStyleLink?.remove()
  hljsStyleLink = null
})

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

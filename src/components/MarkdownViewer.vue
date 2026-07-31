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

<style>
.dark\:prose-dark:is(.dark *) {
  .markdown-viewer {
    color: inherit;
    :not(pre) code {
      background: #0f172a;
    }

    li::before {
      background-color: #c9d1d9;
    }

    strong {
      color: inherit;
    }
  }
}
.markdown-viewer {
  color: #1a1a1a;
  /* 标题层级强化 */
  h1 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 700;
    font-size: 2rem;
    line-height: 1.2;
    margin-bottom: 0.5em;
    color: #000;
    letter-spacing: -0.02em;
  }

  .meta {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 0.9rem;
    color: var(--text-muted);
    margin-bottom: 3em;
  }

  h2 {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-weight: 700;
    font-size: 1.4rem;
    margin-top: 2.5em;
    margin-bottom: 1em;
    color: #000;
    /* 极简分割线，替代沉重的 border */
    position: relative;
  }

  h2::after {
    content: '';
    display: block;
    width: 40px;
    height: 2px;
    background-color: #ddd;
    margin-top: 12px;
  }

  p {
    margin-bottom: 2em;
    line-height: 1.8em;
    font-size: 1.1rem;
  }

  li::before {
    width: 0.3em;
    height: 0.3em;
    left: 16px;
    background-color: #0f172abd;
  }

  *:not(pre) code {
    color: #0119a8;
    background: #f0f4f8;
    border-radius: 2px;
    padding: 2px 5px;
  }

  *:not(pre) code {
    &::before {
      content: '';
    }
    &::after {
      content: '';
    }
  }
}
</style>

<template>
  <div class="markdown-viewer" v-html="renderedHtml"></div>
</template>

<script setup>
import { computed, watch, onMounted, onUnmounted } from 'vue'
import MarkdownIt from 'markdown-it'
import anchor from 'markdown-it-anchor'
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

const emit = defineEmits(['headings'])

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

md.use(anchor, {
  level: [2, 3, 4],
  permalink: false
})

// 在 anchor 插件之后收集标题，供大纲使用
md.core.ruler.after('anchor', 'collect_headings', (state) => {
  const headings = []
  const tokens = state.tokens
  for (let i = 0; i < tokens.length; i++) {
    const token = tokens[i]
    if (token.type === 'heading_open' && ['h2', 'h3', 'h4'].includes(token.tag)) {
      const id = token.attrGet('id')
      const inline = tokens[i + 1]
      if (id && inline?.type === 'inline') {
        headings.push({
          level: parseInt(token.tag[1]),
          text: inline.content,
          id
        })
      }
    }
  }
  state.env.headings = headings
})

/** GitHub Pages 等子路径部署时，根路径资源需拼接 BASE_URL（与 works/detail 一致） */
const resolvePublicUrl = (url) => {
  if (!url) return url
  const trimmed = url.trim()
  if (
    /^(https?:|data:|blob:|mailto:|tel:)/i.test(trimmed) ||
    trimmed.startsWith('#') ||
    trimmed.startsWith('//')
  ) {
    return trimmed
  }
  const base = import.meta.env.BASE_URL || '/'
  if (trimmed.startsWith(base)) return trimmed
  if (trimmed.startsWith('/')) return `${base}${trimmed.slice(1)}`
  return trimmed
}

const rewritePublicUrls = (html) => {
  // 保留代码块原样，避免把示例路径也改成带 base 的地址
  const placeholders = []
  const withoutPre = html.replace(/<pre[\s\S]*?<\/pre>/gi, (block) => {
    const key = `\u0000PRE${placeholders.length}\u0000`
    placeholders.push(block)
    return key
  })

  let out = withoutPre.replace(/\b(src|href)=(["'])([^"']*)\2/gi, (_, attr, quote, url) => {
    return `${attr}=${quote}${resolvePublicUrl(url)}${quote}`
  })
  out = out.replace(/url\((['"]?)([^'")]+)\1\)/gi, (_, quote, url) => {
    const resolved = resolvePublicUrl(url)
    return quote ? `url(${quote}${resolved}${quote})` : `url(${resolved})`
  })

  return out.replace(/\u0000PRE(\d+)\u0000/g, (_, i) => placeholders[Number(i)])
}

const renderResult = computed(() => {
  try {
    if (!props.markdown) {
      return { html: '<p>No content</p>', headings: [] }
    }
    const env = {}
    const html = rewritePublicUrls(md.render(props.markdown, env))
    return { html, headings: env.headings || [] }
  } catch (error) {
    console.error('Error rendering markdown:', error)
    return {
      html: '<p style="color: red;">Error rendering markdown: ' + error.message + '</p>',
      headings: []
    }
  }
})

const renderedHtml = computed(() => renderResult.value.html)

watch(
  () => renderResult.value.headings,
  (headings) => emit('headings', headings),
  { immediate: true }
)
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
    color: inherit;
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

  .illustration {
    background: #fff;
    border: 1px solid #f0f0f0;
    border-radius: 4px;
    flex-direction: column;
    align-items: center;
    margin: 2.5em 0;
    padding: 1.5rem;
    display: flex;
    box-shadow: 0 1px 3px #0000000d;
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

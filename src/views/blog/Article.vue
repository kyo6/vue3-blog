<script setup>
import { ref, computed, watch, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import content from '@/config/content.json'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

const route = useRoute()
const router = useRouter()

const blogPost = ref(null)
const markdownContent = ref('')
const loading = ref(true)
const error = ref(null)

// Vite 构建时批量导入 docs 目录下所有 md 文件的原始内容
const docModules = import.meta.glob('../../blogs/*.md', { query: '?raw', import: 'default' })

// 上一篇 / 下一篇
const currentIndex = computed(() => content.findIndex((p) => p.id === parseInt(route.params.id)))
const prevPost = computed(() => (currentIndex.value > 0 ? content[currentIndex.value - 1] : null))
const nextPost = computed(() =>
  currentIndex.value < content.length - 1 ? content[currentIndex.value + 1] : null
)

// 去除 YAML front matter（--- 包裹的块）
function stripFrontMatter(raw) {
  return raw.replace(/^---[\s\S]*?---\r?\n?/, '').trimStart()
}

async function loadArticle(id) {
  loading.value = true
  error.value = null
  markdownContent.value = ''

  const post = content.find((p) => p.id === parseInt(id))
  blogPost.value = post

  if (!post) {
    error.value = '文章不存在'
    loading.value = false
    return
  }

  const matchKey = Object.keys(docModules).find((key) => key.endsWith('/' + post.filename))

  if (!matchKey) {
    error.value = `找不到文件：${post.filename}`
    loading.value = false
    return
  }

  try {
    const raw = await docModules[matchKey]()
    markdownContent.value = stripFrontMatter(raw)
  } catch (e) {
    error.value = '加载文章失败：' + e.message
  } finally {
    loading.value = false
  }
}

// 路由 id 变化时重新加载（上一篇/下一篇切换场景）
watch(
  () => route.params.id,
  (id) => {
    loadArticle(id)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }
)

onMounted(() => loadArticle(route.params.id))
</script>

<template>
  <div class="max-w-3xl mx-auto px-6 py-10">
    <!-- 返回按钮 -->
    <button
      class="flex items-center gap-1 mb-8 text-sm text-violet-600 hover:text-violet-800 dark:text-violet-400 dark:hover:text-violet-200 transition-colors"
      @click="router.back()"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        class="w-4 h-4"
        viewBox="0 0 20 20"
        fill="currentColor"
      >
        <path
          fill-rule="evenodd"
          d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
          clip-rule="evenodd"
        />
      </svg>
      返回列表
    </button>

    <!-- 加载中 -->
    <div v-if="loading" class="flex justify-center py-20">
      <div
        class="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"
      ></div>
    </div>

    <!-- 错误提示 -->
    <div v-else-if="error" class="text-center py-20 text-gray-500 dark:text-gray-400">
      <p class="text-lg">{{ error }}</p>
    </div>

    <!-- 文章内容 -->
    <template v-else-if="blogPost">
      <!-- 文章头部 -->
      <header class="mb-8 pb-6 border-b border-gray-200 dark:border-gray-700">
        <div class="flex flex-wrap gap-2 mb-3">
          <span
            v-for="tag in blogPost.tag"
            :key="tag"
            class="px-2 py-0.5 text-xs font-semibold rounded bg-violet-100 text-violet-700 dark:bg-violet-900 dark:text-violet-300"
          >
            {{ tag }}
          </span>
        </div>
        <h1 class="text-3xl font-bold text-gray-900 dark:text-white mb-3">
          {{ blogPost.title }}
        </h1>
        <time class="text-sm text-gray-500 dark:text-gray-400">{{ blogPost.date }}</time>
      </header>

      <!-- Markdown 正文 -->
      <div class="prose prose-slate dark:prose-dark max-w-none prose-headings:scroll-mt-20">
        <MarkdownViewer :markdown="markdownContent" />
      </div>

      <!-- 上一篇 / 下一篇 -->
      <nav class="mt-12 pt-6 border-t border-gray-200 dark:border-gray-700 grid grid-cols-2 gap-4">
        <router-link
          v-if="prevPost"
          :to="{ name: 'blog-article', params: { id: prevPost.id } }"
          class="group flex flex-col gap-1 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
        >
          <span
            class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 group-hover:text-violet-500 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                clip-rule="evenodd"
              />
            </svg>
            Previous
          </span>
          <span
            class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 line-clamp-2 transition-colors"
          >
            {{ prevPost.title }}
          </span>
        </router-link>
        <div v-else></div>

        <router-link
          v-if="nextPost"
          :to="{ name: 'blog-article', params: { id: nextPost.id } }"
          class="group flex flex-col items-end gap-1 p-4 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-violet-400 dark:hover:border-violet-500 transition-colors"
        >
          <span
            class="flex items-center gap-1 text-xs text-gray-400 dark:text-gray-500 group-hover:text-violet-500 transition-colors"
          >
            Next
            <svg
              xmlns="http://www.w3.org/2000/svg"
              class="w-3.5 h-3.5"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fill-rule="evenodd"
                d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
          </span>
          <span
            class="text-sm font-medium text-gray-700 dark:text-gray-300 group-hover:text-violet-600 dark:group-hover:text-violet-400 text-right line-clamp-2 transition-colors"
          >
            {{ nextPost.title }}
          </span>
        </router-link>
        <div v-else></div>
      </nav>
    </template>
  </div>
</template>

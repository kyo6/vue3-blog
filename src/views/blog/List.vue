<script setup>
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import content from '@/config/content.json'
import columnsMeta from '@/config/columns.json'
import { columnName } from '@/config/columns.js'
import { canonicalTag } from '@/config/tagAliases.js'

const route = useRoute()
const router = useRouter()
const showMoreTags = ref(false)
const tagSearch = ref('')
const featuredTagLimit = 8

/** 按日期降序；无日期排最后（与 genDocContent 一致） */
function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title, 'zh-CN')
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
}

const activeColumn = computed(() =>
  typeof route.query.column === 'string' ? route.query.column : ''
)
const activeTag = computed(() => canonicalTag(route.query.tag))
const isFiltered = computed(() => Boolean(activeColumn.value || activeTag.value))
const totalCount = computed(() => content.length)
const activeColumnName = computed(() => columnName(activeColumn.value) || activeColumn.value)

/** 每一轴的选项显示另一轴约束后的篇数，方便判断下一步筛选结果。 */
const postsForTag = computed(() =>
  activeTag.value ? content.filter((p) => p.tag.includes(activeTag.value)) : content
)
const postsForColumn = computed(() => {
  if (!activeColumn.value) return content
  const name = columnName(activeColumn.value)
  return name ? content.filter((p) => p.column === name) : []
})
const columnOptions = computed(() =>
  columnsMeta.map((col) => ({
    ...col,
    count: activeTag.value
      ? postsForTag.value.filter((p) => p.column === col.name).length
      : col.count
  }))
)
const tagOptions = computed(() => {
  const counts = new Map()
  for (const post of postsForColumn.value) {
    for (const tag of post.tag) counts.set(tag, (counts.get(tag) || 0) + 1)
  }
  return [...counts]
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, 'zh-CN'))
})
const featuredTags = computed(() => {
  const featured = tagOptions.value.slice(0, featuredTagLimit)
  if (activeTag.value && !featured.some((tag) => tag.name === activeTag.value)) {
    featured.push({
      name: activeTag.value,
      count: tagOptions.value.find((tag) => tag.name === activeTag.value)?.count || 0
    })
  }
  return featured
})
const searchedTags = computed(() => {
  const term = tagSearch.value.trim().toLocaleLowerCase()
  return term
    ? tagOptions.value.filter((tag) => tag.name.toLocaleLowerCase().includes(term))
    : tagOptions.value
})
const blogPosts = computed(() =>
  sortByDateDesc(
    postsForColumn.value.filter((p) => !activeTag.value || p.tag.includes(activeTag.value))
  )
)

watch(activeColumn, () => {
  tagSearch.value = ''
})

/** 同步筛选到 URL query；目标与当前一致时不重复导航 */
function setQuery(key, value) {
  if ((value || '') === (route.query[key] || '')) return
  const query = { ...route.query }
  if (value) query[key] = value
  else delete query[key]
  router.push({ query })
}

function selectColumn(slug) {
  setQuery('column', slug)
}

/** 再次点击同一标签 = 取消该标签筛选 */
function selectTag(tag) {
  setQuery('tag', tag === activeTag.value ? '' : tag)
}

function clearFilters() {
  if (!isFiltered.value) return
  const query = { ...route.query }
  delete query.column
  delete query.tag
  router.push({ query })
}
</script>

<template>
  <div
    class="container max-w-6xl px-4 pt-8 pb-10 mx-auto sm:px-8 lg:grid lg:grid-cols-[15rem_minmax(0,1fr)] lg:items-start lg:gap-8 lg:px-10 xl:gap-10"
  >
    <aside
      class="space-y-5 lg:sticky lg:top-20 lg:max-h-[calc(100vh-6rem)] lg:overflow-y-auto lg:pr-2"
      aria-label="文章筛选"
    >
      <div>
        <p class="mb-2 text-xs font-medium text-gray-500 dark:text-gray-400">按阅读目的 · 栏目</p>
        <nav
          class="flex gap-2 overflow-x-auto pb-1 lg:flex-col lg:overflow-visible"
          aria-label="栏目筛选"
        >
          <button
            type="button"
            class="shrink-0 px-3 py-1 text-sm rounded-full border transition-colors lg:flex lg:w-full lg:items-center lg:justify-between lg:rounded-lg lg:py-2"
            :class="
              !activeColumn
                ? 'border-violet-500 bg-violet-500 text-white'
                : 'border-gray-200 text-gray-600 hover:border-violet-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-500'
            "
            :aria-pressed="!activeColumn"
            @click="selectColumn('')"
          >
            全部
            <span class="ml-1 text-xs opacity-70">{{ postsForTag.length }}</span>
          </button>

          <button
            v-for="col in columnOptions"
            :key="col.slug"
            type="button"
            class="shrink-0 px-3 py-1 text-sm rounded-full border transition-colors lg:flex lg:w-full lg:items-center lg:justify-between lg:rounded-lg lg:py-2"
            :class="
              activeColumn === col.slug
                ? 'border-violet-500 bg-violet-500 text-white'
                : 'border-gray-200 text-gray-600 hover:border-violet-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-500'
            "
            :aria-pressed="activeColumn === col.slug"
            :title="col.desc"
            @click="selectColumn(col.slug)"
          >
            {{ col.name }}
            <span class="ml-1 text-xs opacity-70">{{ col.count }}</span>
          </button>
        </nav>
      </div>

      <div>
        <div class="flex items-center justify-between gap-4 mb-2">
          <p class="text-xs font-medium text-gray-500 dark:text-gray-400">按内容主题 · 标签</p>
          <button
            v-if="tagOptions.length > featuredTagLimit"
            type="button"
            class="text-xs text-violet-600 hover:underline dark:text-violet-400"
            :aria-expanded="showMoreTags"
            aria-controls="all-blog-tags"
            @click="showMoreTags = !showMoreTags"
          >
            {{ showMoreTags ? '收起主题' : '更多主题' }}
          </button>
        </div>
        <nav class="flex flex-wrap gap-2" aria-label="主题筛选">
          <button
            type="button"
            class="px-2.5 py-1 text-sm rounded border transition-colors"
            :class="
              !activeTag
                ? 'border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-200'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-violet-300 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300'
            "
            :aria-pressed="!activeTag"
            @click="setQuery('tag', '')"
          >
            全部主题 <span class="text-xs opacity-70">{{ postsForColumn.length }}</span>
          </button>
          <button
            v-for="tag in featuredTags"
            :key="tag.name"
            type="button"
            class="px-2.5 py-1 text-sm rounded border transition-colors"
            :class="
              activeTag === tag.name
                ? 'border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-200'
                : 'border-gray-200 bg-gray-50 text-gray-600 hover:border-violet-300 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300'
            "
            :aria-pressed="activeTag === tag.name"
            @click="selectTag(tag.name)"
          >
            {{ tag.name }} <span class="text-xs opacity-70">{{ tag.count }}</span>
          </button>
        </nav>

        <div
          v-show="showMoreTags && tagOptions.length > featuredTagLimit"
          id="all-blog-tags"
          class="mt-3 p-3 rounded-lg border border-gray-200 dark:border-gray-700"
        >
          <label for="blog-tag-search" class="sr-only">搜索主题</label>
          <input
            id="blog-tag-search"
            v-model="tagSearch"
            type="search"
            placeholder="搜索主题"
            class="w-full px-3 py-2 text-sm rounded border border-gray-200 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-violet-400 dark:border-gray-700 dark:bg-slate-900 dark:text-gray-100"
          />
          <nav class="flex flex-wrap gap-2 mt-3 max-h-64 overflow-y-auto" aria-label="全部主题">
            <button
              v-for="tag in searchedTags"
              :key="tag.name"
              type="button"
              class="px-2 py-1 text-xs rounded border transition-colors"
              :class="
                activeTag === tag.name
                  ? 'border-violet-300 bg-violet-100 text-violet-700 dark:border-violet-500/50 dark:bg-violet-500/20 dark:text-violet-200'
                  : 'border-gray-200 text-gray-600 hover:border-violet-300 dark:border-gray-700 dark:text-gray-300'
              "
              :aria-pressed="activeTag === tag.name"
              @click="selectTag(tag.name)"
            >
              {{ tag.name }} <span class="opacity-70">{{ tag.count }}</span>
            </button>
            <p v-if="searchedTags.length === 0" class="text-sm text-gray-500 dark:text-gray-400">
              没有匹配的主题
            </p>
          </nav>
        </div>
      </div>
    </aside>

    <main class="min-w-0 mt-6 space-y-6 lg:mt-0">
      <!-- 筛选状态 -->
      <div
        v-if="isFiltered"
        class="flex flex-wrap items-center gap-2 text-sm text-gray-500 dark:text-gray-400"
      >
        <span>筛选结果</span>
        <button
          v-if="activeColumn"
          type="button"
          class="px-2 py-1 rounded bg-violet-50 text-violet-700 hover:bg-violet-100 dark:bg-violet-500/15 dark:text-violet-300"
          :aria-label="`移除栏目筛选：${activeColumnName}`"
          @click="selectColumn('')"
        >
          栏目：{{ activeColumnName }} <span aria-hidden="true">×</span>
        </button>
        <button
          v-if="activeTag"
          type="button"
          class="px-2 py-1 rounded bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-slate-800 dark:text-gray-200"
          :aria-label="`移除主题筛选：${activeTag}`"
          @click="setQuery('tag', '')"
        >
          主题：{{ activeTag }} <span aria-hidden="true">×</span>
        </button>
        <strong class="font-medium text-gray-700 dark:text-gray-200"
          >· {{ blogPosts.length }} 篇</strong
        >
        <button type="button" class="text-violet-500 hover:underline" @click="clearFilters">
          清除全部
        </button>
      </div>

      <div
        v-for="post in blogPosts"
        :key="post.slug"
        class="px-4 py-6 rounded-lg shadow-sm dark:bg-slate-900 sm:px-8"
      >
        <div class="flex items-center justify-between">
          <span class="text-sm dark:text-gray-500">{{ post.date || '未标注日期' }}</span>
          <span v-if="post.column" class="text-xs text-gray-400 dark:text-gray-600">
            {{ post.column }}
          </span>
        </div>
        <div class="mt-3">
          <router-link
            :to="{ name: 'blog-article', params: { slug: post.slug } }"
            class="text-2xl font-bold hover:underline text-gray-900 dark:text-gray-200"
          >
            {{ post.title }}
          </router-link>
          <p class="mt-2">
            {{ post.summary }}
          </p>
        </div>
        <div class="flex items-center justify-between mt-4">
          <div class="flex flex-wrap gap-2">
            <button
              v-for="t in post.tag"
              :key="t"
              type="button"
              class="px-2 py-1 text-xs font-bold rounded transition-colors"
              :class="
                activeTag === t
                  ? 'bg-violet-500 text-white'
                  : 'text-gray-500 hover:text-violet-500 dark:text-gray-500 dark:hover:text-violet-400'
              "
              @click="selectTag(t)"
            >
              {{ t }}
            </button>
          </div>
          <router-link
            :to="{ name: 'blog-article', params: { slug: post.slug } }"
            class="hover:underline dark:text-gray-500"
          >
            Read more
          </router-link>
        </div>
      </div>

      <!-- 空状态 -->
      <div
        v-if="blogPosts.length === 0"
        class="px-4 py-20 text-center text-gray-500 dark:text-gray-400 sm:px-8"
      >
        <p class="text-lg">这个筛选下还没有文章</p>
        <button
          v-if="isFiltered"
          type="button"
          class="mt-3 text-sm text-violet-500 hover:underline"
          @click="clearFilters"
        >
          查看全部 {{ totalCount }} 篇
        </button>
      </div>
    </main>
  </div>
</template>

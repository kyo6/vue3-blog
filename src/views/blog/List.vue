<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import content from '@/config/content.json'
import columnsMeta from '@/config/columns.json'
import { columnName } from '@/config/columns.js'
import { canonicalTag } from '@/config/tagAliases.js'

const route = useRoute()
const router = useRouter()

/** 按日期降序；无日期排最后（与 genDocContent 一致） */
function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title, 'zh-CN')
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
}

const activeColumn = computed(() => route.query.column || '')
const activeTag = computed(() => canonicalTag(route.query.tag))
const isFiltered = computed(() => Boolean(activeColumn.value || activeTag.value))
const totalCount = computed(() => content.length)

/**
 * 双轴筛选：column（体裁，单选）在前，tag（主题，多选）在后。
 * 两者相互独立，不互相限制可选项——计数始终显示全局值。
 */
const blogPosts = computed(() => {
  let posts = sortByDateDesc(content)

  if (activeColumn.value) {
    const name = columnName(activeColumn.value)
    // slug 非法时得到空集，交给空状态兜底，而不是静默退回「显示全部」
    posts = name ? posts.filter((p) => p.column === name) : []
  }

  if (activeTag.value) {
    posts = posts.filter((p) => p.tag.includes(activeTag.value))
  }

  return posts
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
  router.push({ query: {} })
}
</script>

<template>
  <div class="space-y-6">
    <!-- 栏目页签：体裁轴 -->
    <nav
      class="container max-w-4xl px-10 pt-8 mx-auto flex flex-wrap items-center gap-2"
      aria-label="栏目筛选"
    >
      <button
        type="button"
        class="px-3 py-1 text-sm rounded-full border transition-colors"
        :class="
          !activeColumn
            ? 'border-violet-500 bg-violet-500 text-white'
            : 'border-gray-200 text-gray-600 hover:border-violet-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-500'
        "
        @click="selectColumn('')"
      >
        全部
        <span class="ml-1 text-xs opacity-70">{{ totalCount }}</span>
      </button>

      <button
        v-for="col in columnsMeta"
        :key="col.slug"
        type="button"
        class="px-3 py-1 text-sm rounded-full border transition-colors"
        :class="
          activeColumn === col.slug
            ? 'border-violet-500 bg-violet-500 text-white'
            : 'border-gray-200 text-gray-600 hover:border-violet-400 dark:border-gray-700 dark:text-gray-400 dark:hover:border-violet-500'
        "
        :title="col.desc"
        @click="selectColumn(col.slug)"
      >
        {{ col.name }}
        <span class="ml-1 text-xs opacity-70">{{ col.count }}</span>
      </button>
    </nav>

    <!-- 筛选状态 -->
    <div
      v-if="isFiltered"
      class="container max-w-4xl px-10 mx-auto text-sm text-gray-500 dark:text-gray-400"
    >
      筛选出 {{ blogPosts.length }} 篇
      <button type="button" class="ml-2 text-violet-500 hover:underline" @click="clearFilters">
        清除筛选
      </button>
    </div>

    <div
      v-for="post in blogPosts"
      :key="post.id"
      class="container max-w-4xl px-10 py-6 mx-auto rounded-lg shadow-sm dark:bg-slate-900"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm dark:text-gray-500">{{ post.date || '未标注日期' }}</span>
        <span v-if="post.column" class="text-xs text-gray-400 dark:text-gray-600">
          {{ post.column }}
        </span>
      </div>
      <div class="mt-3">
        <router-link
          :to="{ name: 'blog-article', params: { id: post.id } }"
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
          :to="{ name: 'blog-article', params: { id: post.id } }"
          class="hover:underline dark:text-gray-500"
        >
          Read more
        </router-link>
      </div>
    </div>

    <!-- 空状态 -->
    <div
      v-if="blogPosts.length === 0"
      class="container max-w-4xl px-10 py-20 mx-auto text-center text-gray-500 dark:text-gray-400"
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
  </div>
</template>

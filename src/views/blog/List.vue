<script setup>
import { computed } from 'vue'
import content from '@/config/content.json'

/** 按日期降序；无日期排最后（与 genDocContent 一致） */
function sortByDateDesc(posts) {
  return [...posts].sort((a, b) => {
    if (!a.date && !b.date) return a.title.localeCompare(b.title, 'zh-CN')
    if (!a.date) return 1
    if (!b.date) return -1
    return b.date.localeCompare(a.date)
  })
}

const blogPosts = computed(() => sortByDateDesc(content))
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="post in blogPosts"
      :key="post.id"
      class="container max-w-4xl px-10 py-6 mx-auto rounded-lg shadow-sm dark:bg-slate-900"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm dark:text-gray-500">{{ post.date || '未标注日期' }}</span>
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
        <a
          rel="noopener noreferrer"
          href="#"
          class="px-2 py-1 font-bold rounded dark:text-gray-500"
          >{{ post.tag.join(', ') }}</a
        >
        <router-link
          :to="{ name: 'blog-article', params: { id: post.id } }"
          class="hover:underline dark:text-gray-500"
        >
          Read more
        </router-link>
      </div>
    </div>
  </div>
</template>

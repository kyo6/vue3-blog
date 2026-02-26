<script setup>
import { ref } from 'vue'
import content from '@/config/content.json'

// Mock 数据
const blogPosts = ref(content)
</script>

<template>
  <div class="space-y-6">
    <div
      v-for="post in blogPosts"
      :key="post.id"
      class="container max-w-4xl px-10 py-6 mx-auto rounded-lg shadow-sm dark:bg-slate-900"
    >
      <div class="flex items-center justify-between">
        <span class="text-sm dark:text-gray-600">{{ post.date }}</span>
        <a
          rel="noopener noreferrer"
          href="#"
          class="px-2 py-1 font-bold rounded dark:bg-violet-600 dark:text-gray-50"
          >{{ post.tag.join(', ') }}</a
        >
      </div>
      <div class="mt-3">
        <router-link
          :to="{ name: 'blog-article', params: { id: post.id } }"
          class="text-2xl font-bold hover:underline"
        >
          {{ post.title }}
        </router-link>
        <p class="mt-2">
          {{ post.summary }}
        </p>
      </div>
      <div class="flex items-center justify-between mt-4">
        <router-link
          :to="{ name: 'blog-article', params: { id: post.id } }"
          class="hover:underline dark:text-violet-600"
        >
          Read more
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, defineAsyncComponent } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import works from '@/config/works.json'

const route = useRoute()
const vueModules = import.meta.glob('./components/*.vue')

const item = computed(() => works.find((w) => w.id === route.params.id))

const VueWork = computed(() => {
  if (!item.value || item.value.type !== 'vue') return null
  const path = `./components/${item.value.component}.vue`
  const loader = vueModules[path]
  if (!loader) return null
  return defineAsyncComponent(loader)
})
</script>

<template>
  <div v-if="!item" class="min-h-[calc(100vh-4rem)] bg-[#14181f] px-6 py-20 text-center">
    <p class="text-[#9a958c] mb-4">未找到该作品</p>
    <RouterLink to="/works" class="text-[#c48c62] hover:underline">返回作品列表</RouterLink>
  </div>

  <div v-else class="works-detail min-h-[calc(100vh-4rem)] bg-[#14181f]">
    <div
      class="sticky top-[var(--header-offset,4rem)] z-20 flex items-center justify-between gap-4 px-4 md:px-6 py-3 border-b border-[rgba(196,140,98,0.2)] bg-[#14181f]/95 backdrop-blur"
    >
      <div class="min-w-0">
        <RouterLink to="/works" class="text-sm text-[#9a958c] hover:text-[#d9a57a]">
          ← 作品
        </RouterLink>
        <h1 class="text-base md:text-lg font-semibold text-[#f3f0ea] truncate mt-0.5">
          {{ item.title }}
        </h1>
      </div>
      <span class="shrink-0 text-xs px-2 py-1 rounded-md bg-[#1a2029] text-[#9a958c] border border-[rgba(196,140,98,0.2)]">
        {{ item.stack }}
      </span>
    </div>

    <!-- iframe 全屏嵌入 HTML -->
    <div v-if="item.type === 'iframe'" class="works-iframe-wrap">
      <iframe :src="item.src" :title="item.title" class="works-iframe" />
    </div>

    <!-- Vue 作品组件 -->
    <div v-else-if="item.type === 'vue' && VueWork" class="works-vue-wrap">
      <component :is="VueWork" />
    </div>

    <!-- 外链 -->
    <div v-else-if="item.type === 'link'" class="max-w-xl mx-auto px-6 py-20 text-center">
      <p class="text-slate-600 dark:text-slate-300 mb-6">{{ item.summary }}</p>
      <a
        :href="item.src"
        target="_blank"
        rel="noopener noreferrer"
        class="inline-flex items-center gap-1 text-sky-500 hover:underline"
      >
        {{ item.linkLabel || '访问网站' }} ↗
      </a>
    </div>

    <div v-else class="max-w-xl mx-auto px-6 py-20 text-center text-slate-500">
      无法加载该作品
    </div>
  </div>
</template>

<style scoped>
.works-iframe-wrap {
  height: calc(100vh - 8rem);
  min-height: 480px;
}

.works-iframe {
  width: 100%;
  height: 100%;
  border: 0;
  display: block;
  background: #f3f4f6;
}

.works-vue-wrap {
  min-height: calc(100vh - 8rem);
}
</style>

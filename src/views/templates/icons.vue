<template>
  <div class="p-6">
    <!-- Header -->
    <div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
      <div>
        <h2 class="text-xl font-semibold text-gray-900 dark:text-white">项目中使用的图标</h2>
        <p class="text-sm text-gray-500 dark:text-gray-400">支持响应式网格布局、预览与一键复制类名</p>
      </div>
      <div class="flex items-center gap-2 flex-wrap">
        <input
          v-model="searchKeyword"
          class="w-56 border border-gray-200 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="搜索名称或类名..."
        />
        <select
          v-model="iconColor"
          class="border border-gray-200 dark:border-slate-600 rounded px-3 py-2 text-sm bg-white dark:bg-slate-800 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="text-blue-500">蓝色</option>
          <option value="text-green-500">绿色</option>
          <option value="text-yellow-500">黄色</option>
          <option value="text-purple-500">紫色</option>
          <option value="text-slate-500">灰色</option>
        </select>
        <a
          href="https://fontawesome.com/icons"
          target="_blank"
          rel="noreferrer"
          class="px-3 py-2 text-sm border border-gray-200 dark:border-slate-600 rounded hover:bg-gray-50 dark:hover:bg-slate-700 text-gray-700 dark:text-gray-300 transition-colors"
        >
          FA 文档
        </a>
      </div>
    </div>

    <!-- Stats -->
    <p class="text-xs text-gray-400 dark:text-gray-500 mb-4">
      共 {{ filteredIcons.length }} / {{ iconsData.length }} 个图标
    </p>

    <!-- Grid -->
    <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      <div
        v-for="icon in filteredIcons"
        :key="icon.class + icon.name"
        class="group relative border border-gray-200 dark:border-slate-700 rounded-lg p-4 bg-white dark:bg-slate-800 hover:shadow-md dark:hover:shadow-slate-900/50 transition-shadow"
      >
        <!-- Copy button -->
        <button
          class="absolute top-3 right-3 px-2 py-1 text-xs rounded transition-all"
          :class="
            copiedClass === icon.class + icon.name
              ? 'opacity-100 bg-green-600 text-white'
              : 'opacity-0 group-hover:opacity-100 bg-gray-800 dark:bg-slate-600 text-white'
          "
          @click="copyClass(icon.class, icon.name)"
        >
          {{ copiedClass === icon.class + icon.name ? '已复制' : '复制' }}
        </button>

        <!-- Icon + name -->
        <div class="flex items-center space-x-3">
          <div
            class="w-12 h-12 shrink-0 rounded-lg bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/30 dark:to-purple-900/30 flex items-center justify-center"
          >
            <i :class="[icon.class, 'text-2xl', iconColor]"></i>
          </div>
          <div class="min-w-0">
            <div class="text-xs text-gray-400 dark:text-gray-500">名称</div>
            <div class="font-medium text-sm text-gray-900 dark:text-white truncate">
              {{ icon.name }}
            </div>
            <div class="text-xs text-gray-400 dark:text-gray-500 truncate font-mono">
              {{ icon.class }}
            </div>
          </div>
        </div>

        <!-- Usage -->
        <div class="mt-3">
          <div class="text-xs text-gray-400 dark:text-gray-500 mb-1">使用场景</div>
          <ul class="text-xs text-gray-500 dark:text-gray-400 list-disc list-inside space-y-0.5">
            <li v-for="(use, i) in parseUsage(icon.usage)" :key="i">{{ use }}</li>
          </ul>
        </div>
      </div>
    </div>

    <!-- Empty state -->
    <div
      v-if="filteredIcons.length === 0"
      class="text-center py-16 text-gray-400 dark:text-gray-500"
    >
      没有找到匹配的图标
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import iconsData from '@/config/icons.json'

const searchKeyword = ref('')
const iconColor = ref('text-blue-500')
const copiedClass = ref('')

const filteredIcons = computed(() => {
  const kw = searchKeyword.value.trim().toLowerCase()
  if (!kw) return iconsData
  return iconsData.filter(
    (icon) =>
      icon.name.toLowerCase().includes(kw) ||
      icon.class.toLowerCase().includes(kw) ||
      (icon.usage || '').toLowerCase().includes(kw),
  )
})

function parseUsage(usage) {
  return (usage || '通用图标')
    .split(/[,，、]/)
    .map((s) => s.trim())
    .filter(Boolean)
}

async function copyClass(cls, name) {
  try {
    await navigator.clipboard.writeText(cls)
    copiedClass.value = cls + name
    setTimeout(() => {
      copiedClass.value = ''
    }, 1200)
  } catch {
    alert('复制失败，请手动复制: ' + cls)
  }
}
</script>

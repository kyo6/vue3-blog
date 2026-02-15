<template>
  <div class="min-h-screen pt-16 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
    <!-- Hero Section: Redesigned for better theme adaptation and conciseness -->
    <header class="relative py-12 md:py-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
      <!-- Decorative background elements -->
      <div class="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-40 dark:opacity-20">
        <div class="absolute -top-1/2 -left-1/4 w-full h-full bg-gradient-to-br from-indigo-100 to-transparent dark:from-indigo-900/30 rounded-full blur-3xl"></div>
        <div class="absolute -bottom-1/2 -right-1/4 w-full h-full bg-gradient-to-tl from-purple-100 to-transparent dark:from-purple-900/30 rounded-full blur-3xl"></div>
      </div>

      <div class="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-bold uppercase tracking-wider mb-6 border border-indigo-100 dark:border-indigo-800">
          <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-indigo-500"></span>
          </span>
          CSS Animation Analysis
        </div>
        <h1 class="text-3xl md:text-4xl lg:text-5xl font-extrabold text-slate-900 dark:text-white mb-4 tracking-tight">
          CSS 动画实现原理
        </h1>
        <p class="text-base md:text-lg text-slate-600 dark:text-slate-400 max-w-2xl mx-auto font-normal leading-relaxed">
          深度解析 CSS 动画的工作机制，从层叠样式表到浏览器的渲染流水线，带你领略 Web 动画的艺术。
        </p>
      </div>
    </header>

    <!-- Main Content Container: Top-Bottom Layout -->
    <main class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-20">
      <!-- Showcase Card -->
      <section class="bg-white dark:bg-slate-800 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-none overflow-hidden border border-slate-200 dark:border-slate-700">
        <!-- Card Header -->
        <div class="px-6 py-3 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between bg-slate-50/50 dark:bg-slate-800/50">
          <div class="flex items-center gap-2">
            <div class="w-3 h-3 rounded-full bg-red-400/80"></div>
            <div class="w-3 h-3 rounded-full bg-yellow-400/80"></div>
            <div class="w-3 h-3 rounded-full bg-green-400/80"></div>
            <span class="ml-2 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-widest font-mono">Live Demo</span>
          </div>
        </div>

        <div class="flex flex-col">
          <!-- Preview Area: Now at the top for immediate visibility -->
          <div class="p-10 md:p-16 flex items-center justify-center bg-white dark:bg-slate-900/20 border-b border-slate-100 dark:border-slate-700 min-h-[360px]">
            <div class="relative group scale-110 md:scale-125">
              <div class="absolute -inset-6 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-2xl blur-xl opacity-0 group-hover:opacity-100 transition duration-1000"></div>
              <div class="relative z-10 transition-transform duration-500 group-hover:scale-105">
                <Day1 />
              </div>
            </div>
          </div>

          <!-- Analysis Content Area: Below the preview -->
          <div class="p-8 md:p-12">
            <div class="mb-8 flex items-center gap-3">
              <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-600 dark:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20 dark:shadow-indigo-500/10">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h2 class="text-2xl font-bold text-slate-800 dark:text-slate-100">实现原理分析</h2>
            </div>
            
            <div class="prose prose-slate dark:prose-invert max-w-none">
              <MarkdownViewer :markdown="mdContent" class="custom-markdown" />
            </div>
          </div>
        </div>
      </section>

      <!-- Bottom Navigation or Info (Concise) -->
      <footer class="mt-12 text-center text-slate-400 dark:text-slate-600 text-sm">
        <p>&copy; 2026 CSS Challenge Analysis. Built with Vue 3 & Tailwind CSS.</p>
      </footer>
    </main>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import demoMd from '@/docs/demo.md?raw'
import Day1 from '@/components/100days/day1/index.vue'

const mdContent = ref(demoMd)
</script>

<style scoped>
/* 深度自定义 MarkdownViewer 样式以适配暗黑模式 */
.custom-markdown :deep(.markdown-viewer) {
  color: inherit !important;
}

.custom-markdown :deep(p), 
.custom-markdown :deep(li),
.custom-markdown :deep(blockquote) {
  @apply text-slate-600 dark:text-slate-400 text-base leading-relaxed mb-4;
}

.custom-markdown :deep(h1),
.custom-markdown :deep(h2),
.custom-markdown :deep(h3),
.custom-markdown :deep(h4),
.custom-markdown :deep(strong) {
  @apply text-slate-800 dark:text-slate-100 font-bold border-slate-200 dark:border-slate-700 mt-8 mb-4;
}

.custom-markdown :deep(pre) {
  @apply bg-slate-900 border-slate-800 text-slate-300 shadow-xl rounded-xl p-6 my-6 overflow-x-auto;
}

.custom-markdown :deep(code) {
  @apply font-mono text-sm;
}

.custom-markdown :deep(p code),
.custom-markdown :deep(li code) {
  @apply bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 border-none px-1.5 py-0.5 rounded font-medium;
}

.custom-markdown :deep(a) {
  @apply text-indigo-500 hover:text-indigo-600 dark:text-indigo-400 dark:hover:text-indigo-300 underline underline-offset-4 decoration-2 decoration-indigo-500/30;
}

.custom-markdown :deep(blockquote) {
  @apply border-l-4 border-indigo-500 dark:border-indigo-400 pl-6 py-2 italic bg-indigo-50/30 dark:bg-indigo-900/10 rounded-r-lg;
}
</style>

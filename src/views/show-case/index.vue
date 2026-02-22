<template>
  <div
    class="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden font-sans text-slate-900 dark:text-slate-100"
  >
    <!-- Sidebar -->
    <aside
      class="w-72 flex-shrink-0 bg-white dark:bg-slate-800 border-r border-slate-200 dark:border-slate-700 flex flex-col transition-colors duration-300"
    >
      <div
        class="p-6 border-b border-slate-200 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/50"
      >
        <h1
          class="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-500 to-purple-500"
        >
          CSS Challenge
        </h1>
        <p class="text-xs text-slate-500 dark:text-slate-400 mt-1">100 Days of CSS & Vue</p>
      </div>

      <div class="flex-1 overflow-y-auto py-4 px-3 space-y-1 custom-scrollbar">
        <button
          v-for="(item, index) in menuData"
          :key="index"
          @click="activeIndex = index"
          class="w-full text-left px-4 py-3 rounded-lg text-sm transition-all duration-200 group relative overflow-hidden"
          :class="
            activeIndex === index
              ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 shadow-sm ring-1 ring-indigo-200 dark:ring-indigo-700'
              : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700/50 hover:text-slate-900 dark:hover:text-slate-200'
          "
        >
          <div class="flex justify-between items-center mb-1">
            <span class="font-medium truncate">{{ item.name }}</span>
            <span
              v-if="activeIndex === index"
              class="h-1.5 w-1.5 rounded-full bg-indigo-500"
            ></span>
          </div>
          <p
            class="text-xs opacity-70 truncate"
            :class="
              activeIndex === index
                ? 'text-indigo-500/80 dark:text-indigo-400/70'
                : 'text-slate-400 dark:text-slate-500'
            "
          >
            {{ item.tag || 'CSS' }}
          </p>
        </button>
      </div>

      <div
        class="p-4 border-t border-slate-200 dark:border-slate-700 text-center text-xs text-slate-400 dark:text-slate-500"
      >
        {{ menuData.length }} components loaded
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 flex flex-col h-full overflow-hidden relative">
      <!-- Top Bar / Header -->
      <header
        class="h-16 flex items-center justify-between px-8 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-b border-slate-200 dark:border-slate-800 z-10 sticky top-0"
      >
        <div>
          <h2 class="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
            {{ currentItem.name }}
            <span
              class="px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-900/50 text-indigo-600 dark:text-indigo-400 text-xs font-mono font-normal"
            >
              {{ currentItem.path }}
            </span>
          </h2>
        </div>
        <!-- Right side tools (optional) -->
        <div class="flex items-center gap-2 text-sm text-slate-500">
          <!-- Placeholder for tools -->
        </div>
      </header>

      <!-- Scrollable Content Area -->
      <div class="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
        <div class="max-w-5xl mx-auto space-y-8 pb-20">
          <!-- Demo Preview Section -->
          <section
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
          >
            <div
              class="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between"
            >
              <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider"
                >Preview</span
              >
              <div class="flex gap-1.5">
                <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
                <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600"></div>
              </div>
            </div>
            <!-- Centered Component Container -->
            <div
              class="p-8 md:p-12 min-h-[400px] flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjAzLDIxMywyMjcsMC40KSIvPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"
            >
              <div
                class="relative z-10 transform transition-transform duration-500 hover:scale-[1.02]"
              >
                <Transition name="fade" mode="out-in">
                  <component :is="AsyncDemoComponent" :key="activeIndex" />
                </Transition>
              </div>
            </div>
          </section>

          <!-- Documentation Section -->
          <section
            v-if="mdContent"
            class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden p-8 md:p-10"
          >
            <div
              class="flex items-center gap-3 mb-8 pb-4 border-b border-slate-100 dark:border-slate-700"
            >
              <div
                class="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  class="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    stroke-width="2"
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 class="text-xl font-bold text-slate-800 dark:text-slate-100">
                Implementation Details
              </h3>
            </div>

            <div class="prose prose-slate dark:prose-dark max-w-none prose-headings:scroll-mt-20">
              <MarkdownViewer :markdown="mdContent" class="custom-markdown1" />
            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, defineAsyncComponent, shallowRef, watchEffect } from 'vue'
import menuData from '@/components/100days/menu.json'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

// Import all potential demo components and docs dynamically
// Using /src/ prefix to match absolute paths mapped from @/
const demoModules = import.meta.glob('/src/components/100days/**/index.vue')
const docModules = import.meta.glob('/src/components/100days/**/*.md', {
  query: '?raw',
  import: 'default'
})

const activeIndex = ref(0)
const currentItem = computed(() => menuData[activeIndex.value] || {})

// Helper to resolve path from menu (@/...) to glob keys (/src/...)
const resolvePath = (path) => {
  if (!path) return ''
  return path.replace('@/', '/src/')
}

const AsyncDemoComponent = computed(() => {
  if (!currentItem.value.demo) return null

  const path = resolvePath(currentItem.value.demo)
  const loader = demoModules[path]

  if (!loader) {
    console.warn(`Component not found for path: ${path}`)
    // Return a placeholder or error component if needed
    return null
  }

  return defineAsyncComponent({
    loader: loader,
    loadingComponent: {
      template:
        '<div class="animate-pulse flex space-x-4"><div class="h-12 w-12 bg-slate-200 rounded-full"></div><div class="space-y-4 py-1 flex-1"><div class="h-4 bg-slate-200 rounded w-3/4"></div><div class="h-4 bg-slate-200 rounded"></div></div></div>'
    },
    errorComponent: {
      template:
        '<div class="text-red-500 p-4 border border-red-200 rounded bg-red-50">Error loading component</div>'
    }
  })
})

const mdContent = shallowRef('')

watchEffect(async () => {
  if (!currentItem.value.doc) {
    mdContent.value = ''
    return
  }

  const path = resolvePath(currentItem.value.doc)
  const loader = docModules[path]

  if (loader) {
    try {
      mdContent.value = await loader()
    } catch (e) {
      console.error('Failed to load markdown:', e)
      mdContent.value = '> **Error**: Failed to load documentation.'
    }
  } else {
    mdContent.value = ''
  }
})
</script>

<style scoped>
/* Custom Scrollbar for Sidebar and Main Content */
.custom-scrollbar::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

.custom-scrollbar::-webkit-scrollbar-track {
  background: transparent;
}

.custom-scrollbar::-webkit-scrollbar-thumb {
  @apply bg-slate-300 dark:bg-slate-600 rounded-full;
}

.custom-scrollbar::-webkit-scrollbar-thumb:hover {
  @apply bg-slate-400 dark:bg-slate-500;
}

/* Transition for fade effect */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Markdown Customization (Inherited from previous design but refined) */
.custom-markdown :deep(.markdown-viewer) {
  color: inherit !important;
}

.custom-markdown :deep(pre) {
  @apply bg-slate-900 border border-slate-800 text-slate-300 shadow-lg rounded-xl p-5 my-6 overflow-x-auto text-sm;
}

.custom-markdown :deep(code) {
  @apply font-mono text-sm bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-indigo-600 dark:text-indigo-400;
}

.custom-markdown :deep(pre code) {
  @apply bg-transparent text-inherit p-0 border-none;
}

.custom-markdown :deep(a) {
  @apply text-indigo-600 dark:text-indigo-400 hover:underline;
}

.custom-markdown :deep(blockquote) {
  @apply border-l-4 border-indigo-500 pl-4 py-1 italic text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/50 rounded-r;
}
</style>

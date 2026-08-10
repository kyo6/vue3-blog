<script setup>
import { computed, defineAsyncComponent, shallowRef, watchEffect } from 'vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'

const props = defineProps({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  /** glob 键，如 /src/components/100days/day1/index.vue */
  demoPath: { type: String, required: true },
  /** glob 键，如 /src/components/100days/day1/doc.md */
  docPath: { type: String, default: '' }
})

const demoModules = import.meta.glob('/src/components/100days/**/index.vue')
const docModules = import.meta.glob('/src/components/100days/**/*.md', {
  query: '?raw',
  import: 'default'
})

const DemoComponent = computed(() => {
  const loader = demoModules[props.demoPath]
  if (!loader) {
    console.warn(`Demo not found: ${props.demoPath}`)
    return null
  }
  return defineAsyncComponent({
    loader,
    loadingComponent: {
      template:
        '<div class="animate-pulse h-24 w-48 bg-slate-200 dark:bg-slate-700 rounded"></div>'
    },
    errorComponent: {
      template:
        '<div class="text-red-500 text-sm p-4 border border-red-200 rounded">Error loading demo</div>'
    }
  })
})

const mdContent = shallowRef('')

watchEffect(async () => {
  if (!props.docPath) {
    mdContent.value = ''
    return
  }
  const loader = docModules[props.docPath]
  if (!loader) {
    mdContent.value = ''
    return
  }
  try {
    mdContent.value = await loader()
  } catch (e) {
    console.error('Failed to load markdown:', e)
    mdContent.value = '> **Error**: Failed to load documentation.'
  }
})
</script>

<template>
  <div class="space-y-8 pb-10">
    <header>
      <h1 class="text-2xl font-bold text-slate-900 dark:text-white">{{ title }}</h1>
      <p v-if="description" class="mt-2 text-sm text-slate-500 dark:text-slate-400">
        {{ description }}
      </p>
    </header>

    <section
      class="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden"
    >
      <div
        class="px-4 py-2 bg-slate-50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-700 flex items-center justify-between"
      >
        <span class="text-xs font-semibold text-slate-500 uppercase tracking-wider">Preview</span>
        <div class="flex gap-1.5">
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
          <div class="w-2.5 h-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>
      </div>
      <div
        class="p-8 md:p-12 min-h-[320px] flex items-center justify-center bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjAzLDIxMywyMjcsMC40KSIvPjwvc3ZnPg==')] dark:bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAiIGhlaWdodD0iMjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGNpcmNsZSBjeD0iMSIgY3k9IjEiIHI9IjEiIGZpbGw9InJnYmEoMjU1LDI1NSwyNTUsMC4wNSkiLz48L3N2Zz4=')]"
      >
        <component :is="DemoComponent" v-if="DemoComponent" />
      </div>
    </section>

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
        <h2 class="text-xl font-bold text-slate-800 dark:text-slate-100">Implementation Details</h2>
      </div>
      <div class="prose prose-slate dark:prose-dark max-w-none prose-headings:scroll-mt-20">
        <MarkdownViewer :markdown="mdContent" />
      </div>
    </section>
  </div>
</template>

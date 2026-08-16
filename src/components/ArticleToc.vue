<script setup>
import { computed } from 'vue'
import { useScrollSpy } from '@/composables/useScrollSpy'

const props = defineProps({
  headings: {
    type: Array,
    default: () => []
  }
})

const headingIds = computed(() => props.headings.map((h) => h.id))
const { activeId } = useScrollSpy(headingIds)

function indentClass(level) {
  if (level === 3) return 'pl-3'
  if (level >= 4) return 'pl-6'
  return ''
}

function scrollTo(id) {
  const el = document.getElementById(id)
  if (el) {
    el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    history.replaceState(null, '', `#${id}`)
  }
}
</script>

<template>
  <aside aria-label="本页大纲">
    <nav
      class="sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-lg border border-gray-200/60 dark:border-gray-700/60 bg-gray-50/50 dark:bg-gray-900/30 p-4 pointer-events-auto"
    >
      <p class="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-3">
        本页大纲
      </p>
      <ul class="space-y-1.5 text-sm">
        <li v-for="heading in headings" :key="heading.id" :class="indentClass(heading.level)">
          <a
            :href="`#${heading.id}`"
            class="block py-0.5 pl-2 border-l-2 transition-colors leading-snug outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 rounded-r"
            :class="
              activeId === heading.id
                ? 'border-gray-500 text-gray-600 dark:text-gray-300 font-medium'
                : 'border-transparent text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:border-gray-300 dark:hover:border-gray-600'
            "
            @click.prevent="scrollTo(heading.id)"
          >
            {{ heading.text }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

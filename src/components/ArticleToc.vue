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
      class="art-toc sticky top-20 max-h-[calc(100vh-5rem)] overflow-y-auto rounded-lg border p-4 pointer-events-auto"
    >
      <p class="art-toc-title text-xs font-semibold uppercase tracking-wider mb-3">本页大纲</p>
      <ul class="space-y-1.5 text-sm">
        <li v-for="heading in headings" :key="heading.id" :class="indentClass(heading.level)">
          <a
            :href="`#${heading.id}`"
            class="block py-0.5 pl-2 border-l-2 transition-colors leading-snug outline-none focus-visible:ring-2 focus-visible:ring-violet-500/50 rounded-r"
            :class="activeId === heading.id ? 'art-toc-active' : 'art-toc-idle'"
            @click.prevent="scrollTo(heading.id)"
          >
            {{ heading.text }}
          </a>
        </li>
      </ul>
    </nav>
  </aside>
</template>

import { ref, watch, onUnmounted } from 'vue'

/**
 * 监听标题元素的可见性，返回当前激活的 heading id
 * @param {import('vue').Ref<string[]>} headingIds
 */
export function useScrollSpy(headingIds) {
  const activeId = ref('')
  let observer = null

  const observe = (ids) => {
    observer?.disconnect()
    observer = null
    activeId.value = ''

    if (!ids.length) return

    observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)
        if (visible.length) {
          activeId.value = visible[0].target.id
        }
      },
      { rootMargin: '-80px 0px -60% 0px', threshold: 0 }
    )

    ids.forEach((id) => {
      const el = document.getElementById(id)
      if (el) observer.observe(el)
    })
  }

  watch(headingIds, (ids) => observe(ids), { immediate: true })

  onUnmounted(() => observer?.disconnect())

  return { activeId }
}

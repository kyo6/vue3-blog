import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

function update() {
  const isDark =
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    // 如果是暗色模式，给 HTML 根元素 (<html>) 添加 dark 和 changing-theme 类。
    document.documentElement.classList.add('dark', 'changing-theme')
    // 适配移动端浏览器 UI 的颜色，如 Chrome 的地址栏的颜色
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#0B1120')
  } else {
    document.documentElement.classList.remove('dark', 'changing-theme')
    // 适配移动端浏览器 UI 的颜色，如 Chrome 的地址栏的颜色
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#f8fafc')
  }
  window.setTimeout(() => {
    document.documentElement.classList.remove('changing-theme')
  })
}

export const useThemeStore = defineStore('theme', () => {
  const setting = ref(null)

  function setSetting(value) {
    setting.value = value
  }

  function initFromStorage() {
    const theme = localStorage.theme
    if (theme === 'light' || theme === 'dark') {
      setSetting(theme)
    } else {
      setSetting('system')
    }
  }

  watch(
    setting,
    (newVal) => {
      if (!newVal) return
      if (newVal === 'system') {
        localStorage.removeItem('theme')
      } else if (newVal === 'light' || newVal === 'dark') {
        localStorage.theme = newVal
      }
      update()
    },
    { immediate: true }
  )

  function setupListeners() {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    if (mediaQuery?.addEventListener) {
      mediaQuery.addEventListener('change', update)
    } else {
      mediaQuery.addListener(update)
    }

    function onStorage() {
      update()
      const theme = localStorage.theme
      if (theme === 'light' || theme === 'dark') {
        setSetting(theme)
      } else {
        setSetting('system')
      }
    }
    window.addEventListener('storage', onStorage)

    return () => {
      if (mediaQuery?.removeEventListener) {
        mediaQuery.removeEventListener('change', update)
      } else {
        mediaQuery.removeListener(update)
      }
      window.removeEventListener('storage', onStorage)
    }
  }

  return {
    setting,
    setSetting,
    initFromStorage,
    setupListeners,
    update
  }
})

export const THEME_SETTINGS = [
  { value: 'light', label: 'Light' },
  { value: 'dark', label: 'Dark' },
  { value: 'system', label: 'System' }
]

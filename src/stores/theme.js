import { ref, watch } from 'vue'
import { defineStore } from 'pinia'

function update() {
  const isDark =
    localStorage.theme === 'dark' ||
    (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)

  if (isDark) {
    document.documentElement.classList.add('dark', 'changing-theme')
    const meta = document.querySelector('meta[name="theme-color"]')
    if (meta) meta.setAttribute('content', '#0B1120')
  } else {
    document.documentElement.classList.remove('dark', 'changing-theme')
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

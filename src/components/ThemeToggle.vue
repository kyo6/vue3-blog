<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useThemeStore } from '@/stores/theme'
import { THEME_SETTINGS } from '@/stores/theme'
import SunIcon from './theme-icons/SunIcon.vue'
import MoonIcon from './theme-icons/MoonIcon.vue'
import PcIcon from './theme-icons/PcIcon.vue'

const props = defineProps({
  panelClassName: {
    type: String,
    default: 'mt-4'
  }
})

const themeStore = useThemeStore()
const setting = computed(() => themeStore.setting)
const isOpen = ref(false)
const panelRef = ref(null)
const buttonRef = ref(null)

function selectTheme(value) {
  themeStore.setSetting(value)
  isOpen.value = false
}

function handleClickOutside(e) {
  if (
    isOpen.value &&
    panelRef.value &&
    !panelRef.value.contains(e.target) &&
    !buttonRef.value?.contains(e.target)
  ) {
    isOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<template>
  <div class="relative flex items-center">
    <label class="sr-only">Theme</label>
    <button ref="buttonRef" type="button" class="flex items-center" @click="isOpen = !isOpen">
      <span class="dark:hidden">
        <SunIcon class="w-6 h-6" :selected="setting !== 'system'" />
      </span>
      <span class="hidden dark:inline">
        <MoonIcon class="w-6 h-6" :selected="setting !== 'system'" />
      </span>
    </button>
    <div
      v-show="isOpen"
      ref="panelRef"
      class="absolute z-50 top-full right-0 bg-white rounded-lg ring-1 ring-slate-900/10 shadow-lg overflow-hidden w-36 py-1 text-sm text-slate-700 font-semibold dark:bg-slate-800 dark:ring-0 dark:highlight-white/5 dark:text-slate-300"
      :class="panelClassName"
    >
      <button
        v-for="item in THEME_SETTINGS"
        :key="item.value"
        type="button"
        class="w-full py-1 px-2 flex items-center cursor-pointer text-left hover:bg-slate-50 dark:hover:bg-slate-600/30"
        :class="{
          'text-sky-500': setting === item.value
        }"
        @click="selectTheme(item.value)"
      >
        <SunIcon
          v-if="item.value === 'light'"
          class="w-6 h-6 mr-2 shrink-0"
          :selected="setting === item.value"
        />
        <MoonIcon
          v-else-if="item.value === 'dark'"
          class="w-6 h-6 mr-2 shrink-0"
          :selected="setting === item.value"
        />
        <PcIcon v-else class="w-6 h-6 mr-2 shrink-0" :selected="setting === item.value" />
        {{ item.label }}
      </button>
    </div>
  </div>
</template>

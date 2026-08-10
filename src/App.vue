<script setup>
import { RouterView, useRoute } from 'vue-router'
import { computed, onMounted, watch } from 'vue'
import FrameHeader from '@/components/layout/header.vue'
import { useThemeStore } from '@/stores/theme'

const themeStore = useThemeStore()
const route = useRoute()

const isWorksRoute = computed(
  () => route.path === '/works' || route.path.startsWith('/works/')
)

watch(
  isWorksRoute,
  (active) => {
    document.documentElement.classList.toggle('works-route', active)
  },
  { immediate: true }
)

onMounted(() => {
  themeStore.initFromStorage()
  themeStore.setupListeners()
})
</script>

<template>
  <FrameHeader :works-theme="isWorksRoute" />
  <RouterView />
</template>

<style>
html.works-route,
html.works-route body {
  background-color: #14181f;
}
</style>

<script setup>
import { RouterView } from 'vue-router'
import FrameHeader from '@/components/layout/header.vue'
import { useThemeStore } from '@/stores/theme'
import { onMounted } from 'vue'

const themeStore = useThemeStore()

onMounted(() => {
  themeStore.initFromStorage()
  themeStore.setupListeners()
})
</script>

<template>
  <FrameHeader />
  <RouterView />
</template>

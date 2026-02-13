<template>
  <div class="container">
    <div class="left-panel">
      <div class="analysis-title">实现原理分析</div>
      <MarkdownViewer :markdown="mdContent" class="analysis-content" />
    </div>
    <div class="right-panel">
      <day1 />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import MarkdownViewer from '@/components/MarkdownViewer.vue'
import demoMd from '@/docs/demo.md?raw'
import Day1 from '@/components/100days/day1/index.vue'

const mdContent = ref(demoMd)
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&family=Red+Hat+Display:ital,wght@0,300..900;1,300..900&display=swap');

.container {
  display: flex;
  width: 100%;
  min-height: 100vh;
  background: #f5f5f5;
}

.left-panel {
  width: 50%;
  padding: 40px;
  background: #ffffff;
  border-right: 1px solid #e0e0e0;
  overflow-y: auto;
}

.analysis-title {
  font-size: 24px;
  font-weight: 700;
  color: #333;
  margin-bottom: 30px;
  padding-bottom: 15px;
  border-bottom: 2px solid #6b59e0;
}

.analysis-content {
  padding-right: 10px;
}

.right-panel {
  position: fixed;
  top: 0;
  right: 0;
  width: 50%;
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f0f0f0 0%, #e0e0e0 100%);
}
</style>

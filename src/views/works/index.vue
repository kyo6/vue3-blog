<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import works from '@/config/works.json'

const categoryOrder = ['登录认证', '设计系统', '色彩设计', '交互演示', 'AI 科普', '测试与质量']

const groupedWorks = computed(() => {
  const map = new Map()
  for (const item of works) {
    const key = item.category || '其他'
    if (!map.has(key)) map.set(key, [])
    map.get(key).push(item)
  }
  const ordered = categoryOrder
    .filter((name) => map.has(name))
    .map((name) => ({ name, items: map.get(name) }))
  for (const [name, items] of map) {
    if (!categoryOrder.includes(name)) ordered.push({ name, items })
  }
  return ordered
})
</script>

<template>
  <div class="works-page min-h-[calc(100vh-4rem)]">
    <div class="max-w-5xl mx-auto px-6 py-16 md:py-24">
      <header class="text-center mb-14 md:mb-16">
        <p class="works-eyebrow tracking-[0.2em] text-xs font-medium uppercase mb-3">Works</p>
        <h1 class="works-title text-4xl md:text-5xl font-normal mb-4">作品</h1>
        <p class="works-desc text-sm md:text-base max-w-xl mx-auto leading-relaxed">
          一些正在使用和持续维护的页面与工具，也包括解决实际问题的小 demo。
        </p>
      </header>

      <section
        v-for="group in groupedWorks"
        :key="group.name"
        class="mb-12 md:mb-14 last:mb-0"
      >
        <h2 class="works-section-title text-sm tracking-[0.18em] uppercase mb-5 md:mb-6">
          {{ group.name }}
        </h2>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-5 md:gap-6">
          <article
            v-for="item in group.items"
            :key="item.id"
            class="works-card group flex flex-col p-6 md:p-7 rounded-2xl transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div class="flex items-center gap-2 mb-5">
              <span class="works-dot w-1.5 h-1.5 rounded-full shrink-0" />
              <span class="works-stack text-xs tracking-wide">{{ item.stack }}</span>
            </div>

            <h3 class="works-card-title text-2xl md:text-[1.75rem] font-normal mb-3">
              {{ item.title }}
            </h3>
            <p class="works-card-desc text-sm leading-relaxed flex-1 mb-8">
              {{ item.summary }}
            </p>

            <RouterLink
              :to="{ name: 'works-detail', params: { id: item.id } }"
              class="works-link inline-flex items-center gap-1.5 text-sm transition-colors"
            >
              {{ item.linkLabel || '查看项目' }}
              <span aria-hidden="true">→</span>
            </RouterLink>
          </article>
        </div>
      </section>
    </div>
  </div>
</template>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Instrument+Serif:ital@0;1&family=DM+Sans:opsz,wght@9..40,400;9..40,500&display=swap');

.works-page {
  --works-bg: #14181f;
  --works-card: #1a2029;
  --works-border: rgba(196, 140, 98, 0.28);
  --works-accent: #c48c62;
  --works-text: #f3f0ea;
  --works-muted: #9a958c;
  background:
    radial-gradient(ellipse 80% 50% at 50% -10%, rgba(196, 140, 98, 0.08), transparent),
    var(--works-bg);
  color: var(--works-text);
  font-family: 'DM Sans', system-ui, sans-serif;
}

.works-eyebrow {
  color: var(--works-accent);
  font-family: 'DM Sans', system-ui, sans-serif;
}

.works-title,
.works-card-title {
  font-family: 'Instrument Serif', Georgia, serif;
  color: var(--works-text);
}

.works-section-title {
  color: var(--works-accent);
  font-family: 'DM Sans', system-ui, sans-serif;
}

.works-desc,
.works-card-desc,
.works-stack {
  color: var(--works-muted);
}

.works-card {
  background: var(--works-card);
  border: 1px solid var(--works-border);
}

.works-dot {
  background: #8fbc8f;
}

.works-link {
  color: var(--works-accent);
}

.works-link:hover {
  color: #d9a57a;
}
</style>

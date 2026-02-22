<template>
  <div class="min-h-screen bg-slate-50 p-8 space-y-12">
    <header class="max-w-4xl mx-auto">
      <h1 class="text-3xl font-bold text-slate-900">Tailwind CSS Custom Plugins 演示</h1>
      <p class="mt-2 text-slate-600 font-source">
        展示在 tailwind.config.js 中定义的自定义工具和变体。
      </p>
    </header>

    <main class="max-w-4xl mx-auto space-y-16">
      <!-- 1. MatchUtilities: bg-grid -->
      <section>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-6 bg-sky-500 rounded-full"></span>
          动态网格背景 (matchUtilities: bg-grid)
        </h2>
        <div class="h-60 relative">
          <div
            class="absolute inset-0 bottom-10 bg-bottom bg-no-repeat bg-slate-50 dark:bg-[#0B1120]"
          >
            <div
              class="absolute inset-0 bg-grid-slate-900/[0.04] bg-[bottom_1px_center] dark:bg-grid-slate-400/[0.05] dark:bg-bottom dark:border-b dark:border-slate-100/5"
              style="mask-image: linear-gradient(transparent, black)"
            ></div>
          </div>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div
            class="h-32 rounded-xl bg-white border border-slate-200 bg-grid-slate-200 flex items-center justify-center"
          >
            <span class="bg-white px-3 py-1 rounded shadow-sm text-sm text-slate-500"
              >bg-grid-slate-200</span
            >
          </div>
          <div
            class="h-32 rounded-xl bg-slate-900 bg-grid-sky-500/20 flex items-center justify-center text-white"
          >
            <span class="bg-slate-800 px-3 py-1 rounded shadow-sm text-sm border border-slate-700"
              >bg-grid-sky-500/20</span
            >
          </div>
        </div>
      </section>

      <!-- 2. MatchUtilities: highlight -->
      <section>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-6 bg-pink-500 rounded-full"></span>
          内高亮 (matchUtilities: highlight)
        </h2>
        <div class="flex flex-wrap gap-4">
          <button
            class="px-6 py-2 bg-sky-500 text-white rounded-lg font-semibold highlight-white/20 hover:bg-sky-600 transition-colors shadow-lg"
          >
            Highlight White
          </button>
          <button
            class="px-6 py-2 bg-white text-slate-900 rounded-lg font-semibold highlight-sky-100 border border-slate-200 hover:bg-slate-50 transition-colors shadow-sm"
          >
            Highlight Sky
          </button>
        </div>
      </section>

      <!-- 3. AddUtilities: bg-stripes -->
      <section>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-6 bg-amber-500 rounded-full"></span>
          条纹背景 (addUtilities: bg-stripes)
        </h2>
        <div class="space-y-4">
          <div class="h-12 rounded-lg bg-stripes-sky"></div>
          <div class="h-12 rounded-lg bg-stripes-amber"></div>
          <div class="h-12 rounded-lg bg-stripes-pink"></div>
        </div>
      </section>

      <!-- 4. Background Image: squiggle -->
      <section>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-6 bg-yellow-400 rounded-full"></span>
          波浪线背景 (backgroundImage: squiggle)
        </h2>
        <div class="p-8 rounded-xl bg-white border border-slate-200">
          <p class="text-lg leading-relaxed">
            这段文字下面有自定义的波浪线背景：
            <span class="bg-squiggle bg-bottom bg-repeat-x pb-1">
              这是一段带有黄色波浪线下划线的重点文字演示。
            </span>
            它是通过自定义 backgroundImage 插件结合 svgToDataUri 实现的。
          </p>
        </div>
      </section>

      <!-- 5. AddVariant: children -->
      <section>
        <h2 class="text-xl font-semibold mb-4 flex items-center gap-2">
          <span class="w-2 h-6 bg-indigo-500 rounded-full"></span>
          子元素变体 (addVariant: children)
        </h2>
        <div
          class="children:inline-block children:px-4 children:py-2 children:rounded-full children:bg-indigo-100 children:text-indigo-700 children:font-medium children:mr-2 children:mb-2 border-2 border-dashed border-indigo-200 p-4 rounded-xl"
        >
          <span>标签1</span>
          <span>标签2</span>
          <span>标签3</span>
          <span>标签4</span>
          <em>所有子元素都受到了 children: 变体的影响</em>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
// 无需额外逻辑
</script>

<style scoped>
/* 演示页面样式 */
</style>

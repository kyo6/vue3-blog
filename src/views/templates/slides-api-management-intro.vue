<template>
  <div class="gradient-bg dark:dark-gradient-bg font-sans min-h-screen flex flex-col">
    <!-- 导航栏 -->
    <nav class="sticky top-0 z-50 glass-effect dark:glass-effect-dark">
      <div class="container mx-auto px-6 py-4">
        <div class="flex justify-between items-center">
          <div class="flex items-center space-x-3">
            <div class="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center animate-glow">
              <i class="fas fa-cogs text-white text-lg"></i>
            </div>
            <div class="text-2xl font-bold text-gradient">API管理模块</div>
          </div>
          <div class="flex items-center space-x-4">
            <button
              :disabled="currentSlide === 1"
              class="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="prev"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <span class="px-4 py-3 text-purple-700 dark:text-purple-300 font-semibold">
              {{ currentSlide }} / {{ totalSlides }}
            </span>
            <button
              :disabled="currentSlide === totalSlides"
              class="p-3 rounded-full bg-purple-600 text-white hover:bg-purple-700 transition-all hover:scale-110 disabled:opacity-40 disabled:cursor-not-allowed"
              @click="next"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
        </div>
      </div>
    </nav>

    <!-- 幻灯片容器 -->
    <div class="flex-1">
      <!-- 第1页：标题页 -->
      <section v-show="currentSlide === 1" class="slide flex items-center justify-center">
        <div class="text-center animate-fade-in px-6">
          <div class="mb-8">
            <div class="relative inline-block">
              <i class="fas fa-database text-8xl text-purple-600 dark:text-purple-400 animate-float mb-6"></i>
              <div class="absolute -top-4 -right-4 w-8 h-8 bg-gradient-to-r from-green-400 to-blue-500 rounded-full flex items-center justify-center animate-pulse-slow">
                <i class="fas fa-check text-white text-sm"></i>
              </div>
            </div>
          </div>
          <h1 class="text-6xl font-bold text-gradient mb-6">API管理模块</h1>
          <h2 class="text-3xl text-purple-700 dark:text-purple-300 mb-8 font-light">测试平台的数据源头</h2>
          <div class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-2xl p-8 max-w-4xl mx-auto border border-purple-200 dark:border-purple-800">
            <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div class="flex items-center justify-center space-x-3 text-purple-700 dark:text-purple-300">
                <i class="fas fa-file-alt text-2xl text-blue-600 dark:text-blue-400"></i>
                <span class="text-lg font-semibold">接口定义管理</span>
              </div>
              <div class="flex items-center justify-center space-x-3 text-purple-700 dark:text-purple-300">
                <i class="fas fa-code-branch text-2xl text-green-600 dark:text-green-400"></i>
                <span class="text-lg font-semibold">Schema解析</span>
              </div>
              <div class="flex items-center justify-center space-x-3 text-purple-700 dark:text-purple-300">
                <i class="fas fa-book-open text-2xl text-orange-600 dark:text-orange-400"></i>
                <span class="text-lg font-semibold">文档生成</span>
              </div>
            </div>
          </div>
          <div class="mt-8 text-lg text-purple-600 dark:text-purple-400 italic animate-pulse-slow">
            <i class="fas fa-quote-left mr-2"></i>
            从手搓脚本到智能生成的核心基础设施
            <i class="fas fa-quote-right ml-2"></i>
          </div>
        </div>
      </section>

      <!-- 第2页：功能定位与架构 -->
      <section v-show="currentSlide === 2" class="slide">
        <div class="container mx-auto px-6 py-8">
          <h2 class="text-4xl font-bold text-center text-gradient mb-12 animate-slide-up">
            <i class="fas fa-bullseye mr-3 text-purple-600 dark:text-purple-400"></i>功能定位与架构
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <!-- 左侧：功能定位 -->
            <div class="animate-slide-right">
              <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 shadow-2xl card-hover">
                <h3 class="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center">
                  <i class="fas fa-crosshairs mr-3 text-blue-600 dark:text-blue-400"></i>功能定位
                </h3>
                <div class="space-y-6">
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-purple-500 to-purple-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-database text-white"></i>
                    </div>
                    <div>
                      <h4 class="font-bold text-purple-800 dark:text-purple-200 text-lg mb-2">数据源头</h4>
                      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        作为测试平台的核心数据源，负责统一管理所有接口定义信息，为下游测试模块提供标准化的数据支撑。
                      </p>
                    </div>
                  </div>
                  <div class="flex items-start space-x-4">
                    <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-blue-700 rounded-full flex items-center justify-center flex-shrink-0">
                      <i class="fas fa-shield-alt text-white"></i>
                    </div>
                    <div>
                      <h4 class="font-bold text-purple-800 dark:text-purple-200 text-lg mb-2">Schema提供</h4>
                      <p class="text-gray-700 dark:text-gray-300 leading-relaxed">
                        基于标准化Schema规范，自动提取和解析接口约束信息，确保测试数据的准确性和有效性。
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：架构图 -->
            <div class="animate-slide-up">
              <div class="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-2xl p-8 shadow-xl">
                <h3 class="text-xl font-bold text-center text-purple-800 dark:text-purple-200 mb-8">系统架构层次</h3>
                <div class="space-y-6">
                  <!-- 外部数据源 -->
                  <div class="relative">
                    <div class="bg-white/80 dark:bg-slate-800/80 rounded-xl p-4 shadow-lg border-l-4 border-green-500">
                      <div class="flex items-center space-x-3">
                        <i class="fas fa-cloud text-green-600 dark:text-green-400 text-2xl"></i>
                        <div>
                          <h4 class="font-bold text-gray-800 dark:text-gray-200">外部数据源</h4>
                          <p class="text-sm text-gray-600 dark:text-gray-400">YApi JSON、OpenAPI 3.0</p>
                        </div>
                      </div>
                    </div>
                    <div class="absolute left-1/2 -bottom-3 w-1 h-6 flow-line"></div>
                  </div>
                  <!-- API管理模块 -->
                  <div class="relative">
                    <div class="bg-gradient-to-r from-purple-500 to-purple-700 rounded-xl p-4 shadow-xl animate-glow">
                      <div class="flex items-center space-x-3 text-white">
                        <i class="fas fa-cogs text-2xl"></i>
                        <div>
                          <h4 class="font-bold">API管理模块</h4>
                          <p class="text-sm opacity-90">核心处理引擎</p>
                        </div>
                      </div>
                    </div>
                    <div class="absolute left-1/2 -bottom-3 w-1 h-6 flow-line"></div>
                  </div>
                  <!-- 下游模块 -->
                  <div class="grid grid-cols-2 gap-4">
                    <div class="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 shadow-lg border-l-4 border-blue-500">
                      <div class="flex items-center space-x-2">
                        <i class="fas fa-robot text-blue-600 dark:text-blue-400"></i>
                        <div>
                          <h5 class="font-bold text-gray-800 dark:text-gray-200 text-sm">AI生成</h5>
                          <p class="text-xs text-gray-600 dark:text-gray-400">智能用例</p>
                        </div>
                      </div>
                    </div>
                    <div class="bg-white/80 dark:bg-slate-800/80 rounded-xl p-3 shadow-lg border-l-4 border-orange-500">
                      <div class="flex items-center space-x-2">
                        <i class="fas fa-vial text-orange-600 dark:text-orange-400"></i>
                        <div>
                          <h5 class="font-bold text-gray-800 dark:text-gray-200 text-sm">场景测试</h5>
                          <p class="text-xs text-gray-600 dark:text-gray-400">自动化执行</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 第3页：核心功能组件 -->
      <section v-show="currentSlide === 3" class="slide">
        <div class="container mx-auto px-6 py-8">
          <h2 class="text-4xl font-bold text-center text-gradient mb-12 animate-slide-up">
            <i class="fas fa-puzzle-piece mr-3 text-purple-600 dark:text-purple-400"></i>核心功能组件
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
            <!-- 接口定义管理器 -->
            <div class="group animate-slide-up">
              <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl card-hover h-full">
                <div class="text-center mb-6">
                  <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-blue-700 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i class="fas fa-file-code text-white text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-purple-800 dark:text-purple-200">接口定义管理器</h3>
                  <p class="text-sm text-purple-600 dark:text-purple-400 mt-1">@ApiDoc.tsx</p>
                </div>
                <div class="space-y-4">
                  <div v-for="item in apiDocFeatures" :key="item.title" class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-500 mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-gray-800 dark:text-gray-200">{{ item.title }}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.desc }}</p>
                    </div>
                  </div>
                </div>
                <div class="mt-6 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                  <div class="flex items-center text-blue-700 dark:text-blue-300 text-sm">
                    <i class="fas fa-code mr-2"></i>
                    <span class="font-mono">src/components/ApiDoc.tsx</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Schema解析引擎 -->
            <div class="group animate-slide-up">
              <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl card-hover h-full">
                <div class="text-center mb-6">
                  <div class="w-20 h-20 bg-gradient-to-r from-green-500 to-green-700 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i class="fas fa-cog text-white text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-purple-800 dark:text-purple-200">Schema解析引擎</h3>
                  <p class="text-sm text-purple-600 dark:text-purple-400 mt-1">智能解析核心</p>
                </div>
                <div class="space-y-4">
                  <div v-for="item in schemaFeatures" :key="item.title" class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-500 mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-gray-800 dark:text-gray-200">{{ item.title }}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.desc }}</p>
                    </div>
                  </div>
                </div>
                <div class="mt-6 p-3 bg-green-50 dark:bg-green-900/30 rounded-lg">
                  <div class="flex items-center text-green-700 dark:text-green-300 text-sm">
                    <i class="fas fa-brain mr-2"></i>
                    <span>AI辅助解析算法</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- 文档生成器 -->
            <div class="group animate-slide-up">
              <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-6 shadow-xl card-hover h-full">
                <div class="text-center mb-6">
                  <div class="w-20 h-20 bg-gradient-to-r from-orange-500 to-orange-700 rounded-2xl mx-auto mb-4 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <i class="fas fa-book text-white text-3xl"></i>
                  </div>
                  <h3 class="text-xl font-bold text-purple-800 dark:text-purple-200">文档生成器</h3>
                  <p class="text-sm text-purple-600 dark:text-purple-400 mt-1">交互式文档</p>
                </div>
                <div class="space-y-4">
                  <div v-for="item in docGenFeatures" :key="item.title" class="flex items-start space-x-3">
                    <i class="fas fa-check-circle text-green-500 mt-1"></i>
                    <div>
                      <h4 class="font-semibold text-gray-800 dark:text-gray-200">{{ item.title }}</h4>
                      <p class="text-sm text-gray-600 dark:text-gray-400">{{ item.desc }}</p>
                    </div>
                  </div>
                </div>
                <div class="mt-6 p-3 bg-orange-50 dark:bg-orange-900/30 rounded-lg">
                  <div class="flex items-center text-orange-700 dark:text-orange-300 text-sm">
                    <i class="fas fa-play-circle mr-2"></i>
                    <span>实时预览与调试</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 第4页：技术优势与特性 -->
      <section v-show="currentSlide === 4" class="slide">
        <div class="container mx-auto px-6 py-8">
          <h2 class="text-4xl font-bold text-center text-gradient mb-12 animate-slide-up">
            <i class="fas fa-rocket mr-3 text-purple-600 dark:text-purple-400"></i>技术优势与特性
          </h2>
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <!-- 左侧：核心技术优势 -->
            <div class="space-y-4">
              <h3 class="text-2xl font-bold text-purple-800 dark:text-purple-200 mb-6 flex items-center animate-slide-right">
                <i class="fas fa-medal mr-3 text-yellow-500"></i>核心技术优势
              </h3>
              <div v-for="adv in advantages" :key="adv.title" class="bg-white/60 dark:bg-slate-800/60 backdrop-blur-sm rounded-xl p-6 shadow-lg card-hover animate-slide-right">
                <div class="flex items-start space-x-4">
                  <div :class="`w-12 h-12 bg-gradient-to-r ${adv.gradient} rounded-lg flex items-center justify-center flex-shrink-0`">
                    <i :class="`fas fa-${adv.icon} text-white`"></i>
                  </div>
                  <div>
                    <h4 class="font-bold text-purple-800 dark:text-purple-200 text-lg mb-2">{{ adv.title }}</h4>
                    <p class="text-gray-700 dark:text-gray-300">{{ adv.desc }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- 右侧：关键特性指标 -->
            <div class="animate-slide-up">
              <div class="bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-900/40 dark:to-blue-900/40 rounded-2xl p-8 shadow-xl">
                <h3 class="text-xl font-bold text-center text-purple-800 dark:text-purple-200 mb-8">关键特性指标</h3>
                <div class="space-y-6">
                  <!-- 进度条指标 -->
                  <div v-for="metric in metrics" :key="metric.label" class="flex items-center justify-between bg-white/70 dark:bg-slate-800/70 rounded-xl p-4">
                    <div class="flex items-center space-x-3">
                      <i :class="`fas fa-${metric.icon} text-xl`" :style="{ color: metric.color }"></i>
                      <span class="font-semibold text-gray-800 dark:text-gray-200">{{ metric.label }}</span>
                    </div>
                    <div class="flex items-center space-x-2">
                      <div class="w-32 h-2 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
                        <div
                          class="h-full animate-pulse-slow rounded-full"
                          :style="{ width: metric.value, background: `linear-gradient(to right, ${metric.gradFrom}, ${metric.gradTo})` }"
                        ></div>
                      </div>
                      <span class="text-sm font-bold" :style="{ color: metric.color }">{{ metric.value }}</span>
                    </div>
                  </div>
                  <!-- 支持格式 -->
                  <div class="flex items-center justify-between bg-white/70 dark:bg-slate-800/70 rounded-xl p-4">
                    <div class="flex items-center space-x-3">
                      <i class="fas fa-code text-orange-600 dark:text-orange-400 text-xl"></i>
                      <span class="font-semibold text-gray-800 dark:text-gray-200">支持格式</span>
                    </div>
                    <div class="flex space-x-2">
                      <span class="px-2 py-1 bg-orange-100 dark:bg-orange-900/50 text-orange-700 dark:text-orange-300 rounded text-xs font-semibold">YApi</span>
                      <span class="px-2 py-1 bg-green-100 dark:bg-green-900/50 text-green-700 dark:text-green-300 rounded text-xs font-semibold">OpenAPI</span>
                      <span class="px-2 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded text-xs font-semibold">Swagger</span>
                    </div>
                  </div>
                  <!-- 数据统计 -->
                  <div class="mt-4 grid grid-cols-2 gap-4">
                    <div class="text-center bg-white/70 dark:bg-slate-800/70 rounded-xl p-4">
                      <div class="text-2xl font-bold text-purple-600 dark:text-purple-400 animate-pulse-slow">500+</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">接口管理</div>
                    </div>
                    <div class="text-center bg-white/70 dark:bg-slate-800/70 rounded-xl p-4">
                      <div class="text-2xl font-bold text-blue-600 dark:text-blue-400 animate-pulse-slow">30+</div>
                      <div class="text-sm text-gray-600 dark:text-gray-400">项目支持</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <!-- 第5页：价值总结 -->
      <section v-show="currentSlide === 5" class="slide flex items-center justify-center">
        <div class="text-center animate-fade-in px-6 w-full">
          <div class="mb-8">
            <i class="fas fa-trophy text-8xl text-yellow-500 dark:text-yellow-400 animate-float"></i>
          </div>
          <h2 class="text-5xl font-bold text-gradient mb-6">API管理模块价值</h2>
          <div class="bg-white/70 dark:bg-slate-800/70 backdrop-blur-sm rounded-2xl p-8 max-w-6xl mx-auto shadow-2xl">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <div v-for="val in values" :key="val.title" class="text-center p-4 rounded-xl card-hover" :class="val.bgClass">
                <i :class="`fas fa-${val.icon} text-3xl mb-3`" :style="{ color: val.iconColor }"></i>
                <h3 class="font-bold mb-2" :style="{ color: val.titleColor }">{{ val.title }}</h3>
                <p class="text-sm text-gray-700 dark:text-gray-300">
                  {{ val.desc }}<br>
                  <span class="font-bold text-lg" :style="{ color: val.iconColor }">{{ val.stat }}</span>
                </p>
              </div>
            </div>
            <div class="border-t border-purple-200 dark:border-purple-800 pt-6">
              <h3 class="text-2xl font-bold text-purple-700 dark:text-purple-300 mb-4">
                <i class="fas fa-lightbulb mr-2 text-yellow-500"></i>核心价值实现
              </h3>
              <div class="text-left max-w-4xl mx-auto space-y-3 text-gray-700 dark:text-gray-300">
                <div v-for="point in coreValues" :key="point.title" class="flex items-start space-x-3">
                  <i class="fas fa-arrow-right text-purple-600 dark:text-purple-400 mt-1"></i>
                  <p><strong>{{ point.title }}：</strong>{{ point.desc }}</p>
                </div>
              </div>
            </div>
          </div>
          <div class="mt-8 text-xl text-purple-600 dark:text-purple-400 italic animate-pulse-slow">
            <i class="fas fa-quote-left mr-2"></i>
            构建智能测试平台的数据基石，赋能测试跃迁之路
            <i class="fas fa-quote-right ml-2"></i>
          </div>
        </div>
      </section>
    </div>

    <!-- 底部进度条 -->
    <div class="sticky bottom-0 w-full bg-white/70 dark:bg-slate-900/70 backdrop-blur-sm h-2">
      <div
        class="h-full bg-gradient-to-r from-purple-600 via-blue-600 to-teal-600 transition-all duration-300"
        :style="{ width: progressWidth }"
      ></div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'

const totalSlides = 5
const currentSlide = ref(1)

const progressWidth = computed(() => `${(currentSlide.value / totalSlides) * 100}%`)

function next() {
  if (currentSlide.value < totalSlides) currentSlide.value++
}
function prev() {
  if (currentSlide.value > 1) currentSlide.value--
}

function onKeyDown(e) {
  if (e.key === 'ArrowRight' || e.key === ' ') { e.preventDefault(); next() }
  else if (e.key === 'ArrowLeft') { e.preventDefault(); prev() }
  else if (e.key === 'Home') currentSlide.value = 1
  else if (e.key === 'End') currentSlide.value = totalSlides
}

let touchStartX = 0
function onTouchStart(e) { touchStartX = e.changedTouches[0].screenX }
function onTouchEnd(e) {
  const dx = e.changedTouches[0].screenX - touchStartX
  if (dx < -50) next()
  else if (dx > 50) prev()
}

onMounted(() => {
  window.addEventListener('keydown', onKeyDown)
  window.addEventListener('touchstart', onTouchStart)
  window.addEventListener('touchend', onTouchEnd)
})
onUnmounted(() => {
  window.removeEventListener('keydown', onKeyDown)
  window.removeEventListener('touchstart', onTouchStart)
  window.removeEventListener('touchend', onTouchEnd)
})

// ——— 数据 ———
const apiDocFeatures = [
  { title: 'YApi集成', desc: '基于YApi JSON数据，自动同步接口定义' },
  { title: '版本管理', desc: '支持接口版本控制和变更追踪' },
  { title: '统一标准', desc: '标准化接口定义格式和数据结构' },
]
const schemaFeatures = [
  { title: 'OpenAPI 3.0', desc: '完整支持OpenAPI 3.0规范解析' },
  { title: '约束提取', desc: '自动提取类型、长度、枚举值等约束' },
  { title: '依赖识别', desc: '智能识别参数间的依赖关系' },
]
const docGenFeatures = [
  { title: '自动生成', desc: '自动生成交互式API文档界面' },
  { title: '在线调试', desc: '支持在线测试和接口调试功能' },
  { title: '代码示例', desc: '多语言代码示例自动生成' },
]

const advantages = [
  { icon: 'sync-alt', gradient: 'from-purple-500 to-purple-700', title: '实时同步', desc: '与YApi等外部系统实时同步，确保接口定义的时效性和准确性' },
  { icon: 'brain', gradient: 'from-blue-500 to-blue-700', title: '智能解析', desc: '基于AI算法的智能Schema解析，自动识别复杂的数据结构和约束关系' },
  { icon: 'expand-arrows-alt', gradient: 'from-green-500 to-green-700', title: '高扩展性', desc: '模块化设计，支持多种数据格式和协议，易于扩展和定制' },
]

const metrics = [
  { label: '解析速度', icon: 'tachometer-alt', value: '95%', color: '#16a34a', gradFrom: '#4ade80', gradTo: '#16a34a' },
  { label: '准确率', icon: 'shield-alt', value: '99%', color: '#2563eb', gradFrom: '#60a5fa', gradTo: '#2563eb' },
]

const values = [
  { icon: 'clock', title: '效率提升', desc: '接口管理效率提升', stat: '80%', bgClass: 'bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/30 dark:to-blue-800/30', iconColor: '#2563eb', titleColor: '#1e40af' },
  { icon: 'check-double', title: '质量保障', desc: '数据准确性达到', stat: '99%+', bgClass: 'bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/30 dark:to-green-800/30', iconColor: '#16a34a', titleColor: '#166534' },
  { icon: 'users', title: '团队协作', desc: '跨团队协作成本', stat: '-60%', bgClass: 'bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/30 dark:to-purple-800/30', iconColor: '#9333ea', titleColor: '#6b21a8' },
  { icon: 'cogs', title: '自动化率', desc: '接口处理自动化', stat: '95%+', bgClass: 'bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-900/30 dark:to-orange-800/30', iconColor: '#ea580c', titleColor: '#9a3412' },
]

const coreValues = [
  { title: '统一数据源', desc: '建立标准化的接口定义管理体系，消除数据孤岛' },
  { title: '智能解析', desc: '基于AI算法的Schema解析，大幅提升处理效率和准确性' },
  { title: '生态赋能', desc: '为下游AI生成、场景测试等模块提供高质量数据基础' },
]
</script>

<style scoped>
/* 背景渐变 */
.gradient-bg {
  background: linear-gradient(135deg, #f8f9ff 0%, #f3f4f6 25%, #ede9fe 50%, #e0e7ff 75%, #f0f9ff 100%);
}
.dark-gradient-bg {
  background: linear-gradient(135deg, #0f0a1e 0%, #1a1035 25%, #1e1040 50%, #16213e 75%, #0f0f23 100%);
}

/* 玻璃拟态导航 */
.glass-effect {
  background: rgba(255, 255, 255, 0.15);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.3);
}
.glass-effect-dark {
  background: rgba(15, 10, 30, 0.6);
  backdrop-filter: blur(15px);
  border-bottom: 1px solid rgba(139, 92, 246, 0.2);
}

/* 文字渐变 */
.text-gradient {
  background: linear-gradient(135deg, #7c3aed, #3b82f6, #06b6d4);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* 卡片悬停 */
.card-hover {
  transition: all 0.3s ease;
}
.card-hover:hover {
  transform: translateY(-8px) scale(1.02);
  box-shadow: 0 25px 50px rgba(124, 58, 237, 0.2);
}

/* 流动连接线 */
.flow-line {
  background: linear-gradient(180deg, #4ade80, #a855f7);
  animation: flow 3s ease-in-out infinite;
}
@keyframes flow {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 1; }
}

/* 幻灯片高度 */
.slide {
  min-height: calc(100vh - 8rem);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

/* 自定义动画 */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
@keyframes slideUp {
  from { opacity: 0; transform: translateY(40px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes slideRight {
  from { opacity: 0; transform: translateX(-40px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes float {
  0%, 100% { transform: translateY(0px) rotate(0deg); }
  25% { transform: translateY(-10px) rotate(1deg); }
  50% { transform: translateY(-5px) rotate(-1deg); }
  75% { transform: translateY(-15px) rotate(0.5deg); }
}
@keyframes glow {
  from { box-shadow: 0 0 10px rgba(147, 51, 234, 0.3); }
  to { box-shadow: 0 0 25px rgba(147, 51, 234, 0.6); }
}

.animate-fade-in { animation: fadeIn 0.8s ease-in-out; }
.animate-slide-up { animation: slideUp 0.8s ease-out; }
.animate-slide-right { animation: slideRight 0.8s ease-out; }
.animate-float { animation: float 4s ease-in-out infinite; }
.animate-glow { animation: glow 2s ease-in-out infinite alternate; }
.animate-pulse-slow { animation: pulse 3s ease-in-out infinite; }

@keyframes pulse {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.7; }
}
</style>

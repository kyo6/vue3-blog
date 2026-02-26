<template>
  <div class="min-h-screen bg-white dark:bg-slate-900">
    <!-- Mobile overlay -->
    <div
      v-if="sidebarOpen"
      class="fixed inset-0 z-30 bg-black/30 lg:hidden"
      @click="sidebarOpen = false"
    />

    <!-- Mobile topbar -->
    <header
      class="sticky top-0 z-20 flex items-center gap-3 px-4 py-3 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 lg:hidden"
    >
      <button
        type="button"
        class="p-1.5 rounded text-slate-600 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800"
        @click="sidebarOpen = true"
      >
        <svg class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h10" />
        </svg>
      </button>
      <span class="text-sm font-semibold text-slate-900 dark:text-white">DG Components</span>
    </header>

    <!-- Centered container -->
    <div class="max-w-8xl mx-auto px-4 sm:px-6 md:px-8">
      <div class="flex">

        <!-- Desktop sidebar: sticky inside the container -->
        <aside class="hidden lg:block w-64 flex-shrink-0 -ml-0.5">
          <div class="sticky top-0 h-screen overflow-y-auto pb-10">
            <!-- Brand -->
            <div class="py-5 pr-4">
              <router-link
                to="/"
                class="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm"
              >
                <svg class="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" />
                </svg>
                DG Components
              </router-link>
            </div>
            <nav-menu :menu="menu" :is-active="isActive" />
          </div>
        </aside>

        <!-- Mobile sidebar drawer (fixed, outside container flow) -->
        <aside
          :class="[
            'fixed inset-y-0 left-0 z-40 w-64 flex-shrink-0',
            'bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-700',
            'overflow-y-auto transition-transform duration-200 lg:hidden',
            sidebarOpen ? 'translate-x-0' : '-translate-x-full'
          ]"
        >
          <div class="sticky top-0 z-10 bg-white dark:bg-slate-900 px-6 py-4 border-b border-slate-200 dark:border-slate-700">
            <router-link
              to="/"
              class="flex items-center gap-2 text-slate-900 dark:text-white font-semibold text-sm"
              @click="sidebarOpen = false"
            >
              <svg class="w-5 h-5 text-sky-500" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a8 8 0 100 16A8 8 0 0010 2z" />
              </svg>
              DG Components
            </router-link>
          </div>
          <nav-menu :menu="menu" :is-active="isActive" @navigate="sidebarOpen = false" />
        </aside>

        <!-- Main content -->
        <main class="flex-1 min-w-0 py-8 lg:pl-8">
          <router-view />
        </main>

      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, defineComponent, h, resolveComponent } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import menu from '@/config/menu.json'

const route = useRoute()
const sidebarOpen = ref(false)

function isActive(href) {
  return route.path === `/${href}` || route.path.startsWith(`/${href}/`)
}

// Inline nav menu component to avoid duplication between desktop/mobile
const NavMenu = defineComponent({
  props: {
    menu: Object,
    isActive: Function
  },
  emits: ['navigate'],
  setup(props, { emit }) {
    return () =>
      h('nav', { class: 'px-4 py-4 text-sm leading-6' },
        Object.entries(props.menu).map(([category, items]) =>
          h('div', { class: 'mt-6 first:mt-0', key: category }, [
            h('h5', {
              class: 'mb-2 px-2 font-semibold text-slate-900 dark:text-slate-200 text-xs uppercase tracking-wide'
            }, category),
            h('ul', { class: 'space-y-1 border-l border-slate-200 dark:border-slate-700 ml-2' },
              items.map((item) =>
                h('li', { key: item.href },
                  h(RouterLink, {
                    to: `/${item.href}`,
                    class: [
                      'block pl-4 -ml-px border-l py-1.5 pr-2 rounded-r transition-colors',
                      props.isActive(item.href)
                        ? 'text-sky-500 dark:text-sky-400 border-sky-500 dark:border-sky-400 font-semibold bg-sky-50 dark:bg-sky-900/20'
                        : 'text-slate-600 dark:text-slate-400 border-transparent hover:text-slate-900 dark:hover:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500'
                    ].join(' '),
                    onClick: () => emit('navigate')
                  }, () => item.title)
                )
              )
            )
          ])
        )
      )
  }
})
</script>

<template>
  <div
    class="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b"
    :class="[
      plain ? 'plain' : '',
      worksTheme
        ? 'works-header border-[rgba(196,140,98,0.2)] bg-[#14181f]/95 supports-backdrop-blur:bg-[#14181f]/80'
        : 'border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent'
    ]"
  >
    <div class="max-w-8xl mx-auto">
      <div
        class="py-4 border-b lg:px-8 lg:border-0 mx-4 lg:mx-0"
        :class="
          worksTheme
            ? 'border-[rgba(196,140,98,0.15)]'
            : 'border-slate-900/10 dark:border-slate-300/10'
        "
      >
        <div class="relative flex items-center">
          <img :src="logo" class="h-8 w-auto cursor-pointer" @click="handleNavigateTo('/')" />
          <div class="relative hidden lg:flex items-center ml-auto">
            <nav
              class="text-sm leading-6 font-semibold"
              :class="worksTheme ? 'text-[#f3f0ea]' : 'text-slate-700 dark:text-slate-200'"
            >
              <ul class="flex space-x-8">
                <li
                  v-for="item in menuList"
                  :key="item.pathname"
                  :style="{
                    color: isCurrentPage(item.pathname)
                      ? worksTheme
                        ? '#c48c62'
                        : '#0d6eff'
                      : 'inherit'
                  }"
                >
                  <router-link
                    :to="item.pathname"
                    :class="
                      worksTheme
                        ? 'hover:text-[#d9a57a]'
                        : 'hover:text-sky-500 dark:hover:text-sky-400'
                    "
                  >
                    {{ item.name }}
                  </router-link>
                </li>
              </ul>
            </nav>
            <div
              class="flex items-center border-l ml-6 pl-6"
              :class="worksTheme ? 'border-white/10' : 'border-slate-200 dark:border-slate-800'"
            >
              <ThemeToggle panel-class-name="mt-4" />
            </div>
          </div>
          <button
            type="button"
            class="menu-bread lg:hidden ml-auto"
            :class="{ current: menuBreadOpen }"
            :aria-expanded="menuBreadOpen"
            aria-label="Toggle menu"
            @click="toggleMenuBread"
          >
            <span class="bread-icon top" />
            <span class="bread-icon left" />
            <span class="bread-icon right" />
            <span class="bread-icon bottom" />
          </button>
        </div>
      </div>
    </div>

    <Teleport to="body">
      <div
        v-show="!isLgUp"
        class="curtain-menu"
        :class="[
          menuBreadOpen ? 'current' : '',
          worksTheme ? 'works-theme' : ''
        ]"
      >
        <div
          v-for="item in menuList"
          :key="item.pathname"
          class="menu-item"
          :class="{ active: isCurrentPage(item.pathname) }"
          @click="handleNavigateTo(item.pathname)"
        >
          {{ item.name }}
        </div>
        <div class="menu-theme">
          <ThemeToggle panel-class-name="mt-2" />
        </div>
      </div>
    </Teleport>
  </div>
</template>
<script>
import logo from '@/assets/logo.png'
import ThemeToggle from '@/components/ThemeToggle.vue'
export default {
  name: 'FrameHeader',
  props: {
    plain: { default: false },
    worksTheme: { type: Boolean, default: false }
  },
  components: {
    ThemeToggle
  },
  data() {
    return {
      logo,
      menuBreadOpen: false,
      isLgUp: false,
      menuList: [
        { name: 'Blog', pathname: '/' },
        { name: 'Docs', pathname: '/docs' },
        { name: 'Works', pathname: '/works' }
      ]
    }
  },
  computed: {
    isCurrentPage() {
      return (itemPathname, isExternal) => {
        if (isExternal) {
          return false
        }

        itemPathname = itemPathname.split('?')[0]
        const currentPath = this.$route.path
        const normalizedCurrentPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '')
        const normalizedItemPath = itemPathname === '/' ? '/' : itemPathname.replace(/\/$/, '')

        if (normalizedCurrentPath === normalizedItemPath) {
          return true
        }

        if (normalizedItemPath === '/') {
          return false
        }

        return normalizedCurrentPath.startsWith(normalizedItemPath + '/')
      }
    }
  },
  watch: {
    $route() {
      this.menuBreadOpen = false
    },
    isLgUp(val) {
      if (val) this.menuBreadOpen = false
    },
    menuBreadOpen(open) {
      document.body.style.overflow = open ? 'hidden' : ''
    }
  },
  mounted() {
    this.mq = window.matchMedia('(min-width: 1024px)')
    this.updateLgUp = () => {
      this.isLgUp = this.mq.matches
    }
    this.updateLgUp()
    this.mq.addEventListener('change', this.updateLgUp)
  },
  beforeUnmount() {
    this.mq?.removeEventListener('change', this.updateLgUp)
    document.body.style.overflow = ''
  },
  methods: {
    handleNavigateTo(pageName, isExternal) {
      if (isExternal || pageName.startsWith('http://') || pageName.startsWith('https://')) {
        window.open(pageName, '_blank')
        this.menuBreadOpen = false
        return
      }

      if (this.$route.path !== pageName) {
        this.$router.push(pageName)
      }
      this.menuBreadOpen = false
    },
    toggleMenuBread() {
      this.menuBreadOpen = !this.menuBreadOpen
    }
  }
}
</script>
<style lang="scss" scoped>
.menu-bread {
  position: relative;
  width: 34px;
  height: 34px;
  cursor: pointer;
  flex-shrink: 0;
  background: transparent;
  border: 0;
  padding: 0;

  .bread-icon {
    display: block;
    width: 20px;
    height: 2px;
    background-color: #444;
    position: absolute;
    left: 7px;
    top: 16px;
    transition:
      opacity 0.2s cubic-bezier(0.32, 0.08, 0.24, 1),
      transform 0.4s cubic-bezier(0.52, 0.16, 0.24, 1);
    border-radius: 1px;

    &.top {
      top: 10px;
    }

    &.bottom {
      top: 22px;
    }
  }

  &.current {
    .bread-icon {
      &.top {
        transform: translate3d(0, -10px, 0);
        opacity: 0;
      }

      &.left {
        transform: rotate(45deg);
      }

      &.right {
        transform: rotate(-45deg);
      }

      &.bottom {
        transform: translate3d(0, 10px, 0);
        opacity: 0;
      }
    }
  }
}

.works-header .menu-bread .bread-icon {
  background-color: #f3f0ea;
}

.curtain-menu {
  width: 100%;
  overflow: hidden;
  position: fixed;
  inset: 0;
  z-index: 35;
  background-color: #ffffff;
  padding-top: 72px;
  box-sizing: border-box;
  transform: translate3d(0, -100%, 0);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 0.36s cubic-bezier(0.32, 0.08, 0.24, 1),
    transform 0.56s cubic-bezier(0.52, 0.16, 0.24, 1);

  .menu-item {
    margin: 0 30px;
    height: 50px;
    font-size: 16px;
    font-weight: 600;
    line-height: 50px;
    border-bottom: 1px solid #f1f1f1;
    color: #334155;
    cursor: pointer;
    opacity: 0;
    transform: translate3d(0, -15%, 0);

    &.active {
      color: #0d6eff;
    }
  }

  .menu-theme {
    margin: 24px 30px;
    opacity: 0;
    transform: translate3d(0, -15%, 0);
  }

  &.current {
    transform: translate3d(0, 0, 0);
    opacity: 1;
    pointer-events: auto;

    .menu-item,
    .menu-theme {
      transform: translate3d(0, 0, 0);
      opacity: 1;
    }

    @for $i from 1 through 10 {
      .menu-item:nth-child(#{$i}) {
        transition:
          opacity 0.38s cubic-bezier(0.32, 0.08, 0.24, 1) ($i * 0.1s),
          transform 0.48s cubic-bezier(0.52, 0.16, 0.24, 1) ($i * 0.09s);
      }
    }

    .menu-theme {
      transition:
        opacity 0.38s cubic-bezier(0.32, 0.08, 0.24, 1) 0.4s,
        transform 0.48s cubic-bezier(0.52, 0.16, 0.24, 1) 0.36s;
    }
  }

  &.works-theme {
    background-color: #14181f;

    .menu-item {
      border-bottom-color: rgba(196, 140, 98, 0.15);
      color: #f3f0ea;

      &.active {
        color: #c48c62;
      }
    }
  }
}
</style>

<style lang="scss">
.dark .menu-bread .bread-icon {
  background-color: #cbd5e1;
}

.dark .curtain-menu:not(.works-theme) {
  background-color: #0f172a;

  .menu-item {
    border-bottom-color: rgba(148, 163, 184, 0.15);
    color: #e2e8f0;

    &.active {
      color: #38bdf8;
    }
  }
}
</style>

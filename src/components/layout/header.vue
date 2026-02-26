<template>
  <div
    class="sticky top-0 z-40 w-full backdrop-blur flex-none transition-colors duration-500 lg:z-50 lg:border-b lg:border-slate-900/10 dark:border-slate-50/[0.06] bg-white/95 supports-backdrop-blur:bg-white/60 dark:bg-transparent"
    :class="{ plain: plain }"
  >
    <div class="max-w-8xl mx-auto">
      <div
        class="py-4 border-b border-slate-900/10 lg:px-8 lg:border-0 dark:border-slate-300/10 mx-4 lg:mx-0"
      >
        <div class="relative flex items-center">
          <img :src="logo" class="h-8 w-auto" @click="handleNavigateTo('/')" />
          <div class="relative hidden lg:flex items-center ml-auto">
            <nav class="text-sm leading-6 font-semibold text-slate-700 dark:text-slate-200">
              <ul class="flex space-x-8">
                <li
                  v-for="item in menuList"
                  :key="item.pathname"
                  :style="{ color: isCurrentPage(item.pathname) ? '#0d6eff' : 'inherit' }"
                >
                  <a :href="item.pathname" class="hover:text-sky-500 dark:hover:text-sky-400">{{
                    item.name
                  }}</a>
                </li>
              </ul>
            </nav>
            <div
              class="flex items-center border-l border-slate-200 ml-6 pl-6 dark:border-slate-800"
            >
              <ThemeToggle panel-class-name="mt-4" />
            </div>
          </div>
          <div
            v-if="isMobile"
            class="menu-bread"
            :class="{ current: menuBreadOpen }"
            @click="toggleMenuBread"
          >
            <div class="bread-icon top" />
            <div class="bread-icon left" />
            <div class="bread-icon right" />
            <div class="bread-icon bottom" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import logo from '@/assets/logo.svg'
import ThemeToggle from '@/components/ThemeToggle.vue'
export default {
  name: 'FrameHeader',
  props: {
    plain: { default: false }
  },
  components: {
    ThemeToggle
  },
  data() {
    return {
      logo,
      screenWidth: document.body.clientWidth,
      menuBreadOpen: false,
      menuList: [
        { name: 'Blog', pathname: '/' },
        { name: 'ShowCase', pathname: '/show-case' },
        { name: 'Templates', pathname: '/templates' }
      ]
    }
  },
  computed: {
    isMobile() {
      return this.screenWidth < 576
    },
    isCurrentPage() {
      return (itemPathname, isExternal) => {
        // 外链不参与高亮判断
        if (isExternal) {
          return false
        }

        // 移除查询参数
        itemPathname = itemPathname.split('?')[0]

        // 使用$route.path，Vue Router会自动处理base路径
        const currentPath = this.$route.path

        // 处理末尾斜杠的情况，统一比较
        const normalizedCurrentPath = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '')
        const normalizedItemPath = itemPathname === '/' ? '/' : itemPathname.replace(/\/$/, '')

        // 完全匹配
        if (normalizedCurrentPath === normalizedItemPath) {
          return true
        }

        // 首页特殊处理
        if (normalizedItemPath === '/') {
          return false
        }

        // 子路由匹配：currentPath 以 itemPathname/ 开头
        // 例如：/components/button 匹配 /components
        return normalizedCurrentPath.startsWith(normalizedItemPath + '/')
      }
    }
  },
  mounted() {
    window.onresize = () => {
      this.screenWidth = document.body.clientWidth
    }
  },
  methods: {
    handleNavigateTo(pageName, isExternal) {
      // 如果是外链，在新标签页打开
      if (isExternal || pageName.startsWith('http://') || pageName.startsWith('https://')) {
        window.open(pageName, '_blank')
        this.menuBreadOpen = false
        return
      }

      // 内部路由跳转
      if (location.pathname !== pageName) {
        this.$router.push(pageName)
        this.menuBreadOpen = false
      }
    },
    toggleMenuBread() {
      this.menuBreadOpen = !this.menuBreadOpen
    }
  }
}
</script>
<style lang="scss" scoped>
.header-wrap {
  height: 64px;
  user-select: none;
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  background-color: #ffffff;
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.06);

  z-index: 9;
  &.plain {
    position: absolute;
  }
  .curtain-menu {
    width: 100%;
    height: 100vh;
    overflow: hidden;
    position: fixed;
    top: 0;
    left: 0;
    z-index: 1;
    background-color: #ffffff;
    padding-top: 64px;
    box-sizing: border-box;
    transform: translate3d(0, -100%, 0);
    opacity: 0;
    transition:
      opacity 0.36s cubic-bezier(0.32, 0.08, 0.24, 1),
      transform 0.56s cubic-bezier(0.52, 0.16, 0.24, 1);
    .menu-item {
      margin: 0 30px;
      height: 50px;
      font-size: 14px;
      line-height: 50px;
      border-bottom: 1px solid #f1f1f1;
      opacity: 0;
      transform: translate3d(0, -15%, 0);
    }
    &.current {
      transform: translate3d(0, 0, 0);
      opacity: 1;
      .menu-item {
        transform: translate3d(0, 0, 0);
        opacity: 1;
      }
      @for $i from 1 through 10 {
        .menu-item:nth-child(#{$i}) {
          transition:
            opacity 0.38s cubic-bezier(0.32, 0.08, 0.24, 1) ($i * 0.14s),
            transform 0.48s cubic-bezier(0.32, 0.08, 0.24, 1) ($i * 0.13s);
        }
      }
    }
  }
  .header-wrap-row {
    z-index: 3;
    position: relative;
    height: 64px;
    font-size: 14px;
    color: #222;
    display: flex;
    align-items: center;
    justify-content: space-between;
    flex-direction: row;
    background-color: #ffffff;
    .logo {
      width: 156px;
      height: 30px;
      flex-shrink: 0;
      flex-grow: 0;
      display: block;
      cursor: pointer;
      margin-left: 30px;
    }
    .menu-bread {
      position: absolute;
      right: 15px;
      top: 15px;
      width: 34px;
      height: 34px;
      cursor: pointer;
      .bread-icon {
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
    .menu {
      display: flex;
      align-items: center;
      justify-content: center;
      .menu-item {
        font-size: 14px;
        color: #222;
        width: 120px;
        height: 64px;
        display: flex;
        align-items: center;
        justify-content: center;
        cursor: pointer;
        &.current,
        &:hover {
          color: #0d6eff;
        }
      }
    }
  }
  @media (max-width: 750px) {
    .header-wrap {
      position: fixed !important;
    }
    .header-wrap-row {
      justify-content: center;
      .logo {
        width: 125px;
        height: 24px;
        margin-left: 0;
      }
    }
  }
  @media (min-width: 1600px) {
    .header-wrap-row {
      width: 1600px;
      margin: 0 auto;
    }
  }
}
</style>

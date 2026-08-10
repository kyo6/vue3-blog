import { createRouter, createWebHistory } from 'vue-router'
import BlogList from '../views/blog/List.vue'
import BlogArticle from '../views/blog/Article.vue'

const docModules = import.meta.glob('../views/docs/*.vue')

const docChildren = Object.entries(docModules).map(([filePath, component]) => {
  const name = filePath.match(/\/([^/]+)\.vue$/)[1]
  return {
    path: name,
    name: `docs-${name}`,
    component
  }
})

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'blog',
      component: BlogList
    },
    {
      path: '/blog/:id',
      name: 'blog-article',
      component: BlogArticle
    },
    {
      path: '/docs',
      component: () => import('../layout/sidebar.vue'),
      children: [
        ...docChildren,
        {
          path: '',
          redirect: { name: 'docs-installation' }
        }
      ]
    },
    {
      path: '/works',
      name: 'works',
      component: () => import('../views/works/index.vue')
    },
    {
      path: '/works/:id',
      name: 'works-detail',
      component: () => import('../views/works/detail.vue')
    },
    // 旧路径兼容
    {
      path: '/templates/slides-api-management-intro',
      redirect: '/works/slides-api-management-intro'
    },
    {
      path: '/docs/slides-api-management-intro',
      redirect: '/works/slides-api-management-intro'
    },
    {
      path: '/docs/examples',
      redirect: '/docs/css-card'
    },
    {
      path: '/templates/:pathMatch(.*)*',
      redirect: (to) => {
        const rest = to.params.pathMatch
        const suffix = Array.isArray(rest) ? rest.join('/') : rest || ''
        return suffix ? `/docs/${suffix}` : '/docs'
      }
    },
    {
      path: '/show-case',
      redirect: '/docs/css-card'
    }
  ]
})

export default router

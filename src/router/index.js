import { createRouter, createWebHistory } from 'vue-router'
import BlogList from '../views/blog/List.vue'
import BlogArticle from '../views/blog/Article.vue'

const templateModules = import.meta.glob('../views/templates/*.vue')

const templateChildren = Object.entries(templateModules).map(([filePath, component]) => {
  const name = filePath.match(/\/([^/]+)\.vue$/)[1]
  return {
    path: name,
    name: `templates-${name}`,
    component
  }
})

const firstTemplatePath = templateChildren[0]?.path ?? ''

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
      path: '/show-case',
      name: 'show-case',
      component: () => import('../views/show-case/index.vue')
    },
    {
      path: '/templates',
      component: () => import('../layout/sidebar.vue'),
      children: [
        ...templateChildren,
        {
          path: '',
          redirect: `/templates/${firstTemplatePath}`
        }
      ]
    }
  ]
})

export default router

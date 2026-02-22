import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'blog',
      component: HomeView
    },
    {
      path: '/show-case',
      name: 'show-case',
      // route level code-splitting
      // this generates a separate chunk (About.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('../views/show-case/index.vue')
    },
    {
      path: '/templates',
      name: 'templates',
      component: () => import('../views/templates/index.vue')
    }
  ]
})

export default router

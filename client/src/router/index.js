import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/map', name: 'metro-map', component: () => import('../views/MetroMapView.vue') },
  { path: '/areas', name: 'areas', component: () => import('../views/AreaListView.vue') },
  { path: '/areas/:id', name: 'area-detail', component: () => import('../views/AreaDetailView.vue') },
  { path: '/submit', name: 'submit', component: () => import('../views/SubmitView.vue') },
  { path: '/admin/login', name: 'admin-login', component: () => import('../views/admin/AdminLogin.vue'), meta: { guestOnly: true } },
  { path: '/admin/review', name: 'admin-review', component: () => import('../views/admin/ReviewQueue.vue'), meta: { requiresAuth: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('admin_token')
  if (to.meta.requiresAuth && !token) {
    next({ name: 'admin-login', query: { redirect: to.fullPath } })
  } else if (to.meta.guestOnly && token) {
    next({ name: 'admin-review' })
  } else {
    next()
  }
})

export default router

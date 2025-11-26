// src/router/index.ts
import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('@/views/Login.vue'),
      meta: { requiresGuest: true }
    },
    {
      path: '/dashboard',
      name: 'Dashboard',
      component: () => import('@/views/Dashboard.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/inventario',
      name: 'Inventario',
      component: () => import('@/views/Inventario.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/productos',
      name: 'Productos',
      component: () => import('@/views/Productos.vue'),
      meta: { requiresAuth: true }
    },
    {
      path: '/proveedores',
      name: 'Proveedores',
      component: () => import('@/views/Proveedores.vue'),
      meta: { requiresAuth: true }
    },
    /*{
      path: '/categorias',
      name: 'Categorias',
      component: () => import('@/views/Categorias.vue'),
      meta: { requiresAuth: true }
    },*/
    {
      path: '/',
      redirect: '/dashboard'
    }
  ]
})

router.beforeEach((to, from, next) => {
  const token = localStorage.getItem('auth_token')

  if (to.meta.requiresAuth && !token) {
    next('/login')
  } else if (to.meta.requiresGuest && token) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router
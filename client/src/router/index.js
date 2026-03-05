import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth.js'

const Home         = () => import('../views/Home.vue')
const Login        = () => import('../views/Login.vue')
const Register     = () => import('../views/Register.vue')
const EventsPublic = () => import('../views/EventsPublic.vue')
const Dashboard    = () => import('../views/Dashboard.vue')

const routes = [
  { path: '/',          name: 'home',      component: Home,         meta: { guestOnly: true, fullWidth: true } },
  { path: '/login',     name: 'login',     component: Login,        meta: { guestOnly: true } },
  { path: '/register',  name: 'register',  component: Register,     meta: { guestOnly: true } },
  { path: '/events',    name: 'events',    component: EventsPublic  },
  { path: '/dashboard', name: 'dashboard', component: Dashboard,    meta: { requiresAuth: true, requiresAdmin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to) => {
  const auth = useAuthStore()

  // Route protégée : doit être connecté
  if (to.meta?.requiresAuth && !auth.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }

  // Route admin : doit être admin
  if (to.meta?.requiresAdmin && auth.isAuthenticated && !auth.isAdmin) {
    return { name: 'events' }
  }

  // Route invité : si déjà connecté → rediriger selon le rôle
  if (to.meta?.guestOnly && auth.isAuthenticated) {
    return auth.isAdmin ? { name: 'dashboard' } : { name: 'events' }
  }

  return true
})

export default router

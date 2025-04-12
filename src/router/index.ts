import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import MedicinalPlants from '../views/plant/MedicinalPlants.vue'
import MedicinalPlantDetail from '../views/plant/MedicinalPlantDetail.vue'
import CommonDiseases from '../views/disease/CommonDiseases.vue'
import DiseaseDetail from '../views/disease/DiseaseDetail.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import ResetPassword from '../views/auth/ResetPassword.vue'
import Profile from '../views/profile/Profile.vue'

console.log('Router configuration loaded')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/plant',
      name: 'plant',
      component: MedicinalPlants
    },
    {
      path: '/plant/:id',
      name: 'plant-detail',
      component: MedicinalPlantDetail
    },
    {
      path: '/disease',
      name: 'disease',
      component: CommonDiseases
    },
    {
      path: '/disease/:id',
      name: 'disease-detail',
      component: DiseaseDetail
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    },
    {
      path: '/register',
      name: 'register',
      component: Register
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    },  
    {
      path: '/reset-password',
      name: 'reset-password',
      component: ResetPassword
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { requiresAuth: true }
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  console.log(`Navigation: ${from.path} -> ${to.path}`)
  console.log(`Route name: ${String(to.name)}`)
  console.log(`Route params:`, to.params)
  console.log(`Route meta:`, to.meta)
  
  const isAuthenticated = localStorage.getItem('token')
  console.log(`User authenticated: ${!!isAuthenticated}`)
  
  if (to.meta.requiresAuth && !isAuthenticated) {
    console.log('Authentication required, redirecting to login')
    next('/login')
  } else {
    console.log('Navigation allowed')
    next()
  }
})

// After navigation
router.afterEach((to, from) => {
  console.log(`Navigation completed: ${from.path} -> ${to.path}`)
})

export default router
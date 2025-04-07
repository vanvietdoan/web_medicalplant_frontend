import { createRouter, createWebHistory } from 'vue-router'
import Home from '../views/Home.vue'
import MedicinalPlants from '../views/MedicinalPlants.vue'
import MedicinalPlantDetail from '../views/MedicinalPlantDetail.vue'
import CommonDiseases from '../views/CommonDiseases.vue'
import DiseasesDetail from '../views/DiseaseDetail.vue'
import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import ForgotPassword from '../views/ForgotPassword.vue'
import ResetPassword from '../views/ResetPassword.vue'
import Profile from '../views/Profile.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/medicinal-plants',
      name: 'medicinal-plants',
      component: MedicinalPlants
    },
    {
      path: '/medicinal-plant-detail/:id',
      name: 'medicinal-plant-detail',
      component: MedicinalPlantDetail
    },
    {
      path: '/common-diseases',
      name: 'common-diseases',
      component: CommonDiseases
    },
    {
      path: '/diseases-detail/:id',
      name: 'diseases-detail',
      component: DiseasesDetail
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
      path: '/reset-password/:token',
      name: 'ResetPassword',
      component: ResetPassword
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    }
  ]
})

export default router
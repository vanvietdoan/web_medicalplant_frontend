import { createRouter, createWebHistory } from 'vue-router'

import Home from '../views/Home.vue'
import MedicinalPlants from '../views/plant/MedicinalPlants.vue'
import MedicinalPlantDetail from '../views/plant/MedicinalPlantDetail.vue'
import CommonDiseases from '../views/disease/CommonDiseases.vue'
import DiseaseDetail from '../views/disease/DiseaseDetail.vue'
import CreateAdvice from '../views/Advice/CreateAdvice.vue'
import Login from '../views/auth/Login.vue'
import Register from '../views/auth/Register.vue'
import ForgotPassword from '../views/auth/ForgotPassword.vue'
import ChangePassword from '../views/auth/ChangePassword.vue'
import Profile from '../views/profile/Profile.vue'
import EditProfile from '../views/profile/EditProfile.vue'
import ManageAdvice from '../views/Advice/ManageAdvice.vue'
import VisitProfile from '../views/profile/VisitProfile.vue'
import EditAdvice from '../views/Advice/EditAdvice.vue'
import ManageReport from '../views/Report/ManageReport.vue'
import CreateReport from '../views/Report/CreateReport.vue'
import EditReport from '../views/Report/EditReport.vue'
import ManageEvalue from '../views/Evalue/ManageEvalue.vue'
import CreateEvalue from '../views/Evalue/CreateEvalue.vue'
import EditEvalue from '../views/Evalue/EditEvalue.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: Home
    },
    {
      path: '/profile/advice',
      name: 'profile-advice',
      component: ManageAdvice,
      meta: { title: 'Quản lý lời khuyên' }
    },
    {
      path: '/plant',
      name: 'plant',
      component: MedicinalPlants,
      meta: { title: 'Cây thuốc' }
    },
    {
      path: '/plant/newest',
      name: 'plant-newest',
      component: MedicinalPlants,
      meta: { title: 'Cây thuốc mới nhất' }
    },
    {
      path: '/plant/multiUse',
      name: 'plant-multiUse',
      component: MedicinalPlants,
      meta: { title: 'Cây thuốc đa công dụng' }
    },
    {
      path: '/plant/:id',
      name: 'plant-detail',
      component: MedicinalPlantDetail,
      meta: { title: 'Chi tiết cây thuốc' }
    },
    {
      path: '/plant/create-advice',
      name: 'plant-advice-create',
      component: CreateAdvice,
      meta: { title: 'Tạo lời khuyên' }
    },
    
    {
      path: '/disease',
      name: 'disease',
      component: CommonDiseases,
      meta: { title: 'Bệnh thường gặp' }
    },
    {
      path: '/disease/:id',
      name: 'disease-detail',
      component: DiseaseDetail,
      meta: { title: 'Chi tiết bệnh' }
    },
    {
      path: '/disease/create-advice',
      name: 'disease-advice-create',
      component: CreateAdvice,
      meta: { title: 'Tạo lời khuyên' }
    },
    
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { title: 'Đăng nhập' }
    },
    {
      path: '/register',
      name: 'register',
      component: Register,
      meta: { title: 'Đăng ký' }
    },
    {
      path: '/forgot-password',
      name: 'forgot-password',
      component: ForgotPassword,
      meta: { title: 'Quên mật khẩu' }
    },  
    {
      path: '/change-password',
      name: 'change-password',
      component: ChangePassword,
      meta: { title: 'Đổi mật khẩu' }
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile,
      meta: { title: 'Trang cá nhân' }
    },
    {
      path: '/profile/edit',
      name: 'profile-edit',
      component: EditProfile,
      meta: { title: 'Chỉnh sửa thông tin' }
    },
    {
      path: '/profile/:id',
      name: 'profile-visit',
      component: VisitProfile,
      meta: { title: 'Trang cá nhân' }
    },
    { 
      path: '/profile/advice/:id/edit',
      name: 'user-advice-edit',
      component: EditAdvice,
      meta: { title: 'Chỉnh sửa lời khuyên' }
    },
    {
      path: '/profile/advice/create',
      name: 'user-advice-create',
      component: CreateAdvice,
      meta: { title: 'Tạo lời khuyên' }
    },
    {
      path: '/profile/report',
      name: 'profile-report',
      component: ManageReport,
      meta: { title: 'Quản lý báo cáo' }
    },
    {
      path: '/report/create',
      name: 'report-create',
      component: CreateReport,
      meta: { title: 'Tạo báo cáo' }
    },  
    {
      path: '/report/:id/edit',
      name: 'report-edit',
      component: EditReport,
      meta: { title: 'Chỉnh sửa báo cáo' }
    },
    {
      path: '/profile/evalue',
      name: 'evalue',
      component: ManageEvalue,
      meta: { title: 'Quản lý đánh giá' }
    },  
    {
      path: '/profile/evalue/create',
      name: 'evalue-create',
      component: CreateEvalue,
      meta: { title: 'Tạo đánh giá' }
    },
    {
      path: '/profile/evalue/:id/edit',
      name: 'evalue-edit',
      component: EditEvalue,
      meta: { title: 'Chỉnh sửa đánh giá' }
    },
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
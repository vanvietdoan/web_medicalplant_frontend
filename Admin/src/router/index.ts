import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import PlantList from '../views/plants/PlantList.vue'
import CreatePlant from '../views/plants/CreatePlant.vue'
import EditPlant from '../views/plants/EditPlant.vue'
import DiseaseList from '../views/diseases/DiseasesList.vue'
import CreateDisease from '../views/diseases/CreateDisease.vue'
import EditDisease from '../views/diseases/EditDisease.vue'
import UserList from '../views/users/UserList.vue'
import UserEdit from '../views/users/UserEdit.vue'
import UserCreate from '../views/users/UserCreate.vue'
import AdviceList from '../views/advices/AdviceList.vue'
import AdviceCreate from '../views/advices/AdviceCreate.vue'
import AdviceEdit from '../views/advices/AdviceEdit.vue'
import ReportList from '../views/reports/ReportList.vue'
import EditReport from '../views/reports/EditReport.vue'
import CreateReport from '../views/reports/CreateReport.vue'

import listDivision from '../views/fillter/Division/listDivision.vue'
import editDivision from '../views/fillter/Division/editDivision.vue'
import CreateDivision from '../views/fillter/Division/CreateDivision.vue'
import listClass from '../views/fillter/Class/listClass.vue'  
import editClass from '../views/fillter/Class/editClass.vue'
import createClass from '../views/fillter/Class/createClass.vue'
import listOrder from '../views/fillter/Order/listOrder.vue'
import editOrder from '../views/fillter/Order/editOrder.vue'
import listFamily from '../views/fillter/Family/listFamily.vue'
import editFamily from '../views/fillter/Family/editFamily.vue'
import listGenus from '../views/fillter/Genus/listGenus.vue'
import editGenus from '../views/fillter/Genus/editGenus.vue'
import listSpecies from '../views/fillter/Species/listSpecies.vue'
import editSpecies from '../views/fillter/Species/editSpecies.vue'
import createOrder from '../views/fillter/Order/createOrder.vue'
import createFamily from '../views/fillter/Family/createFamily.vue'
import createGenus from '../views/fillter/Genus/createGenus.vue'
import createSpecies from '../views/fillter/Species/createSpecies.vue'
import listStatistics from '../views/statistics/listStatistics.vue'
import chartStatistics from '../views/statistics/chartStatistics.vue'
import EvalueList from '../views/evalue/EvalueList.vue'
import CreateEvalue from '../views/evalue/CreateEvalue.vue'
import EditEvalue from '../views/evalue/EditEvalue.vue'

const router = createRouter({ 
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login,
      meta: { requiresAuth: false }
    },
    {
      path: '/admin',
      component: AdminLayout,
      meta: { requiresAuth: true },
      children: [
        {
          path: '',
          redirect: '/admin/statistics'
        },
        {
          path: 'statistics',
          name: 'statistics',
          component: listStatistics,
          meta: { title: 'Thống kê' }
        },
        {
          path: 'statistics/:type',
          name: 'chart-statistics',
          component: chartStatistics,
          props: true,
          meta: { title: 'Biểu đồ thống kê' }
        },
        {
          path: 'plants',
          name: 'plants',
          component: PlantList,
          meta: { title: 'Quản lý cây thuốc' }
        },
        {
          path: 'plants/create',
          name: 'plant-create',
          component: CreatePlant,
          meta: { title: 'Thêm cây thuốc' }
        },
        {
          path: 'plants/:id/edit',
          name: 'plant-edit',
          component: EditPlant,
          props: true,
          meta: { title: 'Sửa cây thuốc' }
        },
        {
          path: 'diseases',
          name: 'diseases',
          component: DiseaseList,
          meta: { title: 'Quản lý bệnh' }
        },
        {
          path: 'diseases/create',
          name: 'disease-create',
          component: CreateDisease,
          meta: { title: 'Thêm bệnh' }
        },
        {
          path: 'diseases/:id/edit',
          name: 'disease-edit',
          component: EditDisease,
          props: true,
          meta: { title: 'Sửa bệnh' }
        },
        
        {
          path: 'users',
          name: 'users',
          component: UserList,
          meta: { title: 'Quản lý người dùng' }
        },
        {
          path: 'users/:id/edit',
          name: 'user-edit',
          component: UserEdit,
          props: true,
          meta: { title: 'Sửa người dùng' }
        },
        {
          path: 'users/create',
          name: 'user-create',
          component: UserCreate,
          meta: { title: 'Thêm người dùng' }
        },
        {
          path: 'advices',
          name: 'advices',
          component: AdviceList,
          meta: { title: 'Quản lý lời khuyên' }
        },
        {
          path: 'advices/create',
          name: 'advice-create',
          component: AdviceCreate,
          meta: { title: 'Thêm lời khuyên' }
        },
        {
          path: 'advices/:id/edit',
          name: 'advice-edit',
          component: AdviceEdit,
          props: true,
          meta: { title: 'Sửa lời khuyên' }
        },
        {
          path: 'filter',
          meta: { title: 'Quản lý phân loại' },
          children: [
            {
              path: 'division',
              name: 'listDivision',
              component: listDivision,
              meta: { title: 'Quản lý ngành' }
            },
            {
              path: 'division/create',
              name: 'createDivision',
              component: CreateDivision,
              meta: { title: 'Thêm ngành' }
            },
            {
              path: 'division/:id/edit',
              name: 'editDivision',
              component: editDivision,
              props: true,
              meta: { title: 'Sửa ngành' }
            },
            {
              path: 'class',
              name: 'listClass',
              component: listClass,
              meta: { title: 'Quản lý lớp' }
            },
            {
              path: 'class/create',
              name: 'createClass',
              component: createClass,
              meta: { title: 'Thêm lớp' }
            },
            {
              path: 'class/:id/edit',
              name: 'editClass',
              component: editClass,
              props: true,
              meta: { title: 'Sửa lớp' }
            },
            {
              path: 'order',
              name: 'listOrder',
              component: listOrder,
              meta: { title: 'Quản lý bộ' }
            },
            {
              path: 'order/create',
              name: 'createOrder',
              component: createOrder,
              meta: { title: 'Thêm bộ' }
            },
            {
              path: 'order/:id/edit',
              name: 'editOrder',
              component: editOrder,
              props: true,
              meta: { title: 'Sửa bộ' }
            },
            {
              path: 'family',
              name: 'listFamily',
              component: listFamily,
              meta: { title: 'Quản lý họ' }
            },
            {
              path: 'family/create',
              name: 'createFamily',
              component: createFamily,
              meta: { title: 'Thêm họ' }
            },
            {
              path: 'family/:id/edit',
              name: 'editFamily',
              component: editFamily,
              props: true,
              meta: { title: 'Sửa họ' }
            },
            {
              path: 'genus',
              name: 'listGenus',
              component: listGenus,
              meta: { title: 'Quản lý chi' }
            },
            {
              path: 'genus/create',
              name: 'createGenus',
              component: createGenus,
              meta: { title: 'Thêm chi' }
            },
            {
              path: 'genus/:id/edit',
              name: 'editGenus',
              component: editGenus,
              props: true,
              meta: { title: 'Sửa chi' }
            },
            {
              path: 'species',
              name: 'listSpecies',
              component: listSpecies,
              meta: { title: 'Quản lý loài' }
            },
            {
              path: 'species/create',
              name: 'createSpecies',
              component: createSpecies,
              meta: { title: 'Thêm loài' }
            },
            {
              path: 'species/:id/edit',
              name: 'editSpecies',
              component: editSpecies,
              props: true,
              meta: { title: 'Sửa loài' }
            }
          ]
        },
        {
          path: 'reports',
          name: 'reports',
          component: ReportList,
          meta: { requiresAuth: true }
        },
        {
          path: 'reports/pending',
          name: 'pendingReports',
          component: ReportList,
          meta: { requiresAuth: true }
        },
        {
          path: 'reports/create',
          name: 'CreateReport',
          component: CreateReport,
          meta: { requiresAuth: true }
        },
        {
          path: 'reports/edit/:id',
          name: 'EditReport',
          component: EditReport,
          meta: { requiresAuth: true }
        },
        {
          path: 'evalues',
          name: 'evalues',
          component: EvalueList,
          meta: { title: 'Quản lý đánh giá' }
        },
        {
          path: 'evalues/create',
          name: 'createEvalue',
          component: CreateEvalue,
          meta: { title: 'Thêm đánh giá' }
        },
        {
          path: 'evalues/:id/edit',
          name: 'editEvalue',
          component: EditEvalue,
          props: true,
          meta: { title: 'Sửa đánh giá' }
        }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const requiresAuth = to.matched.some(record => record.meta.requiresAuth !== false)
  
  // Update document title
  document.title = to.meta.title ? `${to.meta.title} - Admin` : 'Admin'
  
  // Check if token exists and is valid
  const isAuthenticated = token && token !== 'undefined' && token !== 'null'
  
  // If route requires auth and user is not authenticated
  if (requiresAuth && !isAuthenticated) {
    // Clear any invalid token
    localStorage.removeItem('token')
    next({ name: 'login' })
    return
  }
  
  // If user is authenticated and trying to access login page
  if (isAuthenticated && to.name === 'login') {
    next({ path: '/admin' })
    return
  }
  
  // For all other routes, require authentication
  if (to.path !== '/' && !isAuthenticated) {
    localStorage.removeItem('token')
    next({ name: 'login' })
    return
  }
  
  // Otherwise proceed normally
  next()
})

export default router 
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import AdminLayout from '../layouts/AdminLayout.vue'
import PlantList from '../views/plants/PlantList.vue'
import CreatePlant from '../views/plants/CreatePlant.vue'
import EditPlant from '../views/plants/EditPlant.vue'
import DiseaseList from '../views/diseases/DiseasesList.vue'
import CreateDisease from '../views/diseases/CreateDisease.vue'
import EditDisease from '../views/diseases/EditDisease.vue'
import CommentList from '../views/comments/CommentList.vue'
import UserList from '../views/users/UserList.vue'
import UserEdit from '../views/users/UserEdit.vue'
import UserCreate from '../views/users/UserCreate.vue'
import AdviceList from '../views/advices/AdviceList.vue'
import AdviceCreate from '../views/advices/AdviceCreate.vue'
import AdviceEdit from '../views/advices/AdviceEdit.vue'

import listDivision from '../views/fillter/Division/listDivision.vue'
import editDivision from '../views/fillter/Division/editDivision.vue'
import CreateDivision from '../views/fillter/Division/CreateDivision.vue'
import listClass from '../views/fillter/Class/listClass.vue'  
import editClass from '../views/fillter/Class/editClass.vue'
import CreateClass from '../views/fillter/Class/createClass.vue'
import listOrder from '../views/fillter/Order/listOrder.vue'
import editOrder from '../views/fillter/Order/editOrder.vue'
import listFamily from '../views/fillter/Family/listFamily.vue'
import editFamily from '../views/fillter/Family/editFamily.vue'
import listGenus from '../views/fillter/Genus/listGenus.vue'
import editGenus from '../views/fillter/Genus/editGenus.vue'
import listSpecies from '../views/fillter/Species/listSpecies.vue'
import editSpecies from '../views/fillter/Species/editSpecies.vue'
import createOrder from '../views/fillter/Order/createOrder.vue'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'login',
      component: Login
    },
    {
      path: '/admin',
      component: AdminLayout,
      children: [
        {
          path: '',
          redirect: '/admin/plants'
        },
        {
          path: 'plants',
          name: 'plants',
          component: PlantList
        },
        {
          path: 'plants/create',
          name: 'plant-create',
          component: CreatePlant
        },
        {
          path: 'plants/:id/edit',
          name: 'plant-edit',
          component: EditPlant,
          props: true
        },
        {
          path: 'diseases',
          name: 'diseases',
          component: DiseaseList
        },
        {
          path: 'diseases/create',
          name: 'disease-create',
          component: CreateDisease
        },
        {
          path: 'diseases/:id/edit',
          name: 'disease-edit',
          component: EditDisease,
          props: true
        },
        {
          path: 'comments',
          name: 'comments',
          component: CommentList
        },
        {
          path: 'users',
          name: 'users',
          component: UserList
        },
        {
          path: 'users/:id/edit',
          name: 'user-edit',
          component: UserEdit,
          props: true
        },
        {
          path: 'users/create',
          name: 'user-create',
          component: UserCreate
        },
        {
          path: 'advices',
          name: 'advices',
          component: AdviceList
        },
        {
          path: 'advices/create',
          name: 'advice-create',
          component: AdviceCreate
        },
        {
          path: 'advices/:id/edit',
          name: 'advice-edit',
          component: AdviceEdit,
          props: true
        },
        {
          path: 'filter',
          
          children: [
            {
              path: 'division',
              name: 'listDivision',
              component: listDivision
            },
            {
              path: 'division/create',
              name: 'createDivision',
              component: CreateDivision
            },
            {
              path: 'division/:id/edit',
              name: 'editDivision',
              component: editDivision,
              props: true
            },
            {
              path: 'class',
              name: 'listClass',
              component: listClass
            },
            {
              path: 'class/create',
              name: 'createClass',
              component: editClass
            },
            {
              path: 'class/create',
              name: 'createClass',
              component: CreateClass
            },
            {
              path: 'class/:id/edit',
              name: 'editClass',
              component: editClass,
              props: true
            },
            {
              path: 'order',
              name: 'listOrder',
              component: listOrder
            },
            {
              path: 'order/create',
              name: 'createOrder',
              component: createOrder
            },
            {
              path: 'order/:id/edit',
              name: 'editOrder',
              component: editOrder,
              props: true
            },
            {
              path: 'family',
              name: 'listFamily',
              component: listFamily
            },
            {
              path: 'family/create',
              name: 'createFamily',
              component: editFamily
            },
            {
              path: 'family/:id/edit',
              name: 'editFamily',
              component: editFamily,
              props: true
            },
            {
              path: 'genus',
              name: 'listGenus',
              component: listGenus
            },
            {
              path: 'genus/create',
              name: 'createGenus',
              component: editGenus
            },
            {
              path: 'genus/:id/edit',
              name: 'editGenus',
              component: editGenus,
              props: true
            },
            {
              path: 'species',
              name: 'listSpecies',
              component: listSpecies
            },
            {
              path: 'species/create',
              name: 'createSpecies',
              component: editSpecies
            },
            {
              path: 'species/:id/edit',
              name: 'editSpecies',
              component: editSpecies,
              props: true
            }
          ]
        }
      ]
    }
  ]
})

// Navigation guard
router.beforeEach((to, _from, next) => {
  const isAuthenticated = localStorage.getItem('token')
  
  if (to.path === '/') {
    if (isAuthenticated) {
      next('/admin')
    } else {
      next()
    }
  } else if (to.path.startsWith('/admin')) {
    if (isAuthenticated) {
      next()
    } else {
      next('/')
    }
  } else {
    next()
  }
})

export default router 
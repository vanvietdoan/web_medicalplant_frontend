import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import PlantList from '../views/plants/PlantList.vue'
import DiseaseList from '../views/diseases/DiseaseList.vue'
import CommentList from '../views/comments/CommentList.vue'
import UserList from '../views/users/UserList.vue'
import UserEdit from '../views/users/UserEdit.vue'
import UserCreate from '../views/users/UserCreate.vue'
import Login from '../views/Login.vue'      

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
          path: 'diseases',
          name: 'diseases',
          component: DiseaseList
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
          component: UserEdit
        },
        {
          path: 'users/create',
          name: 'user-create',
          component: UserCreate
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
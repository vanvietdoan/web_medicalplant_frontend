import { createRouter, createWebHistory } from 'vue-router'
import AdminLayout from '../layouts/AdminLayout.vue'
import PlantList from '../views/plants/PlantList.vue'
import DiseaseList from '../views/diseases/DiseaseList.vue'
import CommentList from '../views/comments/CommentList.vue'
import UserList from '../views/users/UserList.vue'
import Login from '../views/Login.vue'      
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
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
        }
      ]
    },
    {
      path: '/login',
      name: 'login',
      component: Login
    }
  ]
})

// Navigation guard
router.beforeEach((to, from, next) => {
  const isAuthenticated = localStorage.getItem('token') // Replace with your auth logic
  
  if (to.name !== 'login' && !isAuthenticated) {
    next({ name: 'login' })
  } else if (to.name === 'login' && isAuthenticated) {
    next({ name: 'dashboard' })
  } else {
    next()
  }
})
export default router 
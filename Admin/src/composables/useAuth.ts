import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

export const useAuth = () => {
  const router = useRouter()
  const isAuthenticated = ref(!!localStorage.getItem('token'))

  const login = (token: string, user: any) => {
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))
    isAuthenticated.value = true
    ElMessage.success('Login successful')
    router.push('/admin')
  }

  const logout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    isAuthenticated.value = false
    ElMessage.success('Logged out successfully')
    router.push('/')
  }

  return {
    isAuthenticated,
    login,
    logout
  }
} 
<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="logo">
        <img src="../assets/logo.svg" alt="Logo">
      </div>
      <h2>Admin Login</h2>
      <el-form
        ref="loginForm"
        :model="loginForm"
        :rules="rules"
        label-width="0"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
            v-model="loginForm.username"
            placeholder="Username"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="loginForm.password"
            type="password"
            placeholder="Password"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <el-form-item>
          <el-checkbox v-model="loginForm.remember">Remember me</el-checkbox>
          <el-button type="text" class="forgot-password">Forgot password?</el-button>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" class="login-button">
            Login
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'

const router = useRouter()
const loading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  remember: false
})

const rules = {
  username: [
    { required: true, message: 'Please input username', trigger: 'blur' },
    { min: 3, message: 'Length should be at least 3 characters', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Please input password', trigger: 'blur' },
    { min: 6, message: 'Length should be at least 6 characters', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  loading.value = true
  try {
    // TODO: Implement actual login logic
    await new Promise(resolve => setTimeout(resolve, 1000))
    localStorage.setItem('token', 'dummy-token')
    ElMessage.success('Login successful')
    router.push('/admin')
  } catch (error) {
    ElMessage.error('Login failed')
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss">
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #f5f5f5;

  .login-card {
    width: 100%;
    max-width: 400px;
    padding: 20px;

    .logo {
      text-align: center;
      margin-bottom: 20px;
      
      img {
        height: 60px;
      }
    }

    h2 {
      text-align: center;
      margin-bottom: 30px;
      color: #303133;
    }

    .forgot-password {
      float: right;
    }

    .login-button {
      width: 100%;
    }
  }
}
</style> 
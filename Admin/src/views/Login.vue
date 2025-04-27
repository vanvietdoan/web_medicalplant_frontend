

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { authService } from '../services/auth.service'

const router = useRouter()
const loading = ref(false)
const loginForm = ref<FormInstance>()

const formData = reactive({
  email: '',
  password: '',
})

const rules = {
  email: [
    { required: true, message: 'Vui lòng nhập tài khoản', trigger: 'blur' },
    { type: 'email', message: 'Vui lòng nhập đúng định dạng email', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Vui lòng nhập mật khẩu', trigger: 'blur' },
    { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự', trigger: 'blur' }
  ]
}

const handleLogin = async () => {
  if (!loginForm.value) return
  
  try {
    await loginForm.value.validate()
    loading.value = true
    
    await authService.login({
      email: formData.email,
      password: formData.password,
      id: 0,
      role: ''
    })
    
    ElMessage.success('Đăng nhập thành công!')
    router.push('/admin')
  } catch (error) {
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('Đăng nhập thất bại!')
    }
  } finally {
    loading.value = false
  }
}
</script>
<template>
  <div class="login-container">
    <el-card class="login-card">
      <div class="logo">
        <img src="../assets/logo.png" alt="Logo">
      </div>
      <h2>Admin quản lý cây thuốc</h2>
      <el-form
        ref="loginForm"
        :model="formData"
        :rules="rules"
        label-width="0"
        @submit.prevent="handleLogin"
      >
        <el-form-item prop="email">
          <el-input
            v-model="formData.email"
            placeholder="Tài khoản"
            prefix-icon="User"
          />
        </el-form-item>
        <el-form-item prop="password">
          <el-input
            v-model="formData.password"
            type="password"
            placeholder="Mật khẩu"
            prefix-icon="Lock"
            show-password
          />
        </el-form-item>
        <!-- <el-form-item>
          <el-button type="text" class="forgot-password">Quên mật khẩu?</el-button>
        </el-form-item> -->
        <el-form-item>
          <el-button type="primary" native-type="submit" :loading="loading" class="login-button">
            Đăng nhập
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>
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
      margin-top: 20px;
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
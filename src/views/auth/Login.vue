<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../services/auth.service';

const router = useRouter();
const email = ref('');
const password = ref('');
const error = ref('');
const showPassword = ref(false);
const loading = ref(false);

const handleSubmit = async () => {
  error.value = '';
  if (!email.value || !password.value) {
    error.value = 'Vui lòng nhập đầy đủ thông tin đăng nhập.';
    return;
  }
  
  loading.value = true;
  try {
    console.log('Login attempt:', { email: email.value, password: password.value });
    // @ts-ignore - Ignoring type error for now
    const response = await authService.login({
      email: email.value,
      password: password.value
    });
    console.log('Login successful:', response);
    
    // Redirect to test page after successful login
    router.push('/profile');
  } catch (err) {
    console.error('Login error:', err);
    error.value = 'Tài khoản hoặc mật khẩu đăng nhập sai.';
  } finally {
    loading.value = false;
  }
};

const togglePassword = () => {
  showPassword.value = !showPassword.value;
};
</script>

<template>
  <div class="login-page">
    <div class="login-container">
      <div class="login-left">
        <div class="login-header">
          <div class="logo">
            <img src="/images/logo.png" alt="Medical Plant" class="logo-img">
          </div>
          <h1>Đăng nhập</h1>
          <p>Vui lòng nhập đúng thông tin để đăng nhập.</p>
        </div>

        <form @submit.prevent="handleSubmit" class="login-form">
          <div class="form-group">
            <label for="email">Email đăng nhập</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              placeholder="abcd@gmail.com"
              :disabled="loading"
            >
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <div class="password-input">
              <input 
                :type="showPassword ? 'text' : 'password'" 
                id="password" 
                v-model="password"
                placeholder="••••••••"
                :disabled="loading"
              >
              <button type="button" class="toggle-password" @click="togglePassword">
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="error-message" v-if="error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>

          <div class="form-options">
            <a href="/forgot-password" class="forgot-password">Quên mật khẩu?</a>
          </div>

          <div class="form-buttons">
            <button type="submit" class="btn-login" :disabled="loading">
              <i v-if="loading" class="fas fa-spinner fa-spin"></i>
              <span v-else>Đăng nhập</span>
            </button>
            <button type="button" class="btn-register" @click="router.push('/register')" :disabled="loading">Đăng ký</button>
          </div>
        </form>
      </div>

      <div class="login-right">
        <div class="illustration">
          <!-- Hình minh họa xe và phong cảnh -->
        </div>
      </div>
    </div>
  </div>
</template>


<style scoped>
.login-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #008053;
  padding: 2rem;
}

.login-container {
  display: flex;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.login-left {
  flex: 1;
  padding: 3rem;
}

.login-right {
  flex: 1;
  background-color: #FFE4C4;
  display: flex;
  align-items: center;
  justify-content: center;
}

.logo {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100px;
}

.logo-img {
  width: 150px;
  /* height: 50px; */
  object-fit: contain;
  margin-bottom: 1.5rem;
}

.login-header h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.login-header p {
  color: #666;
  margin-bottom: 2rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  color: #2c3e50;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.password-input {
  position: relative;
}

.toggle-password {
  position: absolute;
  right: 1rem;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
}

.error-message {
  background-color: #ffebee;
  color: #dc3545;
  padding: 0.8rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.form-options {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.remember-me {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.forgot-password {
  color: #008053;
  text-decoration: none;
}

.form-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
}

.btn-login, .btn-register {
  flex: 1;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-login {
  background-color: #008053;
  color: white;
  border: none;
}

.btn-register {
  background-color: white;
  color: #008053;
  border: 1px solid #008053;
}

.social-login {
  text-align: center;
}

.social-login p {
  color: #666;
  margin-bottom: 1rem;
  position: relative;
}

.social-login p::before,
.social-login p::after {
  content: '';
  position: absolute;
  top: 50%;
  width: 30%;
  height: 1px;
  background-color: #ddd;
}

.social-login p::before {
  left: 0;
}

.social-login p::after {
  right: 0;
}

.social-buttons {
  display: flex;
  gap: 1rem;
}

.social-btn {
  flex: 1;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.social-btn:hover {
  background-color: #f5f5f5;
}

.illustration {
  width: 70%;
  height: 100%;
  background-image: url('/images/Illustration.png');
  background-size: contain;
  background-position: center;
  background-repeat: no-repeat;
}

@media (max-width: 768px) {
  .login-container {
    flex-direction: column;
  }

  .login-right {
    display: none;
  }

  .login-left {
    padding: 2rem;
  }
}
</style> 
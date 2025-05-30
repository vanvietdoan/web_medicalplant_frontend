<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../services/auth.service';

const router = useRouter();
const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const message = ref('');
const error = ref('');
const showCurrentPassword = ref(false);
const showNewPassword = ref(false);
const showConfirmPassword = ref(false);

// Password validation
const isPasswordValid = computed(() => {
  return newPassword.value.length >= 6;
});

const passwordsMatch = computed(() => {
  return newPassword.value === confirmPassword.value && newPassword.value !== '';
});

const handleSubmit = async () => {
  console.log('Starting password change process');
  
  if (!currentPassword.value) {
    console.log('Validation failed: Current password is empty');
    error.value = 'Vui lòng nhập mật khẩu hiện tại';
    return;
  }
  
  if (!isPasswordValid.value) {
    console.log('Validation failed: Password does not meet requirements');
    error.value = 'Mật khẩu mới phải có ít nhất 6 ký tự';
    return;
  }

  if (!passwordsMatch.value) {
    console.log('Validation failed: Passwords do not match');
    error.value = 'Mật khẩu xác nhận không khớp';
    return;
  }

  try {
    console.log('Sending password change request...');
    isLoading.value = true;
    error.value = '';
    const response = await authService.changePassword(currentPassword.value, newPassword.value);
    console.log('Password change successful:', response);
    message.value = response.message;
    setTimeout(() => {
      console.log('Redirecting to login page...');
      router.push('/login');
    }, 3000);
  } catch (err) {
    console.error('Password change failed:', err);
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra, vui lòng thử lại sau';
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="auth-page">
    <div class="auth-container">
      <div class="auth-left">
        <div class="auth-header">
          <div class="logo">
            <img src="/images/logo.png" alt="Logo" class="logo-img">
          </div>
          <h1>Đổi mật khẩu</h1>
          <p>Cập nhật mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form @submit.prevent="handleSubmit" class="auth-form">
          <div class="form-group">
            <label for="currentPassword">Mật khẩu hiện tại</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input
                :type="showCurrentPassword ? 'text' : 'password'"
                id="currentPassword"
                v-model="currentPassword"
                placeholder="••••••••"
                :disabled="isLoading"
                @input="error = ''"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showCurrentPassword = !showCurrentPassword"
              >
                <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="newPassword">Mật khẩu mới</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input
                :type="showNewPassword ? 'text' : 'password'"
                id="newPassword"
                v-model="newPassword"
                placeholder="••••••••"
                :disabled="isLoading"
                @input="error = ''"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showNewPassword = !showNewPassword"
              >
                <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu mới</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="••••••••"
                :disabled="isLoading"
                @input="error = ''"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
            <div v-if="confirmPassword && !passwordsMatch" class="password-mismatch">
              <i class="fas fa-exclamation-circle"></i>
              Mật khẩu xác nhận không khớp
            </div>
          </div>

          <div v-if="error" class="error-message">
            {{ error }}
          </div>

          <div v-if="message" :class="['message', message.includes('success') ? 'success' : 'error']">
            {{ message }}
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading || !isPasswordValid || !passwordsMatch || !currentPassword">
            <span v-if="!isLoading">Cập nhật mật khẩu</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>

          <div class="form-footer">
            <router-link to="/profile" class="back-link">
              <i class="fas fa-arrow-left"></i>
              Quay lại trang cá nhân
            </router-link>
          </div>
        </form>
      </div>

      <div class="auth-right">
        <div class="illustration">
          <!-- Hình minh họa -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.auth-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #008053;
  padding: 2rem;
}

.auth-container {
  display: flex;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.auth-left {
  flex: 1;
  padding: 3rem;
}

.auth-right {
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
  object-fit: contain;
  margin-bottom: 1.5rem;
}

.auth-header h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
  text-align: center;
}

.auth-header p {
  color: #666;
  margin-bottom: 2rem;
  text-align: center;
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

.input-group {
  position: relative;
}

.input-group i {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.input-group input {
  width: 100%;
  padding: 0.8rem 1rem 0.8rem 2.5rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.input-group input:focus {
  border-color: #008053;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 128, 83, 0.1);
}

.input-group input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
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
  padding: 0;
}

.toggle-password:hover {
  color: #008053;
}

.password-mismatch {
  margin-top: 0.5rem;
  font-size: 0.85rem;
  color: #dc2626;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.error-message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  background-color: #fee2e2;
  color: #dc2626;
}

.message {
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
}

.message.error {
  background-color: #fee2e2;
  color: #dc2626;
}

.message.success {
  background-color: #dcfce7;
  color: #16a34a;
}

.submit-btn {
  width: 100%;
  padding: 0.8rem;
  background-color: #008053;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.submit-btn:hover:not(:disabled) {
  background-color: #006c46;
}

.submit-btn:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

.form-footer {
  margin-top: 1.5rem;
  text-align: center;
}

.back-link {
  color: #008053;
  text-decoration: none;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.back-link:hover {
  color: #006c46;
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
  .auth-container {
    flex-direction: column;
  }

  .auth-right {
    display: none;
  }

  .auth-left {
    padding: 2rem;
  }
}
</style> 
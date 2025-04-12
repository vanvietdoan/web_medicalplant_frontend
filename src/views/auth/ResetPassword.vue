<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();

const password = ref('');
const confirmPassword = ref('');
const isLoading = ref(false);
const message = ref({ type: '', content: '' });
const showPassword = ref(false);
const showConfirmPassword = ref(false);
const token = ref('');

onMounted(() => {
  token.value = route.params.token as string;
  if (!token.value) {
    router.push('/forgot-password');
  }
});

const validatePassword = () => {
  if (!password.value) {
    message.value = { type: 'error', content: 'Vui lòng nhập mật khẩu mới' };
    return false;
  }

  if (password.value.length < 6) {
    message.value = { type: 'error', content: 'Mật khẩu phải có ít nhất 6 ký tự' };
    return false;
  }

  if (!confirmPassword.value) {
    message.value = { type: 'error', content: 'Vui lòng xác nhận mật khẩu' };
    return false;
  }

  if (password.value !== confirmPassword.value) {
    message.value = { type: 'error', content: 'Mật khẩu xác nhận không khớp' };
    return false;
  }

  return true;
};

const handleSubmit = async () => {
  message.value = { type: '', content: '' };

  if (!validatePassword()) {
    return;
  }

  try {
    isLoading.value = true;
    // TODO: Implement API call to reset password
    await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call
    
    message.value = {
      type: 'success',
      content: 'Mật khẩu đã được đặt lại thành công'
    };
    
    setTimeout(() => {
      router.push('/login');
    }, 2000);
  } catch (error) {
    message.value = {
      type: 'error',
      content: 'Đã có lỗi xảy ra, vui lòng thử lại sau'
    };
  } finally {
    isLoading.value = false;
  }
};
</script>

<template>
  <div class="reset-password-page">
    <div class="reset-password-container">
      <div class="reset-password-left">
        <div class="reset-password-header">
          <div class="logo">
            <img src="/images/logo.png" alt="Logo" class="logo-img">
          </div>
          <h1>Đặt lại mật khẩu</h1>
          <p>Nhập mật khẩu mới cho tài khoản của bạn</p>
        </div>

        <form @submit.prevent="handleSubmit" class="reset-password-form">
          <div class="form-group">
            <label for="password">Mật khẩu mới</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input
                :type="showPassword ? 'text' : 'password'"
                id="password"
                v-model="password"
                placeholder="••••••••"
                :disabled="isLoading"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showPassword = !showPassword"
              >
                <i :class="showPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu</label>
            <div class="input-group">
              <i class="fas fa-lock"></i>
              <input
                :type="showConfirmPassword ? 'text' : 'password'"
                id="confirmPassword"
                v-model="confirmPassword"
                placeholder="••••••••"
                :disabled="isLoading"
              >
              <button 
                type="button" 
                class="toggle-password"
                @click="showConfirmPassword = !showConfirmPassword"
              >
                <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
              </button>
            </div>
          </div>

          <div v-if="message.content" :class="['message', message.type]">
            <i :class="message.type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle'"></i>
            {{ message.content }}
          </div>

          <button type="submit" class="submit-btn" :disabled="isLoading">
            <span v-if="!isLoading">Đặt lại mật khẩu</span>
            <i v-else class="fas fa-spinner fa-spin"></i>
          </button>

          <div class="form-footer">
            <router-link to="/login" class="back-link">
              <i class="fas fa-arrow-left"></i>
              Quay lại đăng nhập
            </router-link>
          </div>
        </form>
      </div>

      <div class="reset-password-right">
        <div class="illustration">
          <!-- Hình minh họa -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.reset-password-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #008053;
  padding: 2rem;
}

.reset-password-container {
  display: flex;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.reset-password-left {
  flex: 1;
  padding: 3rem;
}

.reset-password-right {
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

.reset-password-header h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.reset-password-header p {
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

.submit-btn:hover {
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
  .reset-password-container {
    flex-direction: column;
  }

  .reset-password-right {
    display: none;
  }

  .reset-password-left {
    padding: 2rem;
  }
}
</style> 
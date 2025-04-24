<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { authService } from '../../services/auth.service';

const router = useRouter();
const currentStep = ref(1);
const isLoading = ref(false);

// Step 1 data
const email = ref('');
const password = ref('');
const confirmPassword = ref('');
const error = ref('');

// Step 2 data
const fullName = ref('');
const title = ref('');
const specialty = ref('');
const proof = ref('');
const certificateFile = ref<File | null>(null);
const avatarFile = ref<File | null>(null);

const validateStep1 = () => {
  error.value = '';
  if (!email.value) {
    error.value = 'Vui lòng nhập địa chỉ email';
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.value)) {
    error.value = 'Địa chỉ email không hợp lệ';
    return false;
  }
  if (!password.value) {
    error.value = 'Vui lòng nhập mật khẩu';
    return false;
  }
  if (password.value.length < 6) {
    error.value = 'Mật khẩu phải có ít nhất 6 ký tự';
    return false;
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Mật khẩu xác nhận không khớp';
    return false;
  }
  return true;
};

const validateStep2 = () => {
  error.value = '';
  if (!fullName.value) {
    error.value = 'Vui lòng nhập họ và tên';
    return false;
  }
  if (!specialty.value) {
    error.value = 'Vui lòng nhập chuyên khoa';
    return false;
  }
  // if (!workplace.value) {
  //   error.value = 'Vui lòng nhập đơn vị công tác';
  //   return false;
  // }
  return true;
};

const handleContinue = () => {
  if (validateStep1()) {
    currentStep.value = 2;
  }
};

const handleSubmit = async () => {
  if (validateStep2()) {
    try {
      isLoading.value = true;
      const registrationData = {
        full_name: fullName.value,
        title: title.value,
        proof: proof.value,
        specialty: specialty.value,
        email: email.value,
        password: password.value,
        active: true,
        avatar: ''
      };

      const response = await authService.register(registrationData) as { message: string };
      // Hiển thị thông báo từ server
      alert(response.message || 'Đăng ký thành công! Vui lòng kiểm tra email để xác thực tài khoản.');
      
      router.push('/login');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đã có lỗi xảy ra khi đăng ký';
    } finally {
      isLoading.value = false;
    }
  }
};

// const handleFileUpload = (event: Event, type: 'certificate' | 'avatar') => {
//   const input = event.target as HTMLInputElement;
//   if (input.files && input.files[0]) {
//     if (type === 'certificate') {
//       certificateFile.value = input.files[0];
//     } else {
//       avatarFile.value = input.files[0];
//     }
//   }
// };
</script>

<template>
  <div class="register-page">
    <div class="register-container">
      <div class="register-left">
        <div class="register-header">
          <div class="logo">
            <img src="/images/logo.png" alt="Medical Plant" class="logo-img">
          </div>
          <h1>Đăng ký tài khoản</h1>
          <p>Bước {{ currentStep }}: {{ currentStep === 1 ? 'Thông tin đăng nhập' : 'Thông tin cá nhân' }}</p>
        </div>

        <!-- Step 1: Login Information -->
        <form v-if="currentStep === 1" @submit.prevent="handleContinue" class="register-form">
          <div class="form-group">
            <label for="email">Địa chỉ email</label>
            <input 
              type="email" 
              id="email" 
              v-model="email"
              placeholder="Nhập địa chỉ email của bạn"
              required
            >
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="Nhập mật khẩu"
              required
            >
          </div>

          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              required
            >
          </div>

          <div class="error-message" v-if="error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>

          <button type="submit" class="btn-continue">Tiếp tục đăng ký</button>
        </form>

        <!-- Step 2: Personal Information -->
        <form v-else @submit.prevent="handleSubmit" class="register-form">
          <div class="form-group">
            <label for="fullName">Họ và tên</label>
            <input 
              type="text" 
              id="fullName" 
              v-model="fullName"
              placeholder="Lê Văn A"
              required
            >
          </div>

          <div class="form-group">
            <label for="title">Chức danh</label>
            <input 
              type="text" 
              id="title" 
              v-model="title"
              placeholder="Giáo sư"
              required
            >
          </div>

          <div class="form-group">
            <label for="specialty">Chuyên khoa</label>
            <input 
              type="text" 
              id="specialty" 
              v-model="specialty"
              placeholder="Dược học cổ truyền"
              required
            >
          </div>

          <!-- <div class="form-group">
            <label for="proof">Chứng chỉ</label>
            <input 
              type="text" 
              id="proof" 
              v-model="proof"
              placeholder="Chứng chỉ hành nghề"
            >
          </div> -->

          <div class="error-message" v-if="error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>

          <button type="submit" class="btn-register" :disabled="isLoading">
            {{ isLoading ? 'Đang xử lý...' : 'Đăng ký' }}
          </button>
        </form>
      </div>

      <div class="register-right">
        <div class="illustration">
          <!-- Hình minh họa xe và phong cảnh -->
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #008053;
  padding: 2rem;
}

.register-container {
  display: flex;
  background: white;
  border-radius: 20px;
  overflow: hidden;
  width: 100%;
  max-width: 1200px;
  min-height: 600px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.register-left {
  flex: 1;
  padding: 3rem;
}

.register-right {
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

.register-header h1 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 0.5rem;
}

.register-header p {
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

.file-upload {
  position: relative;
  overflow: hidden;
}

.file-upload input[type="file"] {
  position: absolute;
  left: 0;
  top: 0;
  opacity: 0;
  width: 100%;
  height: 100%;
  cursor: pointer;
}

.btn-upload {
  width: 100%;
  padding: 0.8rem;
  background-color: #f8f9fa;
  border: 1px dashed #ddd;
  border-radius: 8px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-upload:hover {
  background-color: #e9ecef;
}

.btn-continue, .btn-register {
  width: 100%;
  padding: 0.8rem;
  border-radius: 8px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
  background-color: #008053;
  color: white;
  border: none;
}

.btn-continue:hover, .btn-register:hover {
  background-color: #006c46;
}

.btn-register:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
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
  .register-container {
    flex-direction: column;
  }

  .register-right {
    display: none;
  }

  .register-left {
    padding: 2rem;
  }
}
</style> 
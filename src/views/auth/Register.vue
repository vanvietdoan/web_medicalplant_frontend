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

// Thêm các biến để theo dõi lỗi validation
const emailError = ref('');
const passwordError = ref('');
const confirmPasswordError = ref('');
const fullNameError = ref('');
const titleError = ref('');
const specialtyError = ref('');

// Step 2 data
const fullName = ref('');
const title = ref('');
const specialty = ref('');
const proof = ref('');
const showCustomTitle = ref(false);
const showCustomSpecialty = ref(false);

// Thêm danh sách các chức danh
const titleOptions = [
  { value: '', label: 'Chọn chức danh' },
  { value: 'Giáo sư', label: 'Giáo sư' },
  { value: 'Phó giáo sư', label: 'Phó giáo sư' },
  { value: 'Tiến sĩ', label: 'Tiến sĩ' },
  { value: 'Thạc sĩ', label: 'Thạc sĩ' },
  { value: 'Bác sĩ', label: 'Bác sĩ' },
  { value: 'Dược sĩ', label: 'Dược sĩ' },
  { value: 'Sinh viên', label: 'Sinh viên' },
  { value: 'custom', label: 'Khác (Tự nhập)' }
];

// Thêm danh sách các chuyên khoa
const specialtyOptions = [
  { value: '', label: 'Chọn chuyên khoa' },
  { value: 'Y dược cổ truyền', label: 'Y dược cổ truyền' },
  { value: 'Y dược hiện đại', label: 'Y dược hiện đại' },
  { value: 'Nội khoa', label: 'Nội khoa' },
  { value: 'Ngoại khoa', label: 'Ngoại khoa' },
  { value: 'Dược học', label: 'Dược học' },
  { value: 'Y học cổ truyền', label: 'Y học cổ truyền' },
  { value: 'custom', label: 'Khác (Tự nhập)' }
];

// Hàm validate email
const validateEmail = (email: string) => {
  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
  if (!email) {
    emailError.value = 'Email không được để trống';
    return false;
  }
  if (!emailRegex.test(email)) {
    emailError.value = 'Email không hợp lệ';
    return false;
  }
  emailError.value = '';
  return true;
};

// Hàm validate password
const validatePassword = (password: string) => {
  if (!password) {
    passwordError.value = 'Mật khẩu không được để trống';
    return false;
  }
  if (password.length < 6) {
    passwordError.value = 'Mật khẩu phải có ít nhất 6 ký tự';
    return false;
  }
  passwordError.value = '';
  return true;
};

// Hàm validate confirm password
const validateConfirmPassword = (confirmPassword: string) => {
  if (!confirmPassword) {
    confirmPasswordError.value = 'Vui lòng xác nhận mật khẩu';
    return false;
  }
  if (confirmPassword !== password.value) {
    confirmPasswordError.value = 'Mật khẩu xác nhận không khớp';
    return false;
  }
  confirmPasswordError.value = '';
  return true;
};

// Hàm validate full name
const validateFullName = (fullName: string) => {
  if (!fullName) {
    fullNameError.value = 'Họ và tên không được để trống';
    return false;
  }
  fullNameError.value = '';
  return true;
};

// Hàm validate title
const validateTitle = (title: string) => {
  if (!title) {
    titleError.value = 'Chức danh không được để trống';
    return false;
  }
  titleError.value = '';
  return true;
};

// Hàm validate specialty
const validateSpecialty = (specialty: string) => {
  if (!specialty) {
    specialtyError.value = 'Chuyên khoa không được để trống';
    return false;
  }
  specialtyError.value = '';
  return true;
};

// Hàm validate realtime
const validateEmailRealtime = () => {
  validateEmail(email.value);
};

const validatePasswordRealtime = () => {
  validatePassword(password.value);
};

const validateConfirmPasswordRealtime = () => {
  validateConfirmPassword(confirmPassword.value);
};

const validateFullNameRealtime = () => {
  validateFullName(fullName.value);
};

const validateTitleRealtime = () => {
  validateTitle(title.value);
};

const validateSpecialtyRealtime = () => {
  validateSpecialty(specialty.value);
};

const validateStep1 = () => {
  const isEmailValid = validateEmail(email.value);
  const isPasswordValid = validatePassword(password.value);
  const isConfirmPasswordValid = validateConfirmPassword(confirmPassword.value);
  return isEmailValid && isPasswordValid && isConfirmPasswordValid;
};

const validateStep2 = () => {
  const isFullNameValid = validateFullName(fullName.value);
  const isTitleValid = validateTitle(title.value);
  const isSpecialtyValid = validateSpecialty(specialty.value);
  return isFullNameValid && isTitleValid && isSpecialtyValid;
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
      console.log(response);
      // Hiển thị thông báo thành công với hướng dẫn xác thực email
      const successMessage = `
        Đăng ký thành công! 
        Vui lòng kiểm tra email ${email.value} để xác thực tài khoản của bạn.
        Nếu không thấy email, vui lòng kiểm tra thư mục spam.
      `;
      
      alert(successMessage);
      router.push('/login');
    } catch (err: any) {
      error.value = err.response?.data?.message || 'Đã có lỗi xảy ra khi đăng ký';
    } finally {
      isLoading.value = false;
    }
  }
};

const handleTitleChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  if (value === 'custom') {
    showCustomTitle.value = true;
    title.value = '';
  } else {
    showCustomTitle.value = false;
    title.value = value;
  }
  validateTitleRealtime();
};

const handleSpecialtyChange = (event: Event) => {
  const value = (event.target as HTMLSelectElement).value;
  if (value === 'custom') {
    showCustomSpecialty.value = true;
    specialty.value = '';
  } else {
    showCustomSpecialty.value = false;
    specialty.value = value;
  }
  validateSpecialtyRealtime();
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
          <!-- <p>Bước {{ currentStep }}: {{ currentStep === 1 ? 'Thông tin đăng nhập' : 'Thông tin cá nhân' }}</p> -->
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
              @input="validateEmailRealtime"
              @blur="validateEmailRealtime"
              :class="{ 'error-input': emailError }"
            >
            <span class="error-text" v-if="emailError">{{ emailError }}</span>
          </div>

          <div class="form-group">
            <label for="password">Mật khẩu</label>
            <input 
              type="password" 
              id="password" 
              v-model="password"
              placeholder="Nhập mật khẩu"
              @input="validatePasswordRealtime"
              @blur="validatePasswordRealtime"
              :class="{ 'error-input': passwordError }"
            >
            <span class="error-text" v-if="passwordError">{{ passwordError }}</span>
          </div>

          <div class="form-group">
            <label for="confirmPassword">Xác nhận mật khẩu</label>
            <input 
              type="password" 
              id="confirmPassword" 
              v-model="confirmPassword"
              placeholder="Nhập lại mật khẩu"
              @input="validateConfirmPasswordRealtime"
              @blur="validateConfirmPasswordRealtime"
              :class="{ 'error-input': confirmPasswordError }"
            >
            <span class="error-text" v-if="confirmPasswordError">{{ confirmPasswordError }}</span>
          </div>

          <div class="error-message" v-if="error">
            <i class="fas fa-exclamation-triangle"></i>
            {{ error }}
          </div>

          <button type="submit" class="btn-continue" :disabled="!!emailError || !!passwordError || !!confirmPasswordError">
            Tiếp tục đăng ký
          </button>
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
              @input="validateFullNameRealtime"
              @blur="validateFullNameRealtime"
              :class="{ 'error-input': fullNameError }"
            >
            <span class="error-text" v-if="fullNameError">{{ fullNameError }}</span>
          </div>

          <div class="form-group">
            <label for="title">Chức danh</label>
            <select 
              v-if="!showCustomTitle"
              id="title" 
              v-model="title"
              @change="handleTitleChange"
              :class="{ 'error-input': titleError }"
            >
              <option 
                v-for="option in titleOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <div v-else class="custom-input-group">
              <input 
                type="text" 
                id="title" 
                v-model="title"
                placeholder="Nhập chức danh của bạn"
                @input="validateTitleRealtime"
                @blur="validateTitleRealtime"
                :class="{ 'error-input': titleError }"
              >
              <button 
                type="button" 
                class="btn-back" 
                @click="showCustomTitle = false; title = ''"
              >
                <i class="fas fa-arrow-left"></i>
              </button>
            </div>
            <span class="error-text" v-if="titleError">{{ titleError }}</span>
          </div>

          <div class="form-group">
            <label for="specialty">Chuyên khoa</label>
            <select 
              v-if="!showCustomSpecialty"
              id="specialty" 
              v-model="specialty"
              @change="handleSpecialtyChange"
              :class="{ 'error-input': specialtyError }"
            >
              <option 
                v-for="option in specialtyOptions" 
                :key="option.value" 
                :value="option.value"
              >
                {{ option.label }}
              </option>
            </select>
            <div v-else class="custom-input-group">
              <input 
                type="text" 
                id="specialty" 
                v-model="specialty"
                placeholder="Nhập chuyên khoa của bạn"
                @input="validateSpecialtyRealtime"
                @blur="validateSpecialtyRealtime"
                :class="{ 'error-input': specialtyError }"
              >
              <button 
                type="button" 
                class="btn-back" 
                @click="showCustomSpecialty = false; specialty = ''"
              >
                <i class="fas fa-arrow-left"></i>
              </button>
            </div>
            <span class="error-text" v-if="specialtyError">{{ specialtyError }}</span>
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

          <button type="submit" class="btn-register" :disabled="isLoading || !!fullNameError || !!titleError || !!specialtyError">
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
  margin-bottom: 1rem;
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

.error-input {
  border-color: #dc3545 !important;
}

.error-text {
  color: #dc3545;
  font-size: 0.875rem;
  margin-top: 0.25rem;
  display: block;
}

select {
  width: 100%;
  padding: 0.8rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 1em;
}

select:focus {
  outline: none;
  border-color: #008053;
}

select.error-input {
  border-color: #dc3545;
}

.custom-input-group {
  position: relative;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.custom-input-group input {
  flex: 1;
}

.btn-back {
  padding: 0.8rem;
  background: none;
  border: none;
  color: #666;
  cursor: pointer;
  transition: color 0.3s;
}

.btn-back:hover {
  color: #008053;
}
</style> 
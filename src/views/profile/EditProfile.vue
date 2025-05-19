<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { User, Login } from '../../models/User';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';

const router = useRouter();
const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const success = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const proofFile = ref<File | null>(null);
const avatarPreview = ref<string | null>(null);
const proofPreview = ref<string | null>(null);

const formData = ref({
  full_name: '',
  title: '',
  specialty: '',
  proof: '',
  avatar: ''
});

const handleAvatarChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file.type.startsWith('image/')) {
      avatarFile.value = file;
      avatarPreview.value = URL.createObjectURL(file);
    } else {
      error.value = 'Vui lòng chọn file ảnh hợp lệ';
      input.value = '';
    }
  }
};

const handleProofChange = (event: Event) => {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    const file = input.files[0];
    if (file.type === 'application/pdf') {
      proofFile.value = file;
      proofPreview.value = file.name;
    } else {
      error.value = 'Vui lòng chọn file PDF hợp lệ';
      input.value = '';
    }
  }
};

const uploadFiles = async () => {
  try {
    if (avatarFile.value) {
      const avatarResponse = await userService.uploadAvatarNew(avatarFile.value);
      formData.value.avatar = avatarResponse.url;
    }
    
    if (proofFile.value) {
      const proofResponse = await userService.uploadProof(proofFile.value);
      formData.value.proof = proofResponse.url;
    }
  } catch (err) {
    console.error('Error uploading files:', err);
    throw new Error('Có lỗi xảy ra khi tải lên file');
  }
};

// Add function to remove host from URL
const removeHostFromUrl = (url: string): string => {
  try {
    if (!url) return '';
    const urlObj = new URL(url);
    return urlObj.pathname;
  } catch {
    return url; // Return original URL if it's not a valid URL
  }
};

const fetchUserDetails = async () => {
  try {
    loading.value = true;
    error.value = null;
    const currentUser = authService.getCurrentUser() as Login | null;
    if (!currentUser?.id) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }
    user.value = await userService.getUserById(currentUser.id);
    if (user.value) {
      formData.value = {
        full_name: user.value.full_name,
        title: user.value.title,
        specialty: user.value.specialty,
        proof: user.value.proof,
        avatar: user.value.avatar
      };
      if (user.value.avatar) {
        avatarPreview.value = user.value.avatar;
      }
      if (user.value.proof) {
        proofPreview.value = 'Chứng chỉ hiện tại';
      }
    }
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin người dùng';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    error.value = null;
    success.value = null;
    
    if (!user.value?.user_id) {
      throw new Error('Không tìm thấy thông tin người dùng');
    }

    // Upload files first if any
    await uploadFiles();

    // Remove host from avatar URL if it exists
    if (formData.value.avatar) {
      formData.value.avatar = removeHostFromUrl(formData.value.avatar);
    }

    const updatedUser = {
      ...user.value,
      ...formData.value
    };

    await userService.updateUser(user.value.user_id, updatedUser);
    success.value = 'Cập nhật thông tin thành công';
    
    // Navigate back to profile page after a short delay
    setTimeout(() => {
      router.push('/profile');
    }, 1500);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi cập nhật thông tin';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUserDetails);
</script>

<template>
  <div class="edit-profile-container">
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserDetails" class="retry-btn">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else class="edit-profile-content">
      <h2>Cập nhật thông tin cá nhân</h2>

      <div v-if="success" class="success-message">
        <i class="fas fa-check-circle"></i>
        {{ success }}
      </div>

      <form @submit.prevent="handleSubmit" class="edit-form">
        <div class="form-group">
          <label for="avatar">Ảnh đại diện</label>
          <div class="avatar-preview" v-if="avatarPreview">
              <img :src="avatarPreview" alt="Avatar preview">
            </div>
          <div class="file-upload">
            <input
              id="avatar"
              type="file"
              accept="image/*"
              @change="handleAvatarChange"
              class="file-input"
            >
            
          </div>
        </div>
        <div class="form-group">
          <label for="full_name">Họ và tên</label>
          <input
            id="full_name"
            v-model="formData.full_name"
            type="text"
            required
            placeholder="Nhập họ và tên"
          >
        </div>

        <div class="form-group">
          <label for="title">Chức danh</label>
          <input
            id="title"
            v-model="formData.title"
            type="text"
            required
            placeholder="Nhập chức danh"
          >
        </div>

        <div class="form-group">
          <label for="specialty">Chuyên ngành</label>
          <input
            id="specialty"
            v-model="formData.specialty"
            type="text"
            required
            placeholder="Nhập chuyên ngành"
          >
        </div>

        <div class="form-group">
          <label for="proof">Chứng chỉ (PDF)</label>
          <div class="file-upload">
            <input
              id="proof"
              type="file"
              accept=".pdf"
              @change="handleProofChange"
              class="file-input"
            >
            <div class="file-preview" v-if="proofPreview">
              <i class="fas fa-file-pdf"></i>
              <span>{{ proofPreview }}</span>
            </div>
          </div>
        </div>

       

        <div class="form-actions">
          <button type="submit" class="btn btn-primary" >
            <i class="fas fa-save"></i>
            Lưu thay đổi
          </button>
          <button type="button" class="btn btn-secondary" @click="router.push('/profile')">
            <i class="fas fa-times"></i>
            Hủy
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.edit-profile-container {
  max-width: 800px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i, .error i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error {
  color: #dc3545;
}

.success-message {
  background-color: #d4edda;
  color: #155724;
  padding: 1rem;
  border-radius: 4px;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn:hover {
  background-color: #c82333;
}

.edit-profile-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 2rem;
}

.edit-profile-content h2 {
  color: #008053;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.edit-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-group label {
  font-weight: 500;
  color: #333;
}

.form-group input {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
}

.form-group input:focus {
  outline: none;
  border-color: #42b883;
  box-shadow: 0 0 0 2px rgba(66, 184, 131, 0.2);
}

.form-actions {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #42b883;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #3aa876;
}

.btn-secondary {
  background-color: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background-color: #5a6268;
}

.file-upload {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.file-input {
  padding: 0.5rem;
  border: 1px dashed #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.file-preview {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

.file-preview i {
  color: #dc3545;
}

.avatar-preview {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  overflow: hidden;
  border: 2px solid #ddd;
}

.avatar-preview img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

@media (max-width: 768px) {
  .edit-profile-container {
    margin: 1rem auto;
  }

  .edit-profile-content {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn {
    width: 100%;
    justify-content: center;
  }
}
</style> 
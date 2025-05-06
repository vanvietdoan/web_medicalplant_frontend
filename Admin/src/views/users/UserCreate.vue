<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { CreateUser } from '../../models/User'
import { userService } from '../../services/user.service'
import { config } from '../../config'
const router = useRouter()
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)
const proofFileInput = ref<HTMLInputElement | null>(null)
const user = ref<CreateUser>({
  full_name: '',
  title: '',
  proof: '',
  specialty: '',
  active: true,
  avatar: '',
  email: '',
  role_id: 1,
  password: ''
})

// Function to prepend host to image URL for display
const getDisplayImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.API_HOST}${url}`
}

const handleSubmit = async () => {
  try {
    loading.value = true
    console.log('Submitting user data:', user.value)
    
    // Validate required fields
    if (!user.value.full_name || !user.value.email || !user.value.password) {
      ElMessage.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      loading.value = false
      return
    }
    
    // Call API to create user
    const response = await userService.createUser(user.value)
    console.log('User created successfully:', response)
    
    ElMessage.success('Tạo tài khoản thành công')
    router.push({ name: 'users' })
  } catch (error) {
    console.error('Error creating user:', error)
    ElMessage.error('Không thể tạo tài khoản: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const triggerProofFileInput = () => {
  if (proofFileInput.value) {
    proofFileInput.value.click()
  }
}

const handleAvatarUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      loading.value = true
      const file = input.files[0]
      
      // Kiểm tra kích thước file (tối đa 5MB)
      if (file.size > 5 * 1024 * 1024) {
        ElMessage.error('Kích thước ảnh không được vượt quá 5MB')
        loading.value = false
        return
      }
      
      // Kiểm tra định dạng file
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp']
      if (!allowedTypes.includes(file.type)) {
        ElMessage.error('Định dạng ảnh không hợp lệ. Vui lòng chọn ảnh có định dạng JPG, PNG, GIF hoặc WEBP')
        loading.value = false
        return
      }
      
      // Hiển thị ảnh preview trước khi tải lên
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target && e.target.result) {
          user.value.avatar = e.target.result as string
        }
      }
      reader.readAsDataURL(file)
      
      // Tải ảnh lên server
      const response = await userService.uploadAvatarNew(file)
      user.value.avatar = response.url
      ElMessage.success('Tải ảnh đại diện thành công')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      ElMessage.error('Không thể tải ảnh đại diện')
    } finally {
      loading.value = false
    }
  }
}

const handleProofUpload = async (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files && input.files[0]) {
    try {
      loading.value = true
      const file = input.files[0]
      
      // Kiểm tra kích thước file (tối đa 10MB)
      if (file.size > 10 * 1024 * 1024) {
        ElMessage.error('Kích thước file không được vượt quá 10MB')
        loading.value = false
        return
      }
      
      // Kiểm tra định dạng file
      if (file.type !== 'application/pdf') {
        ElMessage.error('Định dạng file không hợp lệ. Vui lòng chọn file PDF')
        loading.value = false
        return
      }
      
      // Tải file lên server
      const response = await userService.uploadProof(file)
      user.value.proof = response.url
      ElMessage.success('Tải bằng cấp thành công')
    } catch (error) {
      console.error('Error uploading proof:', error)
      ElMessage.error('Không thể tải bằng cấp')
    } finally {
      loading.value = false
    }
  }
}

const handleCancel = () => {
  router.push({ name: 'users' })
}
</script>

<template>
  <div class="user-create">
    <div class="header">
      <h2>Tạo tài khoản mới</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="create-form">
      <div class="avatar-section">
        <img :src="getDisplayImageUrl(user.avatar)" class="avatar-preview" alt="Avatar">
        <div class="avatar-upload">
          <input 
            ref="fileInput"
            type="file" 
            accept="image/jpeg,image/png,image/gif,image/webp" 
            @change="handleAvatarUpload"
            style="display: none;"
          >
          <button type="button" class="btn-upload" @click="triggerFileInput">
            <i class="fas fa-upload"></i> Tải ảnh lên
          </button>
          <p class="upload-hint">Hỗ trợ: JPG, PNG, GIF, WEBP (Tối đa 5MB)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Họ tên</label>
        <input v-model="user.full_name" type="text" required>
      </div>

      <div class="form-group">
        <label>Email</label>
        <input v-model="user.email" type="email" required>
      </div>

      <div class="form-group">
        <label>Mật khẩu</label>
        <input v-model="user.password" type="password" required>
      </div>

      <div class="form-group">
        <label>Chức danh</label>
        <input v-model="user.title" type="text" required>
      </div>

      <div class="form-group">
        <label>Bằng cấp</label>
        <div class="proof-upload">
          <input 
            ref="proofFileInput"
            type="file" 
            accept="application/pdf" 
            @change="handleProofUpload"
            style="display: none;"
          >
          <button type="button" class="btn-upload" @click="triggerProofFileInput">
            <i class="fas fa-file-pdf"></i> Tải bằng cấp lên
          </button>
          <p class="upload-hint">Hỗ trợ: PDF (Tối đa 10MB)</p>
          <div v-if="user.proof" class="proof-preview">
            <a :href="getDisplayImageUrl(user.proof)" target="_blank" class="proof-link">
              <i class="fas fa-file-pdf"></i> Xem bằng cấp đã tải
            </a>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Chuyên môn</label>
        <input v-model="user.specialty" type="text" required>
      </div>

      <div class="form-group">
        <label>Vai trò</label>
        <select v-model="user.role_id" required>
          <option value="2">Chuyên gia</option>
          <option value="1">Quản trị viên</option>
        </select>
      </div>

      <div class="form-group">
        <label>
          <input type="checkbox" v-model="user.active">
          Kích hoạt tài khoản
        </label>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save" :disabled="loading">
          {{ loading ? 'Đang tạo...' : 'Tạo tài khoản' }}
        </button>
        <button type="button" class="btn-cancel" @click="handleCancel">
          Hủy
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.user-create {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.avatar-section {
  text-align: center;
  margin-bottom: 30px;
}

.avatar-preview {
  width: 150px;
  height: 150px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 15px;
}

.avatar-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.avatar-upload input[type="file"] {
  display: none;
}

.btn-upload {
  display: flex;
  align-items: center;
  gap: 5px;
  background: #2196F3;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-upload i {
  font-size: 14px;
}

.create-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group input[type="email"],
.form-group input[type="password"],
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input[type="checkbox"] {
  margin-right: 8px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-save,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
}

.upload-hint {
  font-size: 12px;
  color: #666;
  margin-top: 5px;
}

.proof-upload {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.proof-preview {
  margin-top: 10px;
}

.proof-link {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #2196F3;
  text-decoration: none;
  font-size: 14px;
}

.proof-link:hover {
  text-decoration: underline;
}
</style> 
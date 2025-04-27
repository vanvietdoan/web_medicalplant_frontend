<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { User } from '../../models/User'
import { userService } from '../../services/user.service'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const user = ref<User>({
  user_id: 0,
  full_name: '',
  title: '',
  proof: '',
  specialty: '',
  active: true,
  avatar: '',
  email: '',
  role_id: 1,
  role: {
    role_id: 1,
    name: '',
    created_at: '',
    updated_at: ''
  },
  created_at: '',
  updated_at: ''
})

const fileInput = ref<HTMLInputElement | null>(null)
const proofFileInput = ref<HTMLInputElement | null>(null)

const handleSubmit = async () => {
  try {
    loading.value = true
    console.log('Updating user data:', user.value)
    
    // Validate required fields
    if (!user.value.full_name || !user.value.email) {
      ElMessage.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      loading.value = false
      return
    }
    
    // Get user ID from route params
    const userId = Number(route.params.id)
    
    // Call API to update user
    const response = await userService.updateUser(userId, {
      full_name: user.value.full_name,
      title: user.value.title,
      proof: user.value.proof,
      specialty: user.value.specialty,
      active: user.value.active,
      email: user.value.email,
      role_id: user.value.role_id,
      avatar: user.value.avatar
    })
    
    console.log('User updated successfully:', response)
    ElMessage.success('Cập nhật thông tin thành công')
    router.push({ name: 'users' })
  } catch (error) {
    console.error('Error updating user:', error)
    ElMessage.error('Không thể cập nhật thông tin: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
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
      ElMessage.success('Cập nhật ảnh đại diện thành công')
    } catch (error) {
      console.error('Error uploading avatar:', error)
      ElMessage.error('Không thể cập nhật ảnh đại diện')
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

onMounted(() => {
  // Lấy dữ liệu từ query params
  const query = route.query
  user.value = {
    user_id: Number(route.params.id),
    full_name: query.full_name as string || '',
    email: query.email as string || '',
    title: query.title as string || '',
    proof: query.proof as string || '',
    specialty: query.specialty as string || '',
    active: query.active === 'true',
    avatar: query.avatar as string || '',
    role_id: Number(query.role_id) || 1,
    role: {
      role_id: Number(query.role_id) || 1,
      name: '',
      created_at: '',
      updated_at: ''
    },
    created_at: '',
    updated_at: ''
  }
})
</script>

<template>
  <div class="user-edit">
    <div class="header">
      <h2>Cập nhật thông tin người dùng</h2>
      
    </div>

    <div v-if="loading" class="loading">
      Đang tải...
    </div>

    <form v-else @submit.prevent="handleSubmit" class="edit-form">
      <div class="avatar-section">
        <img :src="user.avatar" class="avatar-preview" alt="Avatar">
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
        <label>Chức danh</label>
        <input v-model="user.title" type="text" required>
      </div>

      <div class="form-group">
        <label>Bằng cấp</label>
        <div class="proof-upload">
          <div v-if="user.proof" class="existing-proof">
            <p>Bằng cấp hiện tại:</p>
            <a :href="user.proof" target="_blank" class="proof-link">
              <i class="fas fa-file-pdf"></i> Xem bằng cấp
            </a>
          </div>
          <input 
            ref="proofFileInput"
            type="file" 
            accept="application/pdf" 
            @change="handleProofUpload"
            style="display: none;"
          >
          <button type="button" class="btn-upload" @click="triggerProofFileInput">
            <i class="fas fa-file-pdf"></i> Tải bằng cấp mới lên
          </button>
          <p class="upload-hint">Hỗ trợ: PDF (Tối đa 10MB)</p>
          <div v-if="user.proof && user.proof !== route.query.proof" class="proof-preview">
            <a :href="user.proof" target="_blank" class="proof-link">
              <i class="fas fa-file-pdf"></i> Xem bằng cấp mới
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
          <option value="1">Quản trị viên</option>
          <option value="2">Chuyên gia</option>
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
          {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
        <button type="button" class="btn-cancel" @click="handleCancel">
          Hủy
        </button>
        
      </div>
    </form>
  </div>
</template>

<style scoped>
.user-edit {
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
}

.btn-upload i {
  font-size: 14px;
}

.edit-form {
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

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
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

.existing-proof {
  margin-bottom: 10px;
  padding: 10px;
  background-color: #f5f5f5;
  border-radius: 4px;
}

.existing-proof p {
  margin-bottom: 5px;
  font-weight: 500;
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
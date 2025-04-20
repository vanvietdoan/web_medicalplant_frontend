<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { plantService } from '../../services/plant.service'

const router = useRouter()
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const formData = ref({
  name: '',
  english_name: '',
  description: '',
  benefits: '',
  instructions: '',
  species_id: 1, // Default species ID
  image_url: ''
})

const handleSubmit = async () => {
  try {
    loading.value = true
    // Validate required fields
    if (!formData.value.name) {
      ElMessage.error('Vui lòng điền tên cây thuốc')
      loading.value = false
      return
    }
    
    await plantService.createPlant(formData.value)
    ElMessage.success('Thêm cây thuốc thành công')
    router.push('/admin/plants')
  } catch (error) {
    console.error('Error creating plant:', error)
    ElMessage.error('Không thể thêm cây thuốc: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
  } finally {
    loading.value = false
  }
}

const triggerFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click()
  }
}

const handleImageUpload = async (event: Event) => {
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
          formData.value.image_url = e.target.result as string
        }
      }
      reader.readAsDataURL(file)
      
      // Tải ảnh lên server
      // const response = await plantService.uploadImage(file)
      // formData.value.image_url = response.url
      ElMessage.success('Tải ảnh thành công')
    } catch (error) {
      console.error('Error uploading image:', error)
      ElMessage.error('Không thể tải ảnh')
    } finally {
      loading.value = false
    }
  }
}

const handleCancel = () => {
  router.push('/admin/plants')
}
</script>

<template>
  <div class="plant-create">
    <div class="header">
      <h2>Thêm cây thuốc mới</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="create-form">
      <div class="image-section">
        <img :src="formData.image_url || '/placeholder-plant.jpg'" class="image-preview" alt="Plant Image">
        <div class="image-upload">
          <input 
            ref="fileInput"
            type="file" 
            accept="image/jpeg,image/png,image/gif,image/webp" 
            @change="handleImageUpload"
            style="display: none;"
          >
          <button type="button" class="btn-upload" @click="triggerFileInput">
            <i class="fas fa-upload"></i> Tải ảnh lên
          </button>
          <p class="upload-hint">Hỗ trợ: JPG, PNG, GIF, WEBP (Tối đa 5MB)</p>
        </div>
      </div>

      <div class="form-group">
        <label>Tên cây thuốc</label>
        <input v-model="formData.name" type="text" required>
      </div>

      <div class="form-group">
        <label>Tên tiếng Anh</label>
        <input v-model="formData.english_name" type="text">
      </div>

      <div class="form-group">
        <label>Mô tả</label>
        <textarea v-model="formData.description" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Công dụng</label>
        <textarea v-model="formData.benefits" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Hướng dẫn sử dụng</label>
        <textarea v-model="formData.instructions" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Loài cây</label>
        <select v-model="formData.species_id">
          <option value="1">Cây thuốc</option>
          <option value="2">Cây dược liệu</option>
          <option value="3">Cây cảnh</option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save" :disabled="loading">
          {{ loading ? 'Đang lưu...' : 'Lưu' }}
        </button>
        <button type="button" class="btn-cancel" @click="handleCancel">
          Hủy
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.plant-create {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 24px;
}

.header h2 {
  margin: 0;
  color: #333;
  font-size: 24px;
}

.create-form {
  background: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.image-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
}

.image-preview {
  width: 200px;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid #ddd;
}

.image-upload {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.btn-upload {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #2196F3;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-upload:hover {
  background-color: #1976D2;
}

.upload-hint {
  margin: 0;
  font-size: 12px;
  color: #666;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  margin-top: 24px;
}

.btn-save,
.btn-cancel {
  padding: 8px 16px;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-save {
  background-color: #4CAF50;
  color: white;
  border: none;
}

.btn-save:hover {
  background-color: #388E3C;
}

.btn-save:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}
</style> 
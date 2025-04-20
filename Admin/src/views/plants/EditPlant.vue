<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Plant, UpdatePlantRequest } from '../../models/Plant'
import { plantService } from '../../services/plant.service'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const fileInput = ref<HTMLInputElement | null>(null)

const plant = ref<UpdatePlantRequest>({
  name: route.query.name as string || '',
  english_name: route.query.english_name as string || '',
  description: route.query.description as string || '',
  benefits: route.query.benefits as string || '',
  instructions: route.query.instructions as string || '',
  species_id: Number(route.query.species_id) || 1,
  created_at: '',
  updated_at: ''
})

const imageUrl = ref(route.query.image_url as string || '')

const handleSubmit = async () => {
  try {
    loading.value = true
    console.log('Updating plant data:', plant.value)
    
    // Validate required fields
    if (!plant.value.name) {
      ElMessage.error('Vui lòng điền tên cây thuốc')
      loading.value = false
      return
    }
    
    // Get plant ID from route params
    const plantId = Number(route.params.id)
    
    // Call API to update plant
    const response = await plantService.updatePlant(plantId, plant.value)
    
    console.log('Plant updated successfully:', response)
    ElMessage.success('Cập nhật thông tin thành công')
    router.push({ name: 'plants' })
  } catch (error) {
    console.error('Error updating plant:', error)
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
          imageUrl.value = e.target.result as string
        }
      }
      reader.readAsDataURL(file)
      
      // Tải ảnh lên server
      const response = await plantService.uploadImage(Number(route.params.id), file)
      imageUrl.value = response.image_url
      ElMessage.success('Cập nhật ảnh thành công')
    } catch (error) {
      console.error('Error uploading image:', error)
      ElMessage.error('Không thể cập nhật ảnh')
    } finally {
      loading.value = false
    }
  }
}

const handleCancel = () => {
  router.push({ name: 'plants' })
}
</script>

<template>
  <div class="plant-edit">
    <div class="header">
      <h2>Cập nhật thông tin cây thuốc</h2>
    </div>

    <div v-if="loading" class="loading">
      Đang tải...
    </div>

    <form v-else @submit.prevent="handleSubmit" class="edit-form">
      <div class="image-section">
        <img :src="imageUrl || '/placeholder-plant.jpg'" class="image-preview" alt="Plant Image">
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
        <input v-model="plant.name" type="text" required>
      </div>

      <div class="form-group">
        <label>Tên tiếng Anh</label>
        <input v-model="plant.english_name" type="text">
      </div>

      <div class="form-group">
        <label>Mô tả</label>
        <textarea v-model="plant.description" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Công dụng</label>
        <textarea v-model="plant.benefits" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Hướng dẫn sử dụng</label>
        <textarea v-model="plant.instructions" rows="4"></textarea>
      </div>

      <div class="form-group">
        <label>Loài cây</label>
        <select v-model="plant.species_id">
          <option value="1">Cây thuốc</option>
          <option value="2">Cây dược liệu</option>
          <option value="3">Cây cảnh</option>
        </select>
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
.plant-edit {
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

.edit-form {
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

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style> 
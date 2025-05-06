<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { Plant } from '../../models/Plant'
import speciesService from '../../services/fillter/species.service'
import { plantService } from '../../services/plant.service'
import type { SpeciesResponse } from '../../models/Species'
import { config } from '../../config'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const species = ref<SpeciesResponse[]>([])
const imageFiles = ref<File[]>([])

const plant = ref<Plant>({  
  plant_id: Number(route.params.id) || 0,
  name: '',
  english_name: '',
  description: '',
  benefits: '',
  instructions: '',
  species_id: 1,
  created_at: '',
  updated_at: '',
  images: []
})

const getPlantDetails = async () => {
  try {
    const plantId = Number(route.params.id)
    const response = await plantService.getPlantById(plantId)
    plant.value = response
  } catch (error) {
    console.error('Error fetching plant details:', error)
    ElMessage.error('Không thể tải thông tin cây thuốc')
  }
}

const getSpecies = async () => {
  const response = await speciesService.getSpecies()
  species.value = response
}

onMounted(async () => {
  await Promise.all([getPlantDetails(), getSpecies()])
})

// Handle image upload
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)
    if (files.length + imageFiles.value.length + plant.value.images.length > 5) {
      ElMessage.warning('Chỉ được tải lên tối đa 5 ảnh')
      return
    }
    imageFiles.value = [...imageFiles.value, ...files]
  }
}

// Create object URL for image preview
const createObjectURL = (file: File) => {
  return URL.createObjectURL(file)
}

// Remove existing image
const removeExistingImage = (index: number) => {
  plant.value.images.splice(index, 1)
}

// Function to prepend host to image URL for display
const getDisplayImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${config.API_HOST}${url}`
}

// Function to extract path from URL
const getPathFromUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) {
    try {
      const urlObj = new URL(url)
      // Remove leading slash if it exists
      return urlObj.pathname.startsWith('/') ? urlObj.pathname.slice(1) : urlObj.pathname
    } catch {
      return url
    }
  }
  // Remove leading slash if it exists
  return url.startsWith('/') ? url.slice(1) : url
}

const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Validate required fields
    if (!plant.value.name) {
      ElMessage.error('Vui lòng điền tên cây thuốc')
      loading.value = false
      return
    }
    
    // Get plant ID from route params
    const plantId = Number(route.params.id)
    
    // Create FormData for image upload
    const formDataToSubmit = new FormData()
    imageFiles.value.forEach((file) => {
      formDataToSubmit.append('images', file)
    })
    
    // Upload new images first
    let uploadedImages: { url?: string }[] = []
    if (imageFiles.value.length > 0) {
      const uploadResponse = await plantService.uploadImages(formDataToSubmit)
      uploadedImages = uploadResponse.map((img: { url?: string }) => ({ url: img.url }))
    }
    
    // Update plant with existing and new images
    const plantData: Partial<Plant> = {
      ...plant.value,
      images: [
        ...plant.value.images.map(img => ({
          picture_id: img.picture_id,
          url: getPathFromUrl(img.url)
        })),
        ...uploadedImages.map(img => ({
          picture_id: 0,
          url: getPathFromUrl(img.url || '')
        }))
      ],
      updated_at: new Date().toISOString()
    }
    
    // Call API to update plant
    const response = await plantService.updatePlant(plantId, plantData)
    
    console.log('Plant updated successfully:', response)
    ElMessage.success('Cập nhật thông tin thành công')
    router.push('/admin/plants')
  } catch (error) {
    console.error('Error updating plant:', error)
    ElMessage.error('Không thể cập nhật thông tin: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push('/admin/plants')
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
          <option v-for="item in species" :key="item.species_id" :value="item.species_id">{{ item.name }}</option>
        </select>
      </div>

      <div class="form-group">
        <label>Hình ảnh hiện tại</label>
        <div v-if="plant.images.length" class="image-preview">
          <div v-for="(image, index) in plant.images" :key="index" class="preview-item">
            <img :src="getDisplayImageUrl(image.url)" :alt="'Image ' + (index + 1)">
            <button 
              type="button" 
              class="remove-image" 
              @click="removeExistingImage(index)"
              :disabled="loading"
            >
              ×
            </button>
          </div>
        </div>

        <label>Thêm hình ảnh mới (tối đa 5 ảnh)</label>
        <input
          type="file"
          multiple
          accept="image/*"
          @change="handleImageUpload"
          :disabled="loading || (imageFiles.length + plant.images.length) >= 5"
        />
        <div v-if="imageFiles.length" class="image-preview">
          <div v-for="(file, index) in imageFiles" :key="index" class="preview-item">
            <img :src="createObjectURL(file)" :alt="'Preview ' + (index + 1)">
            <button 
              type="button" 
              class="remove-image" 
              @click="imageFiles.splice(index, 1)"
              :disabled="loading"
            >
              ×
            </button>
          </div>
        </div>
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

.image-preview {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 10px;
}

.preview-item {
  position: relative;
  width: 100px;
  height: 100px;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}

.preview-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.remove-image {
  position: absolute;
  top: 5px;
  right: 5px;
  width: 20px;
  height: 20px;
  background: rgba(255, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  line-height: 1;
}

.remove-image:hover {
  background: rgba(255, 0, 0, 0.9);
}

.remove-image:disabled {
  background: rgba(255, 0, 0, 0.5);
  cursor: not-allowed;
}
</style> 
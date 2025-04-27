<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { plantService } from '../../services/plant.service'
import speciesService from '../../services/fillter/species.service'
import type { Plant } from '../../models/Plant'
import type { SpeciesResponse } from '../../models/Species'

const router = useRouter()
const loading = ref(false)
const plantForm = ref<FormInstance>()
const imageFiles = ref<File[]>([])
const species = ref<SpeciesResponse[]>([])

const getSpecies = async () => {
  const response = await speciesService.getSpecies()
  species.value = response
}
getSpecies()

// Form data
const formData = reactive({
  name: '',
  english_name: '',
  description: '',
  benefits: '',
  instructions: '',
  species_id: '',
  images: [] as File[]
})

// Form validation rules
const rules = {
  name: [
    { required: true, message: 'Vui lòng nhập tên cây thuốc', trigger: 'blur' },
    { min: 3, message: 'Tên cây thuốc phải có ít nhất 3 ký tự', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Vui lòng nhập mô tả', trigger: 'blur' }
  ],
  benefits: [
    { required: true, message: 'Vui lòng nhập công dụng', trigger: 'blur' }
  ],
  instructions: [
    { required: true, message: 'Vui lòng nhập hướng dẫn', trigger: 'blur' }
  ]
}

// Handle image upload
const handleImageUpload = (event: Event) => {
  const input = event.target as HTMLInputElement
  if (input.files) {
    const files = Array.from(input.files)
    if (files.length + imageFiles.value.length > 5) {
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

// Handle form submission
const handleSubmit = async () => {
  if (!plantForm.value) return
  
  try {
    await plantForm.value.validate()
    loading.value = true
    
    // Create FormData for image upload
    const formDataToSubmit = new FormData()
    imageFiles.value.forEach((file) => {
      formDataToSubmit.append('images', file)
    })
    
    // Upload images first
    let uploadedImages: { url?: string }[] = []
    if (imageFiles.value.length > 0) {
      const uploadResponse = await plantService.uploadImages(formDataToSubmit)
      uploadedImages = uploadResponse.map((img: { url?: string }) => ({ url: img.url }))
    }
    
    // Create plant object
    const plantData: Omit<Plant, 'plant_id'> = {
      name: formData.name,
      english_name: formData.english_name,
      description: formData.description,
      benefits: formData.benefits,
      instructions: formData.instructions,
      species_id: Number(formData.species_id),
      images: uploadedImages.map(img => ({
        picture_id: 0, // Temporary placeholder
        url: img.url || ''
      })),
      created_at: '',
      updated_at: ''
    }
    
    const response = await plantService.createPlant(plantData)
    console.log("creatq",response)
    if (response) {
      ElMessage.success('Tạo cây thuốc thành công')
      router.push('/admin/plants')
    }
  } catch (error) {
    console.error('Error creating plant:', error)
    ElMessage.error('Tạo cây thuốc thất bại: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="disease-create">
    <h1>Tạo cây thuốc mới</h1>
    <div class="form-container">
      <el-form
        ref="plantForm"
        :model="formData"
        :rules="rules"
        class="custom-form"
        @submit.prevent="handleSubmit"
      >
        <div class="form-group">
          <label>Tên cây tiếng Việt:</label>
          <el-input
            v-model="formData.name"
            placeholder="Nhập tên cây"
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label>Tên cây tiếng Anh:</label>
          <el-input
            v-model="formData.english_name"
            placeholder="Nhập tên tiếng anh"
            :disabled="loading"
          />
        </div>


        <div class="form-group">
          <label>Mô tả:</label>
          <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
            placeholder="Nhập mô tả"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label>Lợi ích:</label>
          <el-input
            v-model="formData.benefits"
            type="textarea"
            :rows="4"
            placeholder="Nhập công dụng"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label>Hướng dẫn:</label>
          <el-input
            v-model="formData.instructions"
            type="textarea"
            :rows="4"
            placeholder="Nhập hướng dẫn"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label>Loại cây:</label>
          <el-select v-model="formData.species_id" placeholder="Chọn loại cây">
            <el-option v-for="item in species" :key="item.species_id" :label="item.name" :value="item.species_id" />
          </el-select>
        </div>

        
        <div class="form-group">
          <label>Hình ảnh (tối đa 5 ảnh)</label>
          <input
            type="file"
            multiple
            accept="image/*"
            @change="handleImageUpload"
            :disabled="loading || imageFiles.length >= 5"
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
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            class="btn btn-primary"
            @click="handleSubmit"
          >
            {{ loading ? 'Đang tạo...' : 'Tạo mới' }}
          </el-button>
          <el-button
            @click="router.push('/admin/plants')"
            :disabled="loading"
            class="btn btn-secondary"
          >
            Hủy
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.disease-create {
  padding: 20px;
}

.form-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
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

:deep(.el-input),
:deep(.el-select),
:deep(.el-textarea) {
  width: 100%;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
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
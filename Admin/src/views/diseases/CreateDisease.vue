<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { diseasesService } from '../../services/diseases.service'
import { API_HOST } from '../../confighost'
import type { Disease } from '../../models/Diseases'

const router = useRouter()
const loading = ref(false)
const diseaseForm = ref<FormInstance>()
const imageFiles = ref<File[]>([])

// Form data
const formData = reactive({
  name: '',
  description: '',
  symptoms: '',
  instructions: '',
  images: [] as File[]
})

// Form validation rules
const rules = {
  name: [
    { required: true, message: 'Vui lòng nhập tên bệnh', trigger: 'blur' },
    { min: 3, message: 'Tên bệnh phải có ít nhất 3 ký tự', trigger: 'blur' }
  ],
  description: [
    { required: true, message: 'Vui lòng nhập mô tả', trigger: 'blur' }
  ],
  symptoms: [
    { required: true, message: 'Vui lòng nhập triệu chứng', trigger: 'blur' }
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

// Function to prepend host to image URL for display
const getDisplayImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_HOST}${url}`
}

// Handle form submission
const handleSubmit = async () => {
  if (!diseaseForm.value) return
  
  try {
    await diseaseForm.value.validate()
    loading.value = true
    
    // Create FormData for image upload
    const formDataToSubmit = new FormData()
    imageFiles.value.forEach((file) => {
      formDataToSubmit.append('images', file)
    })
    
    // Upload images first
    let uploadedImages: { url?: string }[] = []
    if (imageFiles.value.length > 0) {
      const uploadResponse = await diseasesService.uploadImages(formDataToSubmit)
        uploadedImages = uploadResponse.map((img: { url?: string }) => ({ url: img.url }))
      }
    
    // Create disease object
    const diseaseData: Omit<Disease, 'disease_id'> = {
      name: formData.name,
      description: formData.description,
      symptoms: formData.symptoms,
      instructions: formData.instructions,
      images: uploadedImages.map(img => ({
        picture_id: 0, // Temporary placeholder
        url: img.url || ''
      })),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
    
    const response = await diseasesService.createDisease(diseaseData)
    if (response) {
      ElMessage.success('Tạo bệnh thành công')
      router.push('/admin/diseases')
    }
  } catch (error) {
    console.error('Error creating disease:', error)
    ElMessage.error('Tạo bệnh thất bại')
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="disease-create">
    <h1>Tạo bệnh mới</h1>
    <div class="form-container">
      <el-form
        ref="diseaseForm"
        :model="formData"
        :rules="rules"
        class="custom-form"
        @submit.prevent="handleSubmit"
      >
        <div class="form-group">
          <label>Tên bệnh:</label>
          <el-input
            v-model="formData.name"
            placeholder="Nhập tên bệnh"
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
          <label>Triệu chứng:</label>
          <el-input
            v-model="formData.symptoms"
            type="textarea"
            :rows="4"
            placeholder="Nhập triệu chứng"
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
              <img :src="getDisplayImageUrl(createObjectURL(file))" :alt="'Preview ' + (index + 1)">
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
          >
            {{ loading ? 'Đang tạo...' : 'Tạo mới' }}
          </el-button>
          <el-button
            @click="router.push('/admin/diseases')"
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
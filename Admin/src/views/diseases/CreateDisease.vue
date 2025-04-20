<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { diseasesService } from '../../services/diseases.service'

const router = useRouter()
const loading = ref(false)

const formData = ref({
  name: '',
  description: '',
  symptoms: ''
})

const handleSubmit = async () => {
  try {
    console.log('Submitting form data:', formData.value)
    loading.value = true
    const response = await diseasesService.createDisease(formData.value)
    console.log('Create disease response:', response)
    ElMessage.success('Tạo bệnh thành công')
    router.push({ name: 'diseases' })
  } catch (error) {
    console.error('Error creating disease:', error)
    ElMessage.error('Không thể tạo bệnh')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  console.log('Canceling disease creation')
  router.push({ name: 'diseases' })
}
</script>

<template>
  <div class="create-disease">
    <h2>Tạo bệnh mới</h2>
    
    <form @submit.prevent="handleSubmit" class="disease-form">
      <div class="form-group">
        <label for="name">Tên bệnh</label>
        <input
          id="name"
          v-model="formData.name"
          type="text"
          required
          placeholder="Nhập tên bệnh"
        />
      </div>

      <div class="form-group">
        <label for="description">Mô tả</label>
        <textarea
          id="description"
          v-model="formData.description"
          required
          placeholder="Nhập mô tả bệnh"
          rows="4"
        ></textarea>
      </div>

      <div class="form-group">
        <label for="symptoms">Triệu chứng</label>
        <textarea
          id="symptoms"
          v-model="formData.symptoms"
          required
          placeholder="Nhập triệu chứng"
          rows="4"
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="button" @click="handleCancel" class="btn-cancel">
          Hủy
        </button>
        <button type="submit" :disabled="loading" class="btn-submit">
          {{ loading ? 'Đang tạo...' : 'Tạo bệnh' }}
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.create-disease {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

h2 {
  margin-bottom: 20px;
  color: #333;
}

.disease-form {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

input,
textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel,
.btn-submit {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: background-color 0.3s ease;
}

.btn-cancel {
  background-color: #f5f5f5;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}

.btn-submit {
  background-color: #4CAF50;
  color: white;
}

.btn-submit:hover {
  background-color: #388E3C;
}

.btn-submit:disabled {
  background-color: #a5d6a7;
  cursor: not-allowed;
}
</style> 
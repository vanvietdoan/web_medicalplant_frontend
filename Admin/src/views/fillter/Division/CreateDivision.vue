<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import divisionService from '../../../services/fillter/division.service'

const router = useRouter()
const formData = ref({
  name: ''
})

const handleSubmit = async () => {
  try {
    await divisionService.createDivision(formData.value)
    ElMessage.success('Tạo ngành thành công')
    router.push({ name: 'listDivision' })
  } catch (error) {
    console.error('Lỗi khi tạo ngành:', error)
    ElMessage.error('Không thể tạo ngành')
  }
}

const handleCancel = () => {
  router.push({ name: 'listDivision' })
}
</script>

<template>
  <div class="division-create">
    <div class="header">
      <h2>Tạo ngành mới</h2>
    </div>

    <form @submit.prevent="handleSubmit" class="create-form">
      <div class="form-group">
        <label>Tên ngành</label>
        <input 
          v-model="formData.name" 
          type="text" 
          required
          placeholder="Nhập tên ngành"
        >
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save">
          Tạo mới
        </button>
        <button type="button" class="btn-cancel" @click="handleCancel">
          Hủy
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.division-create {
  padding: 20px;
  max-width: 600px;
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

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #333;
}

.form-group input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
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

.btn-cancel {
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  color: #333;
}

.btn-cancel:hover {
  background-color: #e0e0e0;
}
</style> 
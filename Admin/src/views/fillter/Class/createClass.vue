<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import classService from '../../../services/fillter/class.service';
import divisionService from '../../../services/fillter/division.service';
import { ElMessage } from 'element-plus';
import type { ClassResponse } from '../../../models/Class';
const router = useRouter();
const loading = ref(false);

const formData = ref({
  name: '',
  division_id: ''
});

const divisions = ref<{ division_id: number; name: string }[]>([]);

const fetchDivisions = async () => {
  try {
    const response = await divisionService.getDivisions();
    divisions.value = response;
  } catch (error) {
    console.error('Error fetching divisions:', error);
    ElMessage.error('Không thể tải danh sách ngành');
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    await classService.createClass(formData.value as unknown as Omit<ClassResponse, 'created_at' | 'updated_at' | 'class_id'>);
    ElMessage.success('Tạo lớp thành công');
    router.push({ name: 'listClass' });
  } catch (error) {
    console.error('Error creating class:', error);
    ElMessage.error('Không thể tạo lớp');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDivisions();
});
</script>

<template>
  <div class="class-create">
    <h1>Tạo lớp mới</h1>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Tên lớp:</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            required
            :disabled="loading"
            placeholder="Nhập tên lớp"
          />
        </div>
        <div class="form-group">
          <label for="division">Ngành:</label>
          <select 
            id="division" 
            v-model="formData.division_id" 
            required
            :disabled="loading"
          >
            <option value="">Chọn ngành</option>
            <option 
              v-for="division in divisions" 
              :key="division.division_id" 
              :value="division.division_id"
            >
              {{ division.name }}
            </option>
          </select>
        </div>
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Đang tạo...' : 'Tạo mới' }}
          </button>
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="router.push({ name: 'listClass' })"
            :disabled="loading"
          >
            Hủy
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<style scoped>
.class-create {
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

.form-group input,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-group input:focus,
.form-group select:focus {
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
</style> 
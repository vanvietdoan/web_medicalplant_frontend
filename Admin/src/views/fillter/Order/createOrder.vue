<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import orderService from '../../../services/fillter/order.service';
import classService from '../../../services/fillter/class.service';
import { ElMessage } from 'element-plus';
import type { OrderResponse } from '../../../models/Order';
const router = useRouter();
const loading = ref(false);

const formData = ref({
  name: '',
  class_id: ''
});

const classes = ref<{ class_id: number; name: string }[]>([]);

const fetchDivisions = async () => {
  try {
    const response = await classService.getClasses();
    classes.value = response;
  } catch (error) {
    console.error('Error fetching classes:', error);
    ElMessage.error('Không thể tải danh sách lớp');
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    await orderService.createOrder(formData.value as unknown as Omit<OrderResponse, 'created_at' | 'updated_at' | 'order_id'>);
    ElMessage.success('Tạo bộ thành công');
    router.push({ name: 'listOrder' });
  } catch (error) {
    console.error('Error creating order:', error);
    ElMessage.error('Không thể tạo bộ');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  fetchDivisions();
});
</script>

<template>
  <div class="order-create">
    <h1>Tạo bộ mới</h1>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Tên bộ:</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            required
            :disabled="loading"
            placeholder="Nhập tên bộ"
          />
        </div>
        <div class="form-group">
          <label for="class">Lớp:</label>
          <select 
            id="class" 
            v-model="formData.class_id" 
            required
            :disabled="loading"
          >
            <option value="">Chọn lớp</option>
            <option 
              v-for="classItem in classes" 
              :key="classItem.class_id" 
              :value="classItem.class_id"
            >
              {{ classItem.name }}
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
            @click="router.push({ name: 'listOrder' })"
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
.order-create {
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
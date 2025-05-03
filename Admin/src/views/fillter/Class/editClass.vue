<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import classService from '../../../services/fillter/class.service';
import divisionService from '../../../services/fillter/division.service';
import { ElMessage } from 'element-plus';

const route = useRoute();
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

const fetchClass = async (id: number) => {
  try {
    loading.value = true;
    const classData = await classService.getClassById(id);
    console.log("classData:", classData);
    
    if (!classData) {
      throw new Error('Class data is undefined');
    }

    formData.value = {
      name: classData.name || '',
      division_id: classData.division_id ? classData.division_id.toString() : ''
    };
  } catch (error) {
    console.error('Error fetching class:', error);
    ElMessage.error('Không thể tải thông tin lớp');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const id = Number(route.params.id);
    await classService.updateClass(id, formData.value);
    ElMessage.success('Cập nhật lớp thành công');
    router.push({ name: 'listClass' });
  } catch (error) {
    console.error('Error updating class:', error);
    ElMessage.error('Không thể cập nhật lớp');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  console.log("id class:", id);
  if (id) {
    fetchClass(id);
  }
  fetchDivisions();
});
</script>

<template>
  <div class="class-edit">
    <h1>Cập nhật lớp</h1>
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
        <button 
          type="submit" 
          class="btn btn-primary"
          :disabled="loading"
        >
          {{ loading ? 'Đang cập nhật...' : 'Cập nhật' }}
        </button>
      </form>
    </div>
  </div>
</template>

<style scoped>
.class-edit {
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

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}
</style> 
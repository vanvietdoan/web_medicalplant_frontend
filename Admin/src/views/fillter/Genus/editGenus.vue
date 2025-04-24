<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import genusService from '../../../services/fillter/genus.service';
import familyService from '../../../services/fillter/family.service';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const loading = ref(false);

const formData = ref({
  name: '',
  family_id: ''
});

  const families = ref<{ family_id: number; name: string }[]>([]);

const fetchFamilies = async () => {
  try {
    const response = await familyService.getFamilies();
    families.value = response;
  } catch (error) {
    console.error('Error fetching families:', error);
    ElMessage.error('Không thể tải danh sách họ');
  }
};

const fetchFamily = async (id: number) => {
  try {
    loading.value = true;
    const familyData = await genusService.getGenusById(id);
    formData.value = {
      name: familyData.name,
      family_id: familyData.family_id.toString()
    };
  } catch (error) {
    console.error('Error fetching family:', error);
    ElMessage.error('Không thể tải thông tin phân loại');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const id = Number(route.params.id);
    await genusService.updateGenus(id, formData.value);
    ElMessage.success('Cập nhật phân loại thành công');
    router.push({ name: 'listGenus' });
  } catch (error) {
    console.error('Error updating genus:', error);
    ElMessage.error('Không thể cập nhật phân loại');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchFamily(id);
  }
  fetchFamilies();
});
</script>

<template>
  <div class="order-edit">
    <h1>Cập nhật phân chi</h1>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Tên chi:</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            required
            :disabled="loading"
          />
        </div>
        <div class="form-group">
          <label for="family">Họ:</label>
          <select 
            id="family" 
            v-model="formData.family_id" 
            required
            :disabled="loading"
          >
            <option value="">Chọn họ</option>
            <option 
              v-for="familyItem in families" 
              :key="familyItem.family_id" 
              :value="familyItem.family_id"
            >
              {{ familyItem.name }}
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
.order-edit {
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
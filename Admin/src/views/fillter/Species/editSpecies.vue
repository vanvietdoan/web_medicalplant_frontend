<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import speciesService from '../../../services/fillter/species.service';
import genusService from '../../../services/fillter/genus.service';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const loading = ref(false);

const formData = ref({
  name: '',
  genus_id: '',
  distribution: '',
  description: ''
});

const genera = ref<{ genus_id: number; name: string }[]>([]);

const fetchGenera = async () => {
  try {
    const response = await genusService.getGenuses();
    genera.value = response;
  } catch (error) {
    console.error('Error fetching genera:', error);
    ElMessage.error('Không thể tải danh sách chi');
  }
};

const fetchSpecies = async (id: number) => {
  try {
    loading.value = true;
    const speciesData = await speciesService.getSpeciesById(id);
    formData.value = {
      name: speciesData.name,
      genus_id: speciesData.genus_id.toString(),
      distribution: speciesData.distribution || '',
      description: speciesData.description || ''
    };
  } catch (error) {
    console.error('Error fetching species:', error);
    ElMessage.error('Không thể tải thông tin loài');
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  try {
    loading.value = true;
    const id = Number(route.params.id);
    await speciesService.updateSpecies(id, formData.value);
    ElMessage.success('Cập nhật loài thành công');
    router.push({ name: 'listSpecies' });
  } catch (error) {
    console.error('Error updating species:', error);
    ElMessage.error('Không thể cập nhật loài');
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  const id = Number(route.params.id);
  if (id) {
    fetchSpecies(id);
  }
  fetchGenera();
});
</script>

<template>
  <div class="species-edit">
    <h1>Cập nhật loài</h1>
    <div class="form-container">
      <form @submit.prevent="handleSubmit">
        <div class="form-group">
          <label for="name">Tên loài:</label>
          <input 
            type="text" 
            id="name" 
            v-model="formData.name" 
            required
            :disabled="loading"
            placeholder="Nhập tên loài"
          />
        </div>
        <div class="form-group">
          <label for="distribution">Phân bố:</label>
          <input 
            type="text" 
            id="distribution" 
            v-model="formData.distribution" 
            :disabled="loading"
            placeholder="Nhập phân bố"
          />
        </div>
      
        <div class="form-group">
          <label for="genus">Chi:</label>
          <select 
            id="genus" 
            v-model="formData.genus_id" 
            required
            :disabled="loading"
          >
            <option value="">Chọn chi</option>
            <option 
              v-for="genusItem in genera" 
              :key="genusItem.genus_id" 
              :value="genusItem.genus_id"
            >
              {{ genusItem.name }}
            </option>
          </select>
        </div>
        <div class="form-actions">
          <button 
            type="submit" 
            class="btn btn-primary"
            :disabled="loading"
          >
            {{ loading ? 'Đang cập nhật...' : 'Cập nhật' }}
          </button>
          <button 
            type="button" 
            class="btn btn-secondary"
            @click="router.push({ name: 'listSpecies' })"
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
.species-edit {
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
.form-group select,
.form-group textarea {
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
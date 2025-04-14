<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { plantService } from '../../services/plant.service';
import type { Plant } from '../../models/Plant';

const route = useRoute();
const plant = ref<Plant | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchPlantDetails = async () => {
  console.log('Starting to fetch plant details...')
  try {
    loading.value = true;
    error.value = null;
    const plantId = Number(route.params.id);
    console.log('Plant ID from route:', plantId)
    if (!plantId) {
      throw new Error('ID cây thuốc không hợp lệ');
    }
    plant.value = await plantService.getPlantById(plantId);
    console.log('Plant details fetched successfully:', plant.value)
  } catch (err) {
    console.error('Error in fetchPlantDetails:', err)
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin cây thuốc';
  } finally {
    loading.value = false;
    console.log('Fetch plant details completed, loading:', loading.value)
  }
};

onMounted(() => {
  console.log('MedicinalPlantDetail component mounted')
  fetchPlantDetails();
});
</script>

<template>
  <div class="plant-detail-container">
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin cây thuốc...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchPlantDetails" class="retry-btn">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="plant" class="plant-detail">
      <div class="plant-header">
        <h1>{{ plant.name }}</h1>
        <img src="/images/plant/tia-to.webp" alt="Plant Image" class="plant-image">
        <p class="english-name">{{ plant.english_name }}</p>
      </div>

      <div class="plant-content">
        <div class="info-section">
          <h2>Mô tả</h2>
          <p>{{ plant.description }}</p>
        </div>

        <div class="info-section">
          <h2>Công dụng</h2>
          <p>{{ plant.benefits }}</p>
        </div>

        <div class="info-section">
          <h2>Hướng dẫn sử dụng</h2>
          <p>{{ plant.instructions }}</p>
        </div>

        <div class="info-section">
          <h2>Thông tin thêm</h2>
          <div class="additional-info">
            <p><strong>ID:</strong> {{ plant.plant_id }}</p>
            <p><strong>Loài:</strong> {{ plant.species_id }}</p>
            <p><strong>Ngày tạo:</strong> {{ new Date(plant.created_at).toLocaleDateString('vi-VN') }}</p>
            <p><strong>Cập nhật lần cuối:</strong> {{ new Date(plant.updated_at).toLocaleDateString('vi-VN') }}</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plant-detail-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i, .error i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error {
  color: #dc3545;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn:hover {
  background-color: #c82333;
}

.plant-detail {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.plant-header {
  background: linear-gradient(135deg, #008053 0%, #006040 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.plant-header h1 {
  margin: 0;
  font-size: 2rem;
}

.english-name {
  margin: 0.5rem 0 0;
  opacity: 0.9;
  font-style: italic;
}

.plant-content {
  padding: 2rem;
}

.info-section {
  margin-bottom: 2rem;
}

.info-section:last-child {
  margin-bottom: 0;
}

.info-section h2 {
  color: #008053;
  font-size: 1.5rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.info-section p {
  color: #333;
  line-height: 1.6;
}

.additional-info {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

.additional-info p {
  margin: 0.5rem 0;
}

.additional-info strong {
  color: #008053;
}

@media (max-width: 768px) {
  .plant-detail-container {
    margin: 1rem auto;
  }

  .plant-header {
    padding: 1.5rem;
  }

  .plant-content {
    padding: 1.5rem;
  }
}
</style> 
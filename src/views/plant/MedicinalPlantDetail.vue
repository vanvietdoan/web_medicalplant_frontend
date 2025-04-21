<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { plantService } from '../../services/plant.service';
import { adviceService } from '../../services/advice.service';
import type { Plant } from '../../models/Plant';
import type { Advice } from '../../models/Advice';

const route = useRoute();
const plant = ref<Plant | null>(null);
const advices = ref<Advice[]>([]);
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
    const [plantResponse, advicesResponse] = await Promise.all([
      plantService.getPlantById(plantId),
      adviceService.getAdvicesByPlant(plantId)
    ]);
    plant.value = plantResponse;
    advices.value = advicesResponse;
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

      <div class="plant-content-grid">
        <!-- Plant Information Column -->
        <div class="plant-info-column">
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

        <!-- Expert Advice Column -->
        <div class="advice-column">
          <section v-if="advices.length > 0" class="advice-section">
            <h2><i class="fas fa-comments"></i> Lời khuyên từ chuyên gia</h2>
            <div class="advice-list">
              <div v-for="advice in advices" :key="advice.advice_id" class="advice-card">
                <div class="advice-header">
                  <h3>{{ advice.title }}</h3>
                  <div class="advice-meta">
                    <span class="date">{{ new Date(advice.created_at).toLocaleDateString('vi-VN') }}</span>
                  </div>
                </div>
                
                <div class="advice-content">
                  <p>{{ advice.content }}</p>
                </div>

                <div class="advice-footer">
                  <div class="disease-info">
                    <i class="fas fa-disease"></i>
                    <router-link :to="`/disease/${advice.disease.disease_id}`">
                      {{ advice.disease.name }}
                    </router-link>
                  </div>
                  
                  <div class="user-info">
                    <i class="fas fa-user-md"></i>
                    <span class="user-name">{{ advice.user.full_name }}</span>
                    <span class="user-title">({{ advice.user.title }})</span>
                  </div>
                </div>
              </div>
            </div>
          </section>
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

.plant-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  padding: 2rem;
}

.plant-info-column {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.advice-column {
  position: sticky;
  top: 80px;
  height: fit-content;
  max-height: calc(100vh - 100px);
  overflow-y: auto;
}

.advice-section {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.advice-section h2 {
  color: #008053;
  font-size: 1.5rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.advice-card {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #008053;
}

.advice-header {
  margin-bottom: 1rem;
}

.advice-header h3 {
  color: #008053;
  margin: 0;
  font-size: 1.2rem;
}

.advice-meta {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
}

.advice-content {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.advice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
}

.disease-info, .user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.disease-info a {
  color: #008053;
  text-decoration: none;
}

.disease-info a:hover {
  text-decoration: underline;
}

.user-name {
  font-weight: 500;
}

.user-title {
  color: #666;
}

@media (max-width: 1024px) {
  .plant-content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .advice-column {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .plant-content-grid {
    padding: 1.5rem;
  }
}
</style> 
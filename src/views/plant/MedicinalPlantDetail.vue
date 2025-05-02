<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { plantService } from '../../services/plant.service';
import { adviceService } from '../../services/advice.service';
import speciesService from '../../services/fillter/species.service';
import type { Plant } from '../../models/Plant';
import type { Species } from '../../models/Species';
import type { Advice } from '../../models/Advice';

const route = useRoute();
const router = useRouter();
const plant = ref<Plant | null>(null);
const advices = ref<Advice[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const species = ref<Species | null>(null);
const currentImageIndex = ref(0);

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
    
    // Lấy thông tin species sau khi có plant
    if (plantResponse.species_id) {
      const speciesResponse = await speciesService.getSpeciesById(plantResponse.species_id);
      species.value = speciesResponse;
      console.log('Species details:', speciesResponse);
    }
    
    console.log('Plant details fetched successfully:', plant.value)
  } catch (err) {
    console.error('Error in fetchPlantDetails:', err)
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin cây thuốc';
  } finally {
    loading.value = false;
    console.log('Fetch plant details completed, loading:', loading.value)
  }
};

const nextImage = () => {
  if (plant.value && currentImageIndex.value < plant.value.images.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (plant.value && currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const handleCreateAdvice = () => {
  console.log('handleCreateAdvice called with plant_id:', route.params.id)
  router.push({
    path: '/plant/create-advice',
    
    query: { plant_id: route.params.id }
  });
};

onMounted(() => {
  console.log('MedicinalPlantDetail component mounted')
  fetchPlantDetails();
});
</script>

<template>
  <div class="plant-detail-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin cây thuốc...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchPlantDetails" class="retry-button">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="plant" class="plant-detail">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-gallery">
          <div class="main-image">
            <img :src="plant.images[currentImageIndex]?.url" :alt="plant.name">
            <button 
              v-if="plant.images.length > 1"
              class="nav-button prev" 
              @click="prevImage"
              :disabled="currentImageIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              v-if="plant.images.length > 1"
              class="nav-button next" 
              @click="nextImage"
              :disabled="currentImageIndex === plant.images.length - 1"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="thumbnail-list" v-if="plant.images.length > 1">
            <div 
              v-for="(image, index) in plant.images" 
              :key="image.picture_id"
              class="thumbnail"
              :class="{ active: currentImageIndex === index }"
              @click="currentImageIndex = index"
            >
              <img :src="image.url" :alt="`${plant.name} - ảnh ${index + 1}`">
            </div>
          </div>
        </div>
        <div class="hero-content">
          <h1>{{ plant.name }}</h1>
          <p class="english-name">{{ plant.english_name }}</p>
          <button @click="handleCreateAdvice" class="create-advice-btn">
            <i class="fas fa-plus"></i>
            Tạo lời khuyên cho cây này
          </button>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="main-content-grid">
        <!-- Plant Information Column -->
        <!-- Info Column -->
<div class="info-column">
  <section class="info-section">
    <h2><i class="fas fa-seedling"></i> Thông tin cây thuốc</h2>
    <div class="content-box">
      <h3>Mô tả</h3>
      <p>{{ plant.description }}</p>

      <h3>Công dụng</h3>
      <p>{{ plant.benefits }}</p>

      <h3>Hướng dẫn sử dụng</h3>
      <p>{{ plant.instructions }}</p>

      <h3>Bệnh có thể điều trị</h3>
      <div class="disease-list">
        <div v-for="advice in advices" :key="advice.disease.disease_id" class="disease-item">
          <i class="fas fa-disease"></i>
          <router-link :to="`/disease/${advice.disease.disease_id}`" class="disease-link">
            {{ advice.disease.name }}
          </router-link>
        </div>
      </div>

      <div class="metadata">
        <div class="metadata-item">
          <span class="label">Loài:</span>
          <span class="value">{{ species?.name }}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Ngày tạo:</span>
          <span class="value">{{ new Date(plant.created_at).toLocaleDateString('vi-VN') }}</span>
        </div>
        <div class="metadata-item">
          <span class="label">Cập nhật lần cuối:</span>
          <span class="value">{{ new Date(plant.updated_at).toLocaleDateString('vi-VN') }}</span>
        </div>
      </div>
    </div>
  </section>
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
                    <i class="fas fa-calendar"></i>
                    <span>{{ new Date(advice.created_at).toLocaleDateString('vi-VN') }}</span>
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
                  
                  <div class="expert-info">
                    <i class="fas fa-user-md"></i>
                    <div class="expert-details">
                      
                      <router-link :to="`/profile/${advice.user.user_id}`">
                        <span class="name">{{ advice.user.full_name }}</span>
                      </router-link>
                      <span class="title">{{ advice.user.title }}</span>
                    </div>
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
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

/* Loading & Error States */
.loading-state,
.error-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #666;
}

.loading-state i,
.error-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #008053;
}

.error-state {
  color: #dc3545;
}

.retry-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  background: #006040;
  transform: translateY(-2px);
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.hero-gallery {
  position: relative;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.main-image {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #008053;
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-button:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.prev {
  left: 1rem;
}

.nav-button.next {
  right: 1rem;
}

.thumbnail-list {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  justify-content: center;
}

.thumbnail-list::-webkit-scrollbar {
  display: none;
}

.thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
  background: white;
}

.thumbnail.active {
  border-color: #008053;
  transform: scale(1.1);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail:hover {
  transform: scale(1.1);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-content .english-name {
  font-size: 1.2rem;
  opacity: 0.9;
  font-style: italic;
  margin-top: 0.5rem;
}

/* Main Content Grid */
.main-content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
}

/* Info Sections */
.info-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  margin-bottom: 2rem;
}

.info-section h2 {
  color: #008053;
  font-size: 1.5rem;
  margin: 0 0 1rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.content-box {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  line-height: 1.6;
}

.metadata {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1rem;
}

.metadata-item {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.metadata-item .label {
  color: #666;
  font-size: 0.9rem;
}

.metadata-item .value {
  font-weight: 500;
  color: #2c3e50;
}

/* Advice Section */
.advice-section {
  position: sticky;
  top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  max-height: calc(100vh - 200px);
  overflow-y: auto;
  padding-right: 0.5rem;
}

.advice-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #008053;
}

.advice-header {
  margin-bottom: 1rem;
}

.advice-header h3 {
  color: #008053;
  margin: 0 0 0.5rem;
  font-size: 1.2rem;
}

.advice-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.advice-content {
  color: #2c3e50;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.advice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.disease-info,
.expert-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.disease-info a {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
}

.disease-info a:hover {
  text-decoration: underline;
}

.expert-details {
  display: flex;
  flex-direction: column;
}

.expert-details .name {
  font-weight: 500;
  color: #2c3e50;
}

.expert-details .title {
  font-size: 0.9rem;
  color: #666;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }

  .advice-section {
    position: static;
  }

  .advice-list {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .plant-detail-container {
    padding: 1rem;
  }

  .hero-section {
    height: 300px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .metadata {
    grid-template-columns: 1fr;
  }

  .hero-gallery {
    height: 300px;
  }

  .thumbnail {
    width: 60px;
    height: 45px;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }
}

/* Disease List Styles */
.disease-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.disease-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.disease-item:hover {
  background: #e0efe8;
  transform: translateX(5px);
}

.disease-item i {
  color: #008053;
  font-size: 1.1rem;
}

.disease-link {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  flex: 1;
}

.disease-link:hover {
  text-decoration: underline;
}

.create-advice-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 2px solid white;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-advice-btn:hover {
  background: white;
  color: #008053;
  transform: translateY(-2px);
}

.create-advice-btn i {
  font-size: 1.1rem;
}
</style>
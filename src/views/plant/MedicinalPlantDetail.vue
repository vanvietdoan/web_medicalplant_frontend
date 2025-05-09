<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { plantService } from '../../services/plant.service';
import { adviceService } from '../../services/advice.service';
import speciesService from '../../services/fillter/species.service';
import { authService } from '../../services/auth.service';
import type { Plant } from '../../models/Plant';
import type { Species } from '../../models/Species';
import type { Advice } from '../../models/Advice';
import { ElMessage } from 'element-plus';

interface AdviceWithExpand extends Advice {
  isExpanded: boolean;
}

const route = useRoute();
const router = useRouter();
const plant = ref<Plant | null>(null);
const advices = ref<AdviceWithExpand[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const species = ref<Species | null>(null);
const currentImageIndex = ref(0);
const currentUser = ref(authService.getCurrentUser());

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
    advices.value = advicesResponse.map(advice => ({
      ...advice,
      isExpanded: false
    }));
    
    // Lấy thông tin species sau khi có plant
    if (plantResponse.species_id) {
      try {
        const speciesResponse = await speciesService.getSpeciesById(plantResponse.species_id);
        species.value = speciesResponse;
        console.log('Species details:', speciesResponse);
      } catch (err) {
        console.warn('Species not found, setting to null:', err);
        species.value = null;
      }
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

const handleCreateReport = () => {
  if (!currentUser.value) {
    ElMessage.warning('Vui lòng đăng nhập để tạo báo cáo');
    router.push('/login');
    return;
  }
  router.push({
    path: '/report/create',
    query: { plant_id: route.params.id }
  });
};

const handleEditAdvice = (adviceId: number) => {
  console.log('handleEditAdvice called with adviceId:', adviceId)
  router.push({
    path :`/profile/advice/${adviceId}/edit`,
    query: { plant_id: route.params.id }
  });
};

const handleViewReports = () => {
  router.push({
    path: '/profile/report',
    query: { 
      plant_id: route.params.id,
      species_id: plant.value?.species_id
    }
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
          <div class="action-buttons">
            <button 
              v-if="currentUser"
              @click="handleCreateReport" 
              class="create-report-btn"
            >
              <i class="fas fa-file-medical"></i>
              Tạo báo cáo
            </button>
            <button 
              @click="handleViewReports" 
              class="view-reports-btn"
            >
              <i class="fas fa-list"></i>
              Xem danh sách báo cáo
            </button>
          </div>
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
      <p class="formatted-text">{{ plant.description }}</p>

      <div v-if="plant.images.length > 1" class="content-image">
        <img :src="plant.images[1].url" :alt="`${plant.name} - ảnh 2`">
      </div>

      <h3>Công dụng</h3>
      <p class="formatted-text">{{ plant.benefits }}</p>

      <div v-if="plant.images.length > 2" class="content-image">
        <img :src="plant.images[2].url" :alt="`${plant.name} - ảnh 3`">
      </div>

      <h3>Hướng dẫn sử dụng</h3>
      <p class="formatted-text">{{ plant.instructions }}</p>

      <div v-if="plant.images.length > 3" class="content-image">
        <img :src="plant.images[3].url" :alt="`${plant.name} - ảnh 4`">
      </div>

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
          <span class="value">{{ species?.name || 'Chưa xác định' }}</span>
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
          <section class="advice-section">
            <div class="advice-header">
              <h2><i class="fas fa-comments"></i> Lời khuyên từ chuyên gia</h2>
              <button @click="handleCreateAdvice" class="create-advice-btn">
                <i class="fas fa-plus"></i>
                Tạo lời khuyên cho cây này
              </button>
            </div>
            <div v-if="advices.length === 0" class="empty-advice">
              <i class="fas fa-comment-slash"></i>
              <p>Chưa có lời khuyên nào cho cây này</p>
            </div>
            <div v-else class="advice-list">
              <div v-for="advice in advices" :key="advice.advice_id" class="advice-card">
                <div class="advice-header">
                  <h3>{{ advice.title }}</h3>
                  
                  <div class="advice-meta">
                    <i class="fas fa-calendar"></i>
                    <span>{{ new Date(advice.created_at).toLocaleDateString('vi-VN') }}</span>
                    <button 
                      v-if="currentUser && currentUser.id === advice.user.user_id"
                      @click="handleEditAdvice(advice.advice_id)"
                      class="edit-btn"
                    >
                      <i class="fas fa-edit"></i>
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
                
                <div class="advice-content">
                  <p :class="{ 'truncated': !advice.isExpanded }">{{ advice.content }}</p>
                  <button 
                    v-if="advice.content.length > 200" 
                    @click="advice.isExpanded = !advice.isExpanded" 
                    class="read-more-btn"
                  >
                    {{ advice.isExpanded ? 'Thu gọn' : 'Xem thêm' }}
                    <i :class="advice.isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  </button>
                </div>

                <div class="advice-footer">
                  <div class="disease-info">
                    <i class="fas fa-disease"></i>
                    <router-link :to="`/disease/${advice.disease.disease_id}`">
                      {{ advice.disease.name }}
                    </router-link>
                  </div>
                  
                  <div class="expert-info">
                    <div class="expert-details">
                      <img 
                        :src="advice.user.avatar || '/default-avatar.png'" 
                        :alt="advice.user.full_name"
                        class="expert-avatar"
                      >
                      <div class="expert-info-text">
                        <router-link :to="`/profile/${advice.user.user_id}`">
                          <span class="name">{{ advice.user.full_name }}</span>
                        </router-link>
                        <span class="title">{{ advice.user.title }}</span>
                      </div>
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
  grid-template-columns: 1fr 400px;
  gap: 2rem;
  position: relative;
}

/* Info Sections */
.info-column {
  position: relative;
  z-index: 1;
}

/* Advice Section */
.advice-section {
  position: sticky;
  top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  width: 400px;
  flex-shrink: 0;
}

.advice-header {
  flex-shrink: 0;
}

.advice-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
}

.advice-list::-webkit-scrollbar {
  width: 6px;
}

.advice-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.advice-list::-webkit-scrollbar-thumb {
  background: #008053;
  border-radius: 3px;
}

.advice-list::-webkit-scrollbar-thumb:hover {
  background: #006040;
}

.advice-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #008053;
}

.advice-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.advice-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

.advice-content .truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.read-more-btn {
  background: none;
  border: none;
  color: #008053;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.read-more-btn:hover {
  color: #006040;
  transform: translateY(-1px);
}

.read-more-btn i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
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
  align-items: center;
  gap: 1rem;
}

.expert-info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.expert-info-text .name {
  font-weight: 500;
  color: #2c3e50;
  text-decoration: none;
}

.expert-info-text .title {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.expert-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
}

/* Responsive Design */
@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }

  .advice-section {
    position: static;
    height: auto;
    width: 100%;
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

  .content-image img {
    max-height: 300px;
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

.create-advice-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.create-advice-btn i {
  font-size: 1.1rem;
}

.empty-advice {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-advice i {
  font-size: 3rem;
  color: #008053;
  margin-bottom: 1rem;
}

.empty-advice p {
  font-size: 1.1rem;
  margin: 0;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.edit-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.edit-btn i {
  font-size: 1rem;
}

.formatted-text {
  white-space: pre-line;
  line-height: 1.8;
  text-align: justify;
}

.content-box h3 {
  color: #008053;
  margin: 1.5rem 0 1rem;
  font-size: 1.2rem;
}

.content-box h3:first-child {
  margin-top: 0;
}

.content-image {
  margin: 2rem 0;
  text-align: center;
}

.content-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.content-image img:hover {
  transform: scale(1.02);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.create-report-btn,
.view-reports-btn {
  padding: 0.75rem 1.5rem;
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

.create-report-btn {
  background: #008053;
}

.create-report-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.view-reports-btn {
  background: #6c757d;
}

.view-reports-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.create-report-btn i,
.view-reports-btn i {
  font-size: 1.1rem;
}
</style>
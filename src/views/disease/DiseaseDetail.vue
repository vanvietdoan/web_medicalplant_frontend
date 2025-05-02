<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { diseasesService } from '../../services/diseases.service';
import { adviceService } from '../../services/advice.service';
import { authService } from '../../services/auth.service';
import type { Diseases } from '../../models/Diseases';
import type { Advice } from '../../models/Advice';
import type { IAdviceService } from '../../services/advice.service';

const route = useRoute();
const router = useRouter();
const disease = ref<Diseases | null>(null);
const advices = ref<Advice[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentImageIndex = ref(0);
const isLoggedIn = ref(false);
const currentUser = ref<any>(null);

const fetchDiseaseDetail = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const diseaseId = Number(route.params.id);
    const [diseaseResponse, advicesResponse] = await Promise.all([
      diseasesService.getDiseaseById(diseaseId),
      adviceService.getAdviceByDiseaseID(diseaseId)
    ]);
    disease.value = {
      ...diseaseResponse,
      images: diseaseResponse.images || []
    };
    advices.value = advicesResponse;
  } catch (err) {
    error.value = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
    console.error('Error fetching disease details:', err);
  } finally {
    isLoading.value = false;
  }
};

const nextImage = () => {
  if (disease.value && currentImageIndex.value < disease.value.images.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (disease.value && currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const handleSuggestAdvice = () => {
  router.push({
    path: '/disease/create-advice',
    query: { disease_id: route.params.id }
  });
};

onMounted(() => {
  const user = authService.getCurrentUser();
  isLoggedIn.value = !!user;
  currentUser.value = user;
  fetchDiseaseDetail();
});
</script>

<template>
  <div class="disease-detail">
    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchDiseaseDetail" class="retry-button">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <!-- Disease Detail Content -->
    <div v-else-if="disease" class="disease-content">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-gallery">
          <div class="main-image">
            <img 
              v-if="disease?.images?.length > 0"
              :src="disease.images[currentImageIndex]?.url" 
              :alt="disease.name"
            >
            <div v-else class="no-image">
              <i class="fas fa-image"></i>
              <p>Không có hình ảnh</p>
            </div>
            <button 
              v-if="disease?.images?.length > 1"
              class="nav-button prev" 
              @click="prevImage"
              :disabled="currentImageIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              v-if="disease?.images?.length > 1"
              class="nav-button next" 
              @click="nextImage"
              :disabled="currentImageIndex === disease.images.length - 1"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="thumbnail-list" v-if="disease?.images?.length > 1">
            <div 
              v-for="(image, index) in disease.images" 
              :key="image.picture_id"
              class="thumbnail"
              :class="{ active: currentImageIndex === index }"
              @click="currentImageIndex = index"
            >
              <img :src="image.url" :alt="`${disease.name} - ảnh ${index + 1}`">
            </div>
          </div>
        </div>
        <div class="hero-content">
          <h1>{{ disease.name }}</h1>
          <p class="description">{{ disease.description }}</p>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="main-content-grid">
        <!-- Disease Information Column -->
        <div class="disease-info-column">
          <!-- Symptoms Section -->
          <section class="section symptoms-section">
            <h2><i class="fas fa-exclamation-circle"></i> Triệu chứng</h2>
            <ul class="symptoms-list">
              <li v-for="symptom in disease.symptoms.split(',')" :key="symptom">
                {{ symptom.trim() }}
              </li>
            </ul>
          </section>

          <!-- Last Updated Section -->
          <section class="section update-section">
            <h2><i class="fas fa-clock"></i> Thông tin cập nhật</h2>
            <div class="update-content">
              <p><strong>Ngày tạo:</strong> {{ new Date(disease.created_at).toLocaleDateString('vi-VN') }}</p>
              <p><strong>Lần cập nhật cuối:</strong> {{ new Date(disease.updated_at).toLocaleDateString('vi-VN') }}</p>
            </div>
          </section>

          <!-- Treatment Section -->
          <section class="section treatment-section">
            <h2><i class="fas fa-clipboard-list"></i> Hướng dẫn điều trị</h2>
            <div class="treatment-content">
              {{ disease.instructions }}
            </div>
          </section>

          <!-- Medicinal Plants Section -->
          <section class="section plants-section">
            <h2><i class="fas fa-leaf"></i> Cây thuốc điều trị</h2>
            <div class="plants-grid">
              <div class="plant-info">
                <div v-for="advice in advices" :key="advice.plant.plant_id" class="plant-card"> 
                  <router-link :to="`/plant/${advice.plant.plant_id}`"> {{ advice.plant.name }}</router-link>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Advice Comments Column -->
        <div class="advice-column">
          <section class="section comments-section">
            <div class="section-header">
              <h2><i class="fas fa-comments"></i> Lời khuyên từ chuyên gia</h2>
              <button 
                v-if="isLoggedIn" 
                @click="handleSuggestAdvice" 
                class="suggest-button"
              >
                <i class="fas fa-lightbulb"></i> Đề xuất lời khuyên
              </button>
            </div>
            
            <div v-if="advices.length === 0" class="no-advice">
              <p>Chưa có lời khuyên nào cho bệnh này.</p>
            </div>
            <div v-else class="advice-list">
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
                  <div class="plant-info">
                    <i class="fas fa-leaf"></i>
                    <router-link :to="`/plant/${advice.plant.plant_id}`">
                      {{ advice.plant.name }}
                    </router-link>
                  </div>
                  
                  <div class="user-info">
                    <i class="fas fa-user-md"></i>
                    <router-link :to="`/profile/${advice.user.user_id}`">
                      <span class="user-name">{{ advice.user.full_name }}</span>
                    </router-link>
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
.disease-detail {
  padding-top: 60px;
}

/* Loading and Error States */
.loading-state,
.error-state {
  text-align: center;
  padding: 4rem 2rem;
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

.error-state i {
  color: #dc3545;
}

.retry-button {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.retry-button:hover {
  background: #006c46;
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 400px;
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
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  z-index: 2;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-content .description {
  font-size: 1.2rem;
  opacity: 0.9;
}

/* Main Content Grid */
.main-content-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
}

.disease-info-column {
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

/* Symptoms Section */
.symptoms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.8rem;
  list-style: none;
  padding: 0;
}

.symptoms-list li {
  background: #f8f9fa;
  padding: 0.5rem 1rem;
  border-radius: 20px;
  font-size: 1rem;
  color: #666;
  border: 1px solid #e0e0e0;
}

/* Treatment Section */
.treatment-content {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #008053;
  line-height: 1.6;
}

/* Plants Section */
.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
}

.plant-card {
  background: white;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.plant-card:hover {
  transform: translateY(-5px);
}

.plant-image {
  height: 200px;
  overflow: hidden;
}

.plant-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plant-info {
  padding: 1.5rem;
}

.plant-info h3 {
  margin: 0 0 0.5rem;
  color: #2c3e50;
}

.english-name {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
  display: block;
}

.view-plant {
  display: inline-block;
  padding: 0.5rem 1rem;
  background: #008053;
  color: white;
  text-decoration: none;
  border-radius: 4px;
  transition: background 0.3s ease;
}

.view-plant:hover {
  background: #006c46;
}

/* Comments Section */
.comments-section {
  margin-top: 0;
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid #f0f0f0;
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
}

.section-header h2 i {
  color: #008053;
  margin-right: 0.5rem;
}

.no-advice {
  text-align: center;
  padding: 2rem;
  color: #666;
  background: #f8f9fa;
  border-radius: 8px;
}

.no-advice p {
  margin: 0;
  font-size: 1.1rem;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.advice-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s, box-shadow 0.2s;
}

.advice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
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
  color: #444;
}

.advice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
  font-size: 0.9rem;
}

.plant-info, .user-info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.plant-info a, .user-info a {
  color: #008053;
  text-decoration: none;
}

.plant-info a:hover, .user-info a:hover {
  text-decoration: underline;
}

.plant-info i {
  color: #67C23A;
}

.user-info i {
  color: #409EFF;
}

.user-name {
  font-weight: 500;
}

.user-title {
  color: #666;
}

.suggest-button {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.suggest-button:hover {
  background: #006c46;
  transform: translateY(-2px);
}

.suggest-button i {
  font-size: 1.1rem;
}

/* Update Section */
.update-section {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  border-left: 4px solid #008053;
}

.update-content {
  color: #666;
  line-height: 1.6;
}

.update-content p {
  margin: 0.5rem 0;
}

.update-content strong {
  color: #2c3e50;
  margin-right: 0.5rem;
}

@media (max-width: 1024px) {
  .main-content-grid {
    grid-template-columns: 1fr;
    gap: 2rem;
  }

  .advice-column {
    position: static;
    max-height: none;
  }
}

@media (max-width: 768px) {
  .main-content-grid {
    padding: 0 1rem;
  }
  
  .hero-section {
    height: 300px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .plants-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
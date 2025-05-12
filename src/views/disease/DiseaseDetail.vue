<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { diseasesService } from '../../services/diseases.service';
import { adviceService } from '../../services/advice.service';
import { authService } from '../../services/auth.service';
import type { Diseases } from '../../models/Diseases';
import type { Advice } from '../../models/Advice';;

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

const handleEditAdvice = (adviceId: number) => {
  router.push({
    path: `/profile/advice/${adviceId}/edit`,
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
  <div class="plant-detail-container">
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin bệnh...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchDiseaseDetail" class="retry-button">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="disease" class="plant-detail">
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
          <p class="update-date">Cập nhật: {{ new Date(disease.updated_at).toLocaleDateString('vi-VN') }}</p>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="main-content-grid">
        <!-- Disease Information Column -->
        <div class="info-column">
          <section class="info-section">
            <h2><i class="fas fa-disease"></i> Thông tin bệnh</h2>
            <div class="content-box">
              <h3>Mô tả</h3>
              <p class="formatted-text">{{ disease.description }}</p>

              <div v-if="disease.images.length > 1" class="content-image">
                <img :src="disease.images[1].url" :alt="`${disease.name} - ảnh 2`">
              </div>

              <h3>Triệu chứng</h3>
              <div class="symptoms-list">
                <div v-for="symptom in disease.symptoms.split(',')" :key="symptom" class="symptom-item">
                  <i class="fas fa-exclamation-circle"></i>
                  <span>{{ symptom.trim() }}</span>
                </div>
              </div>

              <div v-if="disease.images.length > 2" class="content-image">
                <img :src="disease.images[2].url" :alt="`${disease.name} - ảnh 3`">
              </div>

              <h3>Hướng dẫn điều trị</h3>
              <p class="formatted-text">{{ disease.instructions }}</p>

              <div v-if="disease.images.length > 3" class="content-image">
                <img :src="disease.images[3].url" :alt="`${disease.name} - ảnh 4`">
              </div>

              <h3 v-if="advices.some(advice => advice.plant)">Cây thuốc có thể điều trị</h3>
              <div v-if="advices.some(advice => advice.plant)" class="plant-list">
                <div v-for="advice in advices.filter(advice => advice.plant)" :key="advice.plant.plant_id" class="plant-item">
                  <i class="fas fa-seedling"></i>
                  <router-link :to="`/plant/${advice.plant.plant_id}`" class="plant-link">
                    {{ advice.plant.name }}
                  </router-link>
                </div>
              </div>

              <div class="metadata">
                <div class="metadata-item">
                  <span class="label">Ngày tạo:</span>
                  <span class="value">{{ new Date(disease.created_at).toLocaleDateString('vi-VN') }}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Cập nhật lần cuối:</span>
                  <span class="value">{{ new Date(disease.updated_at).toLocaleDateString('vi-VN') }}</span>
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
              <button 
                v-if="isLoggedIn" 
                @click="handleSuggestAdvice" 
                class="create-advice-btn"
              >
                <i class="fas fa-plus"></i>
                Đề xuất lời khuyên
              </button>
            </div>
            <div v-if="advices.length === 0" class="empty-advice">
              <i class="fas fa-comment-slash"></i>
              <p>Chưa có lời khuyên nào cho bệnh này</p>
            </div>
            <div v-else class="advice-list">
              <div v-for="advice in advices" :key="advice.advice_id" class="advice-card">
                <div class="advice-header">
                  <h3>{{ advice.title }}</h3>
                  <div class="advice-meta">
                    <i class="fas fa-calendar"></i>
                    <span>{{ new Date(advice.created_at).toLocaleDateString('vi-VN') }}</span>
                    <button 
                      v-if="currentUser && advice.user && currentUser.id === advice.user.user_id"
                      @click="handleEditAdvice(advice.advice_id)"
                      class="edit-btn"
                    >
                      <i class="fas fa-edit"></i>
                      Chỉnh sửa
                    </button>
                  </div>
                </div>
                
                <div class="advice-content">
                  <p>{{ advice.content }}</p>
                </div>

                <div class="advice-footer">
                  <div class="expert-info">
                    <div class="expert-details">
                      <img 
                        v-if="advice.user"
                        :src="advice.user.avatar || 'https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y'" 
                        :alt="advice.user.full_name"
                        class="expert-avatar"
                      >
                      <img 
                        v-else
                        src="https://www.gravatar.com/avatar/00000000000000000000000000000000?d=mp&f=y"
                        alt="Default Avatar"
                        class="expert-avatar"
                      >
                      <div class="expert-info-text">
                        <router-link v-if="advice.user" :to="`/profile/${advice.user.user_id}`">
                          <span class="name">{{ advice.user.full_name }}</span>
                        </router-link>
                        <span v-if="advice.user" class="title">{{ advice.user.title }}</span>
                        <span v-else class="title">Người dùng</span>
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

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #666;
  background: #f8f9fa;
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #008053;
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

.hero-content .update-date {
  font-size: 1.2rem;
  opacity: 0.9;
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

.info-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.info-section h2 {
  color: #008053;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.content-box {
  background: white;
  color: #2c3e50;
  padding: 1rem;
  border-radius: 8px;
}

.content-box h3 {
  color: #008053;
  margin: 1.5rem 0 1rem;
  font-size: 1.2rem;
}

.content-box h3:first-child {
  margin-top: 0;
}

.formatted-text {
  white-space: pre-line;
  line-height: 1.8;
  text-align: justify;
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

/* Metadata */
.metadata {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666;
}

.metadata-item .label {
  font-weight: 500;
  color: #2c3e50;
}

/* Symptoms List */
.symptoms-list {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.symptom-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.symptom-item:hover {
  background: #e0efe8;
  transform: translateX(5px);
}

.symptom-item i {
  color: #008053;
  font-size: 1.1rem;
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
  color: #008053;
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
  display: flex;
  align-items: center;
  gap: 1rem;
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

.expert-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

/* Plant List Styles */
.plant-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.plant-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.plant-item:hover {
  background: #e0efe8;
  transform: translateX(5px);
}

.plant-item i {
  color: #008053;
  font-size: 1.1rem;
}

.plant-link {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  flex: 1;
}

.plant-link:hover {
  text-decoration: underline;
}
</style> 
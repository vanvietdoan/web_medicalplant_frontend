<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { diseasesService } from '../../services/diseases.service';
import type { Diseases } from '../../models/Diseases';

const route = useRoute();
const disease = ref<Diseases | null>(null);
const isLoading = ref(true);
const error = ref<string | null>(null);

const fetchDiseaseDetail = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const diseaseId = Number(route.params.id);
    const response = await diseasesService.getDiseaseById(diseaseId);
    disease.value = response;
  } catch (err) {
    error.value = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
    console.error('Error fetching disease details:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
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
        <div class="hero-image">
          <img src="/images/diseases/dau-dau-set-danh-1722590273321485717321.webp" :alt="disease.name">
        </div>
        <div class="hero-content">
          <h1>{{ disease.name }}</h1>
          <p class="description">{{ disease.description }}</p>
        </div>
      </section>

      <!-- Main Content -->
      <div class="main-content">
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
            <div v-for="plant in disease.medicinal_plants" :key="plant.plant_id" class="plant-card">
              <div class="plant-image">
                <img :src="plant.image" :alt="plant.name">
              </div>
              <div class="plant-info">
                <h3>{{ plant.name }}</h3>
                <p class="english-name">{{ plant.english_name }}</p>
                <router-link :to="`/plants/${plant.plant_id}`" class="view-plant">
                  Xem chi tiết
                </router-link>
              </div>
            </div>
          </div>
        </section>

        <!-- Advice Comments Section -->
        <section v-if="disease?.advice_comments?.length > 0" class="section comments-section">
          <h2><i class="fas fa-comments"></i> Tư vấn từ chuyên gia</h2>
          <div class="comments-list">
            <div v-for="comment in disease.advice_comments" :key="comment.advice_id" class="comment-card">
              <div class="comment-header">
                <div class="user-info">
                  <img :src="comment.user.avatar" :alt="comment.user.full_name" class="user-avatar">
                  <div>
                    <h4>{{ comment.user.full_name }}</h4>
                    <p class="user-title">{{ comment.user.title }}</p>
                  </div>
                </div>
                <span class="comment-time">{{ comment.time }}</span>
              </div>
              <h3 class="comment-title">{{ comment.title }}</h3>
              <p class="comment-content">{{ comment.content }}</p>
            </div>
          </div>
        </section>
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

.hero-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1;
}

.hero-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
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

/* Main Content */
.main-content {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

.section {
  margin-bottom: 3rem;
}

.section h2 {
  color: #008053;
  font-size: 1.8rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.section h2 i {
  font-size: 1.5rem;
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
.comments-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.comment-card {
  background: white;
  border-radius: 10px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
}

.user-info h4 {
  margin: 0;
  color: #2c3e50;
}

.user-title {
  color: #666;
  font-size: 0.9rem;
  margin: 0;
}

.comment-time {
  color: #666;
  font-size: 0.9rem;
}

.comment-title {
  color: #2c3e50;
  margin: 0 0 1rem;
  font-size: 1.2rem;
}

.comment-content {
  color: #666;
  line-height: 1.6;
  margin: 0;
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

@media (max-width: 768px) {
  .hero-section {
    height: 300px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .main-content {
    padding: 0 1rem;
  }

  .plants-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';
import { plantService } from '../services/plant.service';
import type { Plant } from '../models/Plant';
import { adviceService } from '../services/advice.service';
import { userService } from '../services/user.service';
import type { User } from '../models/User';
import type { UserAdviceCount } from '../models/Advice';

// Hero Slider
const currentSlide = ref(0);
const listUserMostAdvice = ref<UserAdviceCount[]>([]);
const userDetails = ref<User[]>([]);
const slides = ref([
  {
    title: 'Khám Phá Thế Giới Cây Thuốc Việt Nam',
    description: 'Tìm hiểu về các loại cây thuốc quý hiếm và công dụng của chúng',
    image: '/images/slide/1.webp'
  },
  {
    title: 'Cây Thuốc Quý Hiếm',
    description: 'Những loại cây thuốc có giá trị dược liệu cao và đang có nguy cơ tuyệt chủng',
    image: '/images/slide/2.webp'
  },
  {
    title: 'Y Học Cổ Truyền',
    description: 'Khám phá tri thức y học cổ truyền Việt Nam qua các bài thuốc dân gian',
    image: '/images/slide/3.webp'
  },
  {
    title: 'Nghiên Cứu Khoa Học',
    description: 'Những phát hiện mới về công dụng của cây thuốc trong y học hiện đại',
    image: '/images/slide/4.jpg'
  },
  {
    title: 'Bảo Tồn Đa Dạng Sinh Học',
    description: 'Góp phần bảo vệ và phát triển nguồn gen cây thuốc quý hiếm',
    image: '/images/slide/5.jpg'
  },
  {
    title: 'Phát Triển Bền Vững',
    description: 'Kết hợp giữa bảo tồn và phát triển nguồn dược liệu',
    image: '/images/slide/6.jpg'
  }
]);

// Tự động chuyển slide
let slideInterval: number | null = null;

const startSlideInterval = () => {
  slideInterval = window.setInterval(() => {
    nextSlide();
  }, 5000); // Chuyển slide sau mỗi 5 giây
};

const stopSlideInterval = () => {
  if (slideInterval) {
    clearInterval(slideInterval);
    slideInterval = null;
  }
};

const nextSlide = () => {
  console.log('Next slide clicked');
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = () => {
  console.log('Prev slide clicked');
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

// Cây thuốc mới phát hiện
const newPlants = ref<Plant[]>([]);
const loadingNewPlants = ref(true);
const loadingUserMostAdvice = ref(true);
const errorNewPlants = ref<string | null>(null);
const errorUserMostAdvice = ref<string | null>(null);
// Cây có nhiều công dụng
const multiUsePlants = ref<Plant[]>([]);
const loadingMultiUsePlants = ref(true);
const errorMultiUsePlants = ref<string | null>(null);

// Lấy danh sách cây thuốc mới nhất
const fetchNewestPlants = async () => {
  console.log('Fetching newest plants for home page...');
  try {
    loadingNewPlants.value = true;
    errorNewPlants.value = null;
    const allPlants = await plantService.getNewePlants();
    newPlants.value = allPlants.slice(0, 6);
    console.log('Newest plants fetched successfully:', newPlants.value);
  } catch (err) {
    console.error('Error fetching newest plants:', err);
    errorNewPlants.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách cây thuốc mới';
  } finally {
    loadingNewPlants.value = false;
    console.log('Fetch newest plants completed, loading:', loadingNewPlants.value);
  }
};

// Lấy danh sách cây có nhiều công dụng
const fetchMultiUsePlants = async () => {
  console.log('Fetching multi-use plants for home page...');
  try {
    loadingMultiUsePlants.value = true;
    errorMultiUsePlants.value = null;
    const allPlants = await plantService.getMultiUsePlants();
    multiUsePlants.value = allPlants.slice(0, 6);
    console.log('Multi-use plants fetched successfully:', multiUsePlants.value);
  } catch (err) {
    console.error('Error fetching multi-use plants:', err);
    errorMultiUsePlants.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách cây có nhiều công dụng';
  } finally {
    loadingMultiUsePlants.value = false;
    console.log('Fetch multi-use plants completed, loading:', loadingMultiUsePlants.value);
  }
};

// Format ngày tháng
const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

const fetchListUserIDMostAdvice = async () => {
  try {
    loadingUserMostAdvice.value = true;
    errorUserMostAdvice.value = null;
    const response = await adviceService.getListUsetIDMostAdvice();
    listUserMostAdvice.value = (response as unknown) as UserAdviceCount[];
    
    // Fetch user details for each expert
    const userPromises = listUserMostAdvice.value.map(async (userAdvice) => {
      try {
        const user = await userService.getUserById(userAdvice.user_id);
        return user;
      } catch (error) {
        console.error(`Error fetching user details for ID ${userAdvice.user_id}:`, error);
        return null;
      }
    });
    
    const users = await Promise.all(userPromises);
    userDetails.value = users.filter((user): user is User => user !== null);
  } catch (error) {
    console.error('Error fetching list user ID most advice:', error);
    errorUserMostAdvice.value = 'Có lỗi xảy ra khi tải danh sách chuyên gia';
  } finally {
    loadingUserMostAdvice.value = false;
  }
};

onMounted(() => {
  console.log('Home component mounted');
  fetchNewestPlants();
  fetchMultiUsePlants();
  fetchListUserIDMostAdvice();
  startSlideInterval();
});

onBeforeUnmount(() => {
  stopSlideInterval();
});
</script>

<template>
  <div class="home">
    <!-- Hero Slider -->
    <section class="hero-slider">
      <div class="slider-container">
        <div class="slides" :style="{ transform: `translateX(-${currentSlide * 100}%)` }">
          <div v-for="slide in slides" :key="slide.title" class="slide">
            <img :src="slide.image" :alt="slide.title">
            <div class="slide-content">
              <h2>{{ slide.title }}</h2>
              <p>{{ slide.description }}</p>
            </div>
          </div>
        </div>
        <button class="slider-btn prev" @click="prevSlide">❮</button>
        <button class="slider-btn next" @click="nextSlide">❯</button>
      </div>
    </section>

    <div class="content-container">
      <!-- Cây thuốc mới phát hiện -->
      <section class="new-plants">
        <div class="section-header">
          <h2>Cây Thuốc Mới Cập Nhật</h2>
          <router-link to="/plant/newest" class="view-all">Xem tất cả</router-link>
        </div>
        
        <div v-if="loadingNewPlants" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách cây thuốc mới...</p>
        </div>
        
        <div v-else-if="errorNewPlants" class="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorNewPlants }}</p>
          <button @click="fetchNewestPlants" class="retry-btn">
            <i class="fas fa-redo"></i> Thử lại
          </button>
        </div>
        
        <div v-else class="plants-grid">
          <div v-for="plant in newPlants" :key="plant.plant_id" class="plant-card">
            <div class="card-content">
              <h3>{{ plant.name }}</h3>
              <img 
                v-if="plant.images && plant.images.length > 0"
                :src="plant.images[0].url" 
                :alt="plant.name" 
                class="plant-image"
              >
              <div v-else class="no-image">
                <i class="fas fa-image"></i>
                <p>Không có hình ảnh</p>
              </div>
              <p class="english-name">{{ plant.english_name }}</p>
              <p class="description">{{ plant.description }}</p>
              <div class="discovery-date">
                <p>Cập nhật: {{ formatDate(plant.updated_at) }}</p>
              </div>
              <router-link :to="`/plant/${plant.plant_id}`" class="view-details">
                Xem chi tiết
              </router-link>
            </div>
          </div>
        </div>
      </section>

      <!-- Cây có nhiều công dụng -->
      <section class="multi-use-plants">
        <div class="section-header">
          <h2>Cây Thuốc Đa Công Dụng</h2>
          <router-link to="/plant/multiUse" class="view-all">Xem tất cả</router-link>
        </div>
        
        <div v-if="loadingMultiUsePlants" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách cây đa công dụng...</p>
        </div>
        
        <div v-else-if="errorMultiUsePlants" class="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorMultiUsePlants }}</p>
          <button @click="fetchMultiUsePlants" class="retry-btn">
            <i class="fas fa-redo"></i> Thử lại
          </button>
        </div>
        
        <div v-else class="plants-grid">
          <div v-for="plant in multiUsePlants" :key="plant.plant_id" class="plant-card">
            <div class="card-content">
              <h3>{{ plant.name }}</h3>
              <img 
                v-if="plant.images && plant.images.length > 0"
                :src="plant.images[0].url" 
                :alt="plant.name" 
                class="plant-image"
              >
              <div v-else class="no-image">
                <i class="fas fa-image"></i>
                <p>Không có hình ảnh</p>
              </div>
              <p class="english-name">{{ plant.english_name }}</p>
              <p class="description">{{ plant.description }}</p>
             
              <router-link :to="`/plant/${plant.plant_id}`" class="view-details">
                Xem chi tiết
              </router-link>
            </div>
          </div>
        </div>
      </section>
      <section class="user-most-advice">
        <div class="section-header">
          <h2>Chuyên Gia Có Nhiều Đóng Góp</h2>
        </div>
        <div v-if="loadingUserMostAdvice" class="loading">
          <i class="fas fa-spinner fa-spin"></i>
          <p>Đang tải danh sách chuyên gia...</p>
        </div>
        <div v-else-if="errorUserMostAdvice" class="error">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ errorUserMostAdvice }}</p>
          <button @click="fetchListUserIDMostAdvice" class="retry-btn">
            <i class="fas fa-redo"></i> Thử lại
          </button>
        </div>
        <div v-else class="user-list">
          <router-link 
            v-for="(user, index) in userDetails" 
            :key="user.user_id" 
            :to="`/profile/${user.user_id}`"
            class="user-card"
          >
            <img 
              :src="user.avatar || '/images/avatar.webp'" 
              :alt="user.full_name" 
              class="user-avatar"
              @error="(e) => (e.target as HTMLImageElement).src = '/images/avatar.webp'"
            >
            <div class="user-info">
              <h3>{{ user.full_name }}</h3>
              <p class="title">{{ user.title }}</p>
              <p class="advice-count">
                <i class="fas fa-comment-medical"></i>
                {{ listUserMostAdvice[index].total_advice }} lời khuyên
              </p>
            </div>
          </router-link>
        </div>
      </section>
      <section class="user-most-advice"></section>

      
    </div>
  </div>
</template>

<style scoped>
.home {
  padding-top: 60px;
}

/* Hero Slider */
.hero-slider {
  position: relative;
  height: 600px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.slider-container {
  position: relative;
  height: 100%;
}

.slides {
  display: flex;
  height: 100%;
  transition: transform 0.5s ease-in-out;
}

.slide {
  min-width: 100%;
  position: relative;
}

.slide img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.slide-content {
  position: absolute;
  bottom: 20%;
  left: 10%;
  color: white;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
  max-width: 600px;
}

.slide-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
  line-height: 1.2;
}

.slide-content p {
  font-size: 1.2rem;
  line-height: 1.5;
}

.slider-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 1rem;
  border: none;
  cursor: pointer;
  font-size: 1.5rem;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  z-index: 10;
}

.slider-btn:hover {
  background: rgba(0, 0, 0, 0.7);
  transform: translateY(-50%) scale(1.1);
}

.slider-btn.prev {
  left: 1rem;
}

.slider-btn.next {
  right: 1rem;
}

/* Content Container */
.content-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
}

/* Section Styles */
section {
  margin-bottom: 4rem;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  color: #008053;
  font-size: 2rem;
  position: relative;
  padding-bottom: 0.5rem;
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: 0;
  left: 0;
  width: 60px;
  height: 3px;
  background-color: #008053;
}

.view-all {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.view-all:hover {
  color: #006040;
  transform: translateX(5px);
}

.loading, .error {
  text-align: center;
  padding: 3rem 2rem;
  color: #666;
  background-color: #f8f9fa;
  border-radius: 8px;
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
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.plant-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.plant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.card-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.card-content h3 {
  color: #008053;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.english-name {
  color: #666;
  font-style: italic;
  margin-bottom: 1rem;
  font-size: 0.9rem;
}

.description {
  color: #333;
  line-height: 1.5;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.discovery-date, .benefits-count {
  margin-bottom: 1rem;
  font-size: 0.9rem;
  color: #666;
}

.benefits-count {
  color: #008053;
  font-weight: 500;
}

.view-details {
  display: inline-block;
  background-color: #f8f9fa;
  color: #008053;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s ease;
  text-align: center;
  margin-top: auto;
}

.view-details:hover {
  background-color: #e9ecef;
  transform: translateY(-2px);
}

.multi-use-plants {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 2rem;
}

.plant-image {
  width: 100%;
  height: 250px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.no-image {
  width: 100%;
  height: 250px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f8f9fa;
  color: #666;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.no-image i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
  color: #008053;
}

.no-image p {
  font-size: 0.9rem;
  margin: 0;
}

@media (max-width: 768px) {
  .hero-slider {
    height: 400px;
  }

  .slide-content h2 {
    font-size: 2rem;
  }

  .slide-content p {
    font-size: 1rem;
  }

  .content-container {
    padding: 0 1rem;
  }

  .plants-grid {
    grid-template-columns: 1fr;
  }

  .section-header h2 {
    font-size: 1.5rem;
  }
}

.user-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.user-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 1.5rem;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.user-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.user-avatar {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 1rem;
  border: 3px solid #008053;
}

.user-info {
  text-align: center;
}

.user-info h3 {
  color: #008053;
  margin-bottom: 0.5rem;
  font-size: 1.25rem;
}

.user-info .title {
  color: #666;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.advice-count {
  color: #008053;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.advice-count i {
  color: #42b883;
}

.experts-section {
  margin: 4rem 0;
  padding: 2rem;
  background: #f8f9fa;
  border-radius: 12px;
}

.experts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
}

.expert-card {
  background: white;
  border-radius: 8px;
  padding: 1.5rem;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.expert-card:hover {
  transform: translateY(-5px);
}

.expert-content {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.expert-avatar {
  font-size: 2.5rem;
  color: #008053;
}

.expert-info h3 {
  margin: 0;
  color: #2c3e50;
  font-size: 1.1rem;
}

.expert-contribution {
  margin: 0.5rem 0 0;
  color: #666;
  font-size: 0.9rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.expert-contribution i {
  color: #FFD700;
}

@media (max-width: 768px) {
  .experts-grid {
    grid-template-columns: 1fr;
  }
}
</style>
<script setup lang="ts">
import { ref, onMounted } from 'vue';
//import { useRoute } from 'vue-router';

//const route = useRoute();
const currentImageIndex = ref(0);

interface MedicinalPlant {
  plant_id: number;
  name: string;
  english_name: string;
  description: string;
  time: string;
  benefits: string;
  instructions: string;
  pictures: string[];
  species: {
    name: string;
    genus: {
      name: string;
      family: {
        name: string;
        order: {
          name: string;
          class: {
            name: string;
            division: {
              name: string;
            }
          }
        }
      }
    }
  }
}

const plant = ref<MedicinalPlant | null>(null);

// Mocked data for demonstration
onMounted(() => {
  // Simulate API call
  plant.value = {
    plant_id: 1,
    name: 'Sâm Ngọc Linh',
    english_name: 'Vietnamese Ginseng',
    description: 'Sâm Ngọc Linh là loại dược liệu quý hiếm của Việt Nam, được mệnh danh là "Quốc bảo". Cây có nguồn gốc từ vùng núi Ngọc Linh, tỉnh Kon Tum và Quảng Nam. Đây là một trong những loại sâm quý hiếm nhất thế giới, có giá trị dược liệu cao và được sử dụng rộng rãi trong y học cổ truyền.',
    time: 'Thu hoạch sau 5-7 năm trồng',
    benefits: 'Tăng cường sức đề kháng, chống mệt mỏi, bồi bổ cơ thể, tăng cường trí nhớ, chống lão hóa, hỗ trợ điều trị bệnh tiểu đường, huyết áp cao và các bệnh về tim mạch.',
    instructions: 'Có thể sử dụng dưới dạng cao, rượu hoặc bột. Liều lượng khuyến nghị: 3-6g/ngày. Có thể ngâm với mật ong hoặc sắc nước uống.',
    pictures: [
      '/images/sam-ngoc-linh-va-cau-hoi-thuong-gap-01.jpg.webp',
      '/images/sam-ngoc-linh-viet-nam.jpg',
      '/images/sam-ngoc-linh.jpg'
    ],
    species: {
      name: 'Panax vietnamensis',
      genus: {
        name: 'Panax',
        family: {
          name: 'Araliaceae',
          order: {
            name: 'Apiales',
            class: {
              name: 'Magnoliopsida',
              division: {
                name: 'Magnoliophyta'
              }
            }
          }
        }
      }
    }
  };
});

const nextImage = () => {
  if (plant.value && plant.value.pictures) {
    currentImageIndex.value = (currentImageIndex.value + 1) % plant.value.pictures.length;
  }
};

const prevImage = () => {
  if (plant.value && plant.value.pictures) {
    currentImageIndex.value = (currentImageIndex.value - 1 + plant.value.pictures.length) % plant.value.pictures.length;
  }
};
</script>

<template>
  <div class="plant-detail">
    <div v-if="plant" class="detail-container">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-content">
          <h1>{{ plant.name }}</h1>
          <p class="scientific-name">{{ plant.species.name }}</p>
          <p class="english-name">{{ plant.english_name }}</p>
        </div>
      </section>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Image Gallery -->
        <section class="image-gallery">
          <div class="gallery-main">
            <img :src="plant.pictures[currentImageIndex]" :alt="plant.name">
            <button class="gallery-btn prev" @click="prevImage">❮</button>
            <button class="gallery-btn next" @click="nextImage">❯</button>
          </div>
          <div class="gallery-thumbs">
            <div v-for="(pic, index) in plant.pictures" 
                 :key="index" 
                 class="thumb"
                 :class="{ active: index === currentImageIndex }"
                 @click="currentImageIndex = index">
              <img :src="pic" :alt="`${plant.name} - Hình ${index + 1}`">
            </div>
          </div>
          <div class="info-section">
            <h2>Cây cùng loài</h2>
            <router-link :to="`/medicinal-plants`" class="view-details">
              <li>Cây A</li>
              <li>Cây B</li>
              <li>Cây C</li>
            </router-link>
          </div>
        </section>

        <!-- Plant Information -->
        <section class="plant-info">
          <div class="info-section">
            <h2>Mô tả</h2>
            <p>{{ plant.description }}</p>
          </div>

          <div class="info-section">
            <h2>Phân loại khoa học</h2>
            <div class="taxonomy">
              <p><strong>Ngành:</strong> {{ plant.species.genus.family.order.class.division.name }}</p>
              <p><strong>Lớp:</strong> {{ plant.species.genus.family.order.class.name }}</p>
              <p><strong>Bộ:</strong> {{ plant.species.genus.family.order.name }}</p>
              <p><strong>Họ:</strong> {{ plant.species.genus.family.name }}</p>
              <p><strong>Chi:</strong> {{ plant.species.genus.name }}</p>
              <p><strong>Loài:</strong> {{ plant.species.name }}</p>
            </div>
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
            <h2>Bệnh liên quan</h2>
          </div>

          

          

        </section>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plant-detail {
  padding-top: 60px;
}

.detail-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
}

.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url('/images/sam-ngoc-linh.jpg');
  background-size: cover;
  background-position: center;
  height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  border-radius: 15px;
  margin-bottom: 2rem;
}

.hero-content h1 {
  font-size: 3rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.scientific-name {
  font-style: italic;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.english-name {
  font-size: 1.2rem;
  opacity: 0.9;
}

.main-content {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2rem;
}

.image-gallery {
  position: sticky;
  top: 80px;
}

.gallery-main {
  position: relative;
  height: 400px;
  border-radius: 15px;
  overflow: hidden;
  margin-bottom: 1rem;
}

.gallery-main img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border: none;
  padding: 1rem;
  cursor: pointer;
  font-size: 1.5rem;
  border-radius: 50%;
  width: 50px;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.gallery-btn:hover {
  background: rgba(0, 0, 0, 0.7);
}

.gallery-btn.prev {
  left: 1rem;
}

.gallery-btn.next {
  right: 1rem;
}

.gallery-thumbs {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding: 0.5rem 0;
}

.thumb {
  width: 100px;
  height: 100px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  opacity: 0.7;
  transition: all 0.3s ease;
}

.thumb.active {
  opacity: 1;
  border: 2px solid #008053;
}

.thumb img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.plant-info {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.info-section {
  margin-bottom: 2rem;
}

.info-section h2 {
  color: #2c3e50;
  font-size: 1.8rem;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #008053;
}

.info-section p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 1rem;
}

.taxonomy {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.taxonomy p {
  margin: 0.5rem 0;
}

.taxonomy strong {
  color: #008053;
}

@media (max-width: 768px) {
  .main-content {
    grid-template-columns: 1fr;
  }

  .image-gallery {
    position: static;
  }

  .hero-section {
    height: 300px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .scientific-name {
    font-size: 1.2rem;
  }

  .english-name {
    font-size: 1rem;
  }
}
</style> 
<script setup lang="ts">
import { ref, onMounted } from 'vue';

interface Disease {
  disease_id: number;
  name: string;
  symptoms: string;
  instructions: string;
  pictures: {
    name: string;
    picture: string;
  }[];
  medicinal_plants: {
    plant_id: number;
    name: string;
    english_name: string;
    image: string;
    description: string;
    usage: string;
  }[];
  advice_comments: {
    advice_id: number;
    title: string;
    time: string;
    content: string;
    user: {
      full_name: string;
      title: string;
      avatar: string;
    }
  }[];
}

const disease = ref<Disease | null>(null);

onMounted(() => {
  // Mock data - replace with API call
  disease.value = {
    disease_id: 1,
    name: 'Viêm họng',
    symptoms: 'Đau rát họng, Ho khan, Sốt nhẹ, Khó nuốt, Đau tai',
    instructions: `1. Súc họng với nước muối ấm 3-4 lần/ngày
                  2. Uống nhiều nước ấm
                  3. Nghỉ ngơi hợp lý
                  4. Tránh nói nhiều
                  5. Giữ ấm cổ họng`,
    pictures: [
      {
        name: 'Triệu chứng viêm họng',
        picture: '/images/diseases/viem-hong.jpg'
      },
      {
        name: 'Cách điều trị',
        picture: '/images/diseases/viem-hong.jpg'
      }
    ],
    medicinal_plants: [
      {
        plant_id: 1,
        name: 'Gừng',
        english_name: 'Ginger',
        image: '/images/plants/ginger.jpg',
        description: 'Thảo dược có tính ấm, kháng viêm, giảm đau',
        usage: 'Ngậm lát gừng tươi hoặc uống trà gừng ấm'
      },
      {
        plant_id: 2,
        name: 'Chanh',
        english_name: 'Lemon',
        image: '/images/plants/lemon.jpg',
        description: 'Giàu vitamin C, kháng khuẩn, tăng sức đề kháng',
        usage: 'Pha nước chanh mật ong ấm để uống'
      }
    ],
    advice_comments: [
      {
        advice_id: 1,
        title: 'Phương pháp điều trị tại nhà',
        time: '2024-03-18',
        content: 'Kết hợp các bài thuốc dân gian với nghỉ ngơi hợp lý sẽ giúp cải thiện nhanh chóng. Nên uống nhiều nước ấm và tránh ăn đồ lạnh.',
        user: {
          full_name: 'Bs. Nguyễn Văn A',
          title: 'Bác sĩ Y học cổ truyền',
          avatar: '/images/avatars/doctor-1.jpg'
        }
      },
      {
        advice_id: 2,
        title: 'Lưu ý khi điều trị',
        time: '2024-03-17',
        content: 'Nếu triệu chứng kéo dài quá 5 ngày hoặc sốt cao, nên đến bệnh viện để được thăm khám kỹ hơn.',
        user: {
          full_name: 'Bs. Trần Thị B',
          title: 'Chuyên gia Tai Mũi Họng',
          avatar: '/images/avatars/doctor-2.jpg'
        }
      }
    ]
  };
});
</script>

<template>
  <div class="disease-detail">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>{{ disease?.name }}</h1>
        <p>Tìm hiểu chi tiết về bệnh và cách điều trị theo y học cổ truyền</p>
      </div>
    </section>

    <div class="content-wrapper">
      <!-- Main Content -->
      <div class="main-content">
        <section class="pictures-section" v-if="disease?.pictures.length">
          <h2><i class="fas fa-images"></i> Hình ảnh minh họa</h2>
          <div class="pictures-grid">
            <div v-for="pic in disease?.pictures" :key="pic.name" class="picture-item">
              <img :src="pic.picture" :alt="pic.name">
            </div>
          </div>
        </section>
        <section class="symptoms-section">
          <h2><i class="fas fa-exclamation-circle"></i> Triệu chứng</h2>
          <div class="symptoms-grid">
            <div v-for="symptom in disease?.symptoms.split(',')" :key="symptom" class="symptom-item">
              {{ symptom.trim() }}
            </div>
          </div>
        </section>

        <!-- Treatment Section -->
        <section class="treatment-section">
          <h2><i class="fas fa-hand-holding-medical"></i> Hướng dẫn điều trị</h2>
          <div class="instructions">
            <p v-for="(instruction, index) in disease?.instructions.split('\n')" :key="index">
              {{ instruction }}
            </p>
          </div>
        </section>

        <!-- Pictures Section -->
        
      </div>

      <!-- Sidebar -->
      <aside class="sidebar">
        <!-- Medicinal Plants -->
        <section class="medicinal-plants">
          <h2><i class="fas fa-leaf"></i> Cây thuốc điều trị</h2>
          <div class="plants-list">
            <div v-for="plant in disease?.medicinal_plants" :key="plant.plant_id" class="plant-item">
              <img :src="plant.image" :alt="plant.name">
              <div class="plant-info">
                <h3>{{ plant.name }}</h3>
                <span class="english-name">{{ plant.english_name }}</span>
               
                <div class="usage">
                  <h4>Cách sử dụng:</h4>
                  <p>{{ plant.usage }}</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <!-- Expert Advice -->
        <section class="expert-advice" v-if="disease?.advice_comments.length">
          <h2><i class="fas fa-user-md"></i> Lời khuyên từ chuyên gia</h2>
          <div class="advice-list">
            <div v-for="advice in disease?.advice_comments" :key="advice.advice_id" class="advice-item">
              <div class="advisor-info">
                <img :src="advice.user.avatar" :alt="advice.user.full_name" class="advisor-avatar">
                <div class="advisor-details">
                  <h3>{{ advice.user.full_name }}</h3>
                  <span class="advisor-title">{{ advice.user.title }}</span>
                </div>
                <span class="advice-date">{{ new Date(advice.time).toLocaleDateString('vi-VN') }}</span>
              </div>
              
              <p class="advice-content">{{ advice.content }}</p>
            </div>
          </div>
        </section>
      </aside>
    </div>
  </div>
</template>

<style scoped>
.disease-detail {
  padding-top: 60px;
}

.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/diseases/infec.jpg');
  background-size: cover;
  background-position: center;
  height: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  color: white;
  margin-bottom: 2rem;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.5);
}

.hero-content p {
  font-size: 1.2rem;
  opacity: 0.9;
}

.content-wrapper {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: 2fr 1fr;
  gap: 2rem;
}

.main-content section,
.sidebar section {
  /* background: white; */
  border-radius: 15px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #008053;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

h2 i {
  font-size: 1.5rem;
}

.symptoms-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.symptom-item {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  border-left: 4px solid #008053;
  transition: all 0.3s ease;
}

.symptom-item:hover {
  transform: translateX(5px);
  background: #e8f5e9;
}

.instructions {
  line-height: 1.8;
}

.instructions p {
  margin-bottom: 0.5rem;
  color: #666;
}

.pictures-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
}

.picture-item {
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  aspect-ratio: 16/9;
}

.picture-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.picture-item:hover img {
  transform: scale(1.05);
}

.picture-caption {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 0.8rem;
  font-size: 0.9rem;
}

.plants-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.plant-item {
  display: flex;
  gap: 1rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.plant-item:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.plant-item img {
  width: 100px;
  height: 100px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #008053;
}

.plant-info {
  flex: 1;
}

.plant-info h3 {
  margin: 0;
  color: #2c3e50;
}

.english-name {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
  display: block;
  margin-bottom: 0.5rem;
}

.description {
  color: #666;
  margin-bottom: 0.5rem;
}

.usage h4 {
  color: #008053;
  margin-bottom: 0.3rem;
}

.usage p {
  color: #666;
  font-size: 0.9rem;
}

.advice-list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.advice-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid #008053;
}

.advisor-info {
  display: flex;
  align-items: center;
  margin-bottom: 1rem;
}

.advisor-avatar {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 1rem;
  border: 2px solid #008053;
}

.advisor-details {
  flex: 1;
}

.advisor-details h3 {
  margin: 0;
  color: #2c3e50;
}

.advisor-title {
  color: #666;
  font-size: 0.9rem;
}

.advice-date {
  color: #008053;
  font-size: 0.9rem;
}

.advice-title {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.advice-content {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

@media (max-width: 768px) {
  .content-wrapper {
    grid-template-columns: 1fr;
    padding: 0 1rem;
  }

  .hero-section {
    height: 250px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .symptoms-grid {
    grid-template-columns: 1fr;
  }

  .plant-item {
    flex-direction: column;
    text-align: center;
  }

  .plant-item img {
    margin: 0 auto;
  }
}
</style> 
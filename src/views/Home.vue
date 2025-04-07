<script setup lang="ts">
import { ref, onMounted } from 'vue';

// Slider data
const currentSlide = ref(0);
const slides = ref([
  {
    image: '/images/y-hoc-co-truyen-2-16632834151061539475774-0-79-438-780-crop-1663283429390379746055.webp',
    title: 'Cây Thuốc Mới',
    description: 'Kho tàng tri thức y học dân tộc'
  },
  {
    image: '/images/cay-thuoc-nam-quy-phan-loai-dieu-che-va-cach-su-dung-tri-benh-cho-hieu-qua-cao-15-.4824.jpg', 
    title: 'Cây Thuốc Quý',
    description: 'Khám phá các loại dược liệu quý hiếm'
  },
  {
    image: '/images/cham-soc-suc-khoe-ban-dau-2.jpg.webp',
    title: 'Cây thuốc có nhiều công dụng',
    description: 'Phương pháp điều trị từ thiên nhiên'
  }
]);

// Featured plants data
const featuredPlants = ref([
  {
    id: 1,
    name: 'Sâm Ngọc Linh',
    image: '/images/sam-ngoc-linh.jpg',
    description: 'Loại sâm quý hiếm của Việt Nam, có tác dụng bồi bổ sức khỏe',
    uses: ['Tăng cường sức đề kháng', 'Chống mệt mỏi', 'Bồi bổ cơ thể']
  },
  {
    id: 2,
    name: 'Đinh Lăng',
    image: '/images/dinh-lang.webp',
    description: 'Thảo dược quý giúp tăng cường trí nhớ và sức khỏe',
    uses: ['Tăng cường trí nhớ', 'Giảm stress', 'Bổ não']
  },
  {
    id: 3,
    name: 'Đương Quy',
    image: '/images/duong-quy.jpg',
    description: 'Thảo dược bổ huyết hàng đầu trong y học cổ truyền',
    uses: ['Bổ huyết', 'Điều hòa kinh nguyệt', 'Chống lão hóa']
  },
  {
    id: 4,
    name: 'Đương Quy',
    image: '/images/duong-quy.jpg',
    description: 'Thảo dược bổ huyết hàng đầu trong y học cổ truyền',
    uses: ['Bổ huyết', 'Điều hòa kinh nguyệt', 'Chống lão hóa']
  }
]);

// Slider controls
const nextSlide = () => {
  currentSlide.value = (currentSlide.value + 1) % slides.value.length;
};

const prevSlide = () => {
  currentSlide.value = (currentSlide.value - 1 + slides.value.length) % slides.value.length;
};

// Auto slide
onMounted(() => {
  setInterval(nextSlide, 5000);
});

// Thêm các thành phần mới
const multiUsePlants = ref([
  {
    id: 1,
    name: 'Nghệ Vàng',
    image: '/images/nghe-vang-11-16321238202351748496060.jpg',
    description: 'Thảo dược đa công dụng, từ chống viêm đến làm đẹp',
    uses: ['Chống viêm', 'Hỗ trợ tiêu hóa', 'Làm đẹp da', 'Giảm đau nhức']
  },
  {
    id: 2,
    name: 'Gừng',
    image: '/images/gung.jpg',
    description: 'Thảo dược quen thuộc với nhiều công dụng đa dạng',
    uses: ['Chống cảm lạnh', 'Giảm đau bụng', 'Tăng cường miễn dịch', 'Chống say xe']
  },
  {
    id: 3,
    name: 'Tía Tô',
    image: '/images/anh-duoc-tao-boi-tranmaihuongskds-luc-4722141608379-1699971368392200271762.webp',
    description: 'Thảo dược dân gian với nhiều ứng dụng trong y học',
    uses: ['Trị cảm', 'Giải độc', 'Làm đẹp', 'Hỗ trợ tiêu hóa']
  }
]);

const newPlants = ref([
  {
    id: 1,
    name: 'Nấm Linh Chi Đỏ',
    image: '/images/nam-linh-chi-do.jpg',
    description: 'Loại nấm quý mới được phát hiện tại Việt Nam',
    discoveryDate: '2023'
  },
  {
    id: 2,
    name: 'Sâm Đất',
    image: '/images/sam-dat.png',
    description: 'Loại sâm mới được phát hiện tại vùng núi Tây Bắc',
    discoveryDate: '2023'
  }
]);

const experts = ref([
  {
    id: 1,
    name: 'GS.TS Nguyễn Văn A',
    image: '/images/7-1418377501810.webp',
    contributions: ['Nghiên cứu phát triển Đông trùng hạ thảo', 'Tác giả 50 công trình nghiên cứu'],
    specialization: 'Dược liệu học'
  },
  {
    id: 2,
    name: 'PGS.TS Trần Thị B',
    image: '/images/7-1418377501810.webp',
    contributions: ['Nghiên cứu về cây thuốc quý hiếm', 'Phát triển phương pháp bảo tồn gen'],
    specialization: 'Thực vật học'
  }
]);
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

    <!-- Featured Plants -->
    <section class="featured-plants">
      <div class="section-header">
        <h2>Cây Thuốc Tiêu Biểu</h2>
        <router-link to="/medicinal-plants" class="view-all">Xem tất cả ❯</router-link>
      </div>
      <div class="plants-grid">
        <div v-for="plant in featuredPlants" :key="plant.id" class="plant-card">
          <div class="card-image">
            <img :src="plant.image" :alt="plant.name">
          </div>
          <div class="card-content">
            <h3>{{ plant.name }}</h3>
            <p>{{ plant.description }}</p>
            <div class="uses-list">
              <h4>Công dụng chính:</h4>
              <ul>
                <li v-for="use in plant.uses" :key="use">{{ use }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cây thuốc đa công dụng -->
    <section class="multi-use-plants">
      <div class="section-header">
        <h2>Cây Thuốc Đa Công Dụng</h2>
      </div>
      <div class="plants-grid">
        <div v-for="plant in multiUsePlants" :key="plant.id" class="plant-card">
          <div class="card-image">
            <img :src="plant.image" :alt="plant.name">
          </div>
          <div class="card-content">
            <h3>{{ plant.name }}</h3>
            <p>{{ plant.description }}</p>
            <div class="uses-list">
              <h4>Công dụng đa dạng:</h4>
              <ul>
                <li v-for="use in plant.uses" :key="use">{{ use }}</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Cây thuốc mới phát hiện -->
    <section class="new-plants">
      <div class="section-header">
        <h2>Cây Thuốc Mới Phát Hiện</h2>
      </div>
      <div class="plants-grid">
        <div v-for="plant in newPlants" :key="plant.id" class="plant-card">
          <div class="card-image">
            <img :src="plant.image" :alt="plant.name">
          </div>
          <div class="card-content">
            <h3>{{ plant.name }}</h3>
            <p>{{ plant.description }}</p>
            <div class="discovery-date">
              <p>Phát hiện: {{ plant.discoveryDate }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Chuyên gia đóng góp -->
    <section class="experts">
      <div class="section-header">
        <h2>Chuyên Gia Tiêu Biểu</h2>
      </div>
      <div class="experts-grid">
        <div v-for="expert in experts" :key="expert.id" class="expert-card">
          <div class="expert-image">
            <img :src="expert.image" :alt="expert.name">
          </div>
          <div class="expert-content">
            <h3>{{ expert.name }}</h3>
            <p>{{ expert.specialization }}</p>
            <div class="contributions-list">
              <h4>Đóng góp nổi bật:</h4>
              <ul>
                <li v-for="contribution in expert.contributions" :key="contribution">
                  {{ contribution }}
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
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
}

.slide-content h2 {
  font-size: 3rem;
  margin-bottom: 1rem;
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

/* Section Styles */
section {
  padding: 4rem 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.section-header h2 {
  font-size: 2rem;
  color: #2c3e50;
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
  background: #008053;
  border-radius: 2px;
}

.view-all {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border: 2px solid #008053;
  border-radius: 20px;
  transition: all 0.3s ease;
}

.view-all:hover {
  background: #008053;
  color: white;
}

/* Grid Layouts */
.plants-grid,
.diseases-grid,
.news-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

/* Card Styles */
.plant-card,
.disease-card,
.news-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.plant-card:hover,
.disease-card:hover,
.news-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.card-image {
  height: 250px;
  overflow: hidden;
  position: relative;
}

.card-image::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 50%, rgba(0, 0, 0, 0.5));
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.plant-card:hover .card-image img,
.disease-card:hover .card-image img,
.news-card:hover .card-image img {
  transform: scale(1.1);
}

.card-content {
  padding: 2rem;
}

.card-content h3 {
  color: #2c3e50;
  margin-bottom: 1rem;
  font-size: 1.5rem;
}

.card-content p {
  color: #666;
  margin-bottom: 1.5rem;
  line-height: 1.6;
}

/* Lists */
.uses-list,
.symptoms,
.treatments {
  margin-top: 1.5rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
}

.uses-list h4,
.symptoms h4,
.treatments h4 {
  color: #008053;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

ul {
  list-style: none;
  padding-left: 0;
}

ul li {
  padding: 0.5rem 0;
  color: #666;
  position: relative;
  padding-left: 1.8rem;
  transition: all 0.3s ease;
}

ul li:hover {
  color: #008053;
  transform: translateX(5px);
}

ul li::before {
  content: "•";
  color: #008053;
  position: absolute;
  left: 0;
  font-size: 1.5rem;
  line-height: 1;
}

/* News Specific */
.date {
  color: #008053;
  font-size: 0.9rem;
  font-weight: 500;
  display: block;
  margin-bottom: 0.5rem;
}

/* Responsive Design */
@media (max-width: 768px) {
  .hero-slider {
    height: 400px;
  }

  .slide-content h2 {
    font-size: 2rem;
  }

  section {
    padding: 2rem 1rem;
  }

  .plants-grid,
  .diseases-grid,
  .news-grid {
    grid-template-columns: 1fr;
  }

  .card-image {
    height: 200px;
  }

  .card-content {
    padding: 1.5rem;
  }
}

/* Experts Section */
.experts-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
}

.expert-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.expert-card:hover {
  transform: translateY(-10px);
  box-shadow: 0 15px 30px rgba(0, 0, 0, 0.2);
}

.expert-image {
  height: 200px;
  overflow: hidden;
}

.expert-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.expert-card:hover .expert-image img {
  transform: scale(1.1);
}

.expert-content {
  padding: 2rem;
}

.expert-content h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.expert-content p {
  color: #008053;
  font-weight: 500;
  margin-bottom: 1rem;
}

.contributions-list {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 10px;
}

.contributions-list h4 {
  color: #008053;
  margin-bottom: 1rem;
  font-size: 1.2rem;
}

/* Discovery Date */
.discovery-date {
  background: #e8f5e9;
  padding: 0.8rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.discovery-date p {
  color: #008053;
  font-weight: 500;
  margin: 0;
}

/* Enhanced Section Headers */
.section-header {
  text-align: center;
  margin-bottom: 3rem;
}

.section-header h2 {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  position: relative;
  display: inline-block;
}

.section-header h2::after {
  content: '';
  position: absolute;
  bottom: -10px;
  left: 50%;
  transform: translateX(-50%);
  width: 80px;
  height: 4px;
  background: #008053;
  border-radius: 2px;
}

/* Responsive Enhancements */
@media (max-width: 768px) {
  .section-header h2 {
    font-size: 2rem;
  }

  .expert-content {
    padding: 1.5rem;
  }

  .expert-image {
    height: 180px;
  }
}
</style>
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { diseasesService } from '../../services/diseases.service';
import type { Diseases } from '../../models/Diseases';

const diseases = ref<Diseases[]>([]);
const searchQuery = ref('');
const selectedSymptom = ref('');
const isLoading = ref(true);
const error = ref<string | null>(null);
const expandedSymptoms = ref<{ [key: number]: boolean }>({});
const currentPage = ref(1);
const itemsPerPage = 6;

const symptoms = computed(() => {
  const allSymptoms = diseases.value.flatMap(disease => 
    disease.symptoms.split(',').map(s => s.trim())
  );
  return [...new Set(allSymptoms)];
});

const filteredDiseases = computed(() => {
  const filtered = diseases.value.filter(disease => {
    const matchesSearch = disease.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesSymptom = !selectedSymptom.value || disease.symptoms.toLowerCase().includes(selectedSymptom.value.toLowerCase());
    return matchesSearch && matchesSymptom;
  });

  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filtered.slice(start, end);
});

const totalPages = computed(() => {
  const filtered = diseases.value.filter(disease => {
    const matchesSearch = disease.name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesSymptom = !selectedSymptom.value || disease.symptoms.toLowerCase().includes(selectedSymptom.value.toLowerCase());
    return matchesSearch && matchesSymptom;
  });
  return Math.ceil(filtered.length / itemsPerPage);
});

const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2;
  
  let range: (number | string)[] = [];
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 ||
      i === total ||
      (i >= current - delta && i <= current + delta)
    ) {
      range.push(i);
    } else if (i === current - delta - 1 || i === current + delta + 1) {
      range.push('...');
    }
  }
  
  return range;
});

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const toggleSymptoms = (diseaseId: number) => {
  expandedSymptoms.value[diseaseId] = !expandedSymptoms.value[diseaseId];
};

const getVisibleSymptoms = (disease: Diseases) => {
  const symptomsList = disease.symptoms.split(',').map(s => s.trim());
  const isExpanded = expandedSymptoms.value[disease.disease_id];
  return isExpanded ? symptomsList : symptomsList.slice(0, 4);
};

const fetchDiseases = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const response = await diseasesService.getDiseases();
    diseases.value = response;
    console.log(response);
  } catch (err) {
    error.value = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
    console.error('Error fetching diseases:', err);
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  fetchDiseases();
});
</script>

<template>
  <div class="diseases">
    <!-- Hero Section -->
    <section class="hero-section">
      <div class="hero-content">
        <h1>Bệnh Thường Gặp</h1>
        <p>Tìm hiểu về các bệnh thường gặp và cách điều trị theo y học cổ truyền</p>
      </div>
    </section>

    <!-- Search and Filter Section -->
    <section class="search-filter">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <label data-v-3e079a24="">Tìm kiếm bệnh</label>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Tìm kiếm bệnh..."
          class="search-input"
        >
      </div>
      <div class="filters">
        <div class="filter-group">
          <label>Triệu chứng</label>
          <select v-model="selectedSymptom" class="filter-select">
            <option value="">Tất cả triệu chứng</option>
            <option v-for="symptom in symptoms" :key="symptom" :value="symptom">
              {{ symptom }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải dữ liệu...</p>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchDiseases" class="retry-button">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <!-- Diseases Grid -->
    <section v-else class="diseases-grid">
      <div v-if="filteredDiseases.length === 0" class="no-results">
        <i class="fas fa-search"></i>
        <p>Không tìm thấy bệnh phù hợp</p>
      </div>
      
      <router-link 
        v-else 
        v-for="disease in filteredDiseases" 
        :key="disease.disease_id" 
        :to="`/disease/${disease.disease_id}`"
        class="disease-card"
      >
        <div class="disease-header">
          <div class="header-content">
            <h3>{{ disease.name }}</h3>
          </div>
          <div class="header-image">
            <img 
              v-if="disease.images && disease.images.length > 0"
              :src="disease.images[0].url" 
              :alt="disease.name"
            >
            <div v-else class="no-image">
              <i class="fas fa-image"></i>
              <p>Không có hình ảnh</p>
            </div>
          </div>
        </div>

        <div class="disease-content">
          <div class="symptoms-section">
            <h4><i class="fas fa-exclamation-circle"></i> Triệu chứng</h4>
            <ul class="symptoms-list">
              <li v-for="symptom in getVisibleSymptoms(disease)" :key="symptom">
                {{ symptom }}
              </li>
            </ul>
            <button 
              v-if="disease.symptoms.split(',').length > 4"
              @click.prevent="toggleSymptoms(disease.disease_id)"
              class="show-more-btn"
            >
              {{ expandedSymptoms[disease.disease_id] ? 'Thu gọn' : 'Xem thêm' }}
              <i :class="expandedSymptoms[disease.disease_id] ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
            </button>
          </div>
        </div>

        <div class="view-details">
          <i class="fas fa-arrow-right"></i> Xem chi tiết
        </div>
      </router-link>
    </section>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <template v-for="(page, index) in visiblePages" :key="index">
        <button 
          v-if="typeof page === 'number'"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <span v-else class="page-ellipsis">...</span>
      </template>

      <button 
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.diseases {
  padding-top: 60px;
}

.hero-section {
  background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6)), url('/images/diseases-hero.jpg');
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

.search-filter {
  max-width: 1200px;
  margin: 0 auto 2rem;
  padding: 0 2rem;
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.search-box {
  flex: 1;
  min-width: 300px;
  position: relative;
}

.search-box label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 70%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.search-input:focus {
  border-color: #008053;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 128, 83, 0.1);
}

.filter-group {
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.filter-select {
  width: 100%;
  padding: 1rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:focus {
  border-color: #008053;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 128, 83, 0.1);
}

.diseases-grid {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
  margin-bottom: 4rem;
}

.disease-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.disease-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.disease-header {
  position: relative;
  height: 180px;
  overflow: hidden;
}

.header-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  background: linear-gradient(transparent, rgba(0, 0, 0, 0.8));
  color: white;
  z-index: 1;
}

.header-image {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
}

.header-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.disease-card:hover .header-image img {
  transform: scale(1.1);
}

.disease-header h3 {
  margin: 0;
  font-size: 1.5rem;
  text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.5);
}

.symptom-count {
  background: rgba(255, 255, 255, 0.2);
  padding: 0.3rem 0.8rem;
  border-radius: 20px;
  font-size: 0.9rem;
  margin-top: 0.5rem;
  display: inline-block;
}

.disease-content {
  padding: 1.5rem;
  flex: 1;
}

h4 {
  color: #008053;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

h4 i {
  font-size: 1.1rem;
}

.symptoms-section {
  margin: 1rem 0;
}

.symptoms-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
  margin: 0.5rem 0;
  list-style: none;
  padding: 0;
}

.symptoms-list li {
  background: #f8f9fa;
  padding: 0.3rem 0.8rem;
  border-radius: 15px;
  font-size: 0.9rem;
  color: #666;
}

.show-more-btn {
  background: none;
  border: none;
  color: #008053;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
  transition: all 0.3s ease;
}

.show-more-btn:hover {
  color: #006040;
  transform: translateY(-1px);
}

.show-more-btn i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.treatment-section {
  margin: 1rem 0;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
  border-left: 4px solid #008053;
}

.plants-section {
  margin-top: 1rem;
}

.plants-list {
  display: flex;
  gap: 1rem;
  margin-top: 0.5rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.plant-item {
  flex: 0 0 100px;
  text-align: center;
}

.plant-item img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 0.5rem;
  border: 2px solid #008053;
}

.plant-info h5 {
  font-size: 0.9rem;
  margin: 0;
}

.english-name {
  font-size: 0.8rem;
  color: #666;
}

.view-details {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 1rem;
  background: #008053;
  color: white;
  transition: all 0.3s ease;
}

.disease-card:hover .view-details {
  background: #006c46;
}

.disease-card:hover .view-details i {
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .hero-section {
    height: 250px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .search-filter {
    padding: 0 1rem;
    flex-direction: column;
  }

  .diseases-grid {
    padding: 0 1rem;
    grid-template-columns: 1fr;
  }

  .plants-list {
    grid-template-columns: repeat(2, 1fr);
  }
}

.loading-state,
.error-state,
.no-results {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading-state i,
.error-state i,
.no-results i {
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

.retry-button i {
  margin-right: 0.5rem;
  font-size: 1rem;
  color: white;
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 0.5rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #333;
  font-size: 0.95rem;
}

.page-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #008053;
  color: #008053;
}

.page-btn.active {
  background: #008053;
  color: white;
  border-color: #008053;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn i {
  font-size: 0.9rem;
}

.page-ellipsis {
  color: #666;
  padding: 0 0.5rem;
}

/* Responsive Pagination */
@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .page-btn {
    min-width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
}
</style> 
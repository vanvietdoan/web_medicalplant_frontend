<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { adviceService } from '../../services/advice.service';
import { authService } from '../../services/auth.service';
import type { Advice } from '../../models/Advice';

const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const advices = ref<Advice[]>([]);
const searchQuery = ref('');
const selectedPlant = ref('');
const selectedDisease = ref('');

// Computed properties for filtering
const filteredAdvices = computed(() => {
  return advices.value.filter(advice => {
    const matchesSearch = !searchQuery.value || 
      advice.title.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      advice.content.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesPlant = !selectedPlant.value || 
      (advice.plant && advice.plant.plant_id === Number(selectedPlant.value));
    
    const matchesDisease = !selectedDisease.value || 
      (advice.disease && advice.disease.disease_id === Number(selectedDisease.value));
    
    return matchesSearch && matchesPlant && matchesDisease;
  });
});

// Get unique plants and diseases for filters
const uniquePlants = computed(() => {
  const plants = new Map();
  advices.value.forEach(advice => {
    if (advice.plant) {
      plants.set(advice.plant.plant_id, advice.plant);
    }
  });
  return Array.from(plants.values());
});

const uniqueDiseases = computed(() => {
  const diseases = new Map();
  advices.value.forEach(advice => {
    if (advice.disease) {
      diseases.set(advice.disease.disease_id, advice.disease);
    }
  });
  return Array.from(diseases.values());
});

const fetchUserAdvices = async () => {
  try {
    loading.value = true;
    error.value = null;
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Vui lòng đăng nhập để xem lời khuyên');
    }
    const response = await adviceService.getAdvicesByUser(currentUser.id);
    advices.value = response;
    console.log('Advices loaded:', advices.value);
  } catch (err) {
    console.error('Error fetching user advices:', err);
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách lời khuyên';
  } finally {
    loading.value = false;
  }
};

const handleEditAdvice = (adviceId: number) => {
  if (!adviceId) {
    console.error('Invalid advice ID');
    return;
  }
  router.push(`/profile/advice/${adviceId}/edit`);
};

const handleDeleteAdvice = async (adviceId: number) => {
  if (!adviceId) {
    console.error('Invalid advice ID');
    return;
  }
  if (confirm('Bạn có chắc chắn muốn xóa lời khuyên này?')) {
    try {
      await adviceService.deleteAdvice(adviceId);
      advices.value = advices.value.filter(advice => advice.advice_id !== adviceId);
    } catch (err) {
      console.error('Error deleting advice:', err);
      alert('Có lỗi xảy ra khi xóa lời khuyên');
    }
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedPlant.value = '';
  selectedDisease.value = '';
};

onMounted(() => {
  fetchUserAdvices();
});
</script>

<template>
  <div class="manage-advice-container">
    <div class="header">
      <h1>Quản lý lời khuyên</h1>
      <router-link to="/profile/advice/create" class="create-btn">
        <i class="fas fa-plus"></i>
        Thêm lời khuyên mới
      </router-link>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Tìm kiếm lời khuyên..."
          class="search-input"
        >
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Cây thuốc:</label>
          <select v-model="selectedPlant" class="filter-select">
            <option value="">Tất cả cây thuốc</option>
            <option v-for="plant in uniquePlants" 
                    :key="plant.plant_id" 
                    :value="plant.plant_id">
              {{ plant.name }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Bệnh:</label>
          <select v-model="selectedDisease" class="filter-select">
            <option value="">Tất cả bệnh</option>
            <option v-for="disease in uniqueDiseases" 
                    :key="disease.disease_id" 
                    :value="disease.disease_id">
              {{ disease.name }}
            </option>
          </select>
        </div>

        <button 
          v-if="searchQuery || selectedPlant || selectedDisease"
          @click="clearFilters" 
          class="clear-filters-btn"
        >
          <i class="fas fa-times"></i>
          Xóa bộ lọc
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải danh sách lời khuyên...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserAdvices" class="retry-btn">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="filteredAdvices.length === 0" class="empty-state">
      <i class="fas fa-comment-slash"></i>
      <p>Không tìm thấy lời khuyên phù hợp</p>
    </div>

    <div v-else class="advice-list">
      <div v-for="advice in filteredAdvices" :key="advice.advice_id" class="advice-card">
        <div class="advice-header">
          <h3>{{ advice.title }}</h3>
          <div class="advice-meta">
            <span class="date">
              <i class="fas fa-calendar"></i>
              {{ new Date(advice.created_at).toLocaleDateString('vi-VN') }}
            </span>
            <span class="time">
              <i class="fas fa-clock"></i>
              {{ new Date(advice.created_at).toLocaleTimeString('vi-VN') }}
            </span>
          </div>
        </div>

        <div class="advice-content">
          <p class="truncated-content">{{ advice.content }}</p>
        </div>

        <div class="advice-info">
          <div class="info-item">
            <i class="fas fa-leaf"></i>
            <router-link :to="`/plant/${advice.plant.plant_id}`">
              {{ advice.plant.name }}
            </router-link>
          </div>
          <div class="info-item">
            <i class="fas fa-disease"></i>
            <router-link :to="`/disease/${advice.disease.disease_id}`">
              {{ advice.disease.name }}
            </router-link>
          </div>
        </div>

        <div class="advice-actions">
          <button @click="handleEditAdvice(advice.advice_id)" class="edit-btn">
            <i class="fas fa-edit"></i>
            Sửa
          </button>
          <button @click="handleDeleteAdvice(advice.advice_id)" class="delete-btn">
            <i class="fas fa-trash"></i>
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-advice-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #008053;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.create-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.loading, .error, .empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #666;
}

.loading i, .error i, .empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #008053;
}

.error {
  color: #dc3545;
}

.retry-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.advice-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.advice-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.advice-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.advice-header {
  margin-bottom: 1rem;
}

.advice-header h3 {
  color: #008053;
  margin: 0 0 0.5rem;
}

.advice-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.advice-meta .date,
.advice-meta .time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.advice-meta i {
  color: #008053;
}

.advice-content {
  margin: 1rem 0;
  color: #666;
  line-height: 1.6;
}

.truncated-content {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
  margin: 0;
}

.advice-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.info-item a {
  color: #008053;
  text-decoration: none;
}

.info-item a:hover {
  text-decoration: underline;
}

.advice-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #008053;
  color: white;
}

.edit-btn:hover {
  background: #006040;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover {
  background: #c82333;
}

.search-filter-section {
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
}

.filter-select:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.clear-filters-btn {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .manage-advice-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .advice-list {
    grid-template-columns: 1fr;
  }

  .advice-info {
    flex-direction: column;
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .clear-filters-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>    
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { evalueService } from '../../services/evalue.service';
import { authService } from '../../services/auth.service';
import { adviceService } from '../../services/advice.service';
import type { EvalueResponse } from '../../models/Evalue';
import type { Advice } from '../../models/Advice';

interface EvalueWithAdvice extends EvalueResponse {
  advice?: Advice;
}

const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const evaluations = ref<EvalueWithAdvice[]>([]);
const searchQuery = ref('');
const selectedAdvice = ref('');
const selectedRating = ref('');

// Computed properties for filtering
const filteredEvaluations = computed(() => {
  return evaluations.value.filter(evalue => {
    const matchesSearch = !searchQuery.value || 
      evalue.content?.toLowerCase().includes(searchQuery.value.toLowerCase());
    
    const matchesAdvice = !selectedAdvice.value || 
      evalue.advice_id === Number(selectedAdvice.value);
    
    const matchesRating = !selectedRating.value || 
      evalue.rating === Number(selectedRating.value);
    
    return matchesSearch && matchesAdvice && matchesRating;
  });
});

// Get unique advices for filter
const uniqueAdvices = computed(() => {
  const advices = new Map();
  evaluations.value.forEach(evalue => {
    if (evalue.advice) {
      advices.set(evalue.advice_id, evalue.advice);
    }
  });
  return Array.from(advices.values());
});

const fetchUserEvaluations = async () => {
  try {
    loading.value = true;
    error.value = null;
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Vui lòng đăng nhập để xem đánh giá');
    }
    const response = await evalueService.getEvaluesByUser(currentUser.id);
    // Fetch advice details for each evaluation
    const evaluationsWithAdvice = await Promise.all(
      response.map(async (evalue) => {
        const advice = await adviceService.getAdviceById(evalue.advice_id);
        return {
          ...evalue,
          advice
        };
      })
    );
    evaluations.value = evaluationsWithAdvice;
    console.log('Evaluations loaded:', evaluations.value);
  } catch (err) {
    console.error('Error fetching user evaluations:', err);
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách đánh giá';
  } finally {
    loading.value = false;
  }
};

const handleEditEvaluation = (evalueId: number) => {
  if (!evalueId) {
    console.error('Invalid evaluation ID');
    return;
  }
  router.push(`/profile/evalue/${evalueId}/edit`);
};

const handleDeleteEvaluation = async (evalueId: number) => {
  if (!evalueId) {
    console.error('Invalid evaluation ID');
    return;
  }
  if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
    try {
      await evalueService.deleteEvalue(evalueId);
      evaluations.value = evaluations.value.filter(evalue => evalue.id !== evalueId);
    } catch (err) {
      console.error('Error deleting evaluation:', err);
      alert('Có lỗi xảy ra khi xóa đánh giá');
    }
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  selectedAdvice.value = '';
  selectedRating.value = '';
};

onMounted(() => {
  fetchUserEvaluations();
});
</script>

<template>
  <div class="manage-evalue-container">
    <div class="header">
      <h1>Quản lý đánh giá</h1>
      <button @click="router.push('/profile/evalue/create')" class="create-btn">
        <i class="fas fa-plus"></i>
        Tạo đánh giá mới
      </button>
    </div>
      
    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Tìm kiếm đánh giá..."
          class="search-input"
        >
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Lời khuyên:</label>
          <select v-model="selectedAdvice" class="filter-select">
            <option value="">Tất cả lời khuyên</option>
            <option v-for="advice in uniqueAdvices" 
                    :key="advice.advice_id" 
                    :value="advice.advice_id">
              {{ advice.title }}
            </option>
          </select>
        </div>

        <div class="filter-group">
          <label>Đánh giá:</label>
          <select v-model="selectedRating" class="filter-select">
            <option value="">Tất cả đánh giá</option>
            <option v-for="rating in 5" 
                    :key="rating" 
                    :value="rating">
              {{ rating }} sao
            </option>
          </select>
        </div>

        <button 
          v-if="searchQuery || selectedAdvice || selectedRating"
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
      <p>Đang tải danh sách đánh giá...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserEvaluations" class="retry-btn">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="filteredEvaluations.length === 0" class="empty-state">
      <i class="fas fa-star"></i>
      <p>Không tìm thấy đánh giá phù hợp</p>
    </div>

    <div v-else class="evalue-list">
      <div v-for="evalue in filteredEvaluations" :key="evalue.id" class="evalue-card">
        <div class="evalue-header">
          <div class="rating">
            <i 
              v-for="star in 5" 
              :key="star"
              :class="['fas', star <= evalue.rating ? 'fa-star' : 'fa-star-o']"
              :style="{ color: star <= evalue.rating ? '#FFD700' : '#ccc' }"
            ></i>
          </div>
          <div class="evalue-meta">
            <span class="date">
              <i class="fas fa-calendar"></i>
              {{ new Date(evalue.created_at).toLocaleDateString('vi-VN') }}
            </span>
            <span class="time">
              <i class="fas fa-clock"></i>
              {{ new Date(evalue.created_at).toLocaleTimeString('vi-VN') }}
            </span>
          </div>
        </div>

        <div class="evalue-content">
          <p>{{ evalue.content }}</p>
        </div>

        <div class="evalue-info">
          <div class="info-item">
            <i class="fas fa-comment"></i>
            <router-link :to="`/advice/${evalue.advice_id}`">
              {{ evalue.advice?.title || 'Lời khuyên' }}
            </router-link>
          </div>
        </div>

        <div class="evalue-actions">
          <button @click="handleEditEvaluation(evalue.id)" class="edit-btn">
            <i class="fas fa-edit"></i>
            Sửa
          </button>
          <button @click="handleDeleteEvaluation(evalue.id)" class="delete-btn">
            <i class="fas fa-trash"></i>
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-evalue-container {
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

.evalue-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.evalue-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.evalue-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.evalue-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.rating {
  display: flex;
  gap: 0.25rem;
}

.rating i {
  font-size: 1.2rem;
}

.evalue-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.evalue-meta .date,
.evalue-meta .time {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.evalue-meta i {
  color: #008053;
}

.evalue-content {
  margin: 1rem 0;
  color: #666;
  line-height: 1.6;
}

.evalue-info {
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

.evalue-actions {
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

.create-btn {
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
  font-size: 1rem;
}

.create-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .manage-evalue-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .evalue-list {
    grid-template-columns: 1fr;
  }

  .evalue-info {
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

  .create-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>    
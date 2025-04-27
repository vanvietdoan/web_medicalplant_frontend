<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { adviceService } from '../../services/advice.service';
import { authService } from '../../services/auth.service';
import type { Advice } from '../../models/Advice';

const router = useRouter();
const loading = ref(true);
const error = ref<string | null>(null);
const advices = ref<Advice[]>([]);

const fetchUserAdvices = async () => {
  try {
    loading.value = true;
    error.value = null;
    const currentUser = authService.getCurrentUser();
    if (!currentUser?.id) {
      throw new Error('Vui lòng đăng nhập để xem lời khuyên');
    }
    advices.value = await adviceService.getAdvicesByUser(currentUser.id);
    console.log('User advices:', advices.value);
  } catch (err) {
    console.error('Error fetching user advices:', err);
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách lời khuyên';
  } finally {
    loading.value = false;
  }
};

const handleEditAdvice = (adviceId: number) => {
  router.push(`/profile/advice/${adviceId}/edit`);
};

const handleDeleteAdvice = async (adviceId: number) => {
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

    <div v-else-if="advices.length === 0" class="empty-state">
      <i class="fas fa-comment-slash"></i>
      <p>Bạn chưa có lời khuyên nào</p>
      <router-link to="/profile/advice/create" class="create-btn">
        <i class="fas fa-plus"></i>
        Thêm lời khuyên mới
      </router-link>
    </div>

    <div v-else class="advice-list">
      <div v-for="advice in advices" :key="advice.advice_id" class="advice-card">
        <div class="advice-header">
          <h3>{{ advice.title }}</h3>
          <div class="advice-meta">
            <span class="date">
              <i class="fas fa-calendar"></i>
              {{ new Date(advice.created_at).toLocaleDateString('vi-VN') }}
            </span>
          </div>
        </div>

        <div class="advice-content">
          <p>{{ advice.content }}</p>
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
  gap: 1rem;
  color: #666;
  font-size: 0.9rem;
}

.advice-content {
  margin-bottom: 1.5rem;
  line-height: 1.6;
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
}
</style>    
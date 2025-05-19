<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {  useRouter } from 'vue-router';
import { evalueService } from '../../services/evalue.service';
import { adviceService } from '../../services/advice.service';
import { authService } from '../../services/auth.service';
import type { Advice } from '../../models/Advice';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(true);
const submitting = ref(false);
const error = ref<string | null>(null);
const advices = ref<Advice[]>([]);
const selectedAdvice = ref<Advice | null>(null);
const rating = ref(0);
const content = ref('');

const currentUser = ref(authService.getCurrentUser());

const fetchUserAdvices = async () => {
  try {
    loading.value = true;
    error.value = null;
    if (!currentUser.value?.id) {
      throw new Error('Vui lòng đăng nhập để xem lời khuyên');
    }
    const response = await adviceService.getAdvicesByUser(currentUser.value.id);
    advices.value = response;
  } catch (err) {
    console.error('Error fetching user advices:', err);
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách lời khuyên';
  } finally {
    loading.value = false;
  }
};

const handleSubmit = async () => {
  if (!currentUser.value) {
    ElMessage.warning('Vui lòng đăng nhập để tạo đánh giá');
    router.push('/login');
    return;
  }

  if (!selectedAdvice.value) {
    ElMessage.warning('Vui lòng chọn lời khuyên cần đánh giá');
    return;
  }

  if (rating.value === 0) {
    ElMessage.warning('Vui lòng chọn số sao đánh giá');
    return;
  }

  try {
    submitting.value = true;
    await evalueService.createEvalue({
      advice_id: selectedAdvice.value.advice_id,
      rating: rating.value,
      content: content.value,
      user_id: currentUser.value.id
    });
    ElMessage.success('Tạo đánh giá thành công');
    router.push('/profile/evalue');
  } catch (err) {
    console.error('Error creating evaluation:', err);
    ElMessage.error('Có lỗi xảy ra khi tạo đánh giá');
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  fetchUserAdvices();
});
</script>

<template>
  <div class="create-evalue-container">
    <div class="header">
      <h1>Tạo đánh giá</h1>
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

    <div v-else class="evalue-form">
      <div class="advice-list">
        <h2>Chọn lời khuyên cần đánh giá:</h2>
        <div class="advice-select">
          <select 
            v-model="selectedAdvice" 
            class="form-select"
          >
            <option value="">-- Chọn lời khuyên --</option>
            <option 
              v-for="advice in advices" 
              :key="advice.advice_id"
              :value="advice"
            >
              {{ advice.title }}
            </option>
          </select>
        </div>
      </div>

      <div v-if="selectedAdvice" class="evalue-form-content">
        <div class="advice-preview">
          <h2>{{ selectedAdvice.title }}</h2>
          <p class="advice-content">{{ selectedAdvice.content }}</p>
        </div>

        <form @submit.prevent="handleSubmit" class="form">
          <div class="form-group">
            <label>Đánh giá của bạn:</label>
            <div class="rating-container">
              <div class="star-rating">
                <i 
                  v-for="star in 5" 
                  :key="star"
                  class="fas fa-star"
                  :style="{ color: star <= rating ? '#FFD700' : '#e0e0e0' }"
                  @click="rating = star"
                ></i>
              </div>
              <div class="rating-text" v-if="rating > 0">
                {{ rating }} sao
              </div>
            </div>
          </div>

          <div class="form-group">
            <label for="content">Nội dung đánh giá:</label>
            <textarea
              id="content"
              v-model="content"
              rows="4"
              placeholder="Nhập nội dung đánh giá của bạn..."
              class="form-textarea"
            ></textarea>
          </div>

          <div class="form-actions">
            <button 
              type="button" 
              @click="router.back()" 
              class="cancel-btn"
            >
              Hủy
            </button>
            <button 
              type="submit" 
              :disabled="submitting || rating === 0"
              class="submit-btn"
            >
              <i class="fas fa-paper-plane"></i>
              {{ submitting ? 'Đang gửi...' : 'Gửi đánh giá' }}
            </button>
          </div>
        </form>
      </div>

      <div v-else class="no-selection">
        <i class="fas fa-hand-pointer"></i>
        <p>Vui lòng chọn một lời khuyên để đánh giá</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.create-evalue-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  color: #008053;
  margin: 0;
}

.loading, .error, .no-selection {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #666;
}

.loading i, .error i, .no-selection i {
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
  margin-bottom: 2rem;
}

.advice-list h2 {
  color: #2c3e50;
  margin-bottom: 1rem;
}

.advice-select {
  margin-bottom: 2rem;
}

.form-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
}

.form-select:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.form-select option {
  padding: 0.5rem;
}

.advice-preview {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 12px;
  margin-bottom: 2rem;
}

.advice-preview h2 {
  color: #008053;
  margin: 0 0 1rem;
}

.advice-content {
  color: #666;
  line-height: 1.6;
  margin: 0;
}

.form {
  background: white;
  padding: 2rem;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #2c3e50;
  font-weight: 500;
}

.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 100px;
}

.form-textarea:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn, .submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.submit-btn {
  background: #008053;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #006040;
  transform: translateY(-2px);
}

.submit-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.rating-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  font-size: 2.5rem;
  padding: 1rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.star-rating i {
  cursor: pointer;
  transition: all 0.2s ease;
}

.star-rating i:hover {
  transform: scale(1.1);
  color: #FFD700 !important;
}

.rating-text {
  color: #008053;
  font-size: 1.2rem;
  font-weight: 500;
}

@media (max-width: 768px) {
  .create-evalue-container {
    padding: 1rem;
  }

  .form {
    padding: 1.5rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn, .submit-btn {
    width: 100%;
    justify-content: center;
  }

  .star-rating {
    font-size: 2rem;
  }
}
</style> 
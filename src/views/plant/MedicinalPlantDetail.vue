<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { plantService } from '../../services/plant.service';
import { adviceService } from '../../services/advice.service';
import speciesService from '../../services/fillter/species.service';
import { authService } from '../../services/auth.service';
import { evalueService } from '../../services/evalue.service';
import { userService } from '../../services/user.service';
import type { Plant } from '../../models/Plant';
import type { Species } from '../../models/Species';
import type { Advice } from '../../models/Advice';
import type { EvalueResponse } from '../../models/Evalue';
import { ElMessage } from 'element-plus';

interface AdviceWithExpand extends Advice {
  isExpanded: boolean;
  evaluations: (EvalueResponse & { userDetails?: any })[];
  userRating?: number;
  userContent?: string;
  hoverRating?: number;
  showEvaluations?: boolean;
  editingEvaluation?: {
    id: number;
    rating: number;
    content: string;
    hoverRating?: number;
  } | null;
}

const route = useRoute();
const router = useRouter();
const plant = ref<Plant | null>(null);
const advices = ref<AdviceWithExpand[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const species = ref<Species | null>(null);
const currentImageIndex = ref(0);
const currentUser = ref(authService.getCurrentUser());

const isLoggedIn = computed(() => {
  return currentUser.value !== null && currentUser.value.id !== undefined;
});

const isEvaluationAuthor = (userId: number) => {
  return isLoggedIn.value && currentUser.value?.id === userId;
};

const fetchPlantDetails = async () => {
  console.log('Starting to fetch plant details...')
  try {
    loading.value = true;
    error.value = null;
    const plantId = Number(route.params.id);
    console.log('Plant ID from route:', plantId)
    if (!plantId) {
      throw new Error('ID cây thuốc không hợp lệ');
    }
    const [plantResponse, advicesResponse] = await Promise.all([
      plantService.getPlantById(plantId),
      adviceService.getAdvicesByPlant(plantId)
    ]);
    plant.value = plantResponse;
    
    // Fetch evaluations for each advice
    const advicesWithEvaluations = await Promise.all(
      advicesResponse.map(async (advice) => {
        const evaluations = await evalueService.getEvaluesByAdvice(advice.advice_id);
        // Fetch user details for each evaluation
        const evaluationsWithUserDetails = await Promise.all(
          evaluations.map(async (evalue) => {
            const userDetails = await userService.getUserById(evalue.user_id);
            return {
              ...evalue,
              userDetails
            };
          })
        );
        return {
          ...advice,
          isExpanded: false,
          showEvaluations: false,
          evaluations: evaluationsWithUserDetails
        };
      })
    );
    
    advices.value = advicesWithEvaluations;
    
    // Lấy thông tin species sau khi có plant
    if (plantResponse.species_id) {
      try {
        const speciesResponse = await speciesService.getSpeciesById(plantResponse.species_id);
        species.value = speciesResponse;
        console.log('Species details:', speciesResponse);
      } catch (err) {
        console.warn('Species not found, setting to null:', err);
        species.value = null;
      }
    }
    
    console.log('Plant details fetched successfully:', plant.value)
  } catch (err) {
    console.error('Error in fetchPlantDetails:', err)
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin cây thuốc';
  } finally {
    loading.value = false;
    console.log('Fetch plant details completed, loading:', loading.value)
  }
};

const nextImage = () => {
  if (plant.value && currentImageIndex.value < plant.value.images.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (plant.value && currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const handleCreateAdvice = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('Vui lòng đăng nhập để tạo lời khuyên');
    router.push('/login');
    return;
  }
  console.log('handleCreateAdvice called with plant_id:', route.params.id)
  router.push({
    path: '/plant/create-advice',
    query: { plant_id: route.params.id }
  });
};

const handleCreateReport = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('Vui lòng đăng nhập để tạo báo cáo');
    router.push('/login');
    return;
  }
  router.push({
    path: '/report/create',
    query: { plant_id: route.params.id }
  });
};

const handleEditAdvice = (adviceId: number) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('Vui lòng đăng nhập để chỉnh sửa lời khuyên');
    router.push('/login');
    return;
  }
  console.log('handleEditAdvice called with adviceId:', adviceId)
  router.push({
    path :`/profile/advice/${adviceId}/edit`,
    query: { plant_id: route.params.id }
  });
};

const handleViewReports = () => {
  if (!isLoggedIn.value) {
    ElMessage.warning('Vui lòng đăng nhập để xem báo cáo');
    router.push('/login');
    return;
  }
  router.push({
    path: '/profile/report',
    query: { 
      plant_id: route.params.id,
      species_id: plant.value?.species_id
    }
  });
};

const handleSubmitEvaluation = async (adviceId: number) => {
  if (!isLoggedIn.value) {
    ElMessage.warning('Vui lòng đăng nhập để đánh giá');
    router.push('/login');
    return;
  }

  const advice = advices.value.find(a => a.advice_id === adviceId);
  if (!advice) return;

  try {
    await evalueService.createEvalue({
      advice_id: adviceId,
      rating: advice.userRating || 0,
      content: advice.userContent || '',
      user_id: currentUser.value!.id
    });

    ElMessage.success('Đánh giá thành công');
    
    // Reset form
    advice.userRating = 0;
    advice.userContent = '';
    
    // Refresh evaluations
    const evaluations = await evalueService.getEvaluesByAdvice(adviceId);
    const evaluationsWithUserDetails = await Promise.all(
      evaluations.map(async (evalue) => {
        try {
          const userDetails = await userService.getUserById(evalue.user_id);
          return {
            ...evalue,
            userDetails
          };
        } catch (err) {
          console.error('Error fetching user details:', err);
          return {
            ...evalue,
            userDetails: null
          };
        }
      })
    );
    advice.evaluations = evaluationsWithUserDetails;
  } catch (err) {
    console.error('Error submitting evaluation:', err);
    ElMessage.error('Có lỗi xảy ra khi gửi đánh giá');
  }
};

const handleEditEvaluation = (adviceId: number, evalueId: number) => {
  const advice = advices.value.find(a => a.advice_id === adviceId);
  if (!advice) return;

  const evaluation = advice.evaluations.find(e => e.id === evalueId);
  if (!evaluation) return;

  advice.editingEvaluation = {
    id: evaluation.id,
    rating: evaluation.rating,
    content: evaluation.content || '',
    hoverRating: 0
  };
};

const handleUpdateEvaluation = async (adviceId: number) => {
  const advice = advices.value.find(a => a.advice_id === adviceId);
  if (!advice || !advice.editingEvaluation) return;

  try {
    await evalueService.updateEvalue(advice.editingEvaluation.id, {
      rating: advice.editingEvaluation.rating,
      content: advice.editingEvaluation.content,
      user_id: currentUser.value!.id,
      advice_id: adviceId
    });

    // Refresh evaluations
    const evaluations = await evalueService.getEvaluesByAdvice(adviceId);
    const evaluationsWithUserDetails = await Promise.all(
      evaluations.map(async (evalue) => {
        try {
          const userDetails = await userService.getUserById(evalue.user_id);
          return {
            ...evalue,
            userDetails
          };
        } catch (err) {
          console.error('Error fetching user details:', err);
          return {
            ...evalue,
            userDetails: null
          };
        }
      })
    );
    advice.evaluations = evaluationsWithUserDetails;
    advice.editingEvaluation = null;
    ElMessage.success('Cập nhật đánh giá thành công');
  } catch (err) {
    console.error('Error updating evaluation:', err);
    ElMessage.error('Có lỗi xảy ra khi cập nhật đánh giá');
  }
};

const cancelEditEvaluation = (adviceId: number) => {
  const advice = advices.value.find(a => a.advice_id === adviceId);
  if (advice) {
    advice.editingEvaluation = null;
  }
};

const handleDeleteEvaluation = async (adviceId: number, evalueId: number) => {
  const advice = advices.value.find(a => a.advice_id === adviceId);
  if (!advice) return;

  try {
    await evalueService.deleteEvalue(evalueId);
    advice.evaluations = advice.evaluations.filter(e => e.id !== evalueId);
    ElMessage.success('Xóa đánh giá thành công');
  } catch (err) {
    console.error('Error deleting evaluation:', err);
    ElMessage.error('Có lỗi xảy ra khi xóa đánh giá');
  }
};

const scrollToEvaluation = (adviceId: number) => {
  const advice = advices.value.find(a => a.advice_id === adviceId);
  if (advice) {
    advice.showEvaluations = !advice.showEvaluations;
    if (advice.showEvaluations) {
      const evaluationSection = document.getElementById(`evaluation-${adviceId}`);
      if (evaluationSection) {
        evaluationSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
};

onMounted(() => {
  console.log('MedicinalPlantDetail component mounted')
  fetchPlantDetails();
});
</script>

<template>
  <div class="plant-detail-container">
    <div v-if="loading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin cây thuốc...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchPlantDetails" class="retry-button">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="plant" class="plant-detail">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-gallery">
          <div class="main-image">
            <img :src="plant.images[currentImageIndex]?.url" :alt="plant.name">
            <button 
              v-if="plant.images.length > 1"
              class="nav-button prev" 
              @click="prevImage"
              :disabled="currentImageIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              v-if="plant.images.length > 1"
              class="nav-button next" 
              @click="nextImage"
              :disabled="currentImageIndex === plant.images.length - 1"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="thumbnail-list" v-if="plant.images.length > 1">
            <div 
              v-for="(image, index) in plant.images" 
              :key="image.picture_id"
              class="thumbnail"
              :class="{ active: currentImageIndex === index }"
              @click="currentImageIndex = index"
            >
              <img :src="image.url" :alt="`${plant.name} - ảnh ${index + 1}`">
            </div>
          </div>
        </div>
        <div class="hero-content">
          <h1>{{ plant.name }}</h1>
          <p class="english-name">{{ plant.english_name }}</p>
          <div class="action-buttons">
            <button 
              v-if="currentUser"
              @click="handleCreateReport" 
              class="create-report-btn"
            >
              <i class="fas fa-file-medical"></i>
              Tạo báo cáo
            </button>
            <button 
              v-if="currentUser"
              @click="handleViewReports" 
              class="view-reports-btn"
            >
              <i class="fas fa-list"></i>
              Xem danh sách báo cáo
            </button>
            <button 
              v-if="!currentUser"
              @click="() => { ElMessage.warning('Vui lòng đăng nhập để xem báo cáo'); router.push('/login'); }" 
              class="view-reports-btn"
            >
              <i class="fas fa-list"></i>
              Xem danh sách báo cáo
            </button>
          </div>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="main-content-grid">
        <!-- Plant Information Column -->
        <div class="info-column">
          <section class="info-section">
            <h2><i class="fas fa-seedling"></i> Thông tin cây thuốc</h2>
            <div class="content-box">
              <h3>Mô tả</h3>
              <p class="formatted-text">{{ plant.description }}</p>

              <div v-if="plant.images.length > 1" class="content-image">
                <img :src="plant.images[1].url" :alt="`${plant.name} - ảnh 2`">
              </div>

              <h3>Công dụng</h3>
              <p class="formatted-text">{{ plant.benefits }}</p>

              <div v-if="plant.images.length > 2" class="content-image">
                <img :src="plant.images[2].url" :alt="`${plant.name} - ảnh 3`">
              </div>

              <h3>Hướng dẫn sử dụng</h3>
              <p class="formatted-text">{{ plant.instructions }}</p>

              <div v-if="plant.images.length > 3" class="content-image">
                <img :src="plant.images[3].url" :alt="`${plant.name} - ảnh 4`">
              </div>

              <h3>Bệnh có thể điều trị</h3>
              <div class="disease-list">
                <div v-for="advice in advices" :key="advice.disease?.disease_id" class="disease-item">
                  <i class="fas fa-disease"></i>
                  <router-link 
                    v-if="advice.disease?.disease_id"
                    :to="`/disease/${advice.disease.disease_id}`" 
                    class="disease-link"
                  >
                    {{ advice.disease.name }}
                  </router-link>
                  <span v-else class="disease-link">{{ advice.disease?.name || 'Chưa phân loại' }}</span>
                </div>
              </div>

              <div class="metadata">
                <div class="metadata-item">
                  <span class="label">Loài:</span>
                  <span class="value">{{ species?.name || 'Chưa xác định' }}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Ngày tạo:</span>
                  <span class="value">{{ new Date(plant.created_at).toLocaleDateString('vi-VN') }}</span>
                </div>
                <div class="metadata-item">
                  <span class="label">Cập nhật lần cuối:</span>
                  <span class="value">{{ new Date(plant.updated_at).toLocaleDateString('vi-VN') }}</span>
                </div>
              </div>
            </div>
          </section>
        </div>

        <!-- Expert Advice Column -->
        <div class="advice-column">
          <section class="advice-section">
            <div class="advice-header">
              <h2><i class="fas fa-comments"></i> Lời khuyên từ chuyên gia</h2>
              <button 
                v-if="isLoggedIn"
                @click="handleCreateAdvice" 
                class="create-advice-btn"
              >
                <i class="fas fa-plus"></i>
                Tạo lời khuyên cho cây này
              </button>
              <button 
                v-else
                @click="() => { ElMessage.warning('Vui lòng đăng nhập để tạo lời khuyên'); router.push('/login'); }" 
                class="create-advice-btn"
              >
                <i class="fas fa-plus"></i>
                Tạo lời khuyên cho cây này
              </button>
            </div>

            <div v-if="advices.length === 0" class="empty-advice">
              <i class="fas fa-comment-slash"></i>
              <p>Chưa có lời khuyên nào cho cây này</p>
            </div>
            <div v-else class="advice-list">
              <div v-for="advice in advices" :key="advice.advice_id" class="advice-card">
                <div class="advice-header">
                  <div class="advice-title-section">
                    <h3>{{ advice.title }}</h3>
                    <button 
                      @click="scrollToEvaluation(advice.advice_id)"
                      class="view-evaluations-btn"
                    >
                      <i class="fas fa-star"></i>
                      Xem đánh giá ({{ advice.evaluations?.length || 0 }})
                    </button>
                  </div>
                  
                  <div class="advice-meta">
                    <i class="fas fa-calendar"></i>
                    <span>{{ new Date(advice.created_at).toLocaleDateString('vi-VN') }}</span>
                    <button 
                      v-if="currentUser && advice.user && currentUser.id === advice.user.user_id"
                      @click="handleEditAdvice(advice.advice_id)"
                      class="edit-btn"
                    >
                      <i class="fas fa-edit"></i>
                      Chỉnh sửa
                    </button>
                  </div>
                </div>

                <!-- Rest of the advice card content -->
                <div class="advice-content">
                  <p :class="{ 'truncated': !advice.isExpanded }">{{ advice.content }}</p>
                  <button 
                    v-if="advice.content.length > 200" 
                    @click="advice.isExpanded = !advice.isExpanded" 
                    class="read-more-btn"
                  >
                    {{ advice.isExpanded ? 'Thu gọn' : 'Xem thêm' }}
                    <i :class="advice.isExpanded ? 'fas fa-chevron-up' : 'fas fa-chevron-down'"></i>
                  </button>
                </div>

                <div class="advice-footer">
                  <div class="disease-info">
                    <i class="fas fa-disease"></i>
                    <router-link 
                      v-if="advice.disease?.disease_id"
                      :to="`/disease/${advice.disease.disease_id}`"
                    >
                      {{ advice.disease.name }}
                    </router-link>
                    <span v-else>{{ advice.disease?.name || 'Chưa phân loại' }}</span>
                  </div>
                  
                  <div class="expert-info">
                    <div class="expert-details">
                      <img 
                        :src="advice.user?.avatar || '/default-avatar.png'" 
                        :alt="advice.user?.full_name || 'Người ẩn danh'"
                        class="expert-avatar"
                      >
                      <div class="expert-info-text">
                        <router-link 
                          v-if="advice.user && advice.user.user_id"
                          :to="`/profile/${advice.user.user_id}`"
                        >
                          <span class="name">{{ advice.user?.full_name || 'Người ẩn danh' }}</span>
                        </router-link>
                        <span v-else class="name">Người ẩn danh</span>
                        <span class="title">{{ advice.user?.title || 'Chưa có chức danh' }}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Evaluation Section -->
                <div :id="`evaluation-${advice.advice_id}`" class="evaluation-section" v-show="advice.showEvaluations">
                  <!-- Evaluation List -->
                  <div v-if="advice.evaluations && advice.evaluations.length > 0" class="evaluation-list-section">
                    <h4 class="evaluation-title">
                      <i class="fas fa-star"></i>
                      Đánh giá ({{ advice.evaluations.length }})
                    </h4>
                    <div class="evaluation-list">
                      <div v-for="evalue in advice.evaluations" :key="evalue.id" class="evaluation-item">
                        <div v-if="advice.editingEvaluation?.id === evalue.id" class="edit-evaluation-form">
                          <div class="rating-input">
                            <div class="star-rating">
                              <i 
                                v-for="star in 5" 
                                :key="star"
                                class="fas fa-star"
                                :style="{ color: star <= (advice.editingEvaluation?.hoverRating || advice.editingEvaluation?.rating || 0) ? '#FFD700' : '#e0e0e0' }"
                                @click="advice.editingEvaluation!.rating = star"
                                @mouseover="advice.editingEvaluation!.hoverRating = star"
                                @mouseleave="advice.editingEvaluation!.hoverRating = 0"
                              ></i>
                            </div>
                            <span v-if="advice.editingEvaluation?.rating" class="rating-text">
                              {{ advice.editingEvaluation.rating }} sao
                            </span>
                          </div>
                          <textarea
                            v-model="advice.editingEvaluation.content"
                            placeholder="Nhập nội dung đánh giá của bạn..."
                            class="evaluation-textarea"
                            rows="3"
                          ></textarea>
                          <div class="form-actions">
                            <button 
                              @click="handleUpdateEvaluation(advice.advice_id)"
                              class="submit-evaluation-btn"
                              :disabled="!advice.editingEvaluation?.rating || !advice.editingEvaluation?.content?.trim()"
                            >
                              <i class="fas fa-save"></i>
                              Lưu thay đổi
                            </button>
                            <button 
                              @click="cancelEditEvaluation(advice.advice_id)"
                              class="cancel-evaluation-btn"
                            >
                              <i class="fas fa-times"></i>
                              Hủy
                            </button>
                          </div>
                        </div>
                        <div v-else class="evaluation-content-wrapper">
                          <div class="evaluation-header">
                            <div class="evaluation-user">
                              <img 
                                :src="evalue.userDetails?.avatar || '/default-avatar.png'" 
                                :alt="evalue.userDetails?.full_name || 'Người ẩn danh'"
                                class="evaluation-avatar"
                              >
                              <div class="evaluation-user-info">
                                <template v-if="evalue.user_id && evalue.userDetails">
                                  <router-link :to="`/profile/${evalue.user_id}`">
                                    {{ evalue.userDetails.full_name || 'Người ẩn danh' }}
                                  </router-link>
                                </template>
                                <template v-else>
                                  <span>Người ẩn danh</span>
                                </template>
                                <span class="evaluation-date">{{ new Date(evalue.created_at).toLocaleDateString('vi-VN') }}</span>
                              </div>
                            </div>
                            <div class="evaluation-actions">
                              <div class="evaluation-rating">
                                <i 
                                  v-for="star in 5" 
                                  :key="star"
                                  :class="['fas', star <= evalue.rating ? 'fa-star' : 'fa-star-o']"
                                  :style="{ color: star <= evalue.rating ? '#FFD700' : '#ccc' }"
                                ></i>
                              </div>
                              <div v-if="isEvaluationAuthor(evalue.user_id)" class="evaluation-controls">
                                <button 
                                  @click="handleEditEvaluation(advice.advice_id, evalue.id)"
                                  class="edit-evaluation-btn"
                                >
                                  <i class="fas fa-edit"></i>
                                </button>
                                <button 
                                  @click="handleDeleteEvaluation(advice.advice_id, evalue.id)"
                                  class="delete-evaluation-btn"
                                >
                                  <i class="fas fa-trash"></i>
                                </button>
                              </div>
                            </div>
                          </div>
                          <p class="evaluation-content">{{ evalue.content }}</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- User Evaluation Form -->
                  <div v-if="isLoggedIn" class="user-evaluation-form">
                    <h4 class="evaluation-title">
                      <i class="fas fa-edit"></i>
                      Đánh giá của bạn
                    </h4>
                    <form @submit.prevent="handleSubmitEvaluation(advice.advice_id)" class="evaluation-form">
                      <div class="rating-input">
                        <div class="star-rating">
                          <i 
                            v-for="star in 5" 
                            :key="star"
                            class="fas fa-star"
                            :style="{ color: star <= (advice.userRating || 0) ? '#FFD700' : '#e0e0e0' }"
                            @click="advice.userRating = star"
                            @mouseover="advice.hoverRating = star"
                            @mouseleave="advice.hoverRating = 0"
                          ></i>
                        </div>
                        <span v-if="advice.userRating" class="rating-text">
                          {{ advice.userRating }} sao
                        </span>
                      </div>
                      <textarea
                        v-model="advice.userContent"
                        placeholder="Nhập nội dung đánh giá của bạn..."
                        class="evaluation-textarea"
                        rows="3"
                      ></textarea>
                      <div class="form-actions">
                        <button 
                          type="submit" 
                          class="submit-evaluation-btn"
                          :disabled="!advice.userRating || !advice.userContent?.trim()"
                        >
                          <i class="fas fa-paper-plane"></i>
                          Gửi đánh giá
                        </button>
                      </div>
                    </form>
                  </div>

                  <!-- Empty State -->
                  <div v-if="!advice.evaluations || advice.evaluations.length === 0" class="empty-evaluations">
                    <i class="fas fa-star"></i>
                    <p>Chưa có đánh giá nào</p>
                    <p v-if="!isLoggedIn" class="login-prompt">
                      <router-link to="/login">Đăng nhập</router-link> để đánh giá
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.plant-detail-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 2rem;
}

/* Loading & Error States */
.loading-state,
.error-state {
  min-height: 400px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
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

.retry-button {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-button:hover {
  background: #006040;
  transform: translateY(-2px);
}

/* Hero Section */
.hero-section {
  position: relative;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 2rem;
}

.hero-gallery {
  position: relative;
  height: 400px;
  border-radius: 16px;
  overflow: hidden;
  margin-bottom: 1rem;
  background: #f8f9fa;
}

.main-image {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.main-image img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
  transition: transform 0.3s ease;
}

.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.8);
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #008053;
  transition: all 0.3s ease;
  z-index: 10;
}

.nav-button:hover {
  background: white;
  transform: translateY(-50%) scale(1.1);
}

.nav-button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.nav-button.prev {
  left: 1rem;
}

.nav-button.next {
  right: 1rem;
}

.thumbnail-list {
  position: absolute;
  bottom: 1rem;
  left: 0;
  right: 0;
  display: flex;
  gap: 0.5rem;
  padding: 0 1rem;
  overflow-x: auto;
  scrollbar-width: none;
  -ms-overflow-style: none;
  justify-content: center;
}

.thumbnail-list::-webkit-scrollbar {
  display: none;
}

.thumbnail {
  width: 80px;
  height: 60px;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  flex-shrink: 0;
  background: white;
}

.thumbnail.active {
  border-color: #008053;
  transform: scale(1.1);
}

.thumbnail img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.thumbnail:hover {
  transform: scale(1.1);
}

.hero-content {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 2rem;
  background: linear-gradient(transparent, rgba(0,0,0,0.8));
  color: white;
}

.hero-content h1 {
  font-size: 2.5rem;
  margin: 0;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-content .english-name {
  font-size: 1.2rem;
  opacity: 0.9;
  font-style: italic;
  margin-top: 0.5rem;
}

/* Main Content Grid */
.main-content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  position: relative;
  max-width: 1400px;
  margin: 0 auto;
}

/* Info Sections */
.info-column {
  position: relative;
  z-index: 1;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

/* Advice Section */
.advice-section {
  position: sticky;
  top: 2rem;
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  height: calc(100vh - 4rem);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.advice-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.advice-list {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  overflow-y: auto;
  padding-right: 0.5rem;
  margin-right: -0.5rem;
  max-height: calc(100vh - 200px);
}

.advice-list::-webkit-scrollbar {
  width: 6px;
}

.advice-list::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.advice-list::-webkit-scrollbar-thumb {
  background: #008053;
  border-radius: 3px;
}

.advice-list::-webkit-scrollbar-thumb:hover {
  background: #006040;
}

.advice-card {
  background: #f8f9fa;
  border-radius: 12px;
  padding: 1.5rem;
  border-left: 4px solid #008053;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.advice-title-section {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex: 1;
}

.advice-title-section h3 {
  margin: 0;
  font-size: 1.2rem;
  color: #2c3e50;
  line-height: 1.4;
}

.advice-meta {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.advice-content {
  color: #2c3e50;
  line-height: 1.6;
}

.advice-content .truncated {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}

.read-more-btn {
  background: none;
  border: none;
  color: #008053;
  padding: 0.5rem 0;
  font-size: 0.9rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.read-more-btn:hover {
  color: #006040;
  transform: translateY(-1px);
}

.read-more-btn i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.advice-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.disease-info,
.expert-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.disease-info a {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
}

.disease-info a:hover {
  text-decoration: underline;
}

.expert-details {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.expert-info-text {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.expert-info-text .name {
  font-weight: 500;
  color: #2c3e50;
  text-decoration: none;
}

.expert-info-text .title {
  font-size: 0.9rem;
  color: #666;
  font-style: italic;
}

.expert-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  object-fit: cover;
  margin-right: 0.75rem;
}

/* Responsive Design */
@media (max-width: 1200px) {
  .main-content-grid {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 992px) {
  .main-content-grid {
    grid-template-columns: 1fr;
  }

  .advice-section {
    position: static;
    height: auto;
    max-height: none;
  }

  .advice-list {
    max-height: none;
  }
}

@media (max-width: 768px) {
  .plant-detail-container {
    padding: 1rem;
  }

  .main-content-grid {
    gap: 1rem;
  }

  .info-column,
  .advice-section {
    padding: 1rem;
  }

  .hero-section {
    height: 300px;
  }

  .hero-content h1 {
    font-size: 2rem;
  }

  .metadata {
    grid-template-columns: 1fr;
  }

  .hero-gallery {
    height: 300px;
  }

  .thumbnail {
    width: 60px;
    height: 45px;
  }

  .nav-button {
    width: 32px;
    height: 32px;
  }

  .content-image img {
    max-height: 300px;
  }
}

/* Disease List Styles */
.disease-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.disease-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.disease-item:hover {
  background: #e0efe8;
  transform: translateX(5px);
}

.disease-item i {
  color: #008053;
  font-size: 1.1rem;
}

.disease-link {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  flex: 1;
}

.disease-link:hover {
  text-decoration: underline;
}

.create-advice-btn {
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-advice-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.create-advice-btn i {
  font-size: 1.1rem;
}

.empty-advice {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-advice i {
  font-size: 3rem;
  color: #008053;
  margin-bottom: 1rem;
}

.empty-advice p {
  font-size: 1.1rem;
  margin: 0;
}

.edit-btn {
  padding: 0.5rem 1rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.edit-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.edit-btn i {
  font-size: 1rem;
}

.formatted-text {
  white-space: pre-line;
  line-height: 1.8;
  text-align: justify;
}

.content-box h3 {
  color: #008053;
  margin: 1.5rem 0 1rem;
  font-size: 1.2rem;
}

.content-box h3:first-child {
  margin-top: 0;
}

.content-image {
  margin: 2rem 0;
  text-align: center;
}

.content-image img {
  max-width: 100%;
  max-height: 400px;
  object-fit: contain;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.3s ease;
}

.content-image img:hover {
  transform: scale(1.02);
}

.action-buttons {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

.create-report-btn,
.view-reports-btn {
  padding: 0.75rem 1.5rem;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.create-report-btn {
  background: #008053;
}

.create-report-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.view-reports-btn {
  background: #6c757d;
}

.view-reports-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.create-report-btn i,
.view-reports-btn i {
  font-size: 1.1rem;
}

/* Evaluation Styles */
.evaluation-section {
  margin-top: 1rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0,0,0,0.1);
}

.evaluation-list-section {
  padding: 1.5rem;
  border-bottom: 1px solid #eee;
}

.evaluation-title {
  font-size: 1.1rem;
  color: #2c3e50;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.evaluation-title i {
  color: #FFD700;
}

.evaluation-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  max-height: 300px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.evaluation-item {
  background: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.evaluation-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.75rem;
}

.evaluation-user {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.evaluation-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.evaluation-user-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.evaluation-user-info a {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  font-size: 0.9rem;
}

.evaluation-date {
  font-size: 0.8rem;
  color: #666;
}

.evaluation-rating {
  display: flex;
  gap: 0.25rem;
}

.evaluation-rating i {
  font-size: 0.9rem;
  color: #FFD700;
}

.evaluation-content {
  color: #2c3e50;
  font-size: 0.95rem;
  line-height: 1.5;
  margin: 0;
  padding-left: 2.75rem;
}

.user-evaluation-form {
  padding: 1.5rem;
}

.evaluation-form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.rating-input {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.star-rating {
  display: flex;
  gap: 0.5rem;
  font-size: 2rem;
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
  font-size: 1.1rem;
  font-weight: 500;
}

.evaluation-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  resize: vertical;
  min-height: 80px;
}

.evaluation-textarea:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.submit-evaluation-btn {
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: auto;
}

.submit-evaluation-btn:hover:not(:disabled) {
  background: #006040;
  transform: translateY(-2px);
}

.submit-evaluation-btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.empty-evaluations {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.empty-evaluations i {
  font-size: 2rem;
  color: #FFD700;
  margin-bottom: 1rem;
}

.empty-evaluations p {
  margin: 0.5rem 0;
}

.login-prompt {
  font-size: 0.9rem;
}

.login-prompt a {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
}

.login-prompt a:hover {
  text-decoration: underline;
}

/* Evaluation Controls Styles */
.evaluation-actions {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.evaluation-controls {
  display: flex;
  gap: 0.5rem;
}

.edit-evaluation-btn,
.delete-evaluation-btn {
  background: none;
  border: none;
  padding: 0.25rem;
  cursor: pointer;
  transition: all 0.2s ease;
  color: #666;
}

.edit-evaluation-btn:hover {
  color: #008053;
  transform: scale(1.1);
}

.delete-evaluation-btn:hover {
  color: #dc3545;
  transform: scale(1.1);
}

.edit-evaluation-btn i,
.delete-evaluation-btn i {
  font-size: 1rem;
}

/* Edit Evaluation Form Styles */
.edit-evaluation-form {
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1rem;
}

.cancel-evaluation-btn {
  padding: 0.75rem 1.5rem;
  background: #6c757d;
  color: white;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-left: 1rem;
}

.cancel-evaluation-btn:hover {
  background: #5a6268;
  transform: translateY(-2px);
}

.form-actions {
  display: flex;
  justify-content: flex-end;
}

/* View Evaluations Button Styles */
.view-evaluations-btn {
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  color: #008053;
  border: 1px solid #008053;
  border-radius: 6px;
  font-size: 0.9rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  align-self: flex-start;
  font-weight: 500;
}

.view-evaluations-btn i {
  font-size: 0.9rem;
  color: #FFD700;
}

.view-evaluations-btn:hover {
  background: #008053;
  color: white;
  transform: translateY(-1px);
}

.view-evaluations-btn:hover i {
  color: white;
}
</style>
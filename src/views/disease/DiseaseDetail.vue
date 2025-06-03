<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { diseasesService } from '../../services/diseases.service';
import { adviceService } from '../../services/advice.service';
import { authService } from '../../services/auth.service';
import { evalueService } from '../../services/evalue.service';
import { userService } from '../../services/user.service';
import type { Diseases } from '../../models/Diseases';
import type { Advice } from '../../models/Advice';
import type { EvalueResponse } from '../../models/Evalue';
import { ElMessage } from 'element-plus';

const route = useRoute();
const router = useRouter();
const disease = ref<Diseases | null>(null);
const advices = ref<AdviceWithExpand[]>([]);
const isLoading = ref(true);
const error = ref<string | null>(null);
const currentImageIndex = ref(0);
const isLoggedIn = ref(false);
const currentUser = ref<any>(null);

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

const fetchDiseaseDetail = async () => {
  try {
    isLoading.value = true;
    error.value = null;
    const diseaseId = Number(route.params.id);
    const [diseaseResponse, advicesResponse] = await Promise.all([
      diseasesService.getDiseaseById(diseaseId),
      adviceService.getAdviceByDiseaseID(diseaseId)
    ]);
    disease.value = {
      ...diseaseResponse,
      images: diseaseResponse.images || []
    };
    
    // Fetch evaluations for each advice
    const advicesWithEvaluations = await Promise.all(
      advicesResponse.map(async (advice) => {
        const evaluations = await evalueService.getEvaluesByAdvice(advice.advice_id);
        // Fetch user details for each evaluation
        const evaluationsWithUserDetails = await Promise.all(
          evaluations.map(async (evalue) => {
            try {
              const userDetails = await userService.getUserById(evalue.user_id);
              return {
                ...evalue,
                userDetails: userDetails || {
                  full_name: 'Người dùng ẩn danh',
                  avatar: '/images/avatar.webp'
                }
              };
            } catch (err) {
              console.error('Error fetching user details:', err);
              return {
                ...evalue,
                userDetails: {
                  full_name: 'Người dùng ẩn danh',
                  avatar: '/images/avatar.webp'
                }
              };
            }
          })
        );
        return {
          ...advice,
          isExpanded: false,
          showEvaluations: false,
          evaluations: evaluationsWithUserDetails,
          user: advice.user || {
            user_id: 0,
            full_name: 'Người dùng ẩn danh',
            title: 'Chưa có chức danh',
            avatar: '/images/avatar.webp'
          }
        };
      })
    );
    
    advices.value = advicesWithEvaluations;
  } catch (err) {
    error.value = 'Có lỗi xảy ra khi tải dữ liệu. Vui lòng thử lại sau.';
    console.error('Error fetching disease details:', err);
  } finally {
    isLoading.value = false;
  }
};

const nextImage = () => {
  if (disease.value && currentImageIndex.value < disease.value.images.length - 1) {
    currentImageIndex.value++;
  }
};

const prevImage = () => {
  if (disease.value && currentImageIndex.value > 0) {
    currentImageIndex.value--;
  }
};

const handleSuggestAdvice = () => {
  router.push({
    path: '/disease/create-advice',
    query: { disease_id: route.params.id }
  });
};

const handleEditAdvice = (adviceId: number) => {
  router.push({
    path: `/profile/advice/${adviceId}/edit`,
    query: { disease_id: route.params.id }
  });
};

const isEvaluationAuthor = (userId: number) => {
  return isLoggedIn.value && currentUser.value?.id === userId;
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
  const user = authService.getCurrentUser();
  isLoggedIn.value = !!user;
  currentUser.value = user;
  fetchDiseaseDetail();
});
</script>

<template>
  <div class="plant-detail-container">
    <div v-if="isLoading" class="loading-state">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin bệnh...</p>
    </div>

    <div v-else-if="error" class="error-state">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchDiseaseDetail" class="retry-button">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="disease" class="plant-detail">
      <!-- Hero Section -->
      <section class="hero-section">
        <div class="hero-gallery">
          <div class="main-image">
            <img 
              v-if="disease?.images?.length > 0"
              :src="disease.images[currentImageIndex]?.url" 
              :alt="disease.name"
            >
            <div v-else class="no-image">
              <i class="fas fa-image"></i>
              <p>Không có hình ảnh</p>
            </div>
            <button 
              v-if="disease?.images?.length > 1"
              class="nav-button prev" 
              @click="prevImage"
              :disabled="currentImageIndex === 0"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            <button 
              v-if="disease?.images?.length > 1"
              class="nav-button next" 
              @click="nextImage"
              :disabled="currentImageIndex === disease.images.length - 1"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <div class="thumbnail-list" v-if="disease?.images?.length > 1">
            <div 
              v-for="(image, index) in disease.images" 
              :key="image.picture_id"
              class="thumbnail"
              :class="{ active: currentImageIndex === index }"
              @click="currentImageIndex = index"
            >
              <img :src="image.url" :alt="`${disease.name} - ảnh ${index + 1}`">
            </div>
          </div>
        </div>
        <div class="hero-content">
          <h1>{{ disease.name }}</h1>
          <p class="update-date">Cập nhật: {{ new Date(disease.updated_at).toLocaleDateString('vi-VN') }}</p>
        </div>
      </section>

      <!-- Main Content Grid -->
      <div class="main-content-grid">
        <!-- Disease Information Column -->
        <section class="info-section">
          <h2><i class="fas fa-disease"></i> Thông tin bệnh</h2>
          <div class="content-box">
            <h3>Mô tả</h3>
            <p class="formatted-text">{{ disease.description }}</p>

            <div v-if="disease.images.length > 1" class="content-image">
              <img :src="disease.images[1].url" :alt="`${disease.name} - ảnh 2`">
            </div>

            <h3>Triệu chứng</h3>
            <div class="symptoms-list">
              <div v-for="symptom in disease.symptoms.split(',')" :key="symptom" class="symptom-item">
                <i class="fas fa-exclamation-circle"></i>
                <span>{{ symptom.trim() }}</span>
              </div>
            </div>

            <div v-if="disease.images.length > 2" class="content-image">
              <img :src="disease.images[2].url" :alt="`${disease.name} - ảnh 3`">
            </div>

            <h3>Hướng dẫn điều trị</h3>
            <p class="formatted-text">{{ disease.instructions }}</p>

            <div v-if="disease.images.length > 3" class="content-image">
              <img :src="disease.images[3].url" :alt="`${disease.name} - ảnh 4`">
            </div>

            <h3 v-if="advices.some(advice => advice.plant)">Cây thuốc có thể điều trị</h3>
            <div v-if="advices.some(advice => advice.plant)" class="plant-list">
              <div v-for="advice in advices.filter(advice => advice.plant)" :key="advice.plant.plant_id" class="plant-item">
                <i class="fas fa-seedling"></i>
                <router-link :to="`/plant/${advice.plant.plant_id}`" class="plant-link">
                  {{ advice.plant.name }}
                </router-link>
              </div>
            </div>

            <div class="metadata">
              <div class="metadata-item">
                <span class="label">Ngày tạo:</span>
                <span class="value">{{ new Date(disease.created_at).toLocaleDateString('vi-VN') }}</span>
              </div>
              <div class="metadata-item">
                <span class="label">Cập nhật lần cuối:</span>
                <span class="value">{{ new Date(disease.updated_at).toLocaleDateString('vi-VN') }}</span>
              </div>
            </div>
          </div>
        </section>

        <!-- Expert Advice Column -->
        <div class="advice-column">
          <section class="advice-section">
            <div class="advice-header">
              <h2><i class="fas fa-comments"></i> Lời khuyên từ chuyên gia</h2>
              <button 
                v-if="isLoggedIn" 
                @click="handleSuggestAdvice" 
                class="create-advice-btn"
              >
                <i class="fas fa-plus"></i>
                Đề xuất lời khuyên
              </button>
            </div>
            <div v-if="advices.length === 0" class="empty-advice">
              <i class="fas fa-comment-slash"></i>
              <p>Chưa có lời khuyên nào cho bệnh này</p>
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
                
                <div class="advice-content">
                  <p :class="{ 'truncated': !advice.isExpanded }" :style="{ maxHeight: advice.isExpanded ? 'none' : '100px', overflow: 'hidden' }">{{ advice.content }}</p>
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
                  <div class="expert-info">
                    <div class="expert-details">
                      <img 
                        :src="advice.user?.avatar || '/images/avatar.webp'" 
                        :alt="advice.user?.full_name || 'Người dùng ẩn danh'"
                        class="expert-avatar"
                        @error="(e) => (e.target as HTMLImageElement).src = '/images/avatar.webp'"
                      >
                      <div class="expert-info-text">
                        <router-link 
                          v-if="advice.user?.user_id && advice.user.user_id !== 0"
                          :to="`/profile/${advice.user.user_id}`"
                        >
                          <span class="name">{{ advice.user?.full_name || 'Người dùng ẩn danh' }}</span>
                        </router-link>
                        <span v-else class="name">{{ advice.user?.full_name || 'Người dùng ẩn danh' }}</span>
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
                                :src="evalue.userDetails?.avatar || '/images/avatar.webp'" 
                                :alt="evalue.userDetails?.full_name || 'Người dùng ẩn danh'"
                                class="evaluation-avatar"
                                @error="(e) => (e.target as HTMLImageElement).src = '/images/avatar.webp'"
                              >
                              <div class="evaluation-user-info">
                                <template v-if="evalue.user_id && evalue.userDetails && evalue.user_id !== 0">
                                  <router-link :to="`/profile/${evalue.user_id}`">
                                    {{ evalue.userDetails.full_name || 'Người dùng ẩn danh' }}
                                  </router-link>
                                </template>
                                <template v-else>
                                  <span>{{ evalue.userDetails?.full_name || 'Người dùng ẩn danh' }}</span>
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
  background: #f8f9fa;
}

.main-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.no-image {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  color: #666;
  background: #f8f9fa;
}

.no-image i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #008053;
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

.hero-content .update-date {
  font-size: 1.2rem;
  opacity: 0.9;
  margin-top: 0.5rem;
}

/* Main Content Grid */
.main-content-grid {
  display: grid;
  grid-template-columns: 1.5fr 1fr;
  gap: 2rem;
  position: relative;
  width: 100%;
}

/* Info Sections */
.info-section {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  width: 100%;
}

.info-section h2 {
  color: #008053;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.content-box {
  background: white;
  color: #2c3e50;
  padding: 1rem;
  border-radius: 8px;
}

.content-box h3 {
  color: #008053;
  margin: 1.5rem 0 1rem;
  font-size: 1.2rem;
}

.content-box h3:first-child {
  margin-top: 0;
}

.formatted-text {
  white-space: pre-line;
  line-height: 1.8;
  text-align: justify;
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

/* Metadata */
.metadata {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.metadata-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
  color: #666;
}

.metadata-item .label {
  font-weight: 500;
  color: #2c3e50;
}

/* Symptoms List */
.symptoms-list {
  background: white;
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.symptom-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.symptom-item:hover {
  background: #e0efe8;
  transform: translateX(5px);
}

.symptom-item i {
  color: #008053;
  font-size: 1.1rem;
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
  width: 100%;
}

.advice-header {
  flex-shrink: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.advice-header h2 {
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: #008053;
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
}

.advice-header {
  margin-bottom: 1rem;
}

.advice-header h3 {
  color: #008053;
  margin: 0;
  font-size: 1.2rem;
}

.advice-meta {
  margin-top: 0.5rem;
  font-size: 0.9rem;
  color: #666;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.advice-content {
  margin-bottom: 1rem;
  line-height: 1.6;
  color: #444;
  position: relative;
}

.advice-content p {
  transition: max-height 0.3s ease;
  margin: 0;
}

.read-more-btn {
  background: none;
  border: none;
  color: #008053;
  padding: 0.5rem 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  margin-top: 0.5rem;
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
  font-size: 0.9rem;
}

.expert-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
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

  .info-section,
  .advice-section {
    padding: 1rem;
  }

  .hero-section {
    height: 300px;
  }

  .hero-content h1 {
    font-size: 2rem;
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

/* Plant List Styles */
.plant-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin: 1rem 0;
}

.plant-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: #f0f7f4;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.plant-item:hover {
  background: #e0efe8;
  transform: translateX(5px);
}

.plant-item i {
  color: #008053;
  font-size: 1.1rem;
}

.plant-link {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  flex: 1;
}

.plant-link:hover {
  text-decoration: underline;
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
<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import type { User } from '../../models/User';
import { userService } from '../../services/user.service';

const route = useRoute();
const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchUserDetails = async () => {
  try {
    loading.value = true;
    error.value = null;

    const userId = Number(route.params.id);
    if (!userId) {
      throw new Error('Không tìm thấy ID người dùng');
    }

    user.value = await userService.getUserById(userId);
    console.log("user:", user.value);
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin người dùng';
  } finally {
    loading.value = false;
  }
};

onMounted(fetchUserDetails);
</script>

<template>
  <div class="profile-container">
    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchUserDetails" class="retry-btn">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="user" class="profile-content">
      <div class="profile-header">
        <div class="avatar">
          <img :src="user.avatar || '/default-avatar.png'" :alt="user.full_name">
        </div>
        <h2>{{ user.full_name }}</h2>
        <p class="title">{{ user.title }}</p>
      </div>

      <div class="profile-info">
        <div class="info-section">
          <h3>Thông tin cá nhân</h3>
          <div class="info-grid">
            <div class="info-item">
              <i class="fas fa-envelope"></i>
              <div>
                <strong>Email:</strong>
                <p>{{ user.email }}</p>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-graduation-cap"></i>
              <div>
                <strong>Chuyên ngành:</strong>
                <p>{{ user.specialty }}</p>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-certificate"></i>
              <div>
                <strong>Chứng chỉ:</strong>
                <p v-if="user.proof">
                  <a :href="user.proof" target="_blank" class="pdf-link">
                    <i class="fas fa-file-pdf"></i> Xem chứng chỉ
                  </a>
                </p>
                <p v-else>Chưa có</p>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-user-tag"></i>
              <div>
                <strong>Vai trò:</strong>
                <p>{{ user.role?.name || 'Chưa xác định' }}</p>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-clock"></i>
              <div>
                <strong>Ngày tạo:</strong>
                <p>{{ new Date(user.created_at).toLocaleDateString('vi-VN') }}</p>
              </div>
            </div>
            <div class="info-item">
              <i class="fas fa-check-circle"></i>
              <div>
                <strong>Trạng thái:</strong>
                <p :class="{ 'active': user.active, 'inactive': !user.active }">
                  {{ user.active ? 'Đang hoạt động' : 'Không hoạt động' }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1000px;
  margin: 2rem auto;
  padding: 0 1rem;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i, .error i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error {
  color: #dc3545;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn:hover {
  background-color: #c82333;
}

.profile-content {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.profile-header {
  background: linear-gradient(135deg, #008053 0%, #006040 100%);
  color: white;
  padding: 2rem;
  text-align: center;
}

.avatar {
  width: 120px;
  height: 120px;
  margin: 0 auto 1rem;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid rgba(255, 255, 255, 0.3);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.profile-header h2 {
  margin: 0;
  font-size: 1.8rem;
}

.title {
  margin: 0.5rem 0 0;
  opacity: 0.9;
}

.profile-info {
  padding: 2rem;
}

.info-section h3 {
  color: #008053;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #f0f0f0;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.info-item i {
  color: #008053;
  font-size: 1.2rem;
  margin-top: 0.2rem;
}

.info-item strong {
  display: block;
  color: #666;
  margin-bottom: 0.2rem;
}

.info-item p {
  margin: 0;
  color: #333;
}

.pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #008053;
  text-decoration: none;
  padding: 0.3rem 0.8rem;
  border-radius: 4px;
  background-color: rgba(0, 128, 83, 0.1);
  transition: all 0.3s ease;
}

.pdf-link:hover {
  background-color: rgba(0, 128, 83, 0.2);
  color: #006040;
}

.active {
  color: #28a745;
}

.inactive {
  color: #dc3545;
}

@media (max-width: 768px) {
  .profile-container {
    margin: 1rem auto;
  }

  .profile-header {
    padding: 1.5rem;
  }

  .avatar {
    width: 100px;
    height: 100px;
  }

  .profile-info {
    padding: 1.5rem;
  }

  .info-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
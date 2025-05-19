<script setup lang="ts">
import { ref, onMounted } from 'vue';
import {  useRouter } from 'vue-router';
import type { User } from '../../models/User';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';


const router = useRouter();
const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);

const fetchUserDetails = async () => {
  try {
    
    loading.value = true;
    error.value = null;

    
    const currentUser = authService.getCurrentUser();

    console.log("currentUser:", currentUser);

    
      if (!currentUser?.id) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
      user.value = await userService.getUserById(currentUser.id);
      console.log("user:", user.value);
    
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải thông tin người dùng';
  } finally {
    loading.value = false;
  }
  
};

const handleLogout = async () => {
  try {
    await authService.logout();
  } finally {
    router.push('/login');
  }
};
onMounted(fetchUserDetails);
onMounted(async () => {
  const reloaded = localStorage.getItem('hasReloaded');

  if (!reloaded) {
    localStorage.setItem('hasReloaded', 'true'); // đánh dấu đã reload
    window.location.reload(); // reload 1 lần duy nhất
  } else {
    localStorage.removeItem('hasReloaded'); // xóa để lần sau không reload nữa
    await fetchUserDetails(); // chỉ fetch sau reload
  }
});
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
      <div class="profile-sidebar">
        <div class="profile-card">
          <div class="avatar-wrapper">
            <div class="avatar">
              <img 
                :src="user.avatar || '/images/avatar.webp'" 
                :alt="user.full_name"
                @error="(e) => (e.target as HTMLImageElement).src = '/images/avatar.webp'"
              >
            </div>
          </div>
          <div class="user-basic-info">
            <div class="name-status">
              <h2>{{ user.full_name }}</h2>
              <div class="status-dot" :class="{ 'active': user.active }" :title="user.active ? 'Đang hoạt động' : 'Không hoạt động'">
                <i class="fas fa-circle"></i>
              </div>
            </div>
            <p class="title">{{ user.title }}</p>
            <p class="specialty">
              <i class="fas fa-graduation-cap"></i>
              {{ user.specialty }}
            </p>
          </div>
          <div class="quick-stats">
            <div class="stat-item">
              <i class="fas fa-comment-dots"></i>
              <span>Lời khuyên</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-star"></i>
              <span>Đánh giá</span>
            </div>
            <div class="stat-item">
              <i class="fas fa-file-alt"></i>
              <span>Báo cáo</span>
            </div>
          </div>
          <div class="action-buttons">
            <button @click="router.push('/profile/edit')" class="action-btn edit-btn">
              <i class="fas fa-edit"></i>
              <span>Chỉnh sửa</span>
            </button>
            <button @click="router.push('/change-password')" class="action-btn password-btn">
              <i class="fas fa-key"></i>
              <span>Đổi mật khẩu</span>
            </button>
            <button @click="handleLogout" class="action-btn logout-btn">
              <i class="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
            </button>
          </div>
        </div>
      </div>

      <div class="profile-main">
        <div class="info-card">
          <div class="card-header">
            <h3><i class="fas fa-user-circle"></i> Thông tin cá nhân</h3>
          </div>
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
          </div>

          <div class="card-header">
            <h3><i class="fas fa-tasks"></i> Quản lý</h3>
          </div>
          <div class="management-grid">
            <router-link to="/profile/advice" class="management-item advice">
              <i class="fas fa-comment-dots"></i>
              <span>Quản lý lời khuyên</span>
            </router-link>
            <router-link to="/profile/report" class="management-item report">
              <i class="fas fa-file-alt"></i>
              <span>Quản lý báo cáo</span>
            </router-link>
            <router-link to="/profile/evalue" class="management-item evalue">
              <i class="fas fa-star"></i>
              <span>Quản lý đánh giá</span>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 6rem 1rem 2rem;
}

.loading, .error {
  text-align: center;
  padding: 3rem;
  color: #666;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.loading i, .error i {
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: #008053;
}

.error {
  color: #dc3545;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.profile-content {
  display: grid;
  grid-template-columns: 350px 1fr;
  gap: 2rem;
  min-height: calc(100vh - 8rem);
}

.profile-sidebar {
  display: flex;
  flex-direction: column;
}

.profile-card, .info-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.profile-card {
  text-align: center;
}

.profile-main {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.info-card {
  display: flex;
  flex-direction: column;
}

.info-grid {
  flex: 1;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
}

.management-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: auto;
}

.avatar-wrapper {
  position: relative;
  width: 180px;
  margin: 0 auto 1.5rem;
}

.avatar {
  width: 180px;
  height: 180px;
  border-radius: 50%;
  overflow: hidden;
  border: 4px solid #008053;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.name-status {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  margin-bottom: 0.5rem;
}

.status-dot {
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: help;
}

.status-dot i {
  font-size: 0.75rem;
  color: #dc3545;
  transition: all 0.3s ease;
}

.status-dot.active i {
  color: #28a745;
}

.status-dot:hover i {
  transform: scale(1.2);
}

.user-basic-info h2 {
  margin: 0;
  font-size: 1.8rem;
  color: #2c3e50;
}

.title {
  margin: 0.5rem 0;
  font-size: 1.1rem;
  color: #008053;
}

.specialty {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #666;
  font-size: 1rem;
}

.quick-stats {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.stat-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.stat-item i {
  font-size: 1.5rem;
  color: #008053;
}

.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid #eee;
}

.action-btn {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 1rem;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
  color: white;
}

.edit-btn {
  background-color: #00a067;
}

.edit-btn:hover {
  background-color: #006040;
  transform: translateY(-2px);
}

.password-btn {
  background-color: #00a067;
}

.password-btn:hover {
  background-color: #008053;
  transform: translateY(-2px);
}

.logout-btn {
  background-color: #dc3545;
}

.logout-btn:hover {
  background-color: #c82333;
  transform: translateY(-2px);
}

.card-header {
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.card-header:not(:first-child) {
  margin-top: 2rem;
}

.info-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.info-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
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
  font-size: 0.9rem;
}

.info-item p {
  margin: 0;
  color: #333;
  font-size: 1.1rem;
}

.pdf-link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  color: #008053;
  text-decoration: none;
  padding: 0.5rem 1rem;
  border-radius: 6px;
  background-color: rgba(0, 128, 83, 0.1);
  transition: all 0.3s ease;
}

.pdf-link:hover {
  background-color: rgba(0, 128, 83, 0.2);
  color: #006040;
  transform: translateY(-2px);
}

.management-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1.5rem;
  border-radius: 12px;
  color: white;
  text-decoration: none;
  transition: all 0.3s ease;
}

.management-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
}

.management-item i {
  font-size: 1.5rem;
}

.management-item span {
  font-weight: 500;
}

.advice {
  background: linear-gradient(135deg, #00a067 0%, #00a067 100%);
}

.report {
  background: linear-gradient(135deg, #00a067 0%, #00a067 100%);
}

.evalue {
  background: linear-gradient(135deg, #00a067 0%, #00a067 100%);
}

@media (max-width: 1024px) {
  .profile-content {
    grid-template-columns: 1fr;
  }

  .profile-sidebar {
    max-width: 500px;
    margin: 0 auto;
  }
}

@media (max-width: 768px) {
  .profile-container {
    margin: 1rem auto;
  }

  .avatar-wrapper {
    width: 150px;
  }

  .avatar {
    width: 150px;
    height: 150px;
  }

  .info-grid, .management-grid {
    grid-template-columns: 1fr;
  }

  .management-item {
    padding: 1rem;
  }
}
</style> 
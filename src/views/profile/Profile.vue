<script setup lang="ts">
import { ref, onMounted, computed, onUnmounted } from 'vue';
import {  useRouter } from 'vue-router';
import type { User } from '../../models/User';
import { authService } from '../../services/auth.service';
import { userService } from '../../services/user.service';
import { notifyService } from '../../services/notify.service';
import type { Notify } from '../../models/Notify';


const router = useRouter();
const user = ref<User | null>(null);
const loading = ref(true);
const error = ref<string | null>(null);
const notifications = ref<Notify[]>([]);
const showNotifications = ref(false);
const currentPage = ref(1);
const itemsPerPage = 5;
const filterStatus = ref<'all' | 'unread' | 'read'>('all');
let refreshInterval: number | null = null;

const sortedNotifications = computed(() => {
  return [...notifications.value].sort((a, b) => {
    return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
  });
});

const filteredNotifications = computed(() => {
  switch (filterStatus.value) {
    case 'unread':
      return sortedNotifications.value.filter(n => !n.is_read);
    case 'read':
      return sortedNotifications.value.filter(n => n.is_read);
    default:
      return sortedNotifications.value;
  }
});

const paginatedNotifications = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  return filteredNotifications.value.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(filteredNotifications.value.length / itemsPerPage);
});

const changePage = (page: number) => {
  currentPage.value = page;
};

const changeFilter = (status: 'all' | 'unread' | 'read') => {
  filterStatus.value = status;
  currentPage.value = 1; // Reset về trang 1 khi thay đổi filter
};

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

const fetchNotifications = async () => {
  try {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) {
      console.error('User not logged in');
      return;
    }

    const response = await notifyService.getNotifyByUser(currentUser.id);
    console.log("Notifications response:", response);
    if (response) {
      notifications.value = response;
    }
  } catch (error) {
    console.error('Error fetching notifications:', error);
  }
};

const markAsRead = async (notification: Notify) => {
  try {
    if (!notification.is_read) {
      const updatedNotification = await notifyService.markAsRead(notification.notify_id);
      console.log("Updated notification:", updatedNotification);
      
      // Cập nhật thông báo trong danh sách
      const index = notifications.value.findIndex(n => n.notify_id === notification.notify_id);
      if (index !== -1) {
        notifications.value[index] = updatedNotification;
      }
    }
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

const deleteNotification = async (notification: Notify) => {
  try {
    await notifyService.deleteNotification(notification.notify_id);
    // Cập nhật lại danh sách thông báo
    await fetchNotifications();
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

const handleLogout = async () => {
  try {
    await authService.logout();
  } finally {
    router.push('/login');
  }
};
onMounted(() => {
  fetchUserDetails();
  fetchNotifications();
});
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

        <!-- Notifications Card -->
        <div class="notifications-card">
          <div class="card-header">
            <h3><i class="fas fa-bell"></i> Thông báo</h3>
            <div class="notification-stats">
              <span class="unread-count" v-if="notifications.filter(n => !n.is_read).length > 0">
                {{ notifications.filter(n => !n.is_read).length }} thông báo chưa đọc
              </span>
            </div>
          </div>
          
          <!-- Filter Buttons -->
          <div class="notification-filters">
            <button 
              class="filter-btn" 
              :class="{ active: filterStatus === 'all' }"
              @click="changeFilter('all')"
            >
              Tất cả
            </button>
            <button 
              class="filter-btn" 
              :class="{ active: filterStatus === 'unread' }"
              @click="changeFilter('unread')"
            >
              Chưa đọc
            </button>
            <button 
              class="filter-btn" 
              :class="{ active: filterStatus === 'read' }"
              @click="changeFilter('read')"
            >
              Đã đọc
            </button>
          </div>
          
          <div class="notifications-list">
            <div v-if="filteredNotifications.length === 0" class="no-notifications">
              <i class="fas fa-bell-slash"></i>
              <p>{{ filterStatus === 'all' ? 'Không có thông báo nào' : 
                   filterStatus === 'unread' ? 'Không có thông báo chưa đọc' : 
                   'Không có thông báo đã đọc' }}</p>
            </div>
            
            <div 
              v-for="notification in paginatedNotifications" 
              :key="notification.notify_id"
              class="notification-item"
              :class="{ 'unread': !notification.is_read }"
              @click="markAsRead(notification)"
            >
              <div class="notification-content">
                <div class="notification-header">
                  <h4>
                    {{ notification.title }}
                    <span v-if="!notification.is_read" class="unread-badge">
                      <i class="fas fa-circle"></i> Chưa đọc
                    </span>
                  </h4>
                  <span class="notification-time">
                    {{ new Date(notification.created_at).toLocaleString() }}
                  </span>
                </div>
                <p>{{ notification.content }}</p>
              </div>
              <button class="delete-btn" @click.stop="deleteNotification(notification)">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="totalPages > 1" class="pagination">
            <button 
              class="page-btn" 
              :disabled="currentPage === 1"
              @click="changePage(currentPage - 1)"
            >
              <i class="fas fa-chevron-left"></i>
            </button>
            
            <button 
              v-for="page in totalPages" 
              :key="page"
              class="page-btn"
              :class="{ active: currentPage === page }"
              @click="changePage(page)"
            >
              {{ page }}
            </button>
            
            <button 
              class="page-btn" 
              :disabled="currentPage === totalPages"
              @click="changePage(currentPage + 1)"
            >
              <i class="fas fa-chevron-right"></i>
            </button>
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
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.notification-stats {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.unread-count {
  background: #008053;
  color: white;
  padding: 0.25rem 0.75rem;
  border-radius: 12px;
  font-size: 0.9rem;
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

.notifications-card {
  background: white;
  border-radius: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  padding: 2rem;
  margin-top: 2rem;
}

.notifications-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.no-notifications {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.no-notifications i {
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #008053;
}

.notification-item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem;
  border-radius: 8px;
  background: #f8f9fa;
  cursor: pointer;
  transition: all 0.3s ease;
  position: relative;
  border-left: 4px solid transparent;
}

.notification-item.unread {
  background: #f0f7f4;
  border-left: 4px solid #008053;
}

.notification-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.notification-item.unread:hover {
  background: #e8f5f0;
}

.notification-content {
  flex: 1;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0.5rem;
}

.notification-header h4 {
  margin: 0;
  font-size: 1rem;
  color: #2c3e50;
}

.notification-time {
  font-size: 0.85rem;
  color: #666;
}

.notification-content p {
  margin: 0;
  color: #666;
  font-size: 0.95rem;
  line-height: 1.4;
}

.delete-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.5rem;
  margin-left: 1rem;
  opacity: 0.6;
  transition: all 0.3s ease;
}

.delete-btn:hover {
  opacity: 1;
  transform: scale(1.1);
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.page-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2.5rem;
  height: 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
}

.page-btn:hover:not(:disabled) {
  background: #f8f9fa;
  border-color: #008053;
  color: #008053;
}

.page-btn.active {
  background: #008053;
  border-color: #008053;
  color: white;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.unread-badge {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
  padding: 0.2rem 0.5rem;
  background: #008053;
  color: white;
  border-radius: 12px;
  font-size: 0.75rem;
  margin-left: 0.5rem;
  font-weight: normal;
}

.unread-badge i {
  font-size: 0.5rem;
}

.notification-filters {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #eee;
}

.filter-btn {
  padding: 0.5rem 1rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: white;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.filter-btn:hover {
  background: #f8f9fa;
  border-color: #008053;
  color: #008053;
}

.filter-btn.active {
  background: #008053;
  border-color: #008053;
  color: white;
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

  .notifications-card {
    padding: 1rem;
  }

  .notification-item {
    padding: 0.75rem;
  }

  .notification-header h4 {
    font-size: 0.95rem;
  }

  .notification-content p {
    font-size: 0.9rem;
  }

  .pagination {
    gap: 0.25rem;
  }

  .page-btn {
    width: 2rem;
    height: 2rem;
    font-size: 0.9rem;
  }

  .notification-filters {
    flex-wrap: wrap;
    gap: 0.5rem;
  }

  .filter-btn {
    flex: 1;
    min-width: calc(33.333% - 0.5rem);
    text-align: center;
    padding: 0.5rem;
    font-size: 0.85rem;
  }
}
</style> 
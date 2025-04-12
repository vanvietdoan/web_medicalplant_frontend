<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import type { Login, User } from '../models/User';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

const router = useRouter();
const isLoggedIn = ref(authService.isAuthenticated());
const currentUser = ref<Login | null>(null);
const userDetails = ref<User | null>(null);

// Đăng xuất
const handleLogout = () => {
  authService.logout();
  isLoggedIn.value = false;
  currentUser.value = null;
  userDetails.value = null;
  router.push('/login');
};

const handleProfile = () => {
  router.push('/profile');
};

// Khi component được mount, kiểm tra nếu đã đăng nhập thì lấy thông tin người dùng
onMounted(async () => {
  if (isLoggedIn.value) {
    currentUser.value = authService.getCurrentUser() as Login | null;
    if (currentUser.value?.id) {
      try {
        userDetails.value = await userService.getUserById(currentUser.value.id);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
  }
});
</script>

<template>
  <header class="header">
    <div class="header-container">
      <div class="logo">
        <router-link to="/">
          <img src="/images/logo.png" alt="Y Học Cổ Truyền" class="logo-img">
        </router-link>
      </div>
      <nav class="nav-menu">
        <router-link to="/" class="nav-item">Trang chủ</router-link>
        <router-link to="/medicinal-plants" class="nav-item">Cây thuốc</router-link>
        <router-link to="/common-diseases" class="nav-item">Bệnh thường gặp</router-link>
      </nav>

      <div class="auth-buttons">
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="btn btn-login">Đăng nhập</router-link>
          <router-link to="/register" class="btn btn-register">Đăng ký</router-link>
        </template>
        <template v-else>
          <div class="user-menu">
            <button @click="handleProfile" class="btn btn-profile">
              <i class="fas fa-user"></i>
              {{ userDetails?.full_name || 'Tài khoản' }}
            </button>
            <button @click="handleLogout" class="btn btn-logout">
              <i class="fas fa-sign-out-alt"></i>
              Đăng xuất
            </button>
          </div>
        </template>
      </div>
    </div>
  </header>
</template>

<style scoped>
.header {
  background-color: #ffffff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
}

.header-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  height: 80px;
  overflow: hidden;
}

.logo a {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

.logo-img {
  width: 150px;
  margin-top: -35px;
}

.nav-menu {
  display: flex;
  gap: 2rem;
}

.nav-item {
  color: #2c3e50;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s;
}

.nav-item:hover,
.nav-item.router-link-active {
  color: #42b883;
}

.auth-buttons {
  display: flex;
  gap: 1rem;
}

.btn {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.3s;
}

.btn-login {
  color: #42b883;
  border: 1px solid #42b883;
}

.btn-login:hover {
  background-color: #42b883;
  color: white;
}

.btn-register {
  background-color: #42b883;
  color: white;
}

.btn-register:hover {
  background-color: #3aa876;
}

.btn-logout {
  background-color: #dc3545;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: background-color 0.3s;
}

.btn-logout:hover {
  background-color: #c82333;
}

.user-menu {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.user-name {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  background-color: rgba(0, 128, 83, 0.1);
  transition: all 0.3s ease;
}

.user-name:hover {
  background-color: rgba(0, 128, 83, 0.2);
  color: #006040;
}

.btn-profile {
  background-color: #42b883;
  color: white;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
}

.btn-profile:hover {
  background-color: #3aa876;
}

@media (max-width: 768px) {
  .user-menu {
    flex-direction: column;
    gap: 0.5rem;
  }

  .user-name,
  .btn-logout {
    width: 100%;
    justify-content: center;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import type { Login, User } from '../models/User';
import { authService } from '../services/auth.service';
import { userService } from '../services/user.service';

const router = useRouter();
const isLoggedIn = ref(authService.isAuthenticated());
const currentUser = ref<Login | null>(null);
const userDetails = ref<User | null>(null);
const isMenuOpen = ref(false);

// Hàm để cập nhật thông tin người dùng
const updateUserInfo = async () => {
  try {
    if (isLoggedIn.value) {
      const user = authService.getCurrentUser() as Login | null;
      if (user) {
        currentUser.value = user;
        if (user.id) {
          userDetails.value = await userService.getUserById(user.id);
        }
      } else {
        handleLogout();
      }
    }
  } catch (error) {
    console.error('Error fetching user details:', error);
    handleLogout();
  }
};

// Đăng xuất
const handleLogout = async () => {
  try {
    await authService.logout();
  } finally {
    isLoggedIn.value = false;
    currentUser.value = null;
    userDetails.value = null;
    router.push('/login');
  }
};

const handleProfile = () => {
  router.push('/profile');
  isMenuOpen.value = false;
};

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

// Theo dõi thay đổi trạng thái đăng nhập
watch(isLoggedIn, async (newValue) => {
  if (newValue) {
    await updateUserInfo();
  }
});

// Khi component được mount, kiểm tra nếu đã đăng nhập thì lấy thông tin người dùng
onMounted(async () => {
  await updateUserInfo();
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

      <!-- Mobile menu button -->
      <button class="menu-toggle" @click="toggleMenu" :class="{ 'active': isMenuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>

      <!-- Navigation menu -->
      <nav class="nav-menu" :class="{ 'active': isMenuOpen }">
        <router-link to="/" class="nav-item" @click="isMenuOpen = false">Trang chủ</router-link>
        <router-link to="/plant" class="nav-item" @click="isMenuOpen = false">Cây thuốc</router-link>
        <router-link to="/disease" class="nav-item" @click="isMenuOpen = false">Bệnh thường gặp</router-link>    
        <router-link to="/search" class="nav-item" @click="isMenuOpen = false">Tra cứu</router-link>
        <router-link to="/app" class="nav-item" @click="isMenuOpen = false">Tải app</router-link>
      </nav>

      <div class="auth-buttons" :class="{ 'active': isMenuOpen }">
        <template v-if="!isLoggedIn">
          <router-link to="/login" class="btn btn-login" @click="isMenuOpen = false">Đăng nhập</router-link>
          <router-link to="/register" class="btn btn-register" @click="isMenuOpen = false">Đăng ký</router-link>
        </template>
        <template v-else>
          <div class="user-menu">
            <button @click="handleProfile" class="btn btn-profile">
              <i class="fas fa-user"></i>
              <span class="user-name-text">{{ userDetails?.full_name || 'Tài khoản' }}</span>
            </button>
            <button @click="handleLogout" class="btn btn-logout">
              <i class="fas fa-sign-out-alt"></i>
              <span>Đăng xuất</span>
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
  position: relative;
}

.logo {
  height: 80px;
  overflow: hidden;
  z-index: 2;
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

.menu-toggle {
  display: none;
  flex-direction: column;
  justify-content: space-between;
  width: 30px;
  height: 21px;
  background: transparent;
  border: none;
  cursor: pointer;
  padding: 0;
  z-index: 2;
}

.menu-toggle span {
  width: 100%;
  height: 3px;
  background-color: #2c3e50;
  border-radius: 3px;
  transition: all 0.3s ease;
}

.menu-toggle.active span:nth-child(1) {
  transform: translateY(9px) rotate(45deg);
}

.menu-toggle.active span:nth-child(2) {
  opacity: 0;
}

.menu-toggle.active span:nth-child(3) {
  transform: translateY(-9px) rotate(-45deg);
}

@media (max-width: 1024px) {
  .header-container {
    padding: 0.5rem 1rem;
  }

  .logo-img {
    width: 120px;
  }

  .nav-menu {
    gap: 1rem;
  }
}

@media (max-width: 768px) {
  .menu-toggle {
    display: flex;
  }

  .nav-menu {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: white;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1;
  }

  .nav-menu.active {
    transform: translateX(0);
  }

  .auth-buttons {
    position: fixed;
    bottom: 2rem;
    left: 0;
    right: 0;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
    padding: 0 1rem;
    transform: translateX(100%);
    transition: transform 0.3s ease;
    z-index: 1;
  }

  .auth-buttons.active {
    transform: translateX(0);
  }

  .user-menu {
    flex-direction: column;
    width: 100%;
  }

  .btn-profile,
  .btn-logout {
    width: 100%;
    justify-content: center;
  }

  .user-name-text {
    display: inline-block;
    max-width: 150px;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
}

@media (max-width: 480px) {
  .header-container {
    padding: 0.5rem;
  }

  .logo-img {
    width: 100px;
  }

  .btn {
    width: 100%;
    text-align: center;
  }
}
</style>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const isLoggedIn = ref(false);

const handleLogout = () => {
  // TODO: Implement logout logic
  isLoggedIn.value = false;
  router.push('/login');
};
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
        <button v-else @click="handleLogout" class="btn btn-logout">Đăng xuất</button>
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

.nav-item:hover {
  color: #42b883;
}

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
  cursor: pointer;
}

.btn-logout:hover {
  background-color: #c82333;
}

.logo-img {
  width: 150px;
  margin-top: -35px;
}

.logo-text {
  font-size: 1.5rem;
  font-weight: bold;
  color: #2c3e50;
  text-decoration: none;
}

</style> 
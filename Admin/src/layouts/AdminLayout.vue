<template>
  <div class="admin-layout">
    <header class="header">
      <div class="logo">
        <img src="../assets/logo.png" alt="Medical Plant" />
        <h1>Medical Plant Admin</h1>
      </div>
      <div class="user-info">
        <span>{{ currentUser?.name }}</span>
        <button @click="logout" class="logout-btn">Đăng xuất</button>
      </div>
    </header>

    <div class="container">
      <nav class="sidebar">
        <router-link to="/admin/dashboard" class="nav-item">
          <i class="fas fa-home"></i>
          Dashboard
        </router-link>
        <router-link to="/admin/plants" class="nav-item">
          <i class="fas fa-leaf"></i>
          Quản lý cây thuốc
        </router-link>
        <router-link to="/admin/diseases" class="nav-item">
          <i class="fas fa-disease"></i>
          Quản lý bệnh
        </router-link>
        <router-link to="/admin/comments" class="nav-item">
          <i class="fas fa-comments"></i>
          Quản lý bình luận
        </router-link>
        <router-link to="/admin/users" class="nav-item">
          <i class="fas fa-users"></i>
          Quản lý tài khoản
        </router-link>
      </nav>

      <main class="content">
        <router-view></router-view>
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const currentUser = ref({
  name: 'Admin'
})

const logout = () => {
  // Implement logout logic here
  router.push('/login')
}
</script>

<style scoped>
.admin-layout {
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}

.header {
  background: #4CAF50;
  color: white;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.logo {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo img {
  height: 40px;
}

.container {
  display: flex;
  flex: 1;
}

.sidebar {
  width: 250px;
  background: #f5f5f5;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.nav-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem;
  text-decoration: none;
  color: #333;
  border-radius: 4px;
  transition: background-color 0.2s;
}

.nav-item:hover,
.nav-item.router-link-active {
  background: #e0e0e0;
}

.content {
  flex: 1;
  padding: 2rem;
  background: #fff;
}

.logout-btn {
  padding: 0.5rem 1rem;
  background: #fff;
  color: #4CAF50;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.logout-btn:hover {
  background: #f0f0f0;
}
</style> 
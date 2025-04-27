<script setup lang="ts">
import { Collection, Warning, ChatDotRound, User, SwitchButton } from '@element-plus/icons-vue'
import { useAuth } from '../composables/useAuth'
import { authService } from '../services/auth.service'
import { computed } from 'vue'
import logoImage from '../assets/logo.png'

const { logout } = useAuth()

const currentUser = computed(() => {
  return authService.getCurrentUser()
})

const handleLogout = () => {
  logout()
}
</script>

<template>
  <el-container class="admin-layout">
    <el-aside width="200px">
      <div class="logo-container">
        <img :src="logoImage" alt="Logo" class="logo">
      </div>
      <el-menu
        :router="true"
        :default-active="$route.path"
        class="admin-menu"
      >
      <el-menu-item index="/admin/statistics">
          <el-icon><PieChart /></el-icon>
          <span>Thống kê</span>
        </el-menu-item>
        
        <el-menu-item index="/admin/plants">
          <el-icon><Collection /></el-icon>
          <span>Cây thuốc</span>
        </el-menu-item>


        <el-menu-item index="/admin/diseases">
          <el-icon><Warning /></el-icon>
          <span>Bệnh</span>
        </el-menu-item>


        <el-menu-item index="/admin/advices">
          <el-icon><ChatDotRound /></el-icon>
          <span> Lời khuyên</span>
        </el-menu-item>

        <!-- <el-menu-item index="/admin/comments">
          <el-icon><ChatDotRound /></el-icon>
          <span>....</span>
        </el-menu-item> -->



        <el-sub-menu index="1">
  <template #title>
    <el-icon><Operation /></el-icon>
    <span>Phân loại</span>
  </template>

  <el-menu-item index="/admin/filter/division">Ngành</el-menu-item>
  <el-menu-item index="/admin/filter/class">Lớp</el-menu-item>
  <el-menu-item index="/admin/filter/order">Bộ</el-menu-item>
  <el-menu-item index="/admin/filter/family">Họ</el-menu-item>
  <el-menu-item index="/admin/filter/genus">Chi</el-menu-item>
  <el-menu-item index="/admin/filter/species">Loài</el-menu-item>
</el-sub-menu>




        <el-menu-item index="/admin/users">
          <el-icon><User /></el-icon>
          <span>Tài khoản</span>


        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header>
        <div class="header-content">
          <h2>Xin chào, {{ currentUser?.full_name || 'Admin' }}</h2>
          <el-button type="danger" @click="handleLogout">
            <el-icon><SwitchButton /></el-icon>
            Đăng xuất
          </el-button>
        </div>
      </el-header>
      <el-main>
        <router-view></router-view>
      </el-main>
    </el-container>
  </el-container>
</template>


<style scoped lang="scss">
.admin-layout {
  height: 200vh;
  
  .logo-container {
    text-align: center;
    padding: 1rem;
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;

    .logo {
      width: 120px;
      height: auto;
      object-fit: contain;

    }
  }
  
  .admin-menu {
    height: calc(100% - 200px);
    border-right: none;
  }
  
  .el-header {
    background-color: #fff;
    border-bottom: 1px solid #dcdfe6;
    padding: 0 20px;
    height: 100px;
    
    .header-content {
      height: 100px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      
      h2 {
        margin: 0;
      }
    }
  }
  
  .el-main {
    background-color: #f5f7fa;
    padding: 20px;
  }
}
</style> 
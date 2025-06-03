<template>
  <div class="app-download-container">
    <div class="download-content">
      <h1 class="title">Tải ứng dụng của chúng tôi</h1>
      <p class="description">
        Trải nghiệm ứng dụng di động với nhiều tính năng hữu ích và giao diện thân thiện
      </p>
      
      <div class="download-buttons">
        <a href="https://medicalplant.apivui.click/uploads/app/app.apk" class="download-btn android">
          <i class="fab fa-android"></i>
          <span>Tải cho Android</span>
        </a>
      </div>

      <div class="app-features">
        <div class="feature">
          <i class="fas fa-bolt"></i>
          <h3>Nhanh chóng</h3>
          <p>Truy cập nhanh chóng và dễ dàng</p>
        </div>
        <div class="feature">
          <i class="fas fa-shield-alt"></i>
          <h3>Bảo mật</h3>
          <p>Bảo vệ thông tin của bạn</p>
        </div>
        <div class="feature">
          <i class="fas fa-sync"></i>
          <h3>Cập nhật</h3>
          <p>Luôn được cập nhật mới nhất</p>
        </div>
        <div class="feature">
          <i class="fas fa-user-check"></i>
          <h3>Đăng ký</h3>
          <p>Đăng ký tài khoản để sử dụng ứng dụng</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppDownload',
  data() {
    return {
      // Add any data properties here if needed
    }
  }
}
</script>

<style scoped>
.app-download-container {
  min-height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
  padding: 2rem;
}

.download-content {
  max-width: 1200px;
  text-align: center;
  padding: 2rem;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.title {
  font-size: 2.5rem;
  color: #2c3e50;
  margin-bottom: 1rem;
}

.description {
  font-size: 1.2rem;
  color: #666;
  margin-bottom: 2rem;
}

.download-buttons {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.download-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 10px;
  text-decoration: none;
  font-weight: bold;
  transition: transform 0.3s ease;
}

.download-btn:hover {
  transform: translateY(-3px);
}

.android {
  background: #008053;
  color: white;
}

.app-features {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-top: 2rem;
}

.feature {
  padding: 1.5rem;
  background: #f8f9fa;
  border-radius: 15px;
  transition: transform 0.3s ease;
}

.feature:hover {
  transform: translateY(-5px);
}

.feature i {
  font-size: 2rem;
  color: #008053;
  margin-bottom: 1rem;
}

.feature h3 {
  color: #2c3e50;
  margin-bottom: 0.5rem;
}

.feature p {
  color: #666;
}

@media (max-width: 768px) {
  .title {
    font-size: 2rem;
  }
  
  .description {
    font-size: 1rem;
  }
}
</style>
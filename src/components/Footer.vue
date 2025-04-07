<script setup lang="ts">
</script>

<template>
  <footer class="footer">
    <div class="footer-container">
      <div class="footer-section">
        <h3>Về chúng tôi</h3>
        <p>Y Học Cổ Truyền - Nơi chia sẽ kiến thức y học cổ truyền Việt Nam</p>
      </div>
      <div class="footer-section">
        <h3>Liên hệ</h3>
        <p>Email: contact@yhoctruyen.com</p>
        <p>Điện thoại: (84) 123-456-789</p>
        <p>Địa chỉ: 123 Đường Nguyễn Lương Bằng, Quận Liên Chiểu, TP.Đà Nẵng</p>
      </div>
      <div class="footer-section">
        <h3>Theo dõi chúng tôi</h3>
        <div class="social-links">
          <a href="#" class="social-link">
            <i class="fab fa-facebook"></i>
            <span>Facebook</span>
          </a>
          <a href="#" class="social-link">
            <i class="fab fa-instagram"></i>
            <span>Instagram</span>
          </a>
          <a href="#" class="social-link">
            <i class="fab fa-youtube"></i>
            <span>Youtube</span>
          </a>
        </div>
      </div>
    </div>
    <div class="footer-bottom">
      <p>&copy; 2024 Y Học Cổ Truyền. All rights reserved.</p>
    </div>
  </footer>
</template>

<style scoped>
.footer {
  background-color: #008053;
  color: #ffffff;
  padding: 3rem 0 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
}

.footer-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 3rem;
}

.footer-section h3 {
  color: #FFE4C4;
  margin-bottom: 1.5rem;
  font-size: 1.3rem;
  font-weight: 600;
  position: relative;
}

.footer-section h3::after {
  content: '';
  position: absolute;
  left: 0;
  bottom: -0.5rem;
  width: 50px;
  height: 2px;
  background-color: #FFE4C4;
}

.footer-section p {
  margin-bottom: 0.8rem;
  line-height: 1.8;
  font-size: 0.95rem;
  opacity: 0.9;
}

.social-links {
  display: flex;
  gap: 1.5rem;
}

.social-link {
  color: #ffffff;
  text-decoration: none;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.social-link i {
  font-size: 1.2rem;
}

.social-link:hover {
  color: #FFE4C4;
  transform: translateY(-2px);
}

.footer-bottom {
  text-align: center;
  margin-top: 3rem;
  padding-top: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  font-size: 0.9rem;
  opacity: 0.8;
}

@media (max-width: 768px) {
  .footer-container {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding: 0 1.5rem;
  }

  .footer-section {
    text-align: center;
  }

  .footer-section h3::after {
    left: 50%;
    transform: translateX(-50%);
  }

  .social-links {
    justify-content: center;
  }
}
</style>
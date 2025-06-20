<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Tra cứu cây thuốc</h2>
      <button v-if="messages.length > 0" @click="clearChatHistory" class="clear-history-btn">
        <i class="fas fa-trash"></i>
        Xóa lịch sử
      </button>
    </div>
    
    <div class="chat-messages" ref="messageContainer">
      <div v-if="messages.length === 0" class="welcome-message">
        <div class="welcome-content">
          <h3>Chào mừng bạn đến với hệ thống tra cứu cây thuốc!</h3>
          <p>Bạn có thể hỏi về:</p>
          <ul>
            <li>Công dụng của các loại cây thuốc</li>
            <li>Cách sử dụng và liều lượng</li>
            <li>Bài thuốc chữa bệnh</li>
            <li>Thông tin về các loại bệnh</li>
          </ul>
          <p>Ví dụ: "Cây thuốc nào chữa đau dạ dày?"</p>
        </div>
      </div>
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.type === 'user' ? 'user-message' : 'bot-message']">
        <div v-if="message.type === 'bot'" class="bot-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
          {{ message.content }}
        </div>
        <div v-if="message.type === 'user'" class="user-avatar">
          <img 
            :src="currentUser?.avatar || '/images/avatar.webp'" 
            :alt="currentUser?.full_name || 'Người dùng'"
            @error="(e) => (e.target as HTMLImageElement).src = '/images/avatar.webp'"
          >
        </div>
      </div>
      <div v-if="loading" class="message bot-message">
        <div class="bot-avatar">
          <i class="fas fa-robot"></i>
        </div>
        <div class="message-content">
          <div class="loading-dots">
            <span></span>
            <span></span>
            <span></span>
          </div>
        </div>
      </div>
    </div>

    <div class="chat-input">
      <input 
        type="text" 
        v-model="userInput" 
        @keyup.enter="sendMessage"
        placeholder="Nhập câu hỏi của bạn..."
        :disabled="loading"
      >
      <button @click="sendMessage" :disabled="!userInput.trim() || loading">
        {{ loading ? 'Đang xử lý...' : 'Gửi' }}
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'
import axios from 'axios'
import { authService } from '../../services/auth.service'
import { userService } from '../../services/user.service'
import type { User } from '../../models/User'

export default defineComponent({
  name: 'SearchScreen',
  data() {
    return {
      messages: [] as { type: string; content: string }[],
      userInput: '',
      loading: false,
      apiUrl: 'https://chat.apivui.click/chat/ask',
      currentUser: null as User | null,
      maxHistoryLength: 50 // Số lượng tin nhắn tối đa lưu trữ
    }
  },
  async created() {
    const currentUser = authService.getCurrentUser();
    if (currentUser?.id) {
      try {
        this.currentUser = await userService.getUserById(currentUser.id);
      } catch (error) {
        console.error('Error fetching user details:', error);
      }
    }
    this.loadChatHistory();
  },
  mounted() {
    // Thêm event listener để cập nhật user khi đăng nhập/đăng xuất
    window.addEventListener('storage', this.handleStorageChange);
  },
  beforeUnmount() {
    // Xóa event listener khi component bị hủy
    window.removeEventListener('storage', this.handleStorageChange);
  },
  methods: {
    async handleStorageChange(event: StorageEvent) {
      if (event.key === 'user') {
        const currentUser = authService.getCurrentUser();
        if (currentUser?.id) {
          try {
            this.currentUser = await userService.getUserById(currentUser.id);
          } catch (error) {
            console.error('Error fetching user details:', error);
          }
        } else {
          this.currentUser = null;
        }
      }
    },
    loadChatHistory() {
      try {
        const savedHistory = localStorage.getItem('chatHistory');
        if (savedHistory) {
          this.messages = JSON.parse(savedHistory);
          this.$nextTick(() => {
            this.scrollToBottom();
          });
        }
      } catch (error) {
        console.error('Error loading chat history:', error);
      }
    },
    saveChatHistory() {
      try {
        // Chỉ lưu số lượng tin nhắn tối đa
        const messagesToSave = this.messages.slice(-this.maxHistoryLength);
        localStorage.setItem('chatHistory', JSON.stringify(messagesToSave));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    },
    clearChatHistory() {
      this.messages = [];
      localStorage.removeItem('chatHistory');
    },
    async sendMessage() {
      if (!this.userInput.trim() || this.loading) return;

      const userMessage = this.userInput;
      this.userInput = '';
      
      // Add user message
      this.messages.push({
        type: 'user',
        content: userMessage
      });

      // Save history after adding user message
      this.saveChatHistory();

      this.loading = true;
      
      try {
        const response = await axios.post(this.apiUrl, {
          question: userMessage
        });

        // Add bot response
        this.messages.push({
          type: 'bot',
          content: response.data.answer || 'Xin lỗi, tôi không thể xử lý câu hỏi này.'
        });

        // Save history after adding bot response
        this.saveChatHistory();
      } catch (error) {
        console.error('Error sending message:', error);
        this.messages.push({
          type: 'bot',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.'
        });
        // Save history after adding error message
        this.saveChatHistory();
      } finally {
        this.loading = false;
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    },
    scrollToBottom() {
      const container = this.$refs.messageContainer as HTMLElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }
  }
})
</script>

<style scoped>
.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 60px); /* Trừ đi chiều cao của header */
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  background-color: #f0f2f5;
  margin-top: 60px; /* Thêm margin-top để tránh bị che bởi header */
}

.chat-header {
  text-align: center;
  padding: 20px 0;
  background-color: #2c3e50;
  color: white;
  border-radius: 10px 10px 0 0;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  position: sticky;
  top: 0;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
}

.chat-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
}

.clear-history-btn {
  position: absolute;
  right: 1rem;
  padding: 0.5rem 1rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: white;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.clear-history-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.5);
}

.clear-history-btn i {
  font-size: 0.9rem;
}

.welcome-message {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  padding: 20px;
}

.welcome-content {
  background-color: white;
  padding: 30px;
  border-radius: 15px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  max-width: 600px;
  width: 100%;
}

.welcome-content h3 {
  color: #2c3e50;
  margin-bottom: 20px;
  font-size: 1.3rem;
  text-align: center;
}

.welcome-content p {
  color: #666;
  margin-bottom: 15px;
  line-height: 1.6;
}

.welcome-content ul {
  list-style-type: none;
  padding: 0;
  margin: 0 0 20px 0;
}

.welcome-content li {
  color: #666;
  padding: 8px 0;
  padding-left: 25px;
  position: relative;
}

.welcome-content li:before {
  content: "•";
  color: #008053;
  position: absolute;
  left: 0;
  font-size: 1.2em;
}

.chat-messages {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background-color: #ffffff;
  border-radius: 0 0 10px 10px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
  margin-bottom: 20px; /* Thêm margin bottom để tránh bị che bởi input */
}

.message {
  margin-bottom: 15px;
  display: flex;
  align-items: flex-start;
  gap: 10px;
}

.user-message {
  flex-direction: row-reverse;
}

.user-message .message-content {
  background-color: #008053;
  color: white;
  border-radius: 15px 15px 0 15px;
}

.bot-message .message-content {
  background-color: #e8f5e9;
  color: #2c3e50;
  border-radius: 15px 15px 15px 0;
}

.user-avatar, .bot-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  overflow: hidden;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f0f0f0;
}

.user-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.bot-avatar {
  background: #008053;
  color: white;
  font-size: 1.2rem;
}

.chat-input {
  display: flex;
  gap: 10px;
  padding: 20px 0;
  background-color: #f0f2f5;
  position: sticky;
  bottom: 0;
  z-index: 10;
}

input {
  flex: 1;
  padding: 12px 20px;
  border: 2px solid #e0e0e0;
  border-radius: 25px;
  outline: none;
  font-size: 1rem;
  transition: border-color 0.3s;
}

input:focus {
  border-color: #008053;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  border-color: #e0e0e0;
}

button {
  padding: 12px 24px;
  background-color: #008053;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #006c46;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

button:disabled {
  background-color: #cccccc;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.loading-dots {
  display: flex;
  gap: 4px;
  padding: 8px 0;
}

.loading-dots span {
  width: 8px;
  height: 8px;
  background-color: #008053;
  border-radius: 50%;
  animation: bounce 1.4s infinite ease-in-out both;
}

.loading-dots span:nth-child(1) {
  animation-delay: -0.32s;
}

.loading-dots span:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes bounce {
  0%, 80%, 100% { 
    transform: scale(0);
  } 
  40% { 
    transform: scale(1.0);
  }
}

/* Custom scrollbar */
.chat-messages::-webkit-scrollbar {
  width: 6px;
}

.chat-messages::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb {
  background: #008053;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #006c46;
}

.message-content {
  padding: 12px 16px;
  max-width: 70%;
  font-size: 1.1rem;
  line-height: 1.5;
  word-wrap: break-word;
}

@media (max-width: 768px) {
  .message-content {
    max-width: 85%;
    font-size: 1rem;
    padding: 10px 14px;
  }
}
</style>

<template>
  <div class="chat-container">
    <div class="chat-header">
      <h2>Tra cứu cây thuốc</h2>
    </div>
    
    <div class="chat-messages" ref="messageContainer">
      <div v-for="(message, index) in messages" :key="index" 
           :class="['message', message.type === 'user' ? 'user-message' : 'bot-message']">
        <div class="message-content">
          {{ message.content }}
        </div>
      </div>
      <div v-if="loading" class="message bot-message">
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

export default defineComponent({
  name: 'SearchScreen',
  data() {
    return {
      messages: [] as { type: string; content: string }[],
      userInput: '',
      loading: false,
      apiUrl: 'http://157.20.58.220:8000/chat/ask'
    }
  },
  methods: {
    async sendMessage() {
      if (!this.userInput.trim() || this.loading) return;

      const userMessage = this.userInput;
      this.userInput = '';
      
      // Add user message
      this.messages.push({
        type: 'user',
        content: userMessage
      });

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
      } catch (error) {
        console.error('Error sending message:', error);
        this.messages.push({
          type: 'bot',
          content: 'Xin lỗi, đã có lỗi xảy ra. Vui lòng thử lại sau.'
        });
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
}

.chat-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
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
}

.message-content {
  padding: 12px 16px;
  border-radius: 15px;
  max-width: 70%;
  word-wrap: break-word;
  font-size: 0.95rem;
  line-height: 1.4;
}

.user-message {
  justify-content: flex-end;
}

.user-message .message-content {
  background-color: #4CAF50;
  color: white;
  border-bottom-right-radius: 5px;
}

.bot-message .message-content {
  background-color: #e8f5e9;
  color: #2c3e50;
  border-bottom-left-radius: 5px;
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
  border-color: #4CAF50;
}

input:disabled {
  background-color: #f5f5f5;
  cursor: not-allowed;
  border-color: #e0e0e0;
}

button {
  padding: 12px 24px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 25px;
  cursor: pointer;
  font-size: 1rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

button:hover:not(:disabled) {
  background-color: #45a049;
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
  background-color: #4CAF50;
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
  background: #4CAF50;
  border-radius: 3px;
}

.chat-messages::-webkit-scrollbar-thumb:hover {
  background: #45a049;
}
</style>

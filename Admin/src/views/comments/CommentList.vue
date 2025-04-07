<template>
  <div class="comment-list">
    <div class="header">
      <h2>Quản lý bình luận</h2>
      <div class="filter-buttons">
        <button 
          :class="['filter-btn', status === 'pending' ? 'active' : '']"
          @click="status = 'pending'"
        >
          Chờ duyệt
        </button>
        <button 
          :class="['filter-btn', status === 'approved' ? 'active' : '']"
          @click="status = 'approved'"
        >
          Đã duyệt
        </button>
        <button 
          :class="['filter-btn', status === 'rejected' ? 'active' : '']"
          @click="status = 'rejected'"
        >
          Đã từ chối
        </button>
      </div>
    </div>

    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Tìm kiếm bình luận..."
        @input="handleSearch"
      >
    </div>

    <table class="comment-table">
      <thead>
        <tr>
          <th>Người dùng</th>
          <th>Nội dung</th>
          <th>Cây thuốc/Bệnh</th>
          <th>Thời gian</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="comment in filteredComments" :key="comment.id">
          <td>{{ comment.user.name }}</td>
          <td>{{ comment.content }}</td>
          <td>
            <span class="reference-tag" :class="comment.referenceType">
              {{ comment.referenceName }}
            </span>
          </td>
          <td>{{ formatDate(comment.createdAt) }}</td>
          <td>
            <span :class="['status', comment.status]">
              {{ getStatusText(comment.status) }}
            </span>
          </td>
          <td>
            <div class="action-buttons">
              <template v-if="comment.status === 'pending'">
                <button @click="approveComment(comment.id)" class="btn-approve">
                  <i class="fas fa-check"></i>
                </button>
                <button @click="rejectComment(comment.id)" class="btn-reject">
                  <i class="fas fa-times"></i>
                </button>
              </template>
              <button @click="deleteComment(comment.id)" class="btn-delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- View Detail Modal -->
    <div v-if="showDetailModal" class="modal">
      <div class="modal-content">
        <h3>Chi tiết bình luận</h3>
        <div class="comment-detail">
          <div class="detail-row">
            <strong>Người dùng:</strong>
            <span>{{ selectedComment?.user.name }}</span>
          </div>
          <div class="detail-row">
            <strong>Email:</strong>
            <span>{{ selectedComment?.user.email }}</span>
          </div>
          <div class="detail-row">
            <strong>Thời gian:</strong>
            <span>{{ formatDate(selectedComment?.createdAt) }}</span>
          </div>
          <div class="detail-row">
            <strong>Nội dung:</strong>
            <p>{{ selectedComment?.content }}</p>
          </div>
          <div class="detail-row">
            <strong>Trạng thái:</strong>
            <span :class="['status', selectedComment?.status]">
              {{ getStatusText(selectedComment?.status) }}
            </span>
          </div>
        </div>
        <div class="modal-actions">
          <template v-if="selectedComment?.status === 'pending'">
            <button @click="approveComment(selectedComment?.id)" class="btn-approve">
              Duyệt
            </button>
            <button @click="rejectComment(selectedComment?.id)" class="btn-reject">
              Từ chối
            </button>
          </template>
          <button @click="closeModal" class="btn-cancel">Đóng</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'

interface User {
  id: number
  name: string
  email: string
}

interface Comment {
  id: number
  content: string
  user: User
  referenceType: 'plant' | 'disease'
  referenceName: string
  createdAt: Date
  status: 'pending' | 'approved' | 'rejected'
}

const comments = ref<Comment[]>([
  {
    id: 1,
    content: 'Cây này rất tốt cho việc điều trị viêm họng',
    user: {
      id: 1,
      name: 'Nguyễn Văn A',
      email: 'nguyenvana@example.com'
    },
    referenceType: 'plant',
    referenceName: 'Nghệ',
    createdAt: new Date(),
    status: 'pending'
  }
])

const status = ref<'pending' | 'approved' | 'rejected'>('pending')
const searchQuery = ref('')
const showDetailModal = ref(false)
const selectedComment = ref<Comment | null>(null)

const filteredComments = computed(() => {
  return comments.value.filter(comment => {
    const matchesStatus = comment.status === status.value
    const matchesSearch = searchQuery.value === '' || 
      comment.content.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
      comment.user.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    return matchesStatus && matchesSearch
  })
})

const formatDate = (date: Date | undefined) => {
  if (!date) return ''
  return new Date(date).toLocaleString('vi-VN')
}

const getStatusText = (status: string | undefined) => {
  switch (status) {
    case 'pending': return 'Chờ duyệt'
    case 'approved': return 'Đã duyệt'
    case 'rejected': return 'Đã từ chối'
    default: return ''
  }
}

const handleSearch = () => {
  // Implement search logic if needed
}

const viewDetail = (comment: Comment) => {
  selectedComment.value = comment
  showDetailModal.value = true
}

const approveComment = async (id: number) => {
  // Implement approve logic
  const comment = comments.value.find(c => c.id === id)
  if (comment) {
    comment.status = 'approved'
  }
  closeModal()
}

const rejectComment = async (id: number) => {
  // Implement reject logic
  const comment = comments.value.find(c => c.id === id)
  if (comment) {
    comment.status = 'rejected'
  }
  closeModal()
}

const deleteComment = async (id: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa bình luận này?')) {
    // Implement delete logic
    comments.value = comments.value.filter(comment => comment.id !== id)
  }
}

const closeModal = () => {
  showDetailModal.value = false
  selectedComment.value = null
}
</script>

<style scoped>
.comment-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filter-buttons {
  display: flex;
  gap: 10px;
}

.filter-btn {
  padding: 8px 16px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  cursor: pointer;
}

.filter-btn.active {
  background: #4CAF50;
  color: white;
  border-color: #4CAF50;
}

.search-bar {
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.comment-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.comment-table th,
.comment-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.reference-tag {
  display: inline-block;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 0.9em;
}

.reference-tag.plant {
  background: #e8f5e9;
  color: #4CAF50;
}

.reference-tag.disease {
  background: #fff3e0;
  color: #ff9800;
}

.status {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status.pending {
  background: #fff3e0;
  color: #ff9800;
}

.status.approved {
  background: #e8f5e9;
  color: #4CAF50;
}

.status.rejected {
  background: #ffebee;
  color: #f44336;
}

.action-buttons {
  display: flex;
  gap: 4px;
}

.btn-approve,
.btn-reject,
.btn-delete {
  padding: 4px 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-approve {
  background: #4CAF50;
}

.btn-reject {
  background: #f44336;
}

.btn-delete {
  background: #9e9e9e;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.comment-detail {
  margin: 20px 0;
}

.detail-row {
  margin-bottom: 15px;
}

.detail-row strong {
  display: block;
  margin-bottom: 5px;
  color: #666;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 
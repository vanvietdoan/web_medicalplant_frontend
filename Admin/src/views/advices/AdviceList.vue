<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Advice } from '../../models/Advice'
import { adviceService } from '../../services/advice.service'

// Router setup
const router = useRouter()

// State management
const advices = ref<Advice[]>([])
const loading = ref(false)
const searchQuery = ref('')

// Computed properties
const filteredAdvices = computed(() => {
  if (!searchQuery.value) return advices.value
  
  const query = searchQuery.value.toLowerCase()
  return advices.value.filter(advice =>
    advice.title.toLowerCase().includes(query) ||
    advice.content.toLowerCase().includes(query) ||
    advice.plant.name.toLowerCase().includes(query) ||
    advice.disease.name.toLowerCase().includes(query) ||
    advice.user.full_name.toLowerCase().includes(query)
  )
})

// Event handlers
const handleEdit = (advice: Advice) => {
  try {
    if (!advice) return
    router.push({
      name: 'advice-edit',
      params: { id: advice.advice_id }
    })
  } catch (error) {
    console.error('Error in handleEdit:', error)
    ElMessage.error('Không thể chuyển đến trang chỉnh sửa')
  }
}

const handleDelete = async (advice_id: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa lời khuyên này?')) {
      await adviceService.deleteAdvice(advice_id)
      ElMessage.success('Xóa lời khuyên thành công')
      await fetchAdvices()
    }
  } catch (error) {
    console.error('Error deleting advice:', error)
    ElMessage.error('Không thể xóa lời khuyên')
  }
}

const handleCreate = () => {
  try {
    router.push({ name: 'advice-create' })
  } catch (error) {
    console.error('Error in handleCreate:', error)
    ElMessage.error('Không thể chuyển đến trang tạo mới')
  }
}

// Data fetching
const fetchAdvices = async () => {
  try {
    loading.value = true
    const response = await adviceService.getAdvices()
    advices.value = response
  } catch (error) {
    console.error('Error fetching advices:', error)
    ElMessage.error('Không thể tải danh sách lời khuyên')
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchAdvices()
})

onUnmounted(() => {
  // Cleanup if needed
  advices.value = []
  loading.value = false
  searchQuery.value = ''
})
</script>

<template>
  <div class="advice-list">
    <div class="header">
      <h2>Quản lý lời khuyên</h2>
     
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm lời khuyên..." 
          class="search-input"
        />
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Tạo lời khuyên
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="advices.length === 0" class="no-data">
      Không có dữ liệu lời khuyên
    </div>

    <table v-else class="advice-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tiêu đề</th>
          <th>Cây thuốc</th>
          <th>Bệnh</th>
          <th>Người đưa lời khuyên</th>
          <th>Ngày tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="advice in filteredAdvices" :key="advice.advice_id">
          <td>{{ advice.advice_id }}</td>
          <td>{{ advice.title }}</td>
          <td>{{ advice.plant.name }}</td>
          <td>{{ advice.disease.name }}</td>
          <td>
            <div class="user-info">
              <span class="name">{{ advice.user.full_name }}</span>
              <span class="title">{{ advice.user.title }}</span>
            </div>
          </td>
          <td>{{ new Date(advice.created_at).toLocaleDateString() }}</td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(advice)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(advice.advice_id)" class="btn-delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.advice-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  flex: 0 0 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.advice-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.advice-table th,
.advice-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-edit {
  background: #2196F3;
}

.btn-delete {
  background: #f44336;
}

.btn-edit:hover {
  background: #1976D2;
}

.btn-delete:hover {
  background: #D32F2F;
}

.user-info {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.user-info .name {
  font-weight: 500;
}

.user-info .title {
  font-size: 0.9em;
  color: #666;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-create:hover {
  background-color: #388E3C;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 20px;
}
</style> 
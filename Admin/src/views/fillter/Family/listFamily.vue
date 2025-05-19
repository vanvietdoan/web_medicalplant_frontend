<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { FamilyResponse } from '../../../models/Family'
import type { OrderResponse } from '../../../models/Order'
import familyService from '../../../services/fillter/family.service'
import orderService from '../../../services/fillter/order.service'

const router = useRouter()
const families = ref<FamilyResponse[]>([])
const orders = ref<OrderResponse[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedOrderId = ref<number | null>(null)

const filteredFamilies = computed(() => {
  let filtered = families.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }

  // Filter by selected order
  if (selectedOrderId.value) {
    filtered = filtered.filter(item => item.order_id === selectedOrderId.value)
  }
  
  return filtered
})
const getOrders = async () => {
  const response = await orderService.getOrders()
  orders.value = response
}
const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = (item: FamilyResponse) => {
  router.push({
    name: 'editFamily',
    params: { id: item.family_id }
  })
}

const handleDelete = async (familyId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa phân loại này?')) {
          await familyService.deleteFamily(Number(familyId))
      ElMessage.success('Xóa phân loại thành công')
      await fetchFamilies()
    }
  } catch (error) {
    console.error('Error deleting family:', error)
    ElMessage.error('Không thể xóa phân loại')
  }
}

const handleCreate = () => {
  router.push({ name: 'createFamily' })
}

const fetchFamilies = async () => {
  try {
    loading.value = true
    const response = await familyService.getFamilies()
    console.log('API Response:', response)
    families.value = response
   
    console.log('Families data:', families.value)
  } catch (error) {
    console.error('Error fetching families:', error)
    ElMessage.error('Không thể tải danh sách phân loại')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchFamilies()
  getOrders()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h2>Quản lý phân họ</h2>
     
      <div class="filters">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm phân loại..." 
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <select 
            v-model="selectedOrderId" 
            class="form-select"
          >
            <option :value="null">Tất cả bộ</option>
            <option 
              v-for="order in orders" 
              :key="order.order_id" 
              :value="order.order_id"
            >
              {{ order.name }}
            </option>
          </select>
        </div>
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Tạo phân loại họ
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <table v-else class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Bộ</th>
          <th>Ngày tạo</th>
          <th>Ngày cập nhật</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredFamilies" :key="item.family_id">
          <td>{{ item.family_id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ orders.find(order => order.order_id === item.order_id)?.name }}</td>
          <td>{{ formatDate(item.created_at) }}</td>
          <td>{{ formatDate(item.updated_at) }}</td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(item)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(item.family_id)" class="btn-delete">
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
.user-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-bar {
  flex: 1;
}

.filter-group {
  flex: 0 0 200px;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.form-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.user-table th,
.user-table td {
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

.btn-create {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
}

.btn-create:hover {
  background: #388E3C;
}

.btn-create i {
  font-size: 14px;
}
</style> 
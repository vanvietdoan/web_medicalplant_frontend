<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { OrderResponse } from '../../../models/Order'
import type { ClassResponse } from '../../../models/Class'
import orderService from '../../../services/fillter/order.service'
import classService from '../../../services/fillter/class.service'

const router = useRouter()
const orders = ref<OrderResponse[]>([])
const classes = ref<ClassResponse[]>([])
const loading = ref(false)
const searchQuery = ref('')

const filteredOrders = computed(() => {
  if (!searchQuery.value) return orders.value
  const query = searchQuery.value.toLowerCase()
  return orders.value.filter(item =>
    item.name.toLowerCase().includes(query)
  )
})
const getClasses = async () => {
  const response = await classService.getClasses()
  classes.value = response
}


const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = (item: OrderResponse) => {
  router.push({
    name: 'editOrder',
    params: { id: item.order_id }
  })
}

const handleDelete = async (orderId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa phân loại này?')) {
        await orderService.deleteOrder(Number(orderId))
      ElMessage.success('Xóa phân loại thành công')
      await fetchOrders()
    }
  } catch (error) {
    console.error('Error deleting order:', error)
    ElMessage.error('Không thể xóa phân loại')
  }
}

const handleCreate = () => {
  router.push({ name: 'createOrder' })
}

const fetchOrders = async () => {
  try {
    loading.value = true
    const response = await orderService.getOrders()
    console.log('API Response:', response)
    orders.value = response
   
    console.log('Orders data:', orders.value)
  } catch (error) {
    console.error('Error fetching orders:', error)
    ElMessage.error('Không thể tải danh sách phân loại')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchOrders()
  getClasses()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h2>Quản lý phân Bộ</h2>
     
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm phân loại..." 
          class="search-input"
        />
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Tạo phân loại
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <table v-else class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Lớp</th>
          <th>Ngày tạo</th>
          <th>Ngày cập nhật</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="order in filteredOrders" :key="order.order_id">
          <td>{{ order.order_id }}</td>
          <td>{{ order.name }}</td>
          <td>{{ classes.find(cls => cls.class_id === order.class_id)?.name }}</td>
          <td>{{ formatDate(order.created_at) }}</td>
          <td>{{ formatDate(order.updated_at) }}</td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(order)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(order.order_id)" class="btn-delete">
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
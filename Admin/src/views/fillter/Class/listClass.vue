<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { ClassResponse } from '../../../models/Class'
import type { Division } from '../../../models/division'
import classService from '../../../services/fillter/class.service'
import divisionService from '../../../services/fillter/division.service'

const router = useRouter()
const classes = ref<ClassResponse[]>([])
const divisions = ref<Division[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedDivisionId = ref<number | null>(null)

const filteredClasses = computed(() => {
  let filtered = classes.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }

  // Filter by selected division
  if (selectedDivisionId.value) {
    filtered = filtered.filter(item => item.division_id === selectedDivisionId.value)
  }
  
  return filtered
})
const getDivisions = async () => {
  const response = await divisionService.getDivisions()
  divisions.value = response
}


const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = (item: ClassResponse) => {
  router.push({
    name: 'editClass',
    params: { id: item.class_id }
  })
}

const handleDelete = async (classId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa phân loại này?')) {
      await classService.deleteClass(Number(classId))
      ElMessage.success('Xóa phân loại thành công')
      await fetchClasses()
    }
  } catch (error) {
    console.error('Error deleting class:', error)
    ElMessage.error('Không thể xóa phân loại')
  }
}

const handleCreate = () => {
  router.push({ name: 'createClass' })
}

const fetchClasses = async () => {
  try {
    loading.value = true
    const response = await classService.getClasses()
    console.log('API Response:', response)
    classes.value = response
   
    console.log('Classes data:', classes.value)
  } catch (error) {
    console.error('Error fetching classes:', error)
    ElMessage.error('Không thể tải danh sách phân loại')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchClasses()
  getDivisions()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h2>Quản lý phân Lớp</h2>
     
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
            v-model="selectedDivisionId" 
            class="form-select"
          >
            <option :value="null">Tất cả ngành</option>
            <option 
              v-for="division in divisions" 
              :key="division.division_id" 
              :value="division.division_id"
            >
              {{ division.name }}
            </option>
          </select>
        </div>
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
          <th>Ngành</th>
          <th>Ngày tạo</th>
          <th>Ngày cập nhật</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in filteredClasses" :key="item.class_id">
          <td>{{ item.class_id }}</td>
          <td>{{ item.name }}</td>
          <td>{{ divisions.find(division => division.division_id == item.division_id)?.name }}</td>
          <td>{{ formatDate(item.created_at) }}</td>
          <td>{{ formatDate(item.updated_at) }}</td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(item)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(item.class_id)" class="btn-delete">
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
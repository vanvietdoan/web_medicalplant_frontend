<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElPagination } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Division } from '../../../models/division'

import divisionService from '../../../services/fillter/division.service'

const router = useRouter()
const divisions = ref<Division[]>([])
const loading = ref(false)
const searchQuery = ref('')

// Pagination
const currentPage = ref(1)
const pageSize = 10  // Fixed page size

const filteredDivisions = computed(() => {
  if (!searchQuery.value) return divisions.value
  const query = searchQuery.value.toLowerCase()
  return divisions.value.filter(division =>
    division.name.toLowerCase().includes(query)
  )
})

// Computed property for paginated divisions
const paginatedDivisions = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredDivisions.value.slice(start, end)
})

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = (division: Division) => {
  router.push({
    name: 'editDivision',
    params: { id: division.division_id }
  })
}

const handleDelete = async (divisionId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa phân loại này?')) {
      await divisionService.deleteDivision(divisionId)
      ElMessage.success('Xóa phân loại thành công')
      await fetchDivisions()
    }
  } catch (error) {
    console.error('Error deleting division:', error)
    ElMessage.error('Không thể xóa phân loại')
  }
}

const handleCreate = () => {
  router.push({ name: 'createDivision' })
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const fetchDivisions = async () => {
  try {
    loading.value = true
    const response = await divisionService.getDivisions()
    console.log('API Response:', response)
    divisions.value = response
    console.log('Divisions data:', divisions.value)
  } catch (error) {
    console.error('Error fetching divisions:', error)
    ElMessage.error('Không thể tải danh sách phân loại')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchDivisions()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h2>Quản lý phân Ngành</h2>
     
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

    <template v-else>
      <table class="user-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="division in paginatedDivisions" :key="division.division_id">
            <td>{{ division.division_id }}</td>
            <td>{{ division.name }}</td>
            <td>{{ formatDate(division.created_at) }}</td>
            <td>{{ formatDate(division.updated_at) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="handleEdit(division)" class="btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="handleDelete(division.division_id)" class="btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredDivisions.length"
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
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

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.user-table {
  min-height: 400px;
}

:deep(.el-pagination) {
  --el-pagination-button-color: #409eff;
  --el-pagination-hover-color: #79bbff;
  --el-pagination-button-bg-color: #ffffff;
  --el-pagination-button-disabled-color: #c0c4cc;
  --el-pagination-button-disabled-bg-color: #ffffff;
  --el-pagination-hover-bg-color: #f2f6fc;
}

:deep(.el-pagination .el-pager li) {
  background-color: var(--el-pagination-button-bg-color);
  color: var(--el-pagination-button-color);
  border-radius: 4px;
  margin: 0 4px;
}

:deep(.el-pagination .el-pager li.active) {
  background-color: var(--el-pagination-button-color);
  color: #ffffff;
}

:deep(.el-pagination .el-pager li:hover) {
  color: var(--el-pagination-hover-color);
  background-color: var(--el-pagination-hover-bg-color);
}

:deep(.el-pagination .btn-prev),
:deep(.el-pagination .btn-next) {
  background-color: var(--el-pagination-button-bg-color);
  color: var(--el-pagination-button-color);
  border-radius: 4px;
  margin: 0 4px;
}

:deep(.el-pagination .btn-prev:hover),
:deep(.el-pagination .btn-next:hover) {
  color: var(--el-pagination-hover-color);
  background-color: var(--el-pagination-hover-bg-color);
}

:deep(.el-pagination .btn-prev:disabled),
:deep(.el-pagination .btn-next:disabled) {
  color: var(--el-pagination-button-disabled-color);
  background-color: var(--el-pagination-button-disabled-bg-color);
}

:deep(.el-pagination__total) {
  margin-right: 16px;
  font-weight: 500;
  color: #606266;
}

:deep(.el-pagination.is-first) {
  margin-right: 16px;
}

:deep(.el-pagination__total) {
  font-size: 14px;
  line-height: 32px;
  color: #606266;
}

:deep(.el-pagination__total .el-pagination__total-text) {
  margin-right: 8px;
}

:deep(.el-pagination__total .el-pagination__total-number) {
  font-weight: 600;
  color: #409eff;
}
</style> 
<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElPagination, ElSelect, ElOption } from 'element-plus'
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
const selectedDivisionId = ref<number[]>([])

// Pagination
const currentPage = ref(1)
const pageSize = 10  // Fixed page size

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
  if (selectedDivisionId.value.length > 0) {
    filtered = filtered.filter(item => selectedDivisionId.value.includes(item.division_id))
  }
  
  return filtered
})

// Computed property for paginated classes
const paginatedClasses = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredClasses.value.slice(start, end)
})

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

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
      <div class="header-actions">
        <button class="btn-create" @click="handleCreate">
          <i class="fas fa-plus"></i> Tạo phân loại
        </button>
      </div>
    </div>

    <div class="filters-container">
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
          <el-select
            v-model="selectedDivisionId"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="Chọn ngành"
            clearable
            class="filter-select"
          >
            <el-option
              v-for="division in divisions"
              :key="division.division_id"
              :label="division.name"
              :value="division.division_id"
            />
          </el-select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <template v-else>
      <table class="user-table">
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
          <tr v-for="item in paginatedClasses" :key="item.class_id">
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

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredClasses.length"
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

.filters-container {
  background: #f5f7fa;
  padding: 16px;
  border-radius: 8px;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 16px;
  align-items: flex-start;
  flex-wrap: wrap;
}

.search-bar {
  flex: 1;
  min-width: 200px;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
  transition: all 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #409eff;
  box-shadow: 0 0 0 2px rgba(64, 158, 255, 0.1);
}

.filter-select {
  width: 100%;
}

:deep(.el-select) {
  width: 100%;
}

:deep(.el-input__wrapper) {
  box-shadow: 0 0 0 1px #dcdfe6 inset;
  background-color: white;
}

:deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

:deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #409eff inset;
}

:deep(.el-select .el-input__inner) {
  height: 32px;
}

:deep(.el-select .el-tag) {
  margin: 2px;
  background-color: #ecf5ff;
  border-color: #d9ecff;
  color: #409eff;
}

:deep(.el-select .el-tag__close) {
  color: #409eff;
  background-color: transparent;
}

:deep(.el-select .el-tag__close:hover) {
  background-color: #409eff;
  color: white;
}

:deep(.el-select-dropdown__item.selected) {
  color: #409eff;
  font-weight: bold;
}

:deep(.el-select-dropdown__item.hover) {
  background-color: #f5f7fa;
}

.user-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
  min-height: 400px;
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

@media (max-width: 768px) {
  .filters {
    flex-direction: column;
    width: 100%;
  }
  
  .search-bar,
  .filter-group {
    width: 100%;
  }
}
</style> 
<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage, ElPagination, ElSelect, ElOption } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Advice } from '../../models/Advice'
import { adviceService } from '../../services/advice.service'
import { plantService } from '../../services/plant.service'
import { diseasesService } from '../../services/diseases.service'
import type { Plant } from '../../models/Plant'
import type { Disease } from '../../models/Diseases'

// Router setup
const router = useRouter()

// State management
const advices = ref<Advice[]>([])
const plants = ref<Plant[]>([])
const diseases = ref<Disease[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedPlantId = ref<number[]>([])
const selectedDiseaseId = ref<number[]>([])

// Pagination
const currentPage = ref(1)
const pageSize = 10

// Computed properties
const filteredAdvices = computed(() => {
  let filtered = advices.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(advice =>
      advice.title.toLowerCase().includes(query)
    )
  }

  // Filter by selected plants
  if (selectedPlantId.value.length > 0) {
    filtered = filtered.filter(advice => selectedPlantId.value.includes(advice.plant?.plant_id))
  }

  // Filter by selected diseases
  if (selectedDiseaseId.value.length > 0) {
    filtered = filtered.filter(advice => selectedDiseaseId.value.includes(advice.disease?.disease_id))
  }
  
  return filtered
})

// Computed property for paginated advices
const paginatedAdvices = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredAdvices.value.slice(start, end)
})

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

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
    const [advicesData, plantsData, diseasesData] = await Promise.all([
      adviceService.getAdvices(),
      plantService.getPlants(),
      diseasesService.getDiseases()
    ])
    
    // Handle Proxy-wrapped Array for advices
    if (advicesData && typeof advicesData === 'object') {
      advices.value = Array.from(advicesData)
    } else {
      console.error('Unexpected data structure:', advicesData)
      ElMessage.error('Dữ liệu không đúng định dạng')
      return
    }

    plants.value = plantsData || []
    diseases.value = diseasesData || []
    
    console.log('Advices data after assignment:', advices.value)
    console.log('Number of advices:', advices.value.length)
  } catch (error) {
    console.error('Error fetching data:', error)
    ElMessage.error('Không thể tải dữ liệu')
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchAdvices()
})

onUnmounted(() => {
  advices.value = []
  plants.value = []
  diseases.value = []
  loading.value = false
  searchQuery.value = ''
  selectedPlantId.value = []
  selectedDiseaseId.value = []
})
</script>

<template>
  <div class="advice-list">
    <div class="header">
      <div class="header-left">
        <h2>Quản lý lời khuyên</h2>
        <button class="btn-create" @click="handleCreate">
          <i class="fas fa-plus"></i> Tạo lời khuyên
        </button>
      </div>
     
      <div class="filters-container">
        <div class="filters">
          <div class="search-bar">
            <input 
              v-model="searchQuery" 
              type="text" 
              placeholder="Tìm kiếm lời khuyên..." 
              class="search-input"
            />
          </div>
          <div class="filter-group">
            <el-select
              v-model="selectedPlantId"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="Chọn cây"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="plant in plants"
                :key="plant.plant_id"
                :label="plant.name"
                :value="plant.plant_id"
              />
            </el-select>
          </div>
          <div class="filter-group">
            <el-select
              v-model="selectedDiseaseId"
              multiple
              collapse-tags
              collapse-tags-tooltip
              placeholder="Chọn bệnh"
              clearable
              class="filter-select"
            >
              <el-option
                v-for="disease in diseases"
                :key="disease.disease_id"
                :label="disease.name"
                :value="disease.disease_id"
              />
            </el-select>
          </div>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="advices.length === 0" class="no-data">
      Không có dữ liệu lời khuyên
    </div>

    <template v-else>
      <table class="advice-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tiêu đề</th>
            <th>Cây thuốc</th>
            <th>Bệnh</th>
            <th>Người tạo</th>
            <th>Ngày tạo</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="advice in paginatedAdvices" :key="advice.advice_id">
            <td>{{ advice.advice_id }}</td>
            <td>{{ advice.title }}</td>
            <td>{{ advice.plant?.name || 'Không có' }}</td>
            <td>{{ advice.disease?.name || 'Không có' }}</td>
            <td>
              <div class="user-info">
                <span class="name">{{ advice.user?.full_name || 'Không có' }}</span>
                <span class="title">{{ advice.user?.title || '' }}</span>
              </div>
            </td>
            <td>{{ advice.created_at ? new Date(advice.created_at).toLocaleDateString() : 'Không có' }}</td>
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

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredAdvices.length"
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.advice-list {
  padding: 20px;
}

.header {
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.header-left {
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.advice-table {
  width: 100%;
  border-collapse: collapse;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.advice-table th,
.advice-table td {
  padding: 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.advice-table th {
  background-color: #f8f9fa;
  font-weight: 500;
  color: #333;
}

.advice-table tr:last-child td {
  border-bottom: none;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 8px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
  transition: opacity 0.3s ease;
}

.btn-edit {
  background: #2196F3;
}

.btn-delete {
  background: #f44336;
}

.btn-edit:hover,
.btn-delete:hover {
  opacity: 0.9;
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
  padding: 10px 20px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  height: 40px;
}

.btn-create:hover {
  background-color: #388E3C;
  transform: translateY(-1px);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.btn-create:active {
  transform: translateY(0);
  box-shadow: none;
}

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-top: 20px;
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
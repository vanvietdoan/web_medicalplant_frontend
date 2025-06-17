<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElPagination, ElSelect, ElOption } from 'element-plus'
import { useRouter } from 'vue-router'
import type { SpeciesResponse } from '../../../models/Species'
import type { GenusResponse } from '../../../models/Genus'
import speciesService from '../../../services/fillter/species.service'
import genusService from '../../../services/fillter/genus.service'

const router = useRouter()
const species = ref<SpeciesResponse[]>([])
const genuses = ref<GenusResponse[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedGenusId = ref<number[]>([])
const selectedDistribution = ref<string[]>([])

// Pagination
const currentPage = ref(1)
const pageSize = 10  // Fixed page size

const getGenuses = async () => {
  const response = await genusService.getGenuses()
  genuses.value = response
}

// Lấy danh sách phân bố duy nhất từ tất cả các loài
const uniqueDistributions = computed(() => {
  const distributions = new Set<string>()
  species.value.forEach(species => {
    if (species.distribution) {
      species.distribution.split(',').forEach(dist => {
        distributions.add(dist.trim())
      })
    }
  })
  return Array.from(distributions).sort()
})

const filteredSpecies = computed(() => {  
  let filtered = species.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }

  // Filter by selected genus
  if (selectedGenusId.value.length > 0) {
    filtered = filtered.filter(item => selectedGenusId.value.includes(item.genus_id))
  }

  // Filter by distribution
  if (selectedDistribution.value.length > 0) {
    filtered = filtered.filter(item => {
      if (!item.distribution) return false
      const distributions = item.distribution.split(',').map(d => d.trim())
      return selectedDistribution.value.some(dist => distributions.includes(dist))
    })
  }
  
  return filtered
})

// Computed property for paginated species
const paginatedSpecies = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredSpecies.value.slice(start, end)
})

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = (item: SpeciesResponse) => {
  router.push({
    name: 'editSpecies',
    params: { id: item.species_id }
  })
}

const handleDelete = async (speciesId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa phân loại này?')) {
          await speciesService.deleteSpecies(Number(speciesId))
      ElMessage.success('Xóa phân loại thành công')
      await fetchSpecies()
    }
  } catch (error) {
    console.error('Error deleting species:', error)
    ElMessage.error('Không thể xóa phân loại')
  }
}

const handleCreate = () => {
  router.push({ name: 'createSpecies' })
  
}

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const fetchSpecies = async () => {
  try {
    loading.value = true
    const response = await speciesService.getSpecies()
    console.log('API Response:', response)
    species.value = response
   
    console.log('Species data:', species.value)
  } catch (error) {
    console.error('Error fetching species:', error)
    ElMessage.error('Không thể tải danh sách phân loại')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchSpecies()
  getGenuses()
})
</script>

<template>
  <div class="species-list">
    <div class="header">
      <h2>Quản lý loài</h2>
      <div class="header-actions">
        <button class="btn-create" @click="handleCreate">
          <i class="fas fa-plus"></i> Tạo loài mới
        </button>
      </div>
    </div>

    <div class="filters-container">
      <div class="filters">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm loài..." 
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <el-select
            v-model="selectedGenusId"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="Chọn chi"
            clearable
            class="filter-select"
          >
            <el-option
              v-for="genus in genuses"
              :key="genus.genus_id"
              :label="genus.name"
              :value="genus.genus_id"
            />
          </el-select>
        </div>
        <div class="filter-group">
          <el-select
            v-model="selectedDistribution"
            multiple
            collapse-tags
            collapse-tags-tooltip
            placeholder="Chọn phân bố"
            clearable
            class="filter-select"
          >
            <el-option
              v-for="dist in uniqueDistributions"
              :key="dist"
              :label="dist"
              :value="dist"
            />
          </el-select>
        </div>
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="species.length === 0" class="no-data">
      Không có dữ liệu loài
    </div>

    <template v-else>
      <table class="species-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên</th>
            <th>Chi</th>
            <th>Ngày tạo</th>
            <th>Ngày cập nhật</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="species in paginatedSpecies" :key="species.species_id">
            <td>{{ species.species_id }}</td>
            <td>{{ species.name }}</td>
            <td>{{ genuses.find(genus => genus.genus_id === species.genus_id)?.name }}</td>
            <td>{{ formatDate(species.created_at) }}</td>
            <td>{{ formatDate(species.updated_at) }}</td>
            <td>
              <div class="action-buttons">
                <button @click="handleEdit(species)" class="btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="handleDelete(species.species_id)" class="btn-delete">
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
          :total="filteredSpecies.length"
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.species-list {
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

.species-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.species-table th,
.species-table td {
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

.no-data {
  text-align: center;
  padding: 20px;
  color: #666;
  background: #f5f5f5;
  border-radius: 4px;
  margin-top: 20px;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.species-table {
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

.form-select[multiple] {
  height: 120px;
  padding: 4px;
}

.form-select[multiple] option {
  padding: 8px;
  margin: 2px 0;
  border-radius: 4px;
}

.form-select[multiple] option:checked {
  background-color: #e6f7ff;
  color: #1890ff;
}

.form-select[multiple] option:hover {
  background-color: #f5f5f5;
}
</style> 
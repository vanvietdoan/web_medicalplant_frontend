<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage, ElPagination } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Disease } from '../../models/Diseases'
import { diseasesService } from '../../services/diseases.service'
import { API_HOST } from '../../confighost'

const router = useRouter()
const diseases = ref<Disease[]>([])
const loading = ref(false)
const searchQuery = ref('')
const viewMode = ref<'list' | 'grid'>('list')

// Pagination
const currentPage = ref(1)
const pageSize = 12  // Fixed page size

const filteredDiseases = computed(() => {
  if (!searchQuery.value) return diseases.value
  const query = searchQuery.value.toLowerCase()
  return diseases.value.filter(disease =>
    disease.name.toLowerCase().includes(query)
  )
})

// Computed property for paginated diseases
const paginatedDiseases = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredDiseases.value.slice(start, end)
})

const handleCurrentChange = (val: number) => {
  currentPage.value = val
}

const toggleViewMode = () => {
  viewMode.value = viewMode.value === 'list' ? 'grid' : 'list'
}

// Function to get display image URL
const getDisplayImageUrl = (url: string) => {
  if (!url) return ''
  if (url.startsWith('http')) return url
  return `${API_HOST}${url}`
}

const handleEdit = (disease: Disease) => {
  if (!disease) return;
  
  router.push({
    name: 'disease-edit',
    params: { id: disease.disease_id },
    query: {
      name: disease.name || '',
      description: disease.description || '',
      symptoms: disease.symptoms || ''
    }
  })
}

const handleDelete = async (diseaseId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa bệnh này?')) {
      await diseasesService.deleteDisease(diseaseId)
      ElMessage.success('Xóa bệnh thành công')
      await fetchDiseases()
    }
  } catch (error) {
    console.error('Error deleting disease:', error)
    ElMessage.error('Không thể xóa bệnh')
  }
}

const fetchDiseases = async () => {
  try {
    loading.value = true
    const response = await diseasesService.getDiseases()
    console.log('API Response:', response)
    diseases.value = response
    console.log('Diseases data:', diseases.value)
  } catch (error) {
    console.error('Error fetching diseases:', error)
    ElMessage.error('Không thể tải danh sách bệnh')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push({ name: 'disease-create' })
}

onMounted(() => {
  fetchDiseases()
})
</script>

<template>
  <div class="disease-list">
    <div class="header">
      <h2>Quản lý bệnh</h2>
     
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm bệnh..." 
          class="search-input"
        />
      </div>
      <div class="header-actions">
        <button class="btn-view-toggle" @click="toggleViewMode">
          <i :class="viewMode === 'list' ? 'fas fa-th-large' : 'fas fa-list'"></i>
          {{ viewMode === 'list' ? 'Xem dạng lưới' : 'Xem dạng danh sách' }}
        </button>
        <button class="btn-create" @click="handleCreate">
          <i class="fas fa-plus"></i> Thêm bệnh
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <template v-else>
      <!-- List View -->
      <table v-if="viewMode === 'list'" class="disease-table">
        <thead>
          <tr>
            <th>ID</th>
            <th>Tên bệnh</th>
            <th>Mô tả</th>
            <th>Triệu chứng</th>
            <th>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="disease in paginatedDiseases" :key="disease.disease_id">
            <td>{{ disease.disease_id }}</td>
            <td>{{ disease.name }}</td>
            <td>
              <el-tooltip
                :content="disease.description"
                placement="top"
                :show-after="500"
              >
                <div class="truncated-text">{{ disease.description }}</div>
              </el-tooltip>
            </td>
            <td>
              <el-tooltip
                :content="disease.symptoms"
                placement="top"
                :show-after="500"
              >
                <div class="truncated-text">{{ disease.symptoms }}</div>
              </el-tooltip>
            </td>
            <td>
              <div class="action-buttons">
                <button @click="handleEdit(disease)" class="btn-edit">
                  <i class="fas fa-edit"></i>
                </button>
                <button @click="handleDelete(disease.disease_id)" class="btn-delete">
                  <i class="fas fa-trash"></i>
                </button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>

      <!-- Grid View -->
      <div v-else class="disease-grid">
        <div v-for="disease in paginatedDiseases" :key="disease.disease_id" class="disease-card">
          <div class="disease-image">
            <img 
              :src="disease.images && disease.images.length > 0 ? getDisplayImageUrl(disease.images[0].url) : '/default-disease.jpg'" 
              :alt="disease.name"
            >
          </div>
          <div class="disease-info">
            <h3>{{ disease.name }}</h3>
            <div class="disease-description">
              <el-tooltip
                :content="disease.description"
                placement="top"
                :show-after="500"
              >
                <p class="truncated-text">{{ disease.description }}</p>
              </el-tooltip>
            </div>
            <div class="disease-symptoms">
              <el-tooltip
                :content="disease.symptoms"
                placement="top"
                :show-after="500"
              >
                <p class="truncated-text">{{ disease.symptoms }}</p>
              </el-tooltip>
            </div>
            <div class="card-actions">
              <button @click="handleEdit(disease)" class="btn-edit">
                <i class="fas fa-edit"></i> Sửa
              </button>
              <button @click="handleDelete(disease.disease_id)" class="btn-delete">
                <i class="fas fa-trash"></i> Xóa
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Pagination -->
      <div class="pagination-container">
        <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          :total="filteredDiseases.length"
          layout="total, prev, pager, next"
          @current-change="handleCurrentChange"
        />
      </div>
    </template>
  </div>
</template>

<style scoped>
.disease-list {
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

.disease-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.disease-table th,
.disease-table td {
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

.truncated-text {
  max-width: 200px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  cursor: pointer;
}

.disease-table td {
  max-width: 200px;
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.pagination-container {
  margin-top: 20px;
  display: flex;
  justify-content: center;
  padding: 20px 0;
}

.disease-table {
  min-height: 400px;
}

.header-actions {
  display: flex;
  gap: 12px;
  align-items: center;
}

.btn-view-toggle {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.btn-view-toggle:hover {
  background-color: #e0e0e0;
}

.disease-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 20px 0;
  min-height: 400px;
}

.disease-card {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: transform 0.3s ease;
}

.disease-card:hover {
  transform: translateY(-4px);
}

.disease-image {
  width: 100%;
  height: 200px;
  overflow: hidden;
  background-color: #f5f5f5;
}

.disease-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.disease-card:hover .disease-image img {
  transform: scale(1.05);
}

.disease-info {
  padding: 16px;
}

.disease-info h3 {
  margin: 0 0 8px 0;
  font-size: 1.1em;
  color: #333;
}

.disease-description,
.disease-symptoms {
  margin-bottom: 12px;
}

.disease-description p,
.disease-symptoms p {
  margin: 0;
  color: #666;
  font-size: 0.9em;
  line-height: 1.4;
}

.card-actions {
  display: flex;
  gap: 8px;
  margin-top: 16px;
}

.card-actions button {
  flex: 1;
  padding: 8px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.9em;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.card-actions .btn-edit {
  background: #2196F3;
  color: white;
}

.card-actions .btn-delete {
  background: #f44336;
  color: white;
}

.card-actions .btn-edit:hover {
  background: #1976D2;
}

.card-actions .btn-delete:hover {
  background: #D32F2F;
}
</style> 
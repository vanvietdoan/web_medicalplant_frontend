<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Disease } from '../../models/Diseases'
import { diseasesService } from '../../services/diseases.service'

const router = useRouter()
const diseases = ref<Disease[]>([])
const loading = ref(false)
const searchQuery = ref('')

const filteredDiseases = computed(() => {
  if (!searchQuery.value) return diseases.value
  const query = searchQuery.value.toLowerCase()
  return diseases.value.filter(disease =>
    disease.name.toLowerCase().includes(query) ||
    disease.description.toLowerCase().includes(query)
  )
})

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
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Thêm bệnh
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <table v-else class="disease-table">
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
        <tr v-for="disease in filteredDiseases" :key="disease.disease_id">
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
</style> 
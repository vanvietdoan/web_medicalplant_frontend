<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
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
const selectedPlantId = ref<number | null>(null)
const selectedDiseaseId = ref<number | null>(null)

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

  // Filter by selected plant
  if (selectedPlantId.value) {
    filtered = filtered.filter(advice => advice.plant?.plant_id === selectedPlantId.value)
  }

  // Filter by selected disease
  if (selectedDiseaseId.value) {
    filtered = filtered.filter(advice => advice.disease?.disease_id === selectedDiseaseId.value)
  }
  
  return filtered
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
  selectedPlantId.value = null
  selectedDiseaseId.value = null
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
          <select 
            v-model="selectedPlantId" 
            class="form-select"
          >
            <option :value="null">Tất cả cây</option>
            <option 
              v-for="plant in plants" 
              :key="plant.plant_id" 
              :value="plant.plant_id"
            >
              {{ plant.name }}
            </option>
          </select>
          <select 
            v-model="selectedDiseaseId" 
            class="form-select"
          >
            <option :value="null">Tất cả bệnh</option>
            <option 
              v-for="disease in diseases" 
              :key="disease.disease_id" 
              :value="disease.disease_id"
            >
              {{ disease.name }}
            </option>
          </select>
        </div>
      </div>
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
          <th>Người tạo</th>
          <th>Ngày tạo</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="advice in filteredAdvices" :key="advice.advice_id">
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

.filters {
  display: flex;
  gap: 16px;
  align-items: center;
}

.search-bar {
  flex: 1;
}

.filter-group {
  display: flex;
  gap: 12px;
}

.search-input,
.form-select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.3s ease;
}

.search-input:focus,
.form-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
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
</style> 
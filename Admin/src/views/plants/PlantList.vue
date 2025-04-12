<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import type { Plant } from '../../models/Plant'
import { plantService } from '../../services/plant.service'

const plants = ref<Plant[]>([])
const loading = ref(false)
const searchQuery = ref('')

const filteredPlants = computed(() => {
  if (!searchQuery.value) return plants.value
  const query = searchQuery.value.toLowerCase()
  return plants.value.filter(plant => 
    plant.name.toLowerCase().includes(query) ||
    plant.english_name.toLowerCase().includes(query)
  )
})

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = async (plant: Plant) => {
  // TODO: Implement edit functionality
  console.log('Edit plant:', plant)
}

const handleDelete = async (plantId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa cây thuốc này?')) {
      await plantService.deletePlant(plantId)
      ElMessage.success('Xóa cây thuốc thành công')
      await fetchPlants() // Refresh the list
    }
  } catch (error) {
    console.error('Error deleting plant:', error)
    ElMessage.error('Không thể xóa cây thuốc')
  }
}

const fetchPlants = async () => {
  try {
    loading.value = true
    const response = await plantService.getPlants()
    console.log('fetchPlants:', response)
    plants.value = response.data
    console.log('Plants:', plants.value)
  } catch (error) {
    console.error('Error fetching plants:', error)
    ElMessage.error('Không thể tải danh sách cây thuốc')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchPlants()
})
</script>

<template>
  <div class="plant-list">
    <div class="header">
      <h2>Danh sách cây thuốc</h2>
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm cây thuốc..."
          class="search-input"
        >
      </div>
    </div>

    <div v-if="loading" class="loading">
      Đang tải...
    </div>

    <table v-else class="plant-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Hình ảnh</th>
          <th>Tên cây</th>
          <th>Cập nhật gần nhất</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="plant in filteredPlants" :key="plant.plant_id">
          <td>{{ plant.plant_id }}</td>
          <td>
            <img 
              :src="plant.image_url || '/placeholder-plant.jpg'" 
              class="plant-image"
            >
          </td>
          <td>{{ plant.name }}</td>
          <td>{{ formatDate(plant.updated_at) }}</td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(plant)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(plant.plant_id)" class="btn-delete">
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
.plant-list {
  padding: 20px;
}

.header {
  margin-bottom: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
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

.plant-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.plant-table th,
.plant-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.plant-image {
  width: 50px;
  height: 50px;
  object-fit: cover;
  border-radius: 4px;
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
</style> 
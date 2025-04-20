<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Plant } from '../../models/Plant'
import { plantService } from '../../services/plant.service'

const router = useRouter()
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

const handleEdit = (plant: Plant) => {
  if (!plant) return;
  
  router.push({
    name: 'plant-edit',
    params: { id: plant.plant_id },
    query: {
      name: plant.name || '',
      english_name: plant.english_name || '',
      description: plant.description || '',
      benefits: plant.benefits || '',
      instructions: plant.instructions || '',
      species_id: plant.species_id?.toString() || '1',
      image_url: plant.image_url || ''
    }
  })
}

const handleDelete = async (plantId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa cây thuốc này?')) {
      await plantService.deletePlant(plantId)
      ElMessage.success('Xóa cây thuốc thành công')
      await fetchPlants()
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
    console.log('API Response:', response)
    plants.value = response.data
    console.log('Plants data:', plants.value)
  } catch (error) {
    console.error('Error fetching plants:', error)
    ElMessage.error('Không thể tải danh sách cây thuốc')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push({ name: 'plant-create' })
}

onMounted(() => {
  fetchPlants()
})
</script>

<template>
  <div class="plant-list">
    <div class="header">
      <h2>Quản lý cây thuốc</h2>
     
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm cây thuốc..." 
          class="search-input"
        />
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Thêm cây thuốc
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <table v-else class="plant-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Tên tiếng Anh</th>
          <th>Loài</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="plant in filteredPlants" :key="plant.plant_id">
          <td>{{ plant.plant_id }}</td>
          <td>{{ plant.name }}</td>
          <td>{{ plant.english_name }}</td>
          <td>
            <span class="species">
              {{ plant.species_id === 1 ? 'Cây thuốc' : plant.species_id === 2 ? 'Cây dược liệu' : 'Cây cảnh' }}
            </span>
          </td>
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

.plant-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.plant-table th,
.plant-table td {
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

.species {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  background: #e8f5e9;
  color: #4CAF50;
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
</style> 
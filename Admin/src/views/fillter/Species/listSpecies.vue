<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
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
const getGenuses = async () => {
  const response = await genusService.getGenuses()
  genuses.value = response
}
const filteredSpecies = computed(() => {  
  if (!searchQuery.value) return species.value
  const query = searchQuery.value.toLowerCase()
  return species.value.filter(item =>
    item.name.toLowerCase().includes(query)
  )
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
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm loài..." 
          class="search-input"
        />
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Tạo loài mới
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <div v-else-if="species.length === 0" class="no-data">
      Không có dữ liệu loài
    </div>

    <table v-else class="species-table">
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
        <tr v-for="species in filteredSpecies" :key="species.species_id">
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
</style> 
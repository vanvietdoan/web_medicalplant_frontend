<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { GenusResponse } from '../../../models/Genus'
import type { FamilyResponse } from '../../../models/Family'
import genusService from '../../../services/fillter/genus.service'
import familyService from '../../../services/fillter/family.service'
const router = useRouter()
const genuses = ref<GenusResponse[]>([])
const families = ref<FamilyResponse[]>([])
const loading = ref(false)
const searchQuery = ref('')
const selectedFamilyId = ref<number | null>(null)

const getFamilies = async () => {
  const response = await familyService.getFamilies()
  families.value = response
}

const filteredGenuses = computed(() => {
  let filtered = genuses.value
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    filtered = filtered.filter(item =>
      item.name.toLowerCase().includes(query)
    )
  }

  // Filter by selected family
  if (selectedFamilyId.value) {
    filtered = filtered.filter(item => item.family_id === selectedFamilyId.value)
  }
  
  return filtered
})

const formatDate = (date: string) => {
  if (!date) return ''
  const d = new Date(date)
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`
}

const handleEdit = (item: GenusResponse) => {
  router.push({
    name: 'editGenus',
    params: { id: item.genus_id }
  })
}

const handleDelete = async (genusId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa phân loại này?')) {
          await genusService.deleteGenus(Number(genusId))
      ElMessage.success('Xóa phân loại thành công')
      await fetchGenuses()
    }
  } catch (error) {
    console.error('Error deleting genus:', error)
    ElMessage.error('Không thể xóa phân loại')
  }
}

const handleCreate = () => {
  router.push({ name: 'createGenus' })
}

  const fetchGenuses = async () => {
  try {
    loading.value = true
    const response = await genusService.getGenuses()
    console.log('API Response:', response)
    genuses.value = response
   
    console.log('Genuses data:', genuses.value)
  } catch (error) {
    console.error('Error fetching genuses:', error)
    ElMessage.error('Không thể tải danh sách phân loại')
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchGenuses()
  getFamilies()
})
</script>

<template>
  <div class="user-list">
    <div class="header">
      <h2>Quản lý chi</h2>
     
      <div class="filters">
        <div class="search-bar">
          <input 
            v-model="searchQuery" 
            type="text" 
            placeholder="Tìm kiếm phân chi..." 
            class="search-input"
          />
        </div>
        <div class="filter-group">
          <select 
            v-model="selectedFamilyId" 
            class="form-select"
          >
            <option :value="null">Tất cả họ</option>
            <option 
              v-for="family in families" 
              :key="family.family_id" 
              :value="family.family_id"
            >
              {{ family.name }}
            </option>
          </select>
        </div>
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Tạo phân loại chi
      </button>
    </div>

    <div v-if="loading" class="loading">Đang tải...</div>

    <table v-else class="user-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Họ</th>
          <th>Ngày tạo</th>
          <th>Ngày cập nhật</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="genus in filteredGenuses" :key="genus.genus_id">
          <td>{{ genus.genus_id }}</td>
          <td>{{ genus.name }}</td>
          <td>{{ families.find(family => family.family_id === genus.family_id)?.name }}</td>
          <td>{{ formatDate(genus.created_at) }}</td>
          <td>{{ formatDate(genus.updated_at) }}</td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(genus)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(genus.genus_id)" class="btn-delete">
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
.user-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
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
  flex: 0 0 200px;
}

.form-select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background-color: white;
}

.form-select:focus {
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
</style> 
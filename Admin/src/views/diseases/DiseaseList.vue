<template>
  <div class="disease-list">
    <div class="header">
      <h2>Quản lý bệnh</h2>
      <button @click="showAddModal = true" class="btn-add">
        <i class="fas fa-plus"></i> Thêm bệnh
      </button>
    </div>

    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Tìm kiếm bệnh..."
        @input="handleSearch"
      >
    </div>

    <table class="disease-table">
      <thead>
        <tr>
          <th>Tên bệnh</th>
          <th>Triệu chứng</th>
          <th>Cách điều trị</th>
          <th>Cây thuốc liên quan</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="disease in diseases" :key="disease.id">
          <td>{{ disease.name }}</td>
          <td>{{ disease.symptoms }}</td>
          <td>{{ disease.treatment }}</td>
          <td>
            <span v-for="plant in disease.relatedPlants" :key="plant.id" class="plant-tag">
              {{ plant.name }}
            </span>
          </td>
          <td>
            <span :class="['status', disease.active ? 'active' : 'inactive']">
              {{ disease.active ? 'Hoạt động' : 'Không hoạt động' }}
            </span>
          </td>
          <td>
            <button @click="editDisease(disease)" class="btn-edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deleteDisease(disease.id)" class="btn-delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal">
      <div class="modal-content">
        <h3>{{ showEditModal ? 'Sửa bệnh' : 'Thêm bệnh mới' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Tên bệnh</label>
            <input v-model="diseaseForm.name" type="text" required>
          </div>
          
          <div class="form-group">
            <label>Triệu chứng</label>
            <textarea v-model="diseaseForm.symptoms" required></textarea>
          </div>

          <div class="form-group">
            <label>Cách điều trị</label>
            <textarea v-model="diseaseForm.treatment" required></textarea>
          </div>

          <div class="form-group">
            <label>Cây thuốc liên quan</label>
            <select v-model="diseaseForm.relatedPlants" multiple>
              <option v-for="plant in availablePlants" :key="plant.id" :value="plant">
                {{ plant.name }}
              </option>
            </select>
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="diseaseForm.active">
              Hoạt động
            </label>
          </div>

          <div class="modal-actions">
            <button type="submit" class="btn-save">Lưu</button>
            <button type="button" @click="closeModal" class="btn-cancel">Hủy</button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'

interface Plant {
  id: number
  name: string
}

interface Disease {
  id: number
  name: string
  symptoms: string
  treatment: string
  relatedPlants: Plant[]
  active: boolean
}

const diseases = ref<Disease[]>([
  {
    id: 1,
    name: 'Viêm họng',
    symptoms: 'Đau rát họng, khó nuốt',
    treatment: 'Súc họng với nước muối, uống thuốc kháng viêm',
    relatedPlants: [{ id: 1, name: 'Nghệ' }],
    active: true
  }
])

const availablePlants = ref<Plant[]>([
  { id: 1, name: 'Nghệ' },
  { id: 2, name: 'Gừng' },
  { id: 3, name: 'Sả' }
])

const showAddModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')

const diseaseForm = reactive({
  id: 0,
  name: '',
  symptoms: '',
  treatment: '',
  relatedPlants: [] as Plant[],
  active: true
})

const handleSearch = () => {
  // Implement search logic
}

const editDisease = (disease: Disease) => {
  Object.assign(diseaseForm, disease)
  showEditModal.value = true
}

const deleteDisease = async (id: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa bệnh này?')) {
    // Implement delete logic
    diseases.value = diseases.value.filter(disease => disease.id !== id)
  }
}

const handleSubmit = async () => {
  if (showEditModal.value) {
    // Implement update logic
    const index = diseases.value.findIndex(d => d.id === diseaseForm.id)
    if (index !== -1) {
      diseases.value[index] = { ...diseaseForm }
    }
  } else {
    // Implement create logic
    const newDisease = {
      ...diseaseForm,
      id: diseases.value.length + 1
    }
    diseases.value.push(newDisease)
  }
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  Object.assign(diseaseForm, {
    id: 0,
    name: '',
    symptoms: '',
    treatment: '',
    relatedPlants: [],
    active: true
  })
}
</script>

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
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.disease-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.disease-table th,
.disease-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

.plant-tag {
  display: inline-block;
  background: #e3f2fd;
  color: #1976d2;
  padding: 2px 8px;
  border-radius: 12px;
  margin: 2px;
  font-size: 0.9em;
}

.btn-add {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit,
.btn-delete {
  padding: 4px 8px;
  margin: 0 4px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.btn-edit {
  background: #2196F3;
  color: white;
}

.btn-delete {
  background: #f44336;
  color: white;
}

.status {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
}

.status.active {
  background: #e8f5e9;
  color: #4CAF50;
}

.status.inactive {
  background: #ffebee;
  color: #f44336;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
}

.modal-content {
  background: white;
  padding: 20px;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
}

.form-group select {
  height: 120px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
}

.btn-save {
  background: #4CAF50;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 4px;
  cursor: pointer;
}
</style> 
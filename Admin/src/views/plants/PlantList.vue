<template>
  <div class="plant-list">
    <div class="header">
      <h2>Quản lý cây thuốc</h2>
      <button @click="showAddModal = true" class="btn-add">
        <i class="fas fa-plus"></i> Thêm cây thuốc
      </button>
    </div>

    <div class="search-bar">
      <input 
        v-model="searchQuery" 
        type="text" 
        placeholder="Tìm kiếm cây thuốc..."
        @input="handleSearch"
      >
    </div>

    <table class="plant-table">
      <thead>
        <tr>
          <th>Hình ảnh</th>
          <th>Tên cây</th>
          <th>Mô tả</th>
          <th>Công dụng</th>
          <th>Trạng thái</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="plant in plants" :key="plant.id">
          <td>
            <img :src="plant.image" :alt="plant.name" class="plant-image">
          </td>
          <td>{{ plant.name }}</td>
          <td>{{ plant.description }}</td>
          <td>{{ plant.uses }}</td>
          <td>
            <span :class="['status', plant.active ? 'active' : 'inactive']">
              {{ plant.active ? 'Hoạt động' : 'Không hoạt động' }}
            </span>
          </td>
          <td>
            <button @click="editPlant(plant)" class="btn-edit">
              <i class="fas fa-edit"></i>
            </button>
            <button @click="deletePlant(plant.id)" class="btn-delete">
              <i class="fas fa-trash"></i>
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Add/Edit Modal -->
    <div v-if="showAddModal || showEditModal" class="modal">
      <div class="modal-content">
        <h3>{{ showEditModal ? 'Sửa cây thuốc' : 'Thêm cây thuốc mới' }}</h3>
        <form @submit.prevent="handleSubmit">
          <div class="form-group">
            <label>Tên cây thuốc</label>
            <input v-model="plantForm.name" type="text" required>
          </div>
          
          <div class="form-group">
            <label>Mô tả</label>
            <textarea v-model="plantForm.description" required></textarea>
          </div>

          <div class="form-group">
            <label>Công dụng</label>
            <textarea v-model="plantForm.uses" required></textarea>
          </div>

          <div class="form-group">
            <label>Hình ảnh</label>
            <input type="file" @change="handleImageUpload" accept="image/*">
          </div>

          <div class="form-group">
            <label>
              <input type="checkbox" v-model="plantForm.active">
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
  description: string
  uses: string
  image: string
  active: boolean
}

const plants = ref<Plant[]>([
  {
    id: 1,
    name: 'Nghệ',
    description: 'Cây nghệ là một loại cây thảo có củ màu vàng',
    uses: 'Chống viêm, kháng khuẩn',
    image: '/images/nghe.jpg',
    active: true
  }
])

const showAddModal = ref(false)
const showEditModal = ref(false)
const searchQuery = ref('')

const plantForm = reactive({
  id: 0,
  name: '',
  description: '',
  uses: '',
  image: '',
  active: true
})

const handleSearch = () => {
  // Implement search logic
}

const editPlant = (plant: Plant) => {
  Object.assign(plantForm, plant)
  showEditModal.value = true
}

const deletePlant = async (id: number) => {
  if (confirm('Bạn có chắc chắn muốn xóa cây thuốc này?')) {
    // Implement delete logic
    plants.value = plants.value.filter(plant => plant.id !== id)
  }
}

const handleImageUpload = (event: Event) => {
  const file = (event.target as HTMLInputElement).files?.[0]
  if (file) {
    // Implement image upload logic
  }
}

const handleSubmit = async () => {
  if (showEditModal.value) {
    // Implement update logic
    const index = plants.value.findIndex(p => p.id === plantForm.id)
    if (index !== -1) {
      plants.value[index] = { ...plantForm }
    }
  } else {
    // Implement create logic
    const newPlant = {
      ...plantForm,
      id: plants.value.length + 1
    }
    plants.value.push(newPlant)
  }
  closeModal()
}

const closeModal = () => {
  showAddModal.value = false
  showEditModal.value = false
  Object.assign(plantForm, {
    id: 0,
    name: '',
    description: '',
    uses: '',
    image: '',
    active: true
  })
}
</script>

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
  margin-bottom: 20px;
}

.search-bar input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
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
.form-group textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.form-group textarea {
  height: 100px;
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
<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Advice } from '../../models/Advice'
import { adviceService } from '../../services/advice.service'
import { plantService } from '../../services/plant.service'
import { diseasesService } from '../../services/diseases.service'
import { authService } from '../../services/auth.service'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

// State for advice data
const advice = ref<Advice>(Advice.createDefault())

// State for dropdown options
const plants = ref<{ plant_id: number; name: string }[]>([])
const diseases = ref<{ disease_id: number; name: string }[]>([])

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true
    const currentUser = authService.getCurrentUser()
    
    if (!currentUser) {
      ElMessage.error('Vui lòng đăng nhập để tạo lời khuyên')
      return
    }

    // Validate required fields
    if (!advice.value.title || !advice.value.content || !advice.value.plant.plant_id || !advice.value.disease.disease_id) {
      ElMessage.error('Vui lòng điền đầy đủ thông tin')
      return
    }

    // Prepare data for API
    const submitData = {
      title: advice.value.title.trim(),
      content: advice.value.content.trim(),
      plant_id: advice.value.plant.plant_id,
      disease_id: advice.value.disease.disease_id,
      user_id: currentUser.id
    }

    // Call API to create advice
    const response = await adviceService.createAdvice(submitData)
    
    if (response) {
      ElMessage.success('Tạo lời khuyên thành công')
      router.push('/profile/advice')
    } else {
      throw new Error('Không thể tạo lời khuyên')
    }
  } catch (error) {
    console.error('Error creating advice:', error)
    ElMessage.error('Không thể tạo lời khuyên: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
  } finally {
    loading.value = false
  }
}

// Fetch dropdown options
const fetchOptions = async () => {
  try {
    loading.value = true
    const [plantsResponse, diseasesResponse] = await Promise.all([
      plantService.getPlants(),
      diseasesService.getDiseases()
    ])

    plants.value = Array.isArray(plantsResponse) ? plantsResponse : []
    diseases.value = Array.isArray(diseasesResponse) ? diseasesResponse : []

    console.log('Fetched plants:', plants.value)
    console.log('Fetched diseases:', diseases.value)

    // Handle plant_id from query params
    const plantId = Number(route.query.plant_id)
    console.log('Plant ID from query params:', plantId)
    
    if (plantId && !isNaN(plantId)) {
      const plant = plants.value.find(p => p.plant_id === plantId)
      console.log('Found plant:', plant)
      
      if (plant) {
        advice.value.plant = {
          plant_id: plant.plant_id,
          name: plant.name
        }
        console.log('Set advice plant:', advice.value.plant)
      }
    }

    // Handle disease_id from query params
    const diseaseId = Number(route.query.disease_id)
    console.log('Disease ID from query params:', diseaseId)
    
    if (diseaseId && !isNaN(diseaseId)) {
      const disease = diseases.value.find(d => d.disease_id === diseaseId)
      console.log('Found disease:', disease)
      
      if (disease) {
        advice.value.disease = {
          disease_id: disease.disease_id,
          name: disease.name
        }
        console.log('Set advice disease:', advice.value.disease)
      }
    }
  } catch (error) {
    console.error('Error fetching options:', error)
    ElMessage.error('Không thể tải dữ liệu')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  const plantId = Number(route.query.plant_id)
  const diseaseId = Number(route.query.disease_id)

  if (plantId && !isNaN(plantId)) {
    router.push(`/plant/${plantId}`)
  } else if (diseaseId && !isNaN(diseaseId)) {
    router.push(`/disease/${diseaseId}`)
  } else {
    router.push('/profile/advice')
  }
}

onMounted(async () => {
  await fetchOptions()
})
</script>

<template>
  <div class="advice-create">
    <div class="header">
      <h2>Tạo lời khuyên mới</h2>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải dữ liệu...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="create-form">
      <div class="form-group">
        <label>Tiêu đề</label>
        <input 
          v-model="advice.title" 
          type="text" 
          placeholder="Nhập tiêu đề lời khuyên"
          required
        >
      </div>

      <div class="form-group">
        <label>Nội dung</label>
        <textarea 
          v-model="advice.content" 
          rows="6" 
          placeholder="Nhập nội dung lời khuyên"
          required
        ></textarea>
      </div>

      <div class="form-row">
        <div class="form-group">
          <label>Cây trồng</label>
          <select v-model="advice.plant.plant_id" required>
            <option value="" disabled>Chọn cây trồng</option>
            <option 
              v-for="plant in plants" 
              :key="plant.plant_id" 
              :value="plant.plant_id"
            >
              {{ plant.name }}
            </option>
          </select>
        </div>

        <div class="form-group">
          <label>Bệnh</label>
          <select v-model="advice.disease.disease_id" required>
            <option value="" disabled>Chọn bệnh</option>
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

      <div class="form-actions">
        <button type="submit" class="btn-save" :disabled="loading">
          <i class="fas fa-save"></i>
          {{ loading ? 'Đang lưu...' : 'Tạo lời khuyên' }}
        </button>
        <button type="button" class="btn-cancel" @click="handleCancel">
          <i class="fas fa-times"></i>
          Hủy
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.advice-create {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px;
}

.header {
  margin-bottom: 2rem;
}

.header h2 {
  color: #008053;
  margin: 0;
}

.loading {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: #666;
}

.loading i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #008053;
}

.create-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s ease;
}

.form-group input[type="text"]:focus,
.form-group textarea:focus,
.form-group select:focus {
  outline: none;
  border-color: #008053;
}

.form-group textarea {
  resize: vertical;
  min-height: 120px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.5rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-save,
.btn-cancel {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.btn-save {
  background: #008053;
  color: white;
}

.btn-save:hover:not(:disabled) {
  background: #006040;
  transform: translateY(-2px);
}

.btn-save:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
}

.btn-cancel:hover {
  background: #757575;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .advice-create {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-save,
  .btn-cancel {
    width: 100%;
    justify-content: center;
  }
}
</style>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Advice } from '../../models/Advice'
import { adviceService } from '../../services/advice.service'
import { plantService } from '../../services/plant.service'
import { diseasesService } from '../../services/diseases.service'
import { userService } from '../../services/user.service'

const route = useRoute()
const router = useRouter()
const loading = ref(false)

// State for advice data
const advice = ref<Advice>({
  ...Advice.createDefault(),
  plant: { plant_id: 0, name: '' },
  disease: { disease_id: 0, name: '' },
  user: { user_id: 0, full_name: '', title: '' }
})

// State for dropdown options
const plants = ref<{ plant_id: number; name: string }[]>([])
const diseases = ref<{ disease_id: number; name: string }[]>([])
const users = ref<{ user_id: number; full_name: string; title: string; active: boolean }[]>([])

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true
    console.log('Updating advice data:', advice.value)
    
    // Validate required fields
    if (!advice.value.title || !advice.value.content) {
      ElMessage.error('Vui lòng điền đầy đủ thông tin bắt buộc')
      loading.value = false
      return
    }
    
    // Get advice ID from route params
    const adviceId = Number(route.params.id)
    
    // Prepare data
    const plantData = advice.value.plant.plant_id ? {
      plant_id: advice.value.plant.plant_id,
      name: advice.value.plant.name
    } : undefined

    const diseaseData = advice.value.disease.disease_id ? {
      disease_id: advice.value.disease.disease_id,
      name: advice.value.disease.name
    } : undefined

    const userData = advice.value.user.user_id ? {
      user_id: advice.value.user.user_id,
      full_name: advice.value.user.full_name,
      title: advice.value.user.title
    } : undefined
    
    // Call API to update advice
    const response = await adviceService.updateAdvice(adviceId, {
      title: advice.value.title,
      content: advice.value.content,
      plant: plantData,
      disease: diseaseData,
      user: userData
    })
    
    console.log('Advice updated successfully:', response)
    ElMessage.success('Cập nhật lời khuyên thành công')
    router.push({ name: 'advices' })
  } catch (error) {
    console.error('Error updating advice:', error)
    ElMessage.error('Không thể cập nhật lời khuyên: ' + (error instanceof Error ? error.message : 'Lỗi không xác định'))
  } finally {
    loading.value = false
  }
}

// Fetch dropdown options
const fetchOptions = async () => {
  try {
    loading.value = true
    const [plantsResponse, diseasesResponse, usersResponse] = await Promise.all([
      plantService.getPlants(),
      diseasesService.getDiseases(),
      userService.getUsers()
    ])

    // Handle plants response
    if (plantsResponse) {
      plants.value = Array.isArray(plantsResponse) ? plantsResponse : []
    }

    // Handle diseases response
    if (Array.isArray(diseasesResponse)) {
      diseases.value = diseasesResponse
    }

    // Handle users response
    if (usersResponse && usersResponse.data) {
      const responseData = usersResponse.data
      if (Array.isArray(responseData)) {
        users.value = responseData
      } else if (responseData && typeof responseData === 'object') {
        const nestedData = (responseData as any).data
        users.value = Array.isArray(nestedData) ? nestedData : []
      }
    }
  } catch (error) {
    console.error('Error fetching options:', error)
    ElMessage.error('Không thể tải dữ liệu cho form')
  } finally {
    loading.value = false
  }
}

// Fetch advice data
const fetchAdviceData = async () => {
  try {
    loading.value = true
    const response = await adviceService.getAdviceById(Number(route.params.id))
    console.log('Advice data:', response)

    if (response) {
      // Ensure all required fields are initialized
      advice.value = {
        ...response,
        plant: response.plant || { plant_id: 0, name: '' },
        disease: response.disease || { disease_id: 0, name: '' },
        user: response.user || { user_id: 0, full_name: '', title: '' }
      }
    }
  } catch (error) {
    console.error('Error fetching advice:', error)
    ElMessage.error('Không thể tải dữ liệu lời khuyên')
  } finally {
    loading.value = false
  }
}

const handleCancel = () => {
  router.push({ name: 'advices' })
}

onMounted(async () => {
  await Promise.all([
    fetchOptions(),
    fetchAdviceData()
  ])
})
</script>

<template>
  <div class="advice-edit">
    <div class="header">
      <h2>Cập nhật lời khuyên</h2>
    </div>

    <div v-if="loading" class="loading">
      Đang tải...
    </div>

    <form v-else @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-group">
        <label>Tiêu đề</label>
        <input v-model="advice.title" type="text" required>
      </div>

      <div class="form-group">
        <label>Nội dung</label>
        <textarea v-model="advice.content" rows="4" required></textarea>
      </div>

      <div class="form-group">
        <label>Cây trồng</label>
        <select v-model="advice.plant.plant_id">
          <option :value="0">Không chọn cây</option>
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
        <select v-model="advice.disease.disease_id">
          <option :value="0">Không chọn bệnh</option>
          <option 
            v-for="disease in diseases" 
            :key="disease.disease_id" 
            :value="disease.disease_id"
          >
            {{ disease.name }}
          </option>
        </select>
      </div>

      <div class="form-group">
        <label>Người đưa lời khuyên</label>
        <select v-model="advice.user.user_id">
          <option :value="0">Không có người đưa lời khuyên</option>
          <option 
            v-for="user in users" 
            :key="user.user_id" 
            :value="user.user_id"
          >
            {{ user.full_name }} ({{ user.active ? 'Hoạt động' : 'Không hoạt động' }})
          </option>
        </select>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save" :disabled="loading">
          {{ loading ? 'Đang lưu...' : 'Lưu thay đổi' }}
        </button>
        <button type="button" class="btn-cancel" @click="handleCancel">
          Hủy
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.advice-edit {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.header {
  margin-bottom: 30px;
}

.edit-form {
  background: white;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
}

.form-group input[type="text"],
.form-group textarea,
.form-group select {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.form-actions {
  display: flex;
  gap: 15px;
  margin-top: 30px;
}

.btn-save,
.btn-cancel {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
}

.btn-save {
  background: #4CAF50;
  color: white;
}

.btn-save:disabled {
  background: #9e9e9e;
  cursor: not-allowed;
}

.btn-cancel {
  background: #9e9e9e;
  color: white;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style> 
<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { adviceService } from '../../services/advice.service'
import { plantService } from '../../services/plant.service'
import { diseasesService } from '../../services/diseases.service'
import { userService } from '../../services/user.service'
import type { Plant } from '../../models/Plant'
import type { Disease } from '../../models/Diseases'
import type { User } from '../../models/User'



const router = useRouter()
const loading = ref(false)
const adviceForm = ref<FormInstance>()

// State for dropdown options
const plants = ref<Plant[]>([])
const diseases = ref<Disease[]>([])
const users = ref<User[]>([])

// Form data
const formData = reactive({
  title: '',
  content: '',
  instructions: '',
  plant_id: '',
  disease_id: '',
  user_id: ''
})

// Form validation rules
const rules = {
  title: [
    { required: true, message: 'Vui lòng nhập tiêu đề', trigger: 'blur' },
    { min: 3, message: 'Tiêu đề phải có ít nhất 3 ký tự', trigger: 'blur' }
  ],
  content: [
    { required: true, message: 'Vui lòng nhập nội dung', trigger: 'blur' },
    { min: 10, message: 'Nội dung phải có ít nhất 10 ký tự', trigger: 'blur' }
  ],
  plant_id: [
    { required: true, message: 'Vui lòng chọn cây thuốc', trigger: 'change' }
  ],
  disease_id: [
    { required: true, message: 'Vui lòng chọn bệnh', trigger: 'change' }
  ],
  user_id: [
    { required: true, message: 'Vui lòng chọn người đưa lời khuyên', trigger: 'change' }
  ]
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

    // Log raw responses for debugging
    console.log('Raw responses:', {
      plants: plantsResponse,
      diseases: diseasesResponse,
      users: usersResponse
    })

    // Handle plants response (has data property)
    if (plantsResponse) {
      plants.value = Array.isArray(plantsResponse) ? plantsResponse : []
    } else {
      plants.value = []
    }

    // Handle diseases response (direct array)
    diseases.value = Array.isArray(diseasesResponse) ? diseasesResponse : []

    // Handle users response
    console.log('Users response structure:', usersResponse)
    if (usersResponse && usersResponse.data) {
      const responseData = usersResponse.data
      if (Array.isArray(responseData)) {
        users.value = responseData
      } else if (responseData && typeof responseData === 'object') {
        const nestedData = (responseData as any).data
        users.value = Array.isArray(nestedData) ? nestedData : []
      } else {
        users.value = []
      }
    } else {
      users.value = []
    }

    console.log('Processed options:', {
      plantsCount: plants.value.length,
      diseasesCount: diseases.value.length,
      usersCount: users.value.length,
      users: users.value
    })
  } catch (error) {
    console.error('Error fetching options:', error)
    ElMessage.error('Không thể tải dữ liệu cho form')
  } finally {
    loading.value = false
  }
}

// Handle form submission
const handleSubmit = async () => {
  console.log('Click submit')
  console.log('Form data:', formData)
  
  if (!adviceForm.value) {
    console.error('Form reference is not available')
    return
  }
  
  try {
    // Validate form
    await adviceForm.value.validate()
    console.log('Form validation passed')
    
    loading.value = true
    
    // Prepare data for submission
    const submitData = {
      title: formData.title.trim(),
      content: formData.content.trim(),
      plant_id: Number(formData.plant_id),
      disease_id: Number(formData.disease_id),
      user_id: Number(formData.user_id)
    }
    
    console.log('Submitting data:', submitData)
    
    // Submit data
    const response = await adviceService.createAdvice(submitData)
    console.log('Create advice response:', response)
    
    if (response) {
      ElMessage.success('Tạo lời khuyên thành công')
      router.push('/admin/advices')
    } else {
      throw new Error('Không thể tạo lời khuyên')
    }
  } catch (error) {
    console.error('Submit error:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('Tạo lời khuyên thất bại')
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(() => {
  fetchOptions()
})
</script>

<template>
  <div class="advice-create">
    <h1>Tạo lời khuyên mới</h1>
    <div class="form-container">
      <el-form
        ref="adviceForm"
        :model="formData"
        :rules="rules"
        class="custom-form"
        @submit.prevent="handleSubmit"
      >
        <div class="form-group">
          <label>Tiêu đề:</label>
          <el-input
            v-model="formData.title"
            placeholder="Nhập tiêu đề"
            :disabled="loading"
          />
        </div>

        <div class="form-group">
          <label>Nội dung:</label>
          <el-input
            v-model="formData.content"
            type="textarea"
            :rows="4"
            placeholder="Nhập nội dung"
            :disabled="loading"
          />
        </div>

        
        


        <div class="form-group">
          <label>Cây thuốc:</label>
          <el-select
            v-model="formData.plant_id"
            placeholder="Chọn cây thuốc"
            :disabled="loading"
            class="full-width"
          >
            <el-option
              v-for="plant in plants"
              :key="plant.plant_id"
              :label="plant.name"
              :value="plant.plant_id"
            />
          </el-select>
        </div>

        <div class="form-group">
          <label>Bệnh:</label>
          <el-select
            v-model="formData.disease_id"
            placeholder="Chọn bệnh"
            :disabled="loading"
            class="full-width"
          >
            <el-option
              v-for="disease in diseases"
              :key="disease.disease_id"
              :label="disease.name"
              :value="disease.disease_id"
            />
          </el-select>
        </div>

        <div class="form-group">
          <label>Người đưa lời khuyên:</label>
          <el-select
            v-model="formData.user_id"
            placeholder="Chọn người dùng"
            :disabled="loading"
            class="full-width"
          >
            <el-option
              v-for="user in users"
              :key="user.user_id"
              :label="`${user.full_name} (${user.active ? 'Hoạt động' : 'Không hoạt động'})`"
              :value="user.user_id"
            />
          </el-select>
        </div>

        <div class="form-actions">
          <el-button
            type="primary"
            native-type="submit"
            :loading="loading"
            class="btn btn-primary"
          >
            {{ loading ? 'Đang tạo...' : 'Tạo mới' }}
          </el-button>
          <el-button
            @click="router.push('/admin/advices')"
            :disabled="loading"
            class="btn btn-secondary"
          >
            Hủy
          </el-button>
        </div>
      </el-form>
    </div>
  </div>
</template>

<style scoped>
.advice-create {
  padding: 20px;
}

.form-container {
  margin-top: 20px;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  background: white;
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

:deep(.el-input),
:deep(.el-select),
:deep(.el-textarea) {
  width: 100%;
}

:deep(.el-input__inner),
:deep(.el-textarea__inner) {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

:deep(.el-input__inner:focus),
:deep(.el-textarea__inner:focus) {
  outline: none;
  border-color: #4CAF50;
  box-shadow: 0 0 0 2px rgba(76, 175, 80, 0.1);
}

.form-actions {
  display: flex;
  gap: 10px;
  margin-top: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-primary {
  background-color: #4CAF50;
  color: white;
}

.btn-secondary {
  background-color: #f5f5f5;
  color: #333;
  border: 1px solid #ddd;
}

.btn:disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.btn:hover:not(:disabled) {
  opacity: 0.9;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #e0e0e0;
}

.full-width {
  width: 100%;
}
</style> 
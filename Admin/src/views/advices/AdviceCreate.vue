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
    if (plantsResponse && plantsResponse.data) {
      plants.value = Array.isArray(plantsResponse.data) ? plantsResponse.data : []
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
      title: formData.title,
      content: formData.content,
      plant_id: parseInt(formData.plant_id),
      disease_id: parseInt(formData.disease_id),
      user_id: parseInt(formData.user_id)
    }
    
    console.log('Submitting data:', submitData)
    
    // Submit data
    await adviceService.createAdvice(submitData)
    
    ElMessage.success('Tạo lời khuyên thành công')
    router.push('/admin/advices')
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
    <h2>Tạo lời khuyên mới</h2>
    <el-form
      ref="adviceForm"
      :model="formData"
      :rules="rules"
      label-width="120px"
      class="advice-form"
    >
      <el-form-item label="Tiêu đề" prop="title">
        <el-input v-model="formData.title" />
      </el-form-item>

      <el-form-item label="Nội dung" prop="content">
        <el-input
          v-model="formData.content"
          type="textarea"
          :rows="4"
        />
      </el-form-item>

      <el-form-item label="Cây trồng" prop="plant_id">
        <el-select
          v-model="formData.plant_id"
          placeholder="Chọn cây trồng"
          class="w-full"
        >
          <el-option
            v-for="plant in plants"
            :key="plant.plant_id"
            :label="plant.name"
            :value="plant.plant_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Bệnh" prop="disease_id">
        <el-select
          v-model="formData.disease_id"
          placeholder="Chọn bệnh"
          class="w-full"
        >
          <el-option
            v-for="disease in diseases"
            :key="disease.disease_id"
            :label="disease.name"
            :value="disease.disease_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="Người dùng" prop="user_id">
        <el-select v-model="formData.user_id" placeholder="Chọn người dùng" filterable>
          <el-option
            v-for="user in users"
            :key="user.user_id"
            :label="`${user.full_name} (${user.active ? 'Hoạt động' : 'Không hoạt động'})`"
            :value="user.user_id"
          />
        </el-select>
      </el-form-item>

      <el-form-item>
        <el-button type="primary" @click="handleSubmit" :loading="loading">
          Tạo mới
        </el-button>
        <el-button @click="$router.back()">Hủy</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped>
.advice-create {
  padding: 20px;
  max-width: 800px;
  margin: 0 auto;
}

.advice-form {
  margin-top: 20px;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

h2 {
  margin-bottom: 20px;
  color: #303133;
}
</style> 
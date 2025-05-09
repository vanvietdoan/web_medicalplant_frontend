<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'
import { reportService } from '../../services/report.service'
import { plantService } from '../../services/plant.service'
import type { Plant } from '../../models/Plant'
import { authService } from '../../services/auth.service'

const router = useRouter()
const loading = ref(false)
const reportForm = ref<FormInstance>()
const selectedPlant = ref<Plant | null>(null)
const fromPlant = ref(false)

// State for dropdown options
const plants = ref<Plant[]>([])

// Form data
const formData = reactive({
  plant_name: '',
  plant_english_name: '',
  plant_description: '',
  plant_instructions: '',
  plant_benefits: '',
  plant_species_id: 0,
  propose: '',
  summary: '',
  proof: '',
  plant_id: 0,
  user_id: authService.getCurrentUser()?.id || 0
})

// Form validation rules
const rules = {
  plant_id: [
    { required: true, message: 'Vui lòng chọn cây thuốc', trigger: 'change' }
  ],
  summary: [
    { required: true, message: 'Vui lòng nhập tóm tắt', trigger: 'blur' },
    { min: 10, message: 'Tóm tắt phải có ít nhất 10 ký tự', trigger: 'blur' }
  ],
  propose: [
    { required: true, message: 'Vui lòng nhập đề xuất', trigger: 'blur' },
    { min: 10, message: 'Đề xuất phải có ít nhất 10 ký tự', trigger: 'blur' }
  ],
  proof: [
    { required: true, message: 'Vui lòng nhập bằng chứng', trigger: 'blur' },
    { min: 10, message: 'Bằng chứng phải có ít nhất 10 ký tự', trigger: 'blur' }
  ]
}

// Add originalPlantName ref
const originalPlantName = ref('')

// Update handlePlantChange function
const handlePlantChange = (plantId: number) => {
  const plant = plants.value.find(p => p.plant_id === plantId)
  if (plant) {
    selectedPlant.value = plant
    originalPlantName.value = plant.name
    formData.plant_name = plant.name
    formData.plant_english_name = plant.english_name
    formData.plant_species_id = plant.species_id
  }
}

// Update resetPlantName function
const resetPlantName = () => {
  if (selectedPlant.value) {
    formData.plant_name = originalPlantName.value
  }
}

// Fetch dropdown options
const fetchOptions = async () => {
  try {
    loading.value = true
    const plantsData = await plantService.getPlants()
    plants.value = plantsData || []
  } catch (error) {
    console.error('Error fetching options:', error)
    ElMessage.error('Không thể tải dữ liệu')
  } finally {
    loading.value = false
  }
}

// Handle form submission
const handleSubmit = async () => {
  try {
    loading.value = true
    
    // Validate required fields
    if (!formData.plant_id) {
      throw new Error('Vui lòng chọn cây thuốc')
    }
    if (!formData.summary.trim()) {
      throw new Error('Vui lòng nhập tóm tắt')
    }
    if (!formData.propose.trim()) {
      throw new Error('Vui lòng nhập đề xuất')
    }
    if (!formData.proof.trim()) {
      throw new Error('Vui lòng nhập bằng chứng')
    }
    
    // Prepare data for submission
    const submitData = {
      plant_id: Number(formData.plant_id),
      summary: formData.summary.trim(),
      propose: formData.propose.trim(),
      proof: formData.proof.trim(),
      plant_name: formData.plant_name.trim(),
      plant_english_name: formData.plant_english_name.trim(),
      plant_description: formData.plant_description.trim(),
      plant_instructions: formData.plant_instructions.trim(),
      plant_benefits: formData.plant_benefits.trim(),
      plant_species_id: formData.plant_species_id,
      user_id: formData.user_id
    }
    
    // Submit data
    const response = await reportService.createReport(submitData)
    
    if (response) {
      ElMessage.success('Tạo báo cáo thành công')
      // Navigate back to plant detail if came from there
      if (fromPlant.value) {
        router.push(`/plant/${formData.plant_id}`)
      } else {
        router.push('/profile/report')
      }
    } else {
      throw new Error('Không thể tạo báo cáo')
    }
  } catch (error) {
    console.error('Submit error:', error)
    if (error instanceof Error) {
      ElMessage.error(error.message)
    } else {
      ElMessage.error('Tạo báo cáo thất bại')
    }
  } finally {
    loading.value = false
  }
}

// Lifecycle hooks
onMounted(async () => {
  await fetchOptions()
  // Check if we came from plant detail page
  const plantId = router.currentRoute.value.query.plant_id
  if (plantId) {
    fromPlant.value = true
    formData.plant_id = Number(plantId)
    const plant = plants.value.find(p => p.plant_id === Number(plantId))
    if (plant) {
      selectedPlant.value = plant
      originalPlantName.value = plant.name
      formData.plant_name = plant.name
      formData.plant_english_name = plant.english_name
      formData.plant_species_id = plant.species_id
      // Pre-fill all plant information
      formData.plant_description = plant.description
      formData.plant_instructions = plant.instructions
      formData.plant_benefits = plant.benefits
    }
  }
})

const loadPlantData = (field: 'plant_description' | 'plant_instructions' | 'plant_benefits') => {
  const selectedPlant = plants.value.find(p => p.plant_id === Number(formData.plant_id))
  if (selectedPlant) {
    switch (field) {
      case 'plant_description':
        formData.plant_description = selectedPlant.description
        break
      case 'plant_instructions':
        formData.plant_instructions = selectedPlant.instructions
        break
      case 'plant_benefits':
        formData.plant_benefits = selectedPlant.benefits
        break
    }
  }
}

// Add clear functions for each field
const clearField = (field: 'plant_description' | 'plant_instructions' | 'plant_benefits') => {
  formData[field] = ''
}
</script>
<template>
  <div class="report-create">
    <div class="header">
      <h2>Tạo báo cáo mới</h2>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải dữ liệu...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="create-form">
      <div class="form-row">
        <div class="form-group">
          <label>Tên cây</label>
          <div class="input-group">
            <input
              type="text"
              v-model="formData.plant_name"
              placeholder="Nhập tên cây"
            />
            <button 
              type="button" 
              class="btn-icon" 
              @click="resetPlantName"
              title="Khôi phục tên gốc"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
        </div>

        <div class="form-group">
          <label>Tên tiếng Anh</label>
          <input
            type="text"
            v-model="formData.plant_english_name"
            placeholder="Nhập tên tiếng Anh"
          />
        </div>
      </div>

      <div class="form-group">
        <label>Cây thuốc</label>
        <select 
          v-model="formData.plant_id"
          @change="handlePlantChange(Number(formData.plant_id))"
          required
        >
          <option value="">Chọn cây thuốc</option>
          <option 
            v-for="plant in plants" 
            :key="plant.plant_id" 
            :value="plant.plant_id"
          >
            {{ plant.name }}
          </option>
        </select>
      </div>

      <div v-if="selectedPlant" class="form-group">
        <label>Mô tả</label>
        <div class="input-group">
          <textarea
            v-model="formData.plant_description"
            rows="5"
            placeholder="Nhập mô tả"
          ></textarea>
          <div class="button-group">
            <button 
              type="button" 
              class="btn-icon" 
              @click="loadPlantData('plant_description')"
              title="Lấy từ cây hiện tại"
            >
              <i class="fas fa-sync"></i>
            </button>
            <button 
              type="button" 
              class="btn-icon" 
              @click="clearField('plant_description')"
              title="Xóa nội dung"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectedPlant" class="form-group">
        <label>Hướng dẫn sử dụng</label>
        <div class="input-group">
          <textarea
            v-model="formData.plant_instructions"
            rows="5"
            placeholder="Nhập hướng dẫn sử dụng"
          ></textarea>
          <div class="button-group">
            <button 
              type="button" 
              class="btn-icon" 
              @click="loadPlantData('plant_instructions')"
              title="Lấy từ cây hiện tại"
            >
              <i class="fas fa-sync"></i>
            </button>
            <button 
              type="button" 
              class="btn-icon" 
              @click="clearField('plant_instructions')"
              title="Xóa nội dung"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div v-if="selectedPlant" class="form-group">
        <label>Công dụng</label>
        <div class="input-group">
          <textarea
            v-model="formData.plant_benefits"
            rows="5"
            placeholder="Nhập công dụng"
          ></textarea>
          <div class="button-group">
            <button 
              type="button" 
              class="btn-icon" 
              @click="loadPlantData('plant_benefits')"
              title="Lấy từ cây hiện tại"
            >
              <i class="fas fa-sync"></i>
            </button>
            <button 
              type="button" 
              class="btn-icon" 
              @click="clearField('plant_benefits')"
              title="Xóa nội dung"
            >
              <i class="fas fa-times"></i>
            </button>
          </div>
        </div>
      </div>

      <div class="form-group">
        <label>Tóm tắt</label>
        <textarea
          v-model="formData.summary"
          rows="4"
          placeholder="Nhập tóm tắt"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label>Đề xuất</label>
        <textarea
          v-model="formData.propose"
          rows="4"
          placeholder="Nhập đề xuất"
          required
        ></textarea>
      </div>

      <div class="form-group">
        <label>Bằng chứng</label>
        <textarea
          v-model="formData.proof"
          rows="4"
          placeholder="Nhập bằng chứng"
          required
        ></textarea>
      </div>

      <div class="form-actions">
        <button type="submit" class="btn-save" :disabled="loading">
          <i class="fas fa-save"></i>
          {{ loading ? 'Đang lưu...' : 'Tạo báo cáo' }}
        </button>
        <button type="button" class="btn-cancel" @click="router.push('/profile/report')">
          <i class="fas fa-times"></i>
          Hủy
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.report-create {
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
  font-size: 2rem;
  margin-bottom: 1rem;
  color: #008053;
}

.create-form {
  background: white;
  padding: 2rem;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

input, select, textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

input:focus, select:focus, textarea:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0,128,83,0.1);
}

textarea {
  resize: vertical;
  min-height: 100px;
}

.input-group {
  display: flex;
  gap: 0.5rem;
}

.button-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.btn-icon {
  padding: 0.75rem;
  background: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  color: #666;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
}

.btn-icon:hover {
  background: #e9ecef;
  color: #008053;
}

.btn-icon i {
  font-size: 1rem;
}

.form-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  margin-top: 2rem;
}

.btn-save, .btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 4px;
  font-size: 1rem;
  font-weight: 500;
  cursor: pointer;
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

.btn-cancel {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}

.btn-cancel:hover {
  background: #e9ecef;
  transform: translateY(-2px);
}

.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
  transform: none;
}

@media (max-width: 768px) {
  .report-create {
    padding: 1rem;
  }

  .form-row {
    grid-template-columns: 1fr;
  }

  .form-actions {
    flex-direction: column;
  }

  .btn-save, .btn-cancel {
    width: 100%;
    justify-content: center;
  }
}
</style> 
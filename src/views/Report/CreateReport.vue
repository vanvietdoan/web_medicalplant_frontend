<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { reportService } from '../../services/report.service'
import { plantService } from '../../services/plant.service'
import type { Plant } from '../../models/Plant'
import { authService } from '../../services/auth.service'

const router = useRouter()
const loading = ref(false)
const selectedPlant = ref<Plant | null>(null)
const fromPlant = ref(false)
const success = ref(false)

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
    // Luôn cập nhật lại các trường này
    formData.plant_description = plant.description
    formData.plant_instructions = plant.instructions
    formData.plant_benefits = plant.benefits
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
      success.value = true
      // Không chuyển trang ngay, chỉ chuyển khi bấm nút
      // if (fromPlant.value) {
      //   router.push(`/plant/${formData.plant_id}`)
      // } else {
      //   router.push('/profile/report')
      // }
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
  <div class="report-create-new">
    <div class="page-title">
      Tạo báo cáo về cây thuốc
    </div>
    <template v-if="!success">
      <!-- Stepper -->
      <div class="stepper">
        <div class="step" :class="{active: !formData.plant_id || formData.plant_id}">
          <div class="circle"><i class="fas fa-check" v-if="formData.plant_id"></i></div>
          <span>Chọn bài viết</span>
        </div>
        <div class="line" :class="{inactive: !formData.plant_id}"></div>
        <div class="step" :class="{active: formData.plant_id}">
          <div class="circle"><i class="fas fa-check" v-if="formData.plant_id"></i></div>
          <span>Chỉnh sửa</span>
        </div>
        <div class="line inactive"></div>
        <div class="step">
          <div class="circle"></div>
          <span>Gửi yêu cầu</span>
        </div>
      </div>
      <!-- Form -->
      <div v-if="loading" class="loading">
        <i class="fas fa-spinner fa-spin"></i>
        <p>Đang tải dữ liệu...</p>
      </div>
      <form v-else @submit.prevent="handleSubmit" class="edit-compare-form">
        <div class="columns">
          <!-- Cột trái: Thông tin gốc -->
          <div class="column original">
            <div class="form-group">
              <label>Tiêu đề</label>
              <input type="text" :value="selectedPlant?.name || ''" disabled />
            </div>
            <div class="form-group">
              <label>Tên quốc tế</label>
              <input type="text" :value="selectedPlant?.english_name || ''" disabled />
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <textarea :value="selectedPlant?.description || ''" rows="15" disabled></textarea>
            </div>
            <div class="form-group">
              <label>Công dụng</label>
              <textarea :value="selectedPlant?.benefits || ''" rows="25" disabled></textarea>
            </div>
            <div class="form-group">
              <label>Liều/thức kê sử dụng</label>
              <textarea :value="selectedPlant?.instructions || ''" rows="25" disabled></textarea>
            </div>
          </div>
          <!-- Cột phải: Form chỉnh sửa -->
          <div class="column edit">
            <div class="form-group">
              <label>Cây thuốc</label>
              <select v-model="formData.plant_id" @change="handlePlantChange(Number(formData.plant_id))">
                <option value="">Chọn cây thuốc</option>
                <option v-for="plant in plants" :key="plant.plant_id" :value="plant.plant_id">{{ plant.name }}</option>
              </select>
            </div>
            <div class="form-group">
              <label>Tiêu đề</label>
              <div class="input-check">
                <input type="text" v-model="formData.plant_name" :class="{'valid': formData.plant_name.trim()}" />
                <span v-if="formData.plant_name.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
            <div class="form-group">
              <label>Tên quốc tế</label>
              <div class="input-check">
                <input type="text" v-model="formData.plant_english_name" :class="{'valid': formData.plant_english_name.trim()}" />
                <span v-if="formData.plant_english_name.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
            <div class="form-group">
              <label>Mô tả</label>
              <div class="input-check">
                <textarea v-model="formData.plant_description" rows="15" :class="{'valid': formData.plant_description.trim()}" />
                <span v-if="formData.plant_description.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
            <div class="form-group">
              <label>Công dụng</label>
              <div class="input-check">
                <textarea v-model="formData.plant_benefits" rows="25" :class="{'valid': formData.plant_benefits.trim()}" />
                <span v-if="formData.plant_benefits.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
            <div class="form-group">
              <label>Liều/thức kê sử dụng</label>
              <div class="input-check">
                <textarea v-model="formData.plant_instructions" rows="25" :class="{'valid': formData.plant_instructions.trim()}" />
                <span v-if="formData.plant_instructions.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
            <div class="form-group">
              <label>Tóm tắt</label>
              <div class="input-check">
                <textarea v-model="formData.summary" rows="4" :class="{'valid': formData.summary.trim()}" required />
                <span v-if="formData.summary.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
            <div class="form-group">
              <label>Đề xuất</label>
              <div class="input-check">
                <textarea v-model="formData.propose" rows="4" :class="{'valid': formData.propose.trim()}" required />
                <span v-if="formData.propose.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
            <div class="form-group">
              <label>Bằng chứng</label>
              <div class="input-check">
                <textarea v-model="formData.proof" rows="4" :class="{'valid': formData.proof.trim()}" required />
                <span v-if="formData.proof.trim()" class="icon-check"><i class="fas fa-check-circle"></i></span>
              </div>
            </div>
          </div>
        </div>
        <!-- Nút điều hướng -->
        <div class="form-actions">
          <button type="submit" class="btn-save" :disabled="loading">
            <i class="fas fa-save"></i>
            {{ loading ? 'Đang lưu...' : 'Tiếp tục' }}
          </button>
          <button type="button" class="btn-cancel" @click="router.push('/profile/report')">
            <i class="fas fa-times"></i>
            Hủy
          </button>
        </div>
      </form>
    </template>
    <template v-else>
      <div class="success-step">
        <div class="success-icon"><i class="fas fa-check-circle"></i></div>
        <div class="success-title">Tạo báo cáo thành công!</div>
        <div class="success-actions">
          <button class="btn-save" @click="router.push('/profile/report')">
            <i class="fas fa-list"></i> Về danh sách báo cáo
          </button>
          <button class="btn-cancel" @click="router.push(`/plant/${formData.plant_id}`)">
            <i class="fas fa-leaf"></i> Xem chi tiết cây thuốc
          </button>
        </div>
      </div>
    </template>
  </div>
</template>

<style scoped>
.report-create-new {
  max-width: 1100px;
  margin: 0 auto;
  padding: 2rem 1rem 3rem 1rem;
  background: #f8f9fa;
  min-height: 100vh;
  padding-top: 120px;
}
.page-title {
  font-size: 2rem;
  font-weight: bold;
  color: #008053;
  margin-bottom: 1.5rem;
  text-align: center;
}
.stepper {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 2.5rem;
  gap: 0.5rem;
}
.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 1rem;
  color: #008053;
  font-weight: 500;
}
.step .circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #fff;
  border: 3px solid #008053;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.3rem;
  font-size: 1.2rem;
  color: #008053;
}
.step:not(.active) .circle {
  border: 3px solid #ccc;
  color: #ccc;
}
.step:not(.active) span {
  color: #aaa;
}
.line {
  width: 60px;
  height: 3px;
  background: #008053;
  margin: 0 0.5rem;
  border-radius: 2px;
}
.step:not(.active) ~ .line {
  background: #ccc;
}
.line.inactive {
  background: #ccc !important;
}

.edit-compare-form {
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 2rem 2rem 1.5rem 2rem;
}
.columns {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2.5rem;
}
.column {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}
.column.original input,
.column.original textarea {
  background: #f1f1f1;
  color: #888;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  resize: none;
}
.column.original input:disabled,
.column.original textarea:disabled {
  background: #f1f1f1;
  color: #888;
}
.column.edit input,
.column.edit textarea {
  background: #fff;
  border: 1.5px solid #ddd;
  border-radius: 6px;
  padding: 0.75rem;
  font-size: 1rem;
  transition: border 0.2s;
}
.column.edit input.valid,
.column.edit textarea.valid {
  border-color: #008053;
}
.input-check {
  position: relative;
  display: flex;
  align-items: center;
}
.input-check input,
.input-check textarea {
  flex: 1;
}
.icon-check {
  position: absolute;
  right: 10px;
  color: #008053;
  font-size: 1.2rem;
}
.form-group label {
  font-weight: 500;
  color: #333;
  margin-bottom: 0.4rem;
  display: block;
}
.form-group {
  margin-bottom: 0;
}
.form-actions {
  display: flex;
  gap: 1.2rem;
  justify-content: flex-end;
  margin-top: 2.5rem;
}
.btn-save, .btn-cancel {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.8rem 2.2rem;
  border: none;
  border-radius: 4px;
  font-size: 1.1rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
}
.btn-save {
  background: #008053;
  color: #fff;
}
.btn-save:hover:not(:disabled) {
  background: #006040;
}
.btn-cancel {
  background: #f8f9fa;
  color: #666;
  border: 1px solid #ddd;
}
.btn-cancel:hover {
  background: #e9ecef;
}
.btn-save:disabled {
  background: #ccc;
  cursor: not-allowed;
}
@media (max-width: 900px) {
  .columns {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
}
.success-step {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.07);
  padding: 3rem 2rem;
  margin-top: 2rem;
}
.success-icon {
  font-size: 5rem;
  color: #00b86b;
  margin-bottom: 1.5rem;
}
.success-title {
  font-size: 2rem;
  font-weight: bold;
  color: #008053;
  margin-bottom: 2rem;
}
.success-actions {
  display: flex;
  gap: 1.5rem;
  justify-content: center;
}
@media (max-width: 900px) {
  .success-step {
    padding: 2rem 0.5rem;
  }
  .success-actions {
    flex-direction: column;
    gap: 1rem;
    width: 100%;
  }
  .success-actions .btn-save, .success-actions .btn-cancel {
    width: 100%;
    justify-content: center;
  }
}
.column.edit select {
  width: 100%;
  padding: 0.75rem;
  border: 1.5px solid #ddd;
  border-radius: 6px;
  font-size: 1rem;
  background: #fff;
  transition: border 0.2s;
  margin-bottom: 0.2rem;
}
.column.edit select:focus {
  outline: none;
  border-color: #008053;
}
</style> 
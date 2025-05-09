<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { reportService } from '../../services/report.service';
import { plantService } from '../../services/plant.service';
import { authService } from '../../services/auth.service';
import type { Report } from '../../models/Report';
import type { Plant } from '../../models/Plant';
import { ElMessage } from 'element-plus';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const submitting = ref(false);
const plants = ref<Plant[]>([]);
const report = ref<Report | null>(null);
const originalPlantName = ref('');
const originalReportData = ref({
  description: '',
  instructions: '',
  benefits: ''
});

const formData = ref({
  plant_id: 0,
  plant_name: '',
  plant_english_name: '',
  plant_description: '',
  plant_instructions: '',
  plant_benefits: '',
  plant_species_id: 0,
  propose: '',
  summary: '',
  proof: '',
  user_id: 0
});

const fetchReport = async () => {
  try {
    loading.value = true;
    const reportId = Number(route.params.id);
    const [reportData, plantsData] = await Promise.all([
      reportService.getReportById(reportId),
      plantService.getPlants()
    ]);
    
    // Kiểm tra trạng thái báo cáo
    if (reportData.status !== null) {
      ElMessage.error('Không thể chỉnh sửa báo cáo đã được duyệt hoặc đang duyệt');
      router.push('/profile/report');
      return;
    }

    // Lưu dữ liệu gốc
    originalPlantName.value = reportData.plant_name || '';
    originalReportData.value = {
      description: reportData.plant_description || '',
      instructions: reportData.plant_instructions || '',
      benefits: reportData.plant_benefits || ''
    };

    // Cập nhật form data
    formData.value = {
      plant_id: reportData.plant_id,
      plant_name: reportData.plant_name,
      plant_english_name: reportData.plant_english_name || '',
      plant_description: reportData.plant_description || '',
      plant_instructions: reportData.plant_instructions || '',
      plant_benefits: reportData.plant_benefits || '',
      plant_species_id: reportData.plant_species_id,
      propose: reportData.propose,
      summary: reportData.summary,
      proof: reportData.proof,
      user_id: reportData.user_id
    };

    plants.value = plantsData || [];
  } catch (error) {
    console.error('Error fetching report:', error);
    ElMessage.error('Có lỗi xảy ra khi tải thông tin báo cáo');
    router.push('/profile/report');
  } finally {
    loading.value = false;
  }
};

const handlePlantChange = (plantId: number) => {
  const selectedPlant = plants.value.find(p => p.plant_id === plantId);
  if (selectedPlant) {
    formData.value.plant_id = selectedPlant.plant_id;
    formData.value.plant_name = selectedPlant.name;
    formData.value.plant_english_name = selectedPlant.english_name || '';
    formData.value.plant_description = selectedPlant.description || '';
    formData.value.plant_instructions = selectedPlant.instructions || '';
    formData.value.plant_benefits = selectedPlant.benefits || '';
    formData.value.plant_species_id = selectedPlant.species_id;
  }
};

const resetPlantName = () => {
  formData.value.plant_name = originalPlantName.value;
};

const loadPlantData = (field: 'description' | 'instructions' | 'benefits') => {
  const selectedPlant = plants.value.find(p => p.plant_id === formData.value.plant_id);
  if (selectedPlant) {
    switch (field) {
      case 'description':
        formData.value.plant_description = selectedPlant.description;
        break;
      case 'instructions':
        formData.value.plant_instructions = selectedPlant.instructions;
        break;
      case 'benefits':
        formData.value.plant_benefits = selectedPlant.benefits;
        break;
    }
  }
};

const loadReportData = (field: 'description' | 'instructions' | 'benefits') => {
  switch (field) {
    case 'description':
      formData.value.plant_description = originalReportData.value.description;
      break;
    case 'instructions':
      formData.value.plant_instructions = originalReportData.value.instructions;
      break;
    case 'benefits':
      formData.value.plant_benefits = originalReportData.value.benefits;
      break;
  }
};

const handleSubmit = async () => {
  // Validate required fields
  if (!formData.value.plant_id) {
    ElMessage.error('Vui lòng chọn cây thuốc');
    return;
  }
  if (!formData.value.summary) {
    ElMessage.error('Vui lòng nhập tóm tắt');
    return;
  }
  if (!formData.value.propose) {
    ElMessage.error('Vui lòng nhập đề xuất');
    return;
  }
  if (!formData.value.proof) {
    ElMessage.error('Vui lòng nhập bằng chứng');
    return;
  }

  try {
    submitting.value = true;
    const reportId = Number(route.params.id);
    const submitData = {
      ...formData.value,
      status: null // Giữ nguyên trạng thái chờ duyệt
    };

    await reportService.updateReport(reportId, submitData);
    ElMessage.success('Cập nhật báo cáo thành công');
    router.push('/profile/report');
  } catch (error) {
    console.error('Error updating report:', error);
    ElMessage.error('Có lỗi xảy ra khi cập nhật báo cáo');
  } finally {
    submitting.value = false;
  }
};

onMounted(async () => {
  await fetchReport();
});
</script>

<template>
  <div class="edit-report-container">
    <div class="header">
      <h1>Chỉnh sửa báo cáo</h1>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải thông tin báo cáo...</p>
    </div>

    <form v-else @submit.prevent="handleSubmit" class="edit-form">
      <div class="form-section">
        <h2>Thông tin cây thuốc</h2>
        <div class="form-group">
          <label for="plant">Cây thuốc <span class="required">*</span></label>
          <div class="input-group">
            <input
              type="text"
              id="plant_name"
              v-model="formData.plant_name"
              class="form-input"
            />
            <button 
              type="button" 
              class="btn btn-secondary" 
              @click="resetPlantName"
              title="Khôi phục tên gốc"
            >
              <i class="fas fa-undo"></i>
            </button>
          </div>
          <select 
            id="plant"
            v-model="formData.plant_id"
            @change="handlePlantChange(formData.plant_id)"
            required
            class="form-select"
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

        <div class="form-group">
          <label for="plant_english_name">Tên tiếng Anh</label>
          <input 
            type="text" 
            id="plant_english_name"
            v-model="formData.plant_english_name"
            class="form-input"
          >
        </div>

        <div class="form-group">
          <label for="plant_description">Mô tả</label>
          <div class="input-group">
            <textarea 
              id="plant_description"
              v-model="formData.plant_description"
              class="form-textarea"
            ></textarea>
            <div class="btn-group">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="loadReportData('description')"
                title="Lấy từ báo cáo"
              >
                <i class="fas fa-file-alt"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="loadPlantData('description')"
                title="Lấy từ cây hiện tại"
              >
                <i class="fas fa-sync"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="plant_instructions">Hướng dẫn sử dụng</label>
          <div class="input-group">
            <textarea 
              id="plant_instructions"
              v-model="formData.plant_instructions"
              class="form-textarea"
            ></textarea>
            <div class="btn-group">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="loadReportData('instructions')"
                title="Lấy từ báo cáo"
              >
                <i class="fas fa-file-alt"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="loadPlantData('instructions')"
                title="Lấy từ cây hiện tại"
              >
                <i class="fas fa-sync"></i>
              </button>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label for="plant_benefits">Công dụng</label>
          <div class="input-group">
            <textarea 
              id="plant_benefits"
              v-model="formData.plant_benefits"
              class="form-textarea"
            ></textarea>
            <div class="btn-group">
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="loadReportData('benefits')"
                title="Lấy từ báo cáo"
              >
                <i class="fas fa-file-alt"></i>
              </button>
              <button 
                type="button" 
                class="btn btn-secondary" 
                @click="loadPlantData('benefits')"
                title="Lấy từ cây hiện tại"
              >
                <i class="fas fa-sync"></i>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div class="form-section">
        <h2>Thông tin báo cáo</h2>
        <div class="form-group">
          <label for="summary">Tóm tắt <span class="required">*</span></label>
          <textarea 
            id="summary"
            v-model="formData.summary"
            required
            class="form-textarea"
            placeholder="Nhập tóm tắt báo cáo..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="propose">Đề xuất <span class="required">*</span></label>
          <textarea 
            id="propose"
            v-model="formData.propose"
            required
            class="form-textarea"
            placeholder="Nhập đề xuất..."
          ></textarea>
        </div>

        <div class="form-group">
          <label for="proof">Bằng chứng <span class="required">*</span></label>
          <textarea 
            id="proof"
            v-model="formData.proof"
            required
            class="form-textarea"
            placeholder="Nhập bằng chứng..."
          ></textarea>
        </div>
      </div>

      <div class="form-actions">
        <button 
          type="button" 
          @click="router.push('/profile/report')"
          class="cancel-btn"
        >
          Hủy
        </button>
        <button 
          type="submit" 
          class="submit-btn"
          :disabled="submitting"
        >
          <i v-if="submitting" class="fas fa-spinner fa-spin"></i>
          <span v-else>Cập nhật báo cáo</span>
        </button>
      </div>
    </form>
  </div>
</template>

<style scoped>
.edit-report-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px;
}

.header {
  margin-bottom: 2rem;
}

.header h1 {
  color: #008053;
  margin: 0;
}

.loading {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #666;
}

.loading i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #008053;
}

.edit-form {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
}

.form-section {
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid #eee;
}

.form-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.form-section h2 {
  color: #008053;
  margin: 0 0 1.5rem;
  font-size: 1.5rem;
}

.form-group {
  margin-bottom: 1.5rem;
}

.form-group:last-child {
  margin-bottom: 0;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #333;
  font-weight: 500;
}

.required {
  color: #dc3545;
}

.form-select,
.form-input,
.form-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.form-select:focus,
.form-input:focus,
.form-textarea:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.form-textarea {
  min-height: 100px;
  resize: vertical;
}

.input-group {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.input-group .form-input {
  flex: 1;
}

.btn-group {
  display: flex;
  gap: 0.25rem;
}

.btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
}

.btn-secondary {
  background: #6c757d;
  color: white;
}

.btn-secondary:hover {
  background: #5a6268;
}

.form-actions {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
}

.cancel-btn,
.submit-btn {
  padding: 0.75rem 1.5rem;
  border: none;
  border-radius: 8px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.cancel-btn {
  background: #6c757d;
  color: white;
}

.cancel-btn:hover {
  background: #5a6268;
}

.submit-btn {
  background: #008053;
  color: white;
}

.submit-btn:hover:not(:disabled) {
  background: #006040;
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

@media (max-width: 768px) {
  .edit-report-container {
    padding: 1rem;
  }

  .edit-form {
    padding: 1rem;
  }

  .form-actions {
    flex-direction: column;
  }

  .cancel-btn,
  .submit-btn {
    width: 100%;
    justify-content: center;
  }

  .input-group {
    flex-direction: column;
  }

  .btn-group {
    flex-direction: row;
    justify-content: flex-end;
  }
}
</style>    
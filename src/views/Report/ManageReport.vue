<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { reportService } from '../../services/report.service';
import { authService } from '../../services/auth.service';
import type { Report } from '../../models/Report';
import { ElMessage } from 'element-plus';

const router = useRouter();
const loading = ref(false);
const error = ref<string | null>(null);
const reports = ref<Report[]>([]);
const searchQuery = ref('');
const selectedStatus = ref('');
const currentPage = ref(1);
const itemsPerPage = 10;
const currentUser = ref(authService.getCurrentUser());
const filters = ref({
  status: ''
});

// Status options
const statusOptions = [
  { value: '', label: 'Tất cả trạng thái' },
  { value: 'null', label: 'Chờ duyệt' },
  { value: '0', label: 'Đang duyệt' },
  { value: '1', label: 'Đã duyệt' }
];

// Computed properties for filtering
const filteredReports = computed(() => {
  let result = reports.value;
  
  if (filters.value.status) {
    result = result.filter(report => getStatusValue(report.status) === filters.value.status);
  }
  
  return result;
});

const getStatusValue = (status: number | null) => {
  if (status === null) return 'null';
  if (status === 0) return '0';
  if (status === 1) return '1';
  return 'null';
};

const fetchReports = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await reportService.getReportsWithPagination(currentPage.value, itemsPerPage);
    console.log('Full response:', response);
    
    // Kiểm tra cấu trúc response và gán dữ liệu phù hợp
    if (response && Array.isArray(response)) {
      reports.value = response;
    } else if (response && response.data && Array.isArray(response.data)) {
      reports.value = response.data;
    } else {
      reports.value = [];
      console.warn('Unexpected response structure:', response);
    }
    
    console.log('Reports loaded:', reports.value);
  } catch (err) {
    console.error('Error fetching reports:', err);
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách báo cáo';
    reports.value = [];
  } finally {
    loading.value = false;
  }
};

const handleEditReport = (reportId: number, status: number | null) => {
  if (!reportId) {
    console.error('Invalid report ID');
    return;
  }
  // Chỉ cho phép sửa khi trạng thái là chờ duyệt (null)
  if (status !== null) {
    ElMessage.error('Chỉ có thể sửa báo cáo khi trạng thái là chờ duyệt');
    return;
  }
  router.push(`/report/${reportId}/edit`);
};

const handleDeleteReport = async (reportId: number) => {
  if (!reportId) {
    console.error('Invalid report ID');
    return;
  }
  if (confirm('Bạn có chắc chắn muốn xóa báo cáo này?')) {
    try {
      await reportService.deleteReport(reportId);
      reports.value = reports.value.filter(report => report.report_id !== reportId);
      ElMessage.success('Xóa báo cáo thành công');
    } catch (err) {
      console.error('Error deleting report:', err);
      ElMessage.error('Có lỗi xảy ra khi xóa báo cáo');
    }
  }
};

const clearFilters = () => {
  searchQuery.value = '';
  filters.value.status = '';
};

const getStatusLabel = (status: number | null) => {
  if (status === null) return 'Chờ duyệt';
  if (status === 0) return 'Đang duyệt';
  if (status === 1) return 'Đã duyệt';
  return 'Không xác định';
};

const getStatusClass = (status: number | null) => {
  if (status === null) return 'status-pending';
  if (status === 0) return 'status-processing';
  if (status === 1) return 'status-approved';
  return '';
};

const handleCreateReport = () => {
  router.push('/report/create');
};

onMounted(async () => {
  await fetchReports();
});

onUnmounted(() => {
  reports.value = [];
});
</script>

<template>
  <div class="manage-report-container">
    <div class="header">
      <h1>Quản lý báo cáo</h1>
      <router-link to="/report/create" class="create-btn">
        <i class="fas fa-plus"></i>
        Tạo báo cáo mới
      </router-link>
    </div>

    <!-- Search and Filter Section -->
    <div class="search-filter-section">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery"
          placeholder="Tìm kiếm báo cáo..."
          class="search-input"
        >
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Trạng thái:</label>
          <select v-model="filters.status" class="filter-select">
            <option v-for="option in statusOptions" 
                    :key="option.value" 
                    :value="option.value">
              {{ option.label }}
            </option>
          </select>
        </div>

        <button 
          v-if="searchQuery || filters.status"
          @click="clearFilters" 
          class="clear-filters-btn"
        >
          <i class="fas fa-times"></i>
          Xóa bộ lọc
        </button>
      </div>
    </div>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải danh sách báo cáo...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchReports" class="retry-btn">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else-if="filteredReports.length === 0" class="empty-state">
      <i class="fas fa-file-alt"></i>
      <p>Không tìm thấy báo cáo phù hợp</p>
    </div>

    <div v-else class="report-list">
      <div v-for="report in filteredReports" :key="report.report_id" class="report-card">
        <div class="report-header">
          <h3>{{ report.plant_name }}</h3>
          <div class="report-meta">
            <span class="date">
              <i class="fas fa-calendar"></i>
              {{ new Date(report.created_at).toLocaleDateString('vi-VN') }}
            </span>
            <span :class="['status', getStatusClass(report.status)]">
              {{ getStatusLabel(report.status) }}
            </span>
          </div>
        </div>

        <div class="report-content">
          <div class="content-section">
            <h4>Đề xuất:</h4>
            <p>{{ report.propose }}</p>
          </div>
          <div class="content-section">
            <h4>Tóm tắt:</h4>
            <p>{{ report.summary }}</p>
          </div>
        </div>

        <div class="report-info">
          <div class="info-item">
            <i class="fas fa-leaf"></i>
            <router-link :to="`/plant/${report.plant_id}`" class="plant-link">
              {{ report.plant_name }}
            </router-link>
          </div>
        </div>

        <div class="report-actions">
          <button 
            @click="handleEditReport(report.report_id, report.status)" 
            class="edit-btn"
            :disabled="report.status !== null"
          >
            <i class="fas fa-edit"></i>
            Sửa
          </button>
          <button 
            @click="handleDeleteReport(report.report_id)" 
            class="delete-btn"
            :disabled="report.status !== null"
          >
            <i class="fas fa-trash"></i>
            Xóa
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.manage-report-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 2rem;
  padding-top: 80px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
}

.header h1 {
  color: #008053;
  margin: 0;
}

.create-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.create-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.search-filter-section {
  margin-bottom: 2rem;
  background: #f8f9fa;
  padding: 1.5rem;
  border-radius: 8px;
}

.search-box {
  position: relative;
  margin-bottom: 1rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #666;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
}

.search-input:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.filters {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
  align-items: flex-end;
}

.filter-group {
  flex: 1;
  min-width: 200px;
}

.filter-group label {
  display: block;
  margin-bottom: 0.5rem;
  color: #666;
  font-size: 0.9rem;
}

.filter-select {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
}

.filter-select:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.clear-filters-btn {
  padding: 0.75rem 1.5rem;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #c82333;
  transform: translateY(-2px);
}

.loading, .error, .empty-state {
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  color: #666;
}

.loading i, .error i, .empty-state i {
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #008053;
}

.error {
  color: #dc3545;
}

.retry-btn {
  margin-top: 1.5rem;
  padding: 0.75rem 1.5rem;
  background: #008053;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn:hover {
  background: #006040;
  transform: translateY(-2px);
}

.report-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(400px, 1fr));
  gap: 2rem;
}

.report-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.report-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0,0,0,0.15);
}

.report-header {
  margin-bottom: 1rem;
}

.report-header h3 {
  color: #008053;
  margin: 0 0 0.5rem;
}

.report-meta {
  display: flex;
  align-items: center;
  gap: 1.5rem;
  color: #666;
  font-size: 0.9rem;
}

.status {
  padding: 0.25rem 0.75rem;
  border-radius: 4px;
  font-weight: 500;
}

.status-pending {
  background: #fff3cd;
  color: #856404;
}

.status-processing {
  background: #d4edda;
  color: #155724;
}

.status-approved {
  background: #d4edda;
  color: #155724;
}

.report-content {
  margin: 1rem 0;
  color: #666;
  line-height: 1.6;
}

.content-section {
  margin-bottom: 1rem;
}

.content-section h4 {
  color: #008053;
  margin: 0 0 0.5rem;
  font-size: 1rem;
}

.report-info {
  display: flex;
  gap: 1.5rem;
  margin-bottom: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.info-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #666;
}

.report-actions {
  display: flex;
  gap: 1rem;
  justify-content: flex-end;
  align-items: center;
}

.edit-btn, .delete-btn {
  padding: 0.5rem 1rem;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
}

.edit-btn {
  background: #008053;
  color: white;
}

.edit-btn:hover:not(:disabled) {
  background: #006040;
}

.delete-btn {
  background: #dc3545;
  color: white;
}

.delete-btn:hover:not(:disabled) {
  background: #c82333;
}

.edit-btn:disabled, .delete-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
  opacity: 0.7;
}

.plant-link {
  color: #008053;
  text-decoration: none;
  transition: color 0.3s ease;
}

.plant-link:hover {
  color: #006040;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .manage-report-container {
    padding: 1rem;
  }

  .header {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .report-list {
    grid-template-columns: 1fr;
  }

  .report-info {
    flex-direction: column;
    gap: 1rem;
  }

  .filters {
    flex-direction: column;
  }

  .filter-group {
    width: 100%;
  }

  .clear-filters-btn {
    width: 100%;
    justify-content: center;
  }

  .report-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>    
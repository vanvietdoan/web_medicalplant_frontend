<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { reportService } from '../../services/report.service';
import type { Report } from '../../models/Report';
import { ElMessage } from 'element-plus';
import divisionService from '../../services/fillter/division.service';
import classService from '../../services/fillter/class.service';
import orderService from '../../services/fillter/order.service';
import familyService from '../../services/fillter/family.service';
import genusService from '../../services/fillter/genus.service';
import speciesService from '../../services/fillter/species.service';
import { plantService } from '../../services/plant.service';
import { authService } from '../../services/auth.service';

const router = useRouter();
const route = useRoute();
const loading = ref(false);
const error = ref<string | null>(null);
const reports = ref<Report[]>([]);
const searchQuery = ref('');
const currentPage = ref(1);
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

// Add filter states
const selectedDivision = ref('');
const selectedClass = ref('');
const selectedOrder = ref('');
const selectedFamily = ref('');
const selectedGenus = ref('');
const selectedSpecies = ref('');

// Add data states
const divisions = ref<any[]>([]);
const classes = ref<any[]>([]);
const orders = ref<any[]>([]);
const families = ref<any[]>([]);
const genera = ref<any[]>([]);
const species = ref<any[]>([]);

// Add plant names mapping
const plantNames = ref<{ [key: number]: string }>({});

// Computed properties for filtering
const filteredReports = computed(() => {
  return reports.value;
});

const getStatusValue = (status: number | null) => {
  if (status === null) return 'null';
  if (status === 0) return '0';
  if (status === 1) return '1';
  return 'null';
};

// Add function to fetch plant name
const fetchPlantName = async (plantId: number) => {
  if (!plantNames.value[plantId]) {
    try {
      const plant = await plantService.getPlantById(plantId);
      if (plant) {
        plantNames.value[plantId] = plant.name;
      }
    } catch (err) {
      console.error('Error fetching plant name:', err);
    }
  }
  return plantNames.value[plantId] || 'Đang tải...';
};

const fetchReports = async () => {
  try {
    loading.value = true;
    error.value = null;

    let response: Report[] | undefined;
    
    // Get current user's reports by default
    const currentUser = authService.getCurrentUser();
    if (currentUser?.id) {
      response = await reportService.getReportsByUser(currentUser.id);
    }

    // Apply status filter if needed
    if (filters.value.status && response) {
      response = response.filter((report: Report) => 
        getStatusValue(report.status) === filters.value.status
      );
    }

    // Apply search filter if needed
    if (searchQuery.value && response) {
      const query = searchQuery.value.toLowerCase();
      response = response.filter((report: Report) => 
        report.plant_name.toLowerCase().includes(query) ||
        report.summary.toLowerCase().includes(query) ||
        report.propose.toLowerCase().includes(query)
      );
    }
    
    if (response && Array.isArray(response)) {
      reports.value = response;
      // Fetch plant names for all reports
      const uniquePlantIds = [...new Set(response.map(report => report.plant_id))];
      await Promise.all(uniquePlantIds.map(id => fetchPlantName(id)));
    } else {
      reports.value = [];
      console.warn('Unexpected response structure:', response);
    }
    
  } catch (err: any) {
    console.error('Error fetching reports:', err);
    if (err.response?.status === 401 || err.message === 'Unauthorized') {
      // Redirect to login page if unauthorized
      router.push('/login');
      return;
    }
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

const clearFilters = async () => {
  // Reset all filter values
  searchQuery.value = '';
  filters.value.status = '';
  selectedDivision.value = '';
  selectedClass.value = '';
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';

  // Reset all data arrays
  classes.value = [];
  orders.value = [];
  families.value = [];
  genera.value = [];
  species.value = [];

  // Fetch user's reports
  currentPage.value = 1;
  await fetchReports();
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

// Add computed properties for available filter options
const availableClasses = computed(() => {
  if (!selectedDivision.value) return [];
  const targetDivisionId = Number(selectedDivision.value) + 1;
  return classes.value.filter((cls: { division_id: number }) => cls.division_id === targetDivisionId);
});

const availableOrders = computed(() => {
  if (!selectedClass.value) return [];
  const targetClassId = Number(selectedClass.value) + 1;
  return orders.value.filter((order: { class_id: number }) => order.class_id === targetClassId);
});

const availableFamilies = computed(() => {
  if (!selectedOrder.value) return [];
  const targetOrderId = Number(selectedOrder.value) + 1;
  return families.value.filter((family: { order_id: number }) => family.order_id === targetOrderId);
});

const availableGenera = computed(() => {
  if (!selectedFamily.value) return [];
  const targetFamilyId = Number(selectedFamily.value) + 1;
  return genera.value.filter((genus: { family_id: number }) => genus.family_id === targetFamilyId);
});

const availableSpecies = computed(() => {
  if (!selectedGenus.value) return [];
  const targetGenusId = Number(selectedGenus.value) + 1;
  return species.value.filter((s: { genus_id: number }) => s.genus_id === targetGenusId);
});

// Add filter change handlers
const handleDivisionChange = async () => {
  selectedClass.value = '';
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
  if (selectedDivision.value) {
    const classesData = await classService.getClasses();
    const targetDivisionId = Number(selectedDivision.value) + 1;
    classes.value = classesData.filter((cls: { division_id: number }) => cls.division_id === targetDivisionId);
  }
  currentPage.value = 1;
  await fetchReports();
};

const handleClassChange = async () => {
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
  if (selectedClass.value) {
    const ordersData = await orderService.getOrders();
    const filteredOrders = ordersData.filter(order => order.class_id === Number(selectedClass.value) + 1);
    orders.value = [...filteredOrders];
  }
  currentPage.value = 1;
  await fetchReports();
};

const handleOrderChange = async () => {
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
  if (selectedOrder.value) {
    const familiesData = await familyService.getFamilies();
    const filteredFamilies = familiesData.filter(family => family.order_id === Number(selectedOrder.value) + 1);
    families.value = [...filteredFamilies];
  }
  currentPage.value = 1;
  await fetchReports();
};

const handleFamilyChange = async () => {
  selectedGenus.value = '';
  selectedSpecies.value = '';
  if (selectedFamily.value) {
    const generaData = await genusService.getGenuses();
    const filteredGenera = generaData.filter(genus => genus.family_id === Number(selectedFamily.value) + 1);
    genera.value = [...filteredGenera];
  }
  currentPage.value = 1;
  await fetchReports();
};

const handleGenusChange = async () => {
  selectedSpecies.value = '';
  if (selectedGenus.value) {
    const speciesData = await speciesService.getSpecies();
    const filteredSpecies = speciesData.filter(s => s.genus_id === Number(selectedGenus.value) + 1);
    species.value = [...filteredSpecies];
  }
  currentPage.value = 1;
  await fetchReports();
};

const handleSpeciesChange = async () => {
  currentPage.value = 1;
  await fetchReports();
};

// Add watch for search query
watch(searchQuery, async () => {
  currentPage.value = 1;
  await fetchReports();
});

// Add watch for status filter
watch(() => filters.value.status, async () => {
  currentPage.value = 1;
  await fetchReports();
});

// Add fetchFilterData function
const fetchFilterData = async () => {
  try {
    const [
      divisionsData,
      classesData,
      ordersData,
      familiesData,
      generaData,
      speciesData
    ] = await Promise.all([
      divisionService.getDivisions(),
      classService.getClasses(),
      orderService.getOrders(),
      familyService.getFamilies(),
      genusService.getGenuses(),
      speciesService.getSpecies()
    ]);

    divisions.value = divisionsData;
    classes.value = classesData;
    orders.value = ordersData;
    families.value = familiesData;
    genera.value = generaData;
    species.value = speciesData;
  } catch (error) {
    console.error('Error fetching filter data:', error);
  }
};

// Add computed property to check if there are any active filters
const hasActiveFilters = computed(() => {
  return searchQuery.value || 
         filters.value.status || 
         selectedDivision.value || 
         selectedClass.value || 
         selectedOrder.value || 
         selectedFamily.value || 
         selectedGenus.value || 
         selectedSpecies.value;
});

// Add function to handle initial filters from query params
const handleInitialFilters = async () => {
  const { plant_id } = route.query;
  
  if (plant_id) {
    try {
      // Get plant details
      const plant = await plantService.getPlantById(Number(plant_id));
      if (plant && plant.species_id) {
        // Store all taxonomy IDs
        const taxonomyIds: {
          species_id: number;
          genus_id: number | null;
          family_id: number | null;
          order_id: number | null;
          class_id: number | null;
          division_id: number | null;
        } = {
          species_id: plant.species_id,
          genus_id: null,
          family_id: null,
          order_id: null,
          class_id: null,
          division_id: null
        };

        // Get species details
        const species = await speciesService.getSpeciesById(taxonomyIds.species_id);
        if (species && species.genus_id) {
          taxonomyIds.genus_id = species.genus_id;

          // Get genus details
          const genus = await genusService.getGenusById(taxonomyIds.genus_id);
          if (genus && genus.family_id) {
            taxonomyIds.family_id = genus.family_id;

            // Get family details
            const family = await familyService.getFamilyById(taxonomyIds.family_id);
            if (family && family.order_id) {
              taxonomyIds.order_id = family.order_id;

              // Get order details
              const order = await orderService.getOrderById(taxonomyIds.order_id);
              if (order && order.class_id) {
                taxonomyIds.class_id = order.class_id;

                // Get class details
                const cls = await classService.getClassById(taxonomyIds.class_id);
                if (cls && cls.division_id) {
                  taxonomyIds.division_id = cls.division_id;
                }
              }
            }
          }
        }

        console.log("Final taxonomy IDs:", {
          division_id: taxonomyIds.division_id,
          class_id: taxonomyIds.class_id,
          order_id: taxonomyIds.order_id,
          family_id: taxonomyIds.family_id,
          genus_id: taxonomyIds.genus_id,
          species_id: taxonomyIds.species_id
        });

        // Load all filter data first
        await fetchFilterData();

        // Set filters in order from top to bottom
        if (taxonomyIds.division_id) {
          selectedDivision.value = (taxonomyIds.division_id - 1).toString();
          await handleDivisionChange();
        }
        if (taxonomyIds.class_id) {
          selectedClass.value = (taxonomyIds.class_id - 1).toString();
          await handleClassChange();
        }
        if (taxonomyIds.order_id) {
          selectedOrder.value = (taxonomyIds.order_id - 1).toString();
          await handleOrderChange();
        }
        if (taxonomyIds.family_id) {
          selectedFamily.value = (taxonomyIds.family_id - 1).toString();
          await handleFamilyChange();
        }
        if (taxonomyIds.genus_id) {
          selectedGenus.value = (taxonomyIds.genus_id - 1).toString();
          await handleGenusChange();
        }
        if (taxonomyIds.species_id) {
          selectedSpecies.value = (taxonomyIds.species_id - 1).toString();
          await handleSpeciesChange();
        }
      }
    } catch (err) {
      console.error('Error setting initial filters:', err);
    }
  }
};

// Update onMounted to handle initial filters
onMounted(async () => {
  await Promise.all([fetchFilterData(), handleInitialFilters()]);
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

        <div class="filter-group">
          <label>Ngành</label>
          <select v-model="selectedDivision" class="filter-select" @change="handleDivisionChange">
            <option value="">Chọn ngành</option>
            <option v-for="division in divisions" 
                    :key="division.division_id" 
                    :value="(division.division_id - 1).toString()">
              {{ division.name }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedDivision">
          <label>Lớp</label>
          <select v-model="selectedClass" class="filter-select" @change="handleClassChange">
            <option value="">Chọn lớp</option>
            <option v-for="cls in availableClasses" 
                    :key="cls.class_id" 
                    :value="(cls.class_id - 1).toString()">
              {{ cls.name }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedClass">
          <label>Bộ</label>
          <select v-model="selectedOrder" class="filter-select" @change="handleOrderChange">
            <option value="">Chọn bộ</option>
            <option v-for="order in availableOrders" 
                    :key="order.order_id" 
                    :value="(order.order_id - 1).toString()">
              {{ order.name }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedOrder">
          <label>Họ</label>
          <select v-model="selectedFamily" class="filter-select" @change="handleFamilyChange">
            <option value="">Chọn họ</option>
            <option v-for="family in availableFamilies" 
                    :key="family.family_id" 
                    :value="(family.family_id - 1).toString()">
              {{ family.name }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedFamily">
          <label>Chi</label>
          <select v-model="selectedGenus" class="filter-select" @change="handleGenusChange">
            <option value="">Chọn chi</option>
            <option v-for="genus in availableGenera" 
                    :key="genus.genus_id" 
                    :value="(genus.genus_id - 1).toString()">
              {{ genus.name }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedGenus">
          <label>Loài</label>
          <select v-model="selectedSpecies" class="filter-select" @change="handleSpeciesChange">
            <option value="">Chọn loài</option>
            <option v-for="species in availableSpecies" 
                    :key="species.species_id" 
                    :value="(species.species_id - 1).toString()">
              {{ species.name }}
            </option>
          </select>
        </div>

        <div class="filter-actions" v-if="hasActiveFilters">
        <button 
          @click="clearFilters" 
          class="clear-filters-btn"
        >
            <i class="fas fa-times-circle"></i>
            <span>Xóa bộ lọc</span>
        </button>
        </div>
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
              {{ plantNames[report.plant_id] || 'Đang tải...' }}
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
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  position: relative;
}

.filter-group {
  display: flex;
  flex-direction: column;
}

.filter-group label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 0.75rem;
  border: 1px solid #ddd;
  border-radius: 8px;
  background-color: white;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.filter-select:focus {
  outline: none;
  border-color: #008053;
  box-shadow: 0 0 0 2px rgba(0, 128, 83, 0.1);
}

.filter-actions {
  display: flex;
  align-items: flex-end;
  margin-top: 0.5rem;
}

.clear-filters-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.25rem;
  background: #fff;
  color: #dc3545;
  border: 1px solid #dc3545;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.3s ease;
}

.clear-filters-btn:hover {
  background: #dc3545;
  color: #fff;
  border-color: #dc3545;
  transform: translateY(-1px);
}

.clear-filters-btn i {
  font-size: 1rem;
  color: #dc3545;
}

.clear-filters-btn:hover i {
  color: #fff;
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
    grid-template-columns: 1fr;
  }

  .filter-actions {
    margin-top: 1rem;
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
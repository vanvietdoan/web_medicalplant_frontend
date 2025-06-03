<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRoute } from 'vue-router';
import { plantService } from '../../services/plant.service';
import divisionService from '../../services/fillter/division.service';
import classService from '../../services/fillter/class.service';
import orderService from '../../services/fillter/order.service';
import familyService from '../../services/fillter/family.service';
import genusService from '../../services/fillter/genus.service';
import speciesService from '../../services/fillter/species.service';

import type { Plant } from '../../models/Plant';

const route = useRoute();
const plants = ref<Plant[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');
const showSuggestions = ref(false);
const searchHistory = ref<string[]>([]);
const currentPage = ref(1);
const itemsPerPage = 12;
const MAX_HISTORY_ITEMS = 5;

// Filter states
const selectedDivision = ref('');
const selectedClass = ref('');
const selectedOrder = ref('');
const selectedFamily = ref('');
const selectedGenus = ref('');
const selectedSpecies = ref('');
const selectedFilter = ref('');

// Data states
const divisions = ref<any[]>([]);
const classes = ref<any[]>([]);
const orders = ref<any[]>([]);
const families = ref<any[]>([]);
const genera = ref<any[]>([]);
const species = ref<any[]>([]);

// Computed properties for available filter options
const availableClasses = computed(() => {
  if (!selectedDivision.value) return [];
  return classes.value.filter(cls => cls.division_id === selectedDivision.value);
});

const availableOrders = computed(() => {
  if (!selectedClass.value) return [];
  return orders.value.filter(order => order.class_id === selectedClass.value);
});

const availableFamilies = computed(() => {
  if (!selectedOrder.value) return [];
  return families.value.filter(family => family.order_id === selectedOrder.value);
});

const availableGenera = computed(() => {
  if (!selectedFamily.value) return [];
  return genera.value.filter(genus => genus.family_id === selectedFamily.value);
});

const availableSpecies = computed(() => {
  if (!selectedGenus.value) return [];
  return species.value.filter(species => species.genus_id === selectedGenus.value);
});

// Filtered plants based on search query and filters
const filteredPlants = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  let result = plants.value.slice(start, end);
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(plant => 
      plant.name.toLowerCase().includes(query) || 
      plant.english_name.toLowerCase().includes(query) ||
      plant.description.toLowerCase().includes(query)
    );
  }

  return result;
});

const totalPages = computed(() => {
  return Math.ceil(plants.value.length / itemsPerPage);
});

// Add computed property for visible pages
const visiblePages = computed(() => {
  const total = totalPages.value;
  const current = currentPage.value;
  const delta = 2; // Number of pages to show before and after current page
  
  let range: (number | string)[] = [];
  for (let i = 1; i <= total; i++) {
    if (
      i === 1 || // First page
      i === total || // Last page
      (i >= current - delta && i <= current + delta) // Pages around current
    ) {
      range.push(i);
    } else if (i === current - delta - 1 || i === current + delta + 1) {
      range.push('...'); // Add ellipsis
    }
  }
  
  return range;
});

// Filter change handlers
const handleDivisionChange = async () => {
  selectedClass.value = '';
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
  await fetchFilteredPlants();
};

const handleClassChange = async () => {
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
  await fetchFilteredPlants();
};

const handleOrderChange = async () => {
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
  await fetchFilteredPlants();
};

const handleFamilyChange = async () => {
  selectedGenus.value = '';
  selectedSpecies.value = '';
  await fetchFilteredPlants();
};

const handleGenusChange = async () => {
  selectedSpecies.value = '';
  await fetchFilteredPlants();
};

const handleSpeciesChange = async () => {
  await fetchFilteredPlants();
};

// Add new filter handler
const handleFilterChange = async (filterType: string) => {
  selectedFilter.value = filterType;
  await fetchFilteredPlants();
};

// Add new function to clear all filters
const clearAllFilters = async () => {
  selectedFilter.value = '';
  selectedDivision.value = '';
  selectedClass.value = '';
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
  searchQuery.value = '';
  await fetchFilteredPlants();
};

// Update fetchFilteredPlants function
const fetchFilteredPlants = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    let query = '';
    
    // Handle taxonomy filters
    if (selectedSpecies.value) {
      query = `speciesId=${selectedSpecies.value}`;
    } else if (selectedGenus.value) {
      query = `genusId=${selectedGenus.value}`;
    } else if (selectedFamily.value) {
      query = `familyId=${selectedFamily.value}`;
    } else if (selectedOrder.value) {
      query = `orderId=${selectedOrder.value}`;
    } else if (selectedClass.value) {
      query = `classId=${selectedClass.value}`;
    } else if (selectedDivision.value) {
      query = `divisionId=${selectedDivision.value}`;
    }

    // Get base plants based on filters
    let basePlants;
    if (selectedFilter.value === 'newest') {
      console.log('Fetching newest plants...');
      basePlants = await plantService.getNewePlants();
    } else if (selectedFilter.value === 'multiUse') {
      console.log('Fetching multi-use plants...');
      basePlants = await plantService.getMultiUsePlants();
    } else {
      console.log('Fetching all plants...');
      basePlants = await plantService.getPlants();
    }

    // Apply taxonomy filter if exists
    if (query) {
      const filteredPlants = await plantService.getPlantSearch(query);
      // Filter the base plants to only include those that match the taxonomy filter
      plants.value = basePlants.filter(basePlant => 
        filteredPlants.some(filteredPlant => filteredPlant.plant_id === basePlant.plant_id)
      );
    } else {
      plants.value = basePlants;
    }

    // Apply search filter if there's a search query
    if (searchQuery.value) {
      const searchQueryLower = searchQuery.value.toLowerCase();
      plants.value = plants.value.filter(plant => 
        plant.name.toLowerCase().includes(searchQueryLower) || 
        plant.english_name.toLowerCase().includes(searchQueryLower) ||
        plant.description.toLowerCase().includes(searchQueryLower)
      );
    }
    
    console.log('Filtered plants:', plants.value);
  } catch (err) {
    console.error('Error in fetchFilteredPlants:', err);
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách cây thuốc';
  } finally {
    loading.value = false;
  }
};

// Fetch filter data
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

const fetchPlants = async () => {
  try {
    loading.value = true;
    error.value = null;
    const response = await plantService.getPlants();
    plants.value = response;
    console.log('Plants fetched successfully:', plants.value)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách cây thuốc';
  } finally {
    loading.value = false;
  }
};

// Add computed property for plant image
const getPlantImage = (plant: Plant) => {
  if (plant.images && plant.images.length > 0) {
    return plant.images[0].url;
  }
  return '/images/plant/default-plant.jpg'; // Fallback image
};

// Load search history from localStorage
onMounted(() => {
  const savedHistory = localStorage.getItem('plantSearchHistory');
  if (savedHistory) {
    searchHistory.value = JSON.parse(savedHistory);
  }
  // Check for filter in route path
  const path = route.path;
  if (path.includes('/newest')) {
    selectedFilter.value = 'newest';
    fetchFilteredPlants();
  } else if (path.includes('/multiUse')) {
    selectedFilter.value = 'multiUse';
    fetchFilteredPlants();
  } else {
    fetchPlants();
  }
  fetchFilterData();
});

// Save search query to history
const saveToHistory = (query: string) => {
  if (!query.trim()) return;
  
  // Remove if already exists
  searchHistory.value = searchHistory.value.filter(item => item !== query);
  
  // Add to beginning of array
  searchHistory.value.unshift(query);
  
  // Keep only last 5 items
  if (searchHistory.value.length > MAX_HISTORY_ITEMS) {
    searchHistory.value = searchHistory.value.slice(0, MAX_HISTORY_ITEMS);
  }
  
  // Save to localStorage
  localStorage.setItem('plantSearchHistory', JSON.stringify(searchHistory.value));
};

// Filter history based on current input
const filteredHistory = computed(() => {
  if (!searchQuery.value) return searchHistory.value;
  return searchHistory.value.filter(item => 
    item.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

// Handle search
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    saveToHistory(searchQuery.value);
  }
  showSuggestions.value = false;
  fetchFilteredPlants();
};

// Handle suggestion click
const handleSuggestionClick = (suggestion: string) => {
  searchQuery.value = suggestion;
  showSuggestions.value = false;
  handleSearch();
};

// Clear search history
const clearSearchHistory = () => {
  searchHistory.value = [];
  localStorage.removeItem('plantSearchHistory');
};

// Add watch for route changes
watch(() => route.path, (newPath) => {
  console.log('Route path changed:', newPath);
  if (newPath.includes('/newest')) {
    selectedFilter.value = 'newest';
    fetchFilteredPlants();
  } else if (newPath.includes('/multiUse')) {
    selectedFilter.value = 'multiUse';
    fetchFilteredPlants();
  } else {
    selectedFilter.value = '';
    fetchPlants();
  }
}, { immediate: true });

const changePage = (page: number) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
};

const handleBlur = () => {
  setTimeout(() => {
    showSuggestions.value = false;
  }, 200);
};

// Add debounce function
const debounce = (fn: Function, delay: number) => {
  let timeoutId: NodeJS.Timeout;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
};

// Add debounced search
const debouncedSearch = debounce(() => {
  handleSearch();
}, 300);

// Add watch for search query
watch(searchQuery, () => {
  debouncedSearch();
});
</script>

<template>
  <div class="plants-container">
    <div class="plants-header">
      <h1>Danh sách cây thuốc</h1>
      <p>Tìm hiểu về các loại cây thuốc và công dụng của chúng</p>
    </div>

    <section class="search-filter">
      <div class="search-box">
        <i class="fas fa-search search-icon"></i>
        <input 
          type="text" 
          v-model="searchQuery"
          @focus="showSuggestions = true"
          @blur="handleBlur"
          @keyup.enter="handleSearch"
          placeholder="Tìm kiếm cây thuốc..."
          class="search-input"
        >
        <div v-if="showSuggestions && filteredHistory.length > 0" class="search-suggestions">
          <div class="suggestions-header">
            <span>Lịch sử tìm kiếm</span>
            <button @click="clearSearchHistory" class="clear-history-btn">
              <i class="fas fa-trash"></i>
            </button>
          </div>
          <div 
            v-for="(suggestion, index) in filteredHistory" 
            :key="index"
            class="suggestion-item"
            @mousedown="handleSuggestionClick(suggestion)"
          >
            <i class="fas fa-history"></i>
            <span>{{ suggestion }}</span>
          </div>
        </div>
      </div>
      
      <div class="filter-buttons">
        <button 
          class="filter-btn" 
          :class="{ active: selectedFilter === 'newest' }"
          @click="handleFilterChange('newest')"
        >
          <i class="fas fa-clock"></i>
          Cây thuốc mới nhất
        </button>
        <button 
          class="filter-btn" 
          :class="{ active: selectedFilter === 'multiUse' }"
          @click="handleFilterChange('multiUse')"
        >
          <i class="fas fa-leaf"></i>
          Cây thuốc có nhiều công dụng
        </button>
        <button 
          class="filter-btn cancel-btn"
          @click="clearAllFilters"
          v-if="selectedFilter || selectedDivision || selectedClass || selectedOrder || selectedFamily || selectedGenus || selectedSpecies || searchQuery"
        >
          <i class="fas fa-times"></i>
          Hủy bộ lọc
        </button>
      </div>

      <div class="filters">
        <div class="filter-group">
          <label>Ngành</label>
          <select v-model="selectedDivision" class="filter-select" @change="handleDivisionChange">
            <option value="">Chọn ngành</option>
            <option v-for="division in divisions" 
                    :key="division.division_id" 
                    :value="division.division_id">
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
                    :value="cls.class_id">
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
                    :value="order.order_id">
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
                    :value="family.family_id">
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
                    :value="genus.genus_id">
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
                    :value="species.species_id">
              {{ species.name }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <div v-if="loading" class="loading">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Đang tải danh sách cây thuốc...</p>
    </div>

    <div v-else-if="error" class="error">
      <i class="fas fa-exclamation-circle"></i>
      <p>{{ error }}</p>
      <button @click="fetchPlants" class="retry-btn">
        <i class="fas fa-redo"></i> Thử lại
      </button>
    </div>

    <div v-else class="plants-grid">
      <router-link 
        v-for="plant in filteredPlants" 
        :key="plant.plant_id" 
        :to="`/plant/${plant.plant_id}`"
        class="plant-card"
      >
        <div class="plant-image-container">
          <img :src="getPlantImage(plant)" :alt="plant.name" class="plant-image">
        </div>
        <div class="plant-content">
          <h3>{{ plant.name }}</h3>
          <p class="english-name">{{ plant.english_name }}</p>
          <p class="description">{{ plant.description }}</p>
          <div class="plant-footer">
            <div class="benefits">
              <i class="fas fa-leaf"></i>
              <span>{{ plant.benefits ? 'Nhiều công dụng' : 'Đang cập nhật' }}</span>
            </div>
            <div class="view-more">
              Xem chi tiết
              <i class="fas fa-arrow-right"></i>
            </div>
          </div>
        </div>
      </router-link>
    </div>

    <!-- Pagination -->
    <div v-if="totalPages > 1" class="pagination">
      <button 
        class="page-btn" 
        :disabled="currentPage === 1"
        @click="changePage(currentPage - 1)"
      >
        <i class="fas fa-chevron-left"></i>
      </button>
      
      <template v-for="(page, index) in visiblePages" :key="index">
        <button 
          v-if="typeof page === 'number'"
          class="page-btn"
          :class="{ active: currentPage === page }"
          @click="changePage(page)"
        >
          {{ page }}
        </button>
        <span v-else class="page-ellipsis">...</span>
      </template>

      <button 
        class="page-btn"
        :disabled="currentPage === totalPages"
        @click="changePage(currentPage + 1)"
      >
        <i class="fas fa-chevron-right"></i>
      </button>
    </div>
  </div>
</template>

<style scoped>
.plants-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  padding-top: 120px;
}

.plants-header {
  text-align: center;
  margin-bottom: 2rem;
}

.plants-header h1 {
  color: #008053;
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.plants-header p {
  color: #666;
}

.search-filter {
  margin-bottom: 2rem;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 1.5rem;
}

.search-box {
  position: relative;
  margin-bottom: 1.5rem;
}

.search-icon {
  position: absolute;
  left: 1rem;
  top: 50%;
  transform: translateY(-50%);
  color: #008053;
}

.search-input {
  width: 100%;
  padding: 0.75rem 1rem 0.75rem 2.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 1rem;
  transition: border-color 0.3s;
}

.search-input:focus {
  outline: none;
  border-color: #008053;
}

.filter-buttons {
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.filter-btn {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background: white;
  color: #666;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-btn i {
  color: #008053;
}

.filter-btn:hover {
  background: #f8f9fa;
  border-color: #008053;
  color: #008053;
}

.filter-btn.active {
  background: #008053;
  border-color: #008053;
  color: white;
}

.filter-btn.active i {
  color: white;
}

.filter-btn.cancel-btn {
  background-color: #f8f9fa;
  color: #dc3545;
  border-color: #dc3545;
}

.filter-btn.cancel-btn i {
  color: #dc3545;
}

.filter-btn.cancel-btn:hover {
  background-color: #dc3545;
  color: white;
}

.filter-btn.cancel-btn:hover i {
  color: white;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
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
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: white;
  font-size: 0.9rem;
}

.filter-select:focus {
  outline: none;
  border-color: #008053;
}

.loading, .error {
  text-align: center;
  padding: 2rem;
  color: #666;
}

.loading i, .error i {
  font-size: 2rem;
  margin-bottom: 1rem;
}

.error {
  color: #dc3545;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.5rem 1rem;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.retry-btn:hover {
  background-color: #c82333;
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 2rem;
  padding: 1rem;
}

.plant-card {
  background: white;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  display: flex;
  flex-direction: column;
  height: 100%;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.plant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.plant-image-container {
  position: relative;
  width: 100%;
  height: 200px;
  overflow: hidden;
}

.plant-image {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.plant-card:hover .plant-image {
  transform: scale(1.05);
}

.plant-content {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.plant-content h3 {
  color: #008053;
  font-size: 1.25rem;
  margin-bottom: 0.5rem;
  font-weight: 600;
}

.english-name {
  color: #666;
  font-style: italic;
  font-size: 0.9rem;
  margin-bottom: 1rem;
}

.description {
  color: #444;
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1.5rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.plant-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: 1rem;
  border-top: 1px solid #eee;
}

.benefits {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #008053;
  font-size: 0.9rem;
}

.benefits i {
  font-size: 1rem;
}

.view-more {
  color: #008053;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  font-size: 0.9rem;
}

.plant-card:hover .view-more {
  color: #006040;
  transform: translateX(5px);
}

.view-more i {
  font-size: 0.8rem;
  transition: transform 0.3s ease;
}

.plant-card:hover .view-more i {
  transform: translateX(3px);
}

@media (max-width: 768px) {
  .plants-grid {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }

  .plant-image-container {
    height: 180px;
  }
}

/* Pagination Styles */
.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 0.5rem;
  margin-top: 2rem;
  padding: 1rem;
}

.page-btn {
  min-width: 40px;
  height: 40px;
  padding: 0 0.5rem;
  border: 1px solid #e0e0e0;
  background: white;
  border-radius: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  color: #333;
  font-size: 0.95rem;
}

.page-btn:hover:not(:disabled) {
  background: #f0f0f0;
  border-color: #008053;
  color: #008053;
}

.page-btn.active {
  background: #008053;
  color: white;
  border-color: #008053;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.page-btn i {
  font-size: 0.9rem;
}

.page-ellipsis {
  color: #666;
  padding: 0 0.5rem;
}

/* Responsive Pagination */
@media (max-width: 768px) {
  .pagination {
    flex-wrap: wrap;
    gap: 0.25rem;
  }

  .page-btn {
    min-width: 35px;
    height: 35px;
    font-size: 0.9rem;
  }
}

.search-suggestions {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  z-index: 1000;
}

.suggestions-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  border-bottom: 1px solid #eee;
  font-size: 0.9rem;
  color: #666;
}

.clear-history-btn {
  background: none;
  border: none;
  color: #dc3545;
  cursor: pointer;
  padding: 0.25rem;
  font-size: 0.9rem;
  transition: color 0.3s;
}

.clear-history-btn:hover {
  color: #c82333;
}

.suggestion-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1rem;
  cursor: pointer;
  transition: background-color 0.3s;
}

.suggestion-item:hover {
  background-color: #f8f9fa;
}

.suggestion-item i {
  color: #008053;
  font-size: 0.9rem;
}

.suggestion-item span {
  color: #333;
  font-size: 0.95rem;
}
</style> 
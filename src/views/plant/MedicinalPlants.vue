<script setup lang="ts">
import { ref, onMounted, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { plantService } from '../../services/plant.service';
import divisionService from '../../services/fillter/division.service';
import classService from '../../services/fillter/class.service';
import orderService from '../../services/fillter/order.service';
import familyService from '../../services/fillter/family.service';
import genusService from '../../services/fillter/genus.service';
import speciesService from '../../services/fillter/species.service';

import type { Plant } from '../../models/Plant';

const router = useRouter();
const route = useRoute();
const plants = ref<Plant[]>([]);
const loading = ref(true);
const error = ref<string | null>(null);
const searchQuery = ref('');

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
  let result = plants.value;
  
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
  console.log('Starting to fetch plants...')
  try {
    loading.value = true;
    error.value = null;
    plants.value = await plantService.getPlants();
    console.log('Plants fetched successfully:', plants.value)
  } catch (err) {
    console.error('Error in fetchPlants:', err)
    error.value = err instanceof Error ? err.message : 'Có lỗi xảy ra khi tải danh sách cây thuốc';
  } finally {
    loading.value = false;
    console.log('Fetch plants completed, loading:', loading.value)
  }
};

const handlePlantClick = (plantId: number) => {
  console.log('Plant clicked, navigating to:', plantId)
  router.push(`/plant/${plantId}`);
};

// Add computed property for plant image
const getPlantImage = (plant: Plant) => {
  if (plant.images && plant.images.length > 0) {
    return plant.images[0].url;
  }
  return '/images/plant/default-plant.jpg'; // Fallback image
};

// Add watch for search query
watch(searchQuery, async () => {
  await fetchFilteredPlants();
});

// Add new function to handle view all click
// Update onMounted to handle route parameters
onMounted(() => {
  console.log('MedicinalPlants component mounted');
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
          placeholder="Tìm kiếm cây thuốc..."
          class="search-input"
        >
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
      <div v-for="plant in filteredPlants" :key="plant.plant_id" class="plant-card" @click="handlePlantClick(plant.plant_id)">
        <div class="plant-info">
          <h3>{{ plant.name }}</h3>
          <img :src="getPlantImage(plant)" :alt="plant.name" class="plant-image">
          <p class="english-name">{{ plant.english_name }}</p>
          <p class="description">{{ plant.description }}</p>
        </div>
        <div class="plant-footer">
          <span class="benefits">
            <i class="fas fa-leaf"></i>
            {{ plant.benefits }}
          </span>
        </div>
      </div>
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
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
}

.plant-card {
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.plant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}

.plant-info {
  padding: 1.5rem;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.plant-info h3 {
  color: #008053;
  margin-bottom: 0.75rem;
  font-size: 1.25rem;
  font-weight: 600;
}

.plant-image {
  width: 100%;
  height: 200px;
  object-fit: cover;
  border-radius: 8px;
  margin-bottom: 1rem;
  transition: transform 0.3s;
}

.plant-card:hover .plant-image {
  transform: scale(1.05);
}

.english-name {
  color: #666;
  font-style: italic;
  margin-bottom: 0.5rem;
  font-size: 0.9rem;
}

.description {
  color: #444;
  line-height: 1.5;
  font-size: 0.95rem;
  margin-bottom: 1rem;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.plant-footer {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
  border-top: 1px solid #eee;
  margin-top: auto;
}

.benefits {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #008053;
  font-size: 0.9rem;
  font-weight: 500;
}

.benefits i {
  color: #42b883;
}

.view-all {
  color: #008053;
  text-decoration: none;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  transition: all 0.3s ease;
  cursor: pointer;
}

.view-all:hover {
  color: #006040;
  transform: translateX(5px);
}

@media (max-width: 768px) {
  .plants-container {
    margin: 1rem auto;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .plants-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
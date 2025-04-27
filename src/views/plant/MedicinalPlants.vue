<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import { plantService } from '../../services/plant.service';
import divisionService from '../../services/fillter/division.service';
import classService from '../../services/fillter/class.service';
import orderService from '../../services/fillter/order.service';
import familyService from '../../services/fillter/family.service';
import genusService from '../../services/fillter/genus.service';
import speciesService from '../../services/fillter/species.service';

import type { Plant } from '../../models/Plant';

const router = useRouter();
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

// Filter change handlers
const handleDivisionChange = () => {
  selectedClass.value = '';
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
};

const handleClassChange = () => {
  selectedOrder.value = '';
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
};

const handleOrderChange = () => {
  selectedFamily.value = '';
  selectedGenus.value = '';
  selectedSpecies.value = '';
};

const handleFamilyChange = () => {
  selectedGenus.value = '';
  selectedSpecies.value = '';
};

const handleGenusChange = () => {
  selectedSpecies.value = '';
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

// Filtered plants based on search query and filters
const filteredPlants = computed(() => {
  console.log('Filtering plants with query:', searchQuery.value);
  let result = plants.value;
  
  // Filter by search query
  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase();
    result = result.filter(plant => 
      plant.name.toLowerCase().includes(query) || 
      plant.english_name.toLowerCase().includes(query)
    );
  }
  
  // Filter by selected filters (to be implemented later)
  // This is where we'll add the actual filtering logic when the API is ready
  
  console.log('Filtered plants count:', result.length);
  return result;
});

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

onMounted(() => {
  console.log('MedicinalPlants component mounted')
  fetchPlants();
  fetchFilterData();
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
          placeholder="Tìm kiếm cây thuốc..."
          class="search-input"
        >
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
          <select v-model="selectedSpecies" class="filter-select">
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
          <img src="/images/plant/tia-to.webp" alt="Plant Image" class="plant-image">
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
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  cursor: pointer;
  transition: transform 0.3s, box-shadow 0.3s;
}

.plant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.plant-info {
  padding: 1.5rem;
}

.plant-info h3 {
  color: #008053;
  margin-bottom: 0.5rem;
}

.english-name {
  color: #666;
  font-style: italic;
  margin-bottom: 1rem;
}

.description {
  color: #333;
  line-height: 1.5;
}

.plant-footer {
  padding: 1rem 1.5rem;
  background-color: #f8f9fa;
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
  color: #42b883;
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
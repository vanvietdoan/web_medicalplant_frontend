<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import type { Plant } from '../../models/Plant'
import type { Species } from '../../models/Species'
import { plantService } from '../../services/plant.service'
import speciesService from '../../services/fillter/species.service'
import divisionService from '../../services/fillter/division.service'
import classService from '../../services/fillter/class.service'
import orderService from '../../services/fillter/order.service'
import familyService from '../../services/fillter/family.service'
import genusService from '../../services/fillter/genus.service'
import type { Division } from '../../models/division'
import type { ClassResponse } from '../../models/Class'
import type { OrderResponse } from '../../models/Order'
import type { FamilyResponse } from '../../models/Family'
import type { GenusResponse } from '../../models/Genus'
import type { SpeciesResponse } from '../../models/Species'

const router = useRouter()
const plants = ref<Plant[]>([])
const species = ref<Species[]>([])
const loading = ref(false)
const searchQuery = ref('')

// Filter states
const divisions = ref<Division[]>([])
const classes = ref<ClassResponse[]>([])
const orders = ref<OrderResponse[]>([])
const families = ref<FamilyResponse[]>([])
const genera = ref<GenusResponse[]>([])
const speciesList = ref<SpeciesResponse[]>([])

const selectedDivision = ref('')
const selectedClass = ref('')
const selectedOrder = ref('')
const selectedFamily = ref('')
const selectedGenus = ref('')
const selectedSpecies = ref('')

// Computed properties for available filter options
const availableClasses = computed(() => {
  if (!selectedDivision.value) return [];
  return classes.value.filter(cls => cls.division_id === Number(selectedDivision.value));
});

const availableOrders = computed(() => {
  if (!selectedClass.value) return [];
  return orders.value.filter(order => order.class_id === Number(selectedClass.value));
});

const availableFamilies = computed(() => {
  if (!selectedOrder.value) return [];
  return families.value.filter(family => family.order_id === Number(selectedOrder.value));
});

const availableGenera = computed(() => {
  if (!selectedFamily.value) return [];
  return genera.value.filter(genus => genus.family_id === Number(selectedFamily.value));
});

const availableSpecies = computed(() => {
  if (!selectedGenus.value) return [];
  return speciesList.value.filter(species => species.genus_id === Number(selectedGenus.value));
});

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
    speciesList.value = speciesData;
  } catch (error) {
    console.error('Error fetching filter data:', error);
    ElMessage.error('Không thể tải dữ liệu bộ lọc');
  }
};

const fetchFilteredPlants = async () => {
  try {
    loading.value = true;
    let query = '';

    // Nếu không chọn ngành thì hiển thị tất cả cây
    if (!selectedDivision.value) {
      plants.value = await plantService.getPlants();
      return;
    }

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

    // Nếu có query thì gọi API tìm kiếm
    if (query) {
      plants.value = await plantService.getPlantSearch(query);
    }
  } catch (error) {
    console.error('Error fetching filtered plants:', error);
    ElMessage.error('Không thể tải danh sách cây thuốc');
  } finally {
    loading.value = false;
  }
};

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

// Update the filteredPlants computed property to only handle search
const filteredPlants = computed(() => {
  if (!searchQuery.value) return plants.value;
  
  const query = searchQuery.value.toLowerCase();
  return plants.value.filter(plant =>
    plant.name.toLowerCase().includes(query) ||
    plant.english_name.toLowerCase().includes(query)
  );
});

const getSpecies = async () => {
  const response = await speciesService.getSpecies()
  species.value = response
}

const handleEdit = (plant: Plant) => {
  if (!plant) return;
  
  router.push({
    name: 'plant-edit',
    params: { id: plant.plant_id },
    query: {
      name: plant.name || '',
      english_name: plant.english_name || '',
      description: plant.description || '',
      benefits: plant.benefits || '',
      instructions: plant.instructions || '',
      species_id: plant.species_id?.toString() || '1',
      image_url: plant.image_url || ''
    }
  })
}

const handleDelete = async (plantId: number) => {
  try {
    if (confirm('Bạn có chắc chắn muốn xóa cây thuốc này?')) {
      await plantService.deletePlant(plantId)
      ElMessage.success('Xóa cây thuốc thành công')
      await fetchPlants()
    }
  } catch (error) {
    console.error('Error deleting plant:', error)
    ElMessage.error('Không thể xóa cây thuốc')
  }
}

const fetchPlants = async () => {
  try {
    loading.value = true
    const response = await plantService.getPlants()
    console.log('API Response:', response)
    plants.value = response
    console.log('Plants data:', plants.value)
  } catch (error) {
    console.error('Error fetching plants:', error)
    ElMessage.error('Không thể tải danh sách cây thuốc')
  } finally {
    loading.value = false
  }
}

const handleCreate = () => {
  router.push({ name: 'plant-create' })
}

onMounted(() => {
  fetchPlants()
  getSpecies()
  fetchFilterData()
})
</script>

<template>
  <div class="plant-list">
    <div class="header">
      <h2>Quản lý cây thuốc</h2>
     
      <div class="search-bar">
        <input 
          v-model="searchQuery" 
          type="text" 
          placeholder="Tìm kiếm cây thuốc..." 
          class="search-input"
        />
      </div>
      <button class="btn-create" @click="handleCreate">
        <i class="fas fa-plus"></i> Thêm cây thuốc
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

    <div v-if="loading" class="loading">Đang tải...</div>

    <table v-else class="plant-table">
      <thead>
        <tr>
          <th>ID</th>
          <th>Tên</th>
          <th>Tên tiếng Anh</th>
          <th>Loài</th>
          <th>Thao tác</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="plant in filteredPlants" :key="plant.plant_id">
          <td>{{ plant.plant_id }}</td>
          <td>{{ plant.name }}</td>
          <td>{{ plant.english_name }}</td>
          <td>{{ species.find((species: Species) => species.species_id === plant.species_id)?.name }}</td>
          <td>
            <div class="action-buttons">
              <button @click="handleEdit(plant)" class="btn-edit">
                <i class="fas fa-edit"></i>
              </button>
              <button @click="handleDelete(plant.plant_id)" class="btn-delete">
                <i class="fas fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<style scoped>
.plant-list {
  padding: 20px;
}

.header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.search-bar {
  flex: 0 0 300px;
}

.search-input {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
}

.search-input:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}

.plant-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

.plant-table th,
.plant-table td {
  padding: 12px;
  border-bottom: 1px solid #ddd;
}

.loading {
  text-align: center;
  padding: 20px;
  color: #666;
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-edit,
.btn-delete {
  padding: 6px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  color: white;
}

.btn-edit {
  background: #2196F3;
}

.btn-delete {
  background: #f44336;
}

.btn-edit:hover {
  background: #1976D2;
}

.btn-delete:hover {
  background: #D32F2F;
}

.species {
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.9em;
  background: #e8f5e9;
  color: #4CAF50;
}

.btn-create {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background-color: #4CAF50;
  color: white;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

.btn-create:hover {
  background-color: #388E3C;
}

.filters {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-bottom: 20px;
  padding: 16px;
  background: #f5f5f5;
  border-radius: 8px;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.filter-group label {
  font-weight: 500;
  color: #333;
}

.filter-select {
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-width: 200px;
  background: white;
}

.filter-select:focus {
  outline: none;
  border-color: #2196F3;
  box-shadow: 0 0 0 2px rgba(33, 150, 243, 0.1);
}
</style> 
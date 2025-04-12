<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';

interface MedicinalPlant {
  plant_id: number;
  name: string;
  image: string;
  english_name: string;
  description: string;
  time: string;
  benefits: string;
  instructions: string;
  species: {
    name: string;
    genus: {
      name: string;
      family: {
        name: string;
        order: {
          name: string;
          class: {
            name: string;
            division: {
              name: string;
            }
          }
        }
      }
    }
  }
}

const plants = ref<MedicinalPlant[]>([]);
const searchQuery = ref('');
const selectedDivision = ref('');
const selectedClass = ref('');
const selectedOrder = ref('');
const selectedFamily = ref('');
const selectedGenus = ref('');
const selectedSpecies = ref('');

// Computed properties for cascade filtering
const availableClasses = computed(() => {
  if (!selectedDivision.value) return [];
  return [...new Set(plants.value
    .filter(p => p.species.genus.family.order.class.division.name === selectedDivision.value)
    .map(p => p.species.genus.family.order.class.name))];
});

const availableOrders = computed(() => {
  if (!selectedClass.value) return [];
  return [...new Set(plants.value
    .filter(p => p.species.genus.family.order.class.name === selectedClass.value)
    .map(p => p.species.genus.family.order.name))];
});

const availableFamilies = computed(() => {
  if (!selectedOrder.value) return [];
  return [...new Set(plants.value
    .filter(p => p.species.genus.family.order.name === selectedOrder.value)
    .map(p => p.species.genus.family.name))];
});

const availableGenera = computed(() => {
  if (!selectedFamily.value) return [];
  return [...new Set(plants.value
    .filter(p => p.species.genus.family.name === selectedFamily.value)
    .map(p => p.species.genus.name))];
});

const availableSpecies = computed(() => {
  if (!selectedGenus.value) return [];
  return [...new Set(plants.value
    .filter(p => p.species.genus.name === selectedGenus.value)
    .map(p => p.species.name))];
});

// Reset dependent filters when parent filter changes
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

const filteredPlants = computed(() => {
  return plants.value.filter(plant => {
    const matchesSearch = plant.name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
                         plant.english_name.toLowerCase().includes(searchQuery.value.toLowerCase());
    const matchesDivision = !selectedDivision.value || plant.species.genus.family.order.class.division.name === selectedDivision.value;
    const matchesClass = !selectedClass.value || plant.species.genus.family.order.class.name === selectedClass.value;
    const matchesOrder = !selectedOrder.value || plant.species.genus.family.order.name === selectedOrder.value;
    const matchesFamily = !selectedFamily.value || plant.species.genus.family.name === selectedFamily.value;
    const matchesGenus = !selectedGenus.value || plant.species.genus.name === selectedGenus.value;
    const matchesSpecies = !selectedSpecies.value || plant.species.name === selectedSpecies.value;
    return matchesSearch && matchesDivision && matchesClass && matchesOrder && matchesFamily && matchesGenus && matchesSpecies;
  });
});

// Mocked data for demonstration
onMounted(() => {
  plants.value = [
    {
      plant_id: 1,
      name: 'Sâm Ngọc Linh',
      image: '/images/sam-ngoc-linh.jpg',
      english_name: 'Vietnamese Ginseng', 
      description: 'Sâm Ngọc Linh là loại dược liệu quý hiếm của Việt Nam',
      time: 'Thu hoạch sau 5-7 năm trồng',
      benefits: 'Tăng cường sức đề kháng, chống mệt mỏi, bồi bổ cơ thể',
      instructions: 'Có thể sử dụng dưới dạng cao, rượu hoặc bột',
      species: {
        name: 'Panax vietnamensis',
        genus: {
          name: 'Panax',
          family: {
            name: 'Araliaceae',
            order: {
              name: 'Apiales', 
              class: {
                name: 'Magnoliopsida',
                division: {
                  name: 'Magnoliophyta'
                }
              }
            }
          }
        }
      }
    },
    {
      plant_id: 2,
      name: 'Đinh Lăng',
      image: '/images/dinh-lang.webp',
      english_name: 'Polyscias fruticosa',
      description: 'Đinh lăng là cây thuốc quý có tác dụng bổ não và tăng cường trí nhớ',
      time: 'Thu hoạch sau 2-3 năm trồng',
      benefits: 'Tăng cường trí nhớ, giảm stress, bổ não',
      instructions: 'Dùng dưới dạng rễ phơi khô, ngâm rượu hoặc sắc nước uống',
      species: {
        name: 'Polyscias fruticosa',
        genus: {
          name: 'Polyscias',
          family: {
            name: 'Araliaceae',
            order: {
              name: 'Apiales',
              class: {
                name: 'Magnoliopsida', 
                division: {
                  name: 'Magnoliophyta'
                }
              }
            }
          }
        }
      }
    },
    {
      plant_id: 3,
      name: 'Đương Quy',
      image: '/images/duong-quy.jpg',
      english_name: 'Chinese Angelica',
      description: 'Đương quy là vị thuốc quý trong Đông y có tác dụng bổ huyết',
      time: 'Thu hoạch sau 1-2 năm trồng',
      benefits: 'Bổ huyết, điều hòa kinh nguyệt, chống lão hóa',
      instructions: 'Có thể dùng dưới dạng thuốc sắc, thuốc hoàn, rượu thuốc',
      species: {
        name: 'Angelica sinensis',
        genus: {
          name: 'Angelica',
          family: {
            name: 'Apiaceae',
            order: {
              name: 'Apiales',
              class: {
                name: 'Magnoliopsida',
                division: {
                  name: 'Magnoliophyta'
                }
              }
            }
          }
        }
      }
    },
    // Thêm các cây thuốc khác...
  ];
});
</script>

<template>
  <div class="medicinal-plants">
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
            <option v-for="division in [...new Set(plants.map(p => p.species.genus.family.order.class.division.name))]" 
                    :key="division" 
                    :value="division">
              {{ division }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedDivision">
          <label>Lớp</label>
          <select v-model="selectedClass" class="filter-select" @change="handleClassChange">
            <option value="">Chọn lớp</option>
            <option v-for="cls in availableClasses" :key="cls" :value="cls">
              {{ cls }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedClass">
          <label>Bộ</label>
          <select v-model="selectedOrder" class="filter-select" @change="handleOrderChange">
            <option value="">Chọn bộ</option>
            <option v-for="order in availableOrders" :key="order" :value="order">
              {{ order }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedOrder">
          <label>Họ</label>
          <select v-model="selectedFamily" class="filter-select" @change="handleFamilyChange">
            <option value="">Chọn họ</option>
            <option v-for="family in availableFamilies" :key="family" :value="family">
              {{ family }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedFamily">
          <label>Chi</label>
          <select v-model="selectedGenus" class="filter-select" @change="handleGenusChange">
            <option value="">Chọn chi</option>
            <option v-for="genus in availableGenera" :key="genus" :value="genus">
              {{ genus }}
            </option>
          </select>
        </div>

        <div class="filter-group" v-if="selectedGenus">
          <label>Loài</label>
          <select v-model="selectedSpecies" class="filter-select">
            <option value="">Chọn loài</option>
            <option v-for="species in availableSpecies" :key="species" :value="species">
              {{ species }}
            </option>
          </select>
        </div>
      </div>
    </section>

    <section class="plants-grid">
      <div v-for="plant in filteredPlants" :key="plant.plant_id" class="plant-card">
        <div class="card-image">
          <img :src="`${plant.image}`" :alt="plant.name">
        </div>
        <div class="card-content">
          <div class="plant-names">
            <h3>{{ plant.name }}</h3>
            <span class="scientific-name">{{ plant.species.name }}</span>
          </div>
          <div class="plant-info">
            <div class="taxonomy">
              <p><strong>Họ:</strong> {{ plant.species.genus.family.name }}</p>
              <p><strong>Chi:</strong> {{ plant.species.genus.name }}</p>
            </div>
            <p class="description">{{ plant.description }}</p>
            <div class="details">
              <div class="benefits">
                <h4>Công dụng:</h4>
                <p>{{ plant.benefits }}</p>
              </div>
              <div class="instructions">
                <h4>Hướng dẫn sử dụng:</h4>
                <p>{{ plant.instructions }}</p>
              </div>
              <div class="harvest-time">
                <h4>Thời gian thu hoạch:</h4>
                <p>{{ plant.time }}</p>
              </div>
            </div>
          </div>
          <router-link :to="`/medicinal-plant-detail/${plant.plant_id}`" class="view-details">
            Xem chi tiết
          </router-link>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.medicinal-plants {
  padding: 2rem;
  max-width: 1200px;
  margin: 40px auto;
}

.search-filter {
  background: white;
  padding: 2rem;
  border-radius: 15px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  margin-bottom: 2rem;
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
  color: #666;
}

.search-input {
  width: 100%;
  padding: 1rem 1rem 1rem 3rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
}

.filters {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
}

.filter-group {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.filter-group label {
  font-weight: 500;
  color: #2c3e50;
}

.filter-select {
  padding: 0.8rem;
  border: 2px solid #e0e0e0;
  border-radius: 8px;
  font-size: 1rem;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
}

.filter-select:hover {
  border-color: #008053;
}

.filter-select:focus {
  border-color: #008053;
  outline: none;
  box-shadow: 0 0 0 3px rgba(0, 128, 83, 0.1);
}

.plants-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 2rem;
}

.plant-card {
  background: white;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.plant-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 15px rgba(0, 0, 0, 0.2);
}

.card-image {
  height: 250px;
  overflow: hidden;
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.5s ease;
}

.plant-card:hover .card-image img {
  transform: scale(1.1);
}

.card-content {
  padding: 1.5rem;
}

.plant-names {
  margin-bottom: 1rem;
}

.plant-names h3 {
  color: #2c3e50;
  font-size: 1.5rem;
  margin-bottom: 0.5rem;
}

.scientific-name {
  color: #666;
  font-style: italic;
}

.taxonomy {
  margin-bottom: 1rem;
  padding: 0.5rem;
  background: #f8f9fa;
  border-radius: 8px;
}

.taxonomy p {
  margin: 0.3rem 0;
  color: #666;
}

.description {
  margin-bottom: 1rem;
  line-height: 1.6;
}

.details {
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.details h4 {
  color: #008053;
  margin-bottom: 0.5rem;
}

.details p {
  color: #666;
  margin-bottom: 1rem;
}

.view-details {
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: #008053;
  color: white;
  text-decoration: none;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.view-details:hover {
  background-color: #006c46;
  transform: translateY(-2px);
}

@media (max-width: 768px) {
  .medicinal-plants {
    padding: 1rem;
  }

  .search-filter {
    padding: 1rem;
  }

  .filters {
    grid-template-columns: 1fr;
  }

  .plants-grid {
    grid-template-columns: 1fr;
  }
}
</style> 
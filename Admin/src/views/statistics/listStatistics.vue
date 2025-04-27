<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { plantService } from '../../services/plant.service'
import divisionService from '../../services/fillter/division.service'
import orderService from '../../services/fillter/order.service'
import classService from '../../services/fillter/class.service'
import familyService from '../../services/fillter/family.service'
import genusService from '../../services/fillter/genus.service'
import speciesService from '../../services/fillter/species.service'
import { diseasesService } from '../../services/diseases.service'
import { adviceService } from '../../services/advice.service'
import { userService } from '../../services/user.service'
import { useRouter } from 'vue-router'

const router = useRouter()
const loading = ref(true)
const stats = ref({
  totalPlants: 0,
  totalDiseases: 0,
  totalAdvices: 0,
  totalUsers: 0,
  totalDivisions: 0,
  totalOrders: 0,
  totalClasses: 0,
  totalFamilies: 0,
  totalGenuses: 0,
  totalSpecies: 0
})

const handleChart = (type: string) => {
  router.push(`/admin/statistics/${type}`)
}

const fetchStatistics = async () => {
  try {
    loading.value = true
    const [
      plantsResponse,
      diseasesResponse,
      advicesResponse,
      usersResponse,
      divisionsResponse,
      ordersResponse,
      classesResponse,
      familiesResponse,
      genusesResponse,
      speciesResponse
    ] = await Promise.all([
      plantService.getPlants(),
      diseasesService.getDiseases(),
      adviceService.getAdvices(),
      userService.getUsers(),
      divisionService.getDivisions(),
      orderService.getOrders(),
      classService.getClasses(),
      familyService.getFamilies(),
      genusService.getGenuses(),
      speciesService.getSpecies()
    ])

    let usersData = []
    if (Array.isArray(usersResponse.data)) {
      usersData = usersResponse.data
    } else if (usersResponse.data && typeof usersResponse.data === 'object' && 'data' in usersResponse.data) {
      usersData = (usersResponse.data as { data: any[] }).data
    } else {
      console.error('Unexpected data structure:', usersResponse.data)
      return
    }

    stats.value.totalPlants = plantsResponse.length
    stats.value.totalDiseases = diseasesResponse.length
    stats.value.totalAdvices = advicesResponse.length
    stats.value.totalUsers = usersData.length
    stats.value.totalDivisions = divisionsResponse.length
    stats.value.totalOrders = ordersResponse.length
    stats.value.totalClasses = classesResponse.length
    stats.value.totalFamilies = familiesResponse.length
    stats.value.totalGenuses = genusesResponse.length
    stats.value.totalSpecies = speciesResponse.length

  } catch (error) {
    console.error('Error fetching statistics:', error)
  } finally {
    loading.value = false
  }
}

onMounted(() => {
  fetchStatistics()
})
</script>

<template>
  <div class="statistics-page">
    <h1>Thống kê</h1>
    
    <div v-if="loading" class="loading">Đang tải dữ liệu...</div>
    
    <div v-else class="statistics-grid">
      <div class="stat-card" @click="handleChart('plant')">
        <h3>Tổng số cây thuốc</h3>
        <p class="number">{{ stats.totalPlants }}</p>
      </div>
      
      <div class="stat-card" @click="handleChart('disease')">
        <h3>Tổng số bệnh</h3>
        <p class="number">{{ stats.totalDiseases }}</p>
      </div>
      
      <div class="stat-card" @click="handleChart('advice')">
        <h3>Tổng số lời khuyên</h3>
        <p class="number">{{ stats.totalAdvices }}</p>
      </div>
      
      <div class="stat-card" @click="handleChart('user')">
        <h3>Tổng số người dùng</h3>
        <p class="number">{{ stats.totalUsers }}</p>
      </div>

      <div class="stat-card" @click="handleChart('division')">
        <h3>Tổng số ngành</h3>
        <p class="number">{{ stats.totalDivisions }}</p>
      </div>

      <div class="stat-card" @click="handleChart('order')">
        <h3>Tổng số bộ</h3>
        <p class="number">{{ stats.totalOrders }}</p>
      </div>

      <div class="stat-card" @click="handleChart('class')">
        <h3>Tổng số lớp</h3>
        <p class="number">{{ stats.totalClasses }}</p>
      </div>

      <div class="stat-card" @click="handleChart('family')">
        <h3>Tổng số họ</h3>
        <p class="number">{{ stats.totalFamilies }}</p>
      </div>

      <div class="stat-card" @click="handleChart('genus')">
        <h3>Tổng số chi</h3>
        <p class="number">{{ stats.totalGenuses }}</p>
      </div>

      <div class="stat-card" @click="handleChart('species')">
        <h3>Tổng số loài</h3>
        <p class="number">{{ stats.totalSpecies }}</p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.statistics-page {
  padding: 20px;
}

.statistics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-top: 20px;
}

.stat-card {
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  text-align: center;
  text-decoration: none;
  color: inherit;
  transition: transform 0.2s;
}

.stat-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.stat-card h3 {
  margin: 0;
  color: #666;
  font-size: 1.1em;
}

.stat-card .number {
  font-size: 2.5em;
  font-weight: bold;
  color: #4CAF50;
  margin: 10px 0 0;
}

.loading {
  text-align: center;
  padding: 40px;
  color: #666;
}
</style>
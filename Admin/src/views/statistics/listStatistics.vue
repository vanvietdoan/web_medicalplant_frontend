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
import { evalueService } from '../../services/evalue.service'
import { reportService } from '../../services/report.service'
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
  totalSpecies: 0,
  totalEvalues: 0,
  totalReports: 0
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
      speciesResponse,
      evaluesResponse,
      reportsResponse
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
      speciesService.getSpecies(),
      evalueService.getEvalues(),
      reportService.getReports()
    ])

    let usersData: any[] = []
    if (Array.isArray(usersResponse.data)) {
      usersData = usersResponse.data
    } else if (usersResponse.data && typeof usersResponse.data === 'object' && 'data' in usersResponse.data) {
      usersData = (usersResponse.data as { data: any[] }).data
    } else {
      console.error('Unexpected data structure:', usersResponse.data)
      usersData = []
    }

    let unapprovedReports = Array.isArray(reportsResponse)
      ? reportsResponse.filter((r: any) => r.status !== 1)
      : []

    stats.value = {
      totalPlants: Array.isArray(plantsResponse) ? plantsResponse.length : 0,
      totalDiseases: Array.isArray(diseasesResponse) ? diseasesResponse.length : 0,
      totalAdvices: Array.isArray(advicesResponse) ? advicesResponse.length : 0,
      totalUsers: usersData.length,
      totalDivisions: Array.isArray(divisionsResponse) ? divisionsResponse.length : 0,
      totalOrders: Array.isArray(ordersResponse) ? ordersResponse.length : 0,
      totalClasses: Array.isArray(classesResponse) ? classesResponse.length : 0,
      totalFamilies: Array.isArray(familiesResponse) ? familiesResponse.length : 0,
      totalGenuses: Array.isArray(genusesResponse) ? genusesResponse.length : 0,
      totalSpecies: Array.isArray(speciesResponse) ? speciesResponse.length : 0,
      totalEvalues: Array.isArray(evaluesResponse) ? evaluesResponse.length : 0,
      totalReports: unapprovedReports.length
    }

    console.log('Statistics data:', stats.value)

  } catch (error) {
    console.error('Error fetching statistics:', error)
  } finally {
    loading.value = false
  }
}

const goToReportList = () => {
  router.push({ name: 'reports' })
}

onMounted(() => {
  fetchStatistics()
})
</script>

<template>
  <div class="dashboard-v2">
    <div class="dashboard-v2__top">
      <div class="dashboard-v2__stats">
        <div class="stat-card-v2 clickable" @click="handleChart('plant')">
          <span class="stat-label">Tổng số cây thuốc</span>
          <span class="stat-value">{{ stats.totalPlants }}</span>
        </div>
        <div class="stat-card-v2 clickable" @click="handleChart('disease')">
          <span class="stat-label">Tổng số bệnh</span>
          <span class="stat-value">{{ stats.totalDiseases }}</span>
        </div>
        <div class="stat-card-v2 clickable" @click="handleChart('user')">
          <span class="stat-label">Tổng số người dùng</span>
          <span class="stat-value">{{ stats.totalUsers }}</span>
        </div>
      </div>
      <div class="dashboard-v2__report">
        <div class="report-card-v2">
          <div class="report-card-v2__icon">
            <img src="https://cdn-icons-png.flaticon.com/512/1827/1827392.png" alt="bell" />
            <span class="report-card-v2__badge">{{ stats.totalReports }}</span>
          </div>
          <div class="report-card-v2__content">
            <span class="report-card-v2__count">{{ stats.totalReports }}</span>
            <span class="report-card-v2__label">báo cáo chưa duyệt</span>
            <div class="report-actions">
              <button class="btn-report" @click="handleChart('report')">Xem thống kê</button>
              <button class="btn-report" @click="goToReportList">Duyệt báo cáo</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div class="dashboard-v2__bottom">
      <div class="dashboard-v2__left">
        <div class="section-title">Phân loại thực vật</div>
        <div class="plant-classify-grid">
          <div class="classify-card-v2 clickable" @click="handleChart('division')">
            <span class="classify-label">Ngành</span>
            <span class="classify-value">{{ stats.totalDivisions }}</span>
          </div>
          <div class="classify-card-v2 clickable" @click="handleChart('order')">
            <span class="classify-label">Bộ</span>
            <span class="classify-value">{{ stats.totalOrders }}</span>
          </div>
          <div class="classify-card-v2 clickable" @click="handleChart('class')">
            <span class="classify-label">Lớp</span>
            <span class="classify-value">{{ stats.totalClasses }}</span>
          </div>
          <div class="classify-card-v2 clickable" @click="handleChart('family')">
            <span class="classify-label">Họ</span>
            <span class="classify-value">{{ stats.totalFamilies }}</span>
          </div>
          <div class="classify-card-v2 clickable" @click="handleChart('genus')">
            <span class="classify-label">Chi</span>
            <span class="classify-value">{{ stats.totalGenuses }}</span>
          </div>
          <div class="classify-card-v2 clickable" @click="handleChart('species')">
            <span class="classify-label">Loài</span>
            <span class="classify-value">{{ stats.totalSpecies }}</span>
          </div>
        </div>
      </div>
      <div class="dashboard-v2__right">
        <div class="section-title">Tương tác người dùng</div>
        <div class="user-interact-grid">
          <div class="classify-card-v2 clickable" @click="handleChart('advice')">
            <span class="classify-label">Lời khuyên</span>
            <span class="classify-value">{{ stats.totalAdvices }}</span>
          </div>
          <div class="classify-card-v2 clickable" @click="handleChart('evalue')">
            <span class="classify-label">Đánh giá</span>
            <span class="classify-value">{{ stats.totalEvalues }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.dashboard-v2 {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto;
  padding: 32px 0 0 0;
  background: #f7f9fb;
}
.dashboard-v2__top {
  display: flex;
  gap: 32px;
  margin-bottom: 32px;
}
.dashboard-v2__stats {
  display: flex;
  gap: 24px;
  flex: 2;
}
.stat-card-v2 {
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  padding: 32px 24px;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.stat-label {
  color: #888;
  font-size: 18px;
  margin-bottom: 12px;
}
.stat-value {
  font-size: 36px;
  font-weight: 700;
  color: #222;
}
.dashboard-v2__report {
  flex: 1;
  display: flex;
  align-items: stretch;
}
.report-card-v2 {
  background: #fff;
  border-radius: 24px;
  box-shadow: 0 2px 16px 0 rgba(76,175,80,0.10);
  padding: 32px 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: 180px;
  position: relative;
  border: 3px solid #b6e7c9;
}
.report-card-v2__icon {
  position: absolute;
  top: -24px;
  right: -24px;
  background: #fff;
  border-radius: 50%;
  box-shadow: 0 2px 8px 0 rgba(76,175,80,0.10);
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.report-card-v2__icon img {
  width: 40px;
  height: 40px;
}
.report-card-v2__badge {
  position: absolute;
  top: 6px;
  right: 6px;
  background: #4CAF50;
  color: #fff;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid #fff;
}
.report-card-v2__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.report-card-v2__count {
  font-size: 40px;
  font-weight: 800;
  color: #222;
  margin-bottom: 8px;
}
.report-card-v2__label {
  font-size: 22px;
  color: #222;
  font-weight: 600;
}
.report-actions {
  display: flex;
  gap: 10px;
  margin-top: 12px;
  justify-content: center;
}
.btn-report {
  background: #4CAF50;
  color: #fff;
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-size: 15px;
  font-weight: 500;
  cursor: pointer;
  transition: background 0.2s;
}
.btn-report:hover {
  background: #388E3C;
}
.dashboard-v2__bottom {
  display: flex;
  gap: 32px;
}
.dashboard-v2__left {
  flex: 2;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  padding: 24px 24px 32px 24px;
}
.dashboard-v2__right {
  flex: 1;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,0.06);
  padding: 24px 24px 32px 24px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
}
.section-title {
  font-size: 20px;
  font-weight: 700;
  color: #222;
  margin-bottom: 18px;
}
.plant-classify-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18px;
}
.user-interact-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 18px;
}
.classify-card-v2 {
  background: #f7f9fb;
  border-radius: 12px;
  box-shadow: 0 1px 4px 0 rgba(0,0,0,0.04);
  padding: 24px 0 18px 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
.classify-label {
  color: #888;
  font-size: 16px;
  margin-bottom: 8px;
}
.classify-value {
  font-size: 28px;
  font-weight: 700;
  color: #222;
}
@media (max-width: 1100px) {
  .dashboard-v2__top, .dashboard-v2__bottom {
    flex-direction: column;
    gap: 24px;
  }
  .dashboard-v2__stats {
    flex-direction: column;
    gap: 18px;
  }
  .dashboard-v2__report {
    min-height: 120px;
  }
}
@media (max-width: 700px) {
  .dashboard-v2 {
    padding: 12px 0 0 0;
  }
  .dashboard-v2__left, .dashboard-v2__right {
    padding: 12px 8px 18px 8px;
  }
  .plant-classify-grid {
    grid-template-columns: 1fr 1fr;
  }
  .user-interact-grid {
    grid-template-columns: 1fr;
  }
}
.clickable {
  cursor: pointer;
  transition: box-shadow 0.2s;
}
.clickable:hover {
  box-shadow: 0 4px 20px 0 rgba(76,175,80,0.13), 0 2px 12px 0 rgba(0,0,0,0.08);
}
</style>
<template>
  <div class="chart-wrapper">
    <div class="chart-header">
      <h2 class="chart-title">{{ chartTitle }}</h2>
      <div class="chart-controls">
        <button 
          class="chart-toggle" 
          @click="toggleChartType"
          :class="{ active: chartType === 'bar' }"
        >
          <i class="fas fa-chart-bar"></i>
          Biểu đồ cột
        </button>
        <button 
          class="chart-toggle" 
          @click="toggleChartType"
          :class="{ active: chartType === 'line' }"
        >
          <i class="fas fa-chart-line"></i>
          Biểu đồ đường
        </button>
      </div>
    </div>
    <div class="chart-container">
      <canvas ref="chartRef"></canvas>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { onMounted, ref } from 'vue'
import { Chart, registerables } from 'chart.js'
import { useRoute } from 'vue-router'
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

Chart.register(...registerables)

const route = useRoute()
const chartRef = ref<HTMLCanvasElement | null>(null)
let chartInstance: Chart | null = null
const chartType = ref<'bar' | 'line'>('bar')
const chartTitle = ref('')

const toggleChartType = () => {
  chartType.value = chartType.value === 'bar' ? 'line' : 'bar'
  updateChart()
}

const updateChart = async () => {
  const type = route.params.type as string
  const chartInfo = await getChartData(type)

  if (!chartInfo) return

  const { data, title, colors } = chartInfo
  chartTitle.value = title

  // Process data for created_at
  const countByCreatedDate = data.reduce((acc: Record<string, number>, item: any) => {
    if (item.created_at) {
      const date = new Date(item.created_at).toISOString().slice(0, 10)
      acc[date] = (acc[date] || 0) + 1
    }
    return acc
  }, {})
  const countByUpdatedDate = data.reduce((acc: Record<string, number>, item: any) => {
    if (item.updated_at) {
      const date = new Date(item.updated_at).toISOString().slice(0, 10)
      acc[date] = (acc[date] || 0) + 1
    }
    return acc
  }, {})

  // Get all unique dates
  const allDates = new Set([
    ...Object.keys(countByCreatedDate),
    ...Object.keys(countByUpdatedDate)
  ])
  const labels = Array.from(allDates).sort()

  // Prepare data for both datasets
  const createdData = labels.map(date => countByCreatedDate[date] || 0)
  const updatedData = labels.map(date => countByUpdatedDate[date] || 0)

  // Draw chart
  if (chartRef.value) {
    if (chartInstance) {
      chartInstance.destroy()
    }

    chartInstance = new Chart(chartRef.value.getContext('2d')!, {
      type: chartType.value,
      data: {
        labels,
        datasets: [
          {
            label: `${title} (Ngày tạo)`,
            data: createdData,
            backgroundColor: `${colors.created}80`,
            borderColor: colors.created,
            borderWidth: 2,
            borderRadius: chartType.value === 'bar' ? 4 : 0,
            tension: chartType.value === 'line' ? 0.4 : 0,
            fill: chartType.value === 'line' ? false : true,
            pointBackgroundColor: colors.created,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          },
          {
            label: `${title} (Ngày cập nhật)`,
            data: updatedData,
            backgroundColor: `${colors.updated}80`,
            borderColor: colors.updated,
            borderWidth: 2,
            borderRadius: chartType.value === 'bar' ? 4 : 0,
            tension: chartType.value === 'line' ? 0.4 : 0,
            fill: chartType.value === 'line' ? false : true,
            pointBackgroundColor: colors.updated,
            pointBorderColor: '#fff',
            pointBorderWidth: 2,
            pointRadius: 4,
            pointHoverRadius: 6
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              usePointStyle: true,
              padding: 20,
              font: {
                size: 12,
                weight: 'bold'
              }
            }
          }
        },
        scales: {
          x: {
            title: {
              display: true,
              text: 'Ngày',
              font: {
                weight: 'bold'
              }
            },
            grid: {
              display: false
            }
          },
          y: {
            title: {
              display: true,
              text: 'Số lượng',
              font: {
                weight: 'bold'
              }
            },
            beginAtZero: true,
            ticks: {
              stepSize: 1
            }
          }
        }
      }
    })
  }
}

const getChartData = async (type: string) => {
  let data: any[] = []
  let title = ''
  let colors = {
    created: '',
    updated: ''
  }

  switch (type) {
    case 'plant':
      const plantsRes = await plantService.getPlants()
      data = plantsRes || []
      title = 'Cây thuốc theo thời gian'
      colors = {
        created: '#4CAF50',  // Xanh lá đậm
        updated: '#FF9800'   // Cam
      }
      break
    case 'disease':
      data = await diseasesService.getDiseases()
      title = 'Bệnh theo thời gian'
      colors = {
        created: '#F44336',  // Đỏ
        updated: '#2196F3'   // Xanh dương
      }
      break
    case 'advice':
      data = await adviceService.getAdvices()
      title = 'Lời khuyên theo thời gian'
      colors = {
        created: '#9C27B0',  // Tím
        updated: '#00BCD4'   // Xanh ngọc
      }
      break
    case 'user':
      const usersRes = await userService.getUsers()
      let usersData = []
      if (Array.isArray(usersRes.data)) {
        usersData = usersRes.data
      } else if (usersRes.data && typeof usersRes.data === 'object' && 'data' in usersRes.data) {
        usersData = (usersRes.data as { data: any[] }).data
      } else {
        console.error('Unexpected data structure:', usersRes.data)
      }
      data = usersData
      title = 'Người dùng theo thời gian'
      colors = {
        created: '#FFC107',  // Vàng
        updated: '#795548'   // Nâu
      }
      break
    case 'division':
      data = await divisionService.getDivisions()
      title = 'Phân loại ngành theo thời gian'
      colors = {
        created: '#3F51B5',  // Chàm
        updated: '#009688'   // Ngọc lục bảo
      }
      break
    case 'order':
      data = await orderService.getOrders()
      title = 'Phân loại bộ theo thời gian'
      colors = {
        created: '#E91E63',  // Hồng
        updated: '#607D8B'   // Xám xanh
      }
      break
    case 'class':
      data = await classService.getClasses()
      title = 'Phân loại lớp theo thời gian'
      colors = {
        created: '#673AB7',  // Tím đậm
        updated: '#FF5722'   // Cam đậm
      }
      break
    case 'family':
      data = await familyService.getFamilies()
      title = 'Phân loại họ theo thời gian'
      colors = {
        created: '#8BC34A',  // Xanh lá nhạt
        updated: '#FF4081'   // Hồng đậm
      }
      break
    case 'genus':
      data = await genusService.getGenuses()
      title = 'Phân loại chi theo thời gian'
      colors = {
        created: '#00BCD4',  // Xanh ngọc
        updated: '#FF9800'   // Cam
      }
      break
    case 'species':
      data = await speciesService.getSpecies()
      title = 'Phân loại loài theo thời gian'
      colors = {
        created: '#CDDC39',  // Vàng chanh
        updated: '#9C27B0'   // Tím
      }
      break
    case 'evalue':
      data = await evalueService.getEvalues()
      title = 'Đánh giá theo thời gian'
      colors = {
        created: '#FF5722',  // Cam đậm
        updated: '#2196F3'   // Xanh dương
      }
      break
    case 'report':
      data = await reportService.getReports()
      title = 'Báo cáo theo thời gian'
      colors = {
        created: '#F44336',  // Đỏ
        updated: '#4CAF50'   // Xanh lá
      }
      break
    default:
      console.error('Invalid chart type')
      return null
  }

  return { data, title, colors }
}

onMounted(() => {
  updateChart()
})
</script>

<style scoped>
.chart-wrapper {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.chart-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.chart-title {
  margin: 0;
  font-size: 1.5rem;
  color: #333;
  font-weight: 600;
}

.chart-controls {
  display: flex;
  gap: 12px;
}

.chart-toggle {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: white;
  color: #606266;
  cursor: pointer;
  transition: all 0.3s ease;
}

.chart-toggle:hover {
  color: #409eff;
  border-color: #c6e2ff;
  background-color: #ecf5ff;
}

.chart-toggle.active {
  color: #409eff;
  border-color: #409eff;
  background-color: #ecf5ff;
}

.chart-toggle i {
  font-size: 16px;
}

.chart-container {
  height: 70vh;
  background: white;
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}
</style>
  
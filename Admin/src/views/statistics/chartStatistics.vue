<template>
    <div class="chart-container">
      <canvas ref="chartRef"></canvas>
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
  
  const getChartData = async (type: string) => {
    let data: any[] = []
    let title = ''
    let color = ''
  
    switch (type) {
      case 'plant':
        const plantsRes = await plantService.getPlants()
        data = plantsRes || []
        title = 'Cây thuốc theo thời gian'
        color = '#4CAF50'
        break
      case 'disease':
        data = await diseasesService.getDiseases()
        title = 'Bệnh theo thời gian'
        color = '#FF6384'
        break
      case 'advice':
        data = await adviceService.getAdvices()
        title = 'Lời khuyên theo thời gian'
        color = '#36A2EB'
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
        color = '#FFCE56'
        break
      case 'division':
        data = await divisionService.getDivisions()
        title = 'Phân loại theo thời gian'
        color = '#FFCE56'
        break
      case 'order':
        data = await orderService.getOrders()
        title = 'Đơn hàng theo thời gian'
        color = '#FFCE56'
        break
      case 'class':
        data = await classService.getClasses()
        title = 'Lớp theo thời gian'
        color = '#FFCE56'
        break
      case 'family':
        data = await familyService.getFamilies()
        title = 'Họ theo thời gian'
        color = '#FFCE56'
        break
      case 'genus':
        data = await genusService.getGenuses()
        title = 'Genus theo thời gian'
        color = '#FFCE56'
        break
      case 'species':
        data = await speciesService.getSpecies()
        title = 'Loài theo thời gian'
        color = '#FFCE56'
        break
      case 'evalue':
        data = await evalueService.getEvalues()
        title = 'Đánh giá theo thời gian'
        color = '#9C27B0'
        break
      case 'report':
        data = await reportService.getReports()
        title = 'Báo cáo theo thời gian'
        color = '#F44336'
        break
      default:
        console.error('Invalid chart type')
        return null
    }
  
    return { data, title, color }
  }
  
  onMounted(async () => {
    const type = route.params.type as string
    const chartInfo = await getChartData(type)
  
    if (!chartInfo) return
  
    const { data, title, color } = chartInfo
  
    // Process data for created_at
    const countByCreatedDate = data.reduce((acc: Record<string, number>, item: any) => {
      if (item.created_at) {
        const date = new Date(item.created_at).toISOString().slice(0, 10)
        acc[date] = (acc[date] || 0) + 1
      }
      return acc
    }, {})
  
    // Process data for updated_at
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
        type: 'bar',
        data: {
          labels,
          datasets: [
            {
              label: `${title} (Ngày tạo)`,
              data: createdData,
              backgroundColor: color,
              borderColor: color,
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: `${title} (Ngày cập nhật)`,
              data: updatedData,
              backgroundColor: color + '80', // Add transparency
              borderColor: color,
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          plugins: {
            legend: {
              display: true,
              position: 'top'
            }
          },
          scales: {
            x: {
              title: {
                display: true,
                text: 'Ngày'
              },
              grid: {
                display: false
              }
            },
            y: {
              title: {
                display: true,
                text: 'Số lượng'
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
  })
  </script>
  
  <style scoped>
  .chart-container {
    height: 70vh;
    background: white;
    padding: 20px;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
  </style>
  
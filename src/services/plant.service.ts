import type { Plant, PlantResponse } from '../models/Plant'
import BaseService from './base.service'

class PlantService extends BaseService {
  // Lấy danh sách tất cả cây thuốc
  async getPlants(): Promise<PlantResponse> {
    console.log('Fetching plants list from API...')
    try {
      const response = await this.get<Plant[]>('/plants')
      console.log('Plants list response:', response)
      return {
        data: response,
        total: response.length,
        page: 1,
        limit: response.length
      }
    } catch (error) {
      console.error('Error fetching plants list:', error)
      throw error
    }
  }

  // Lấy chi tiết cây thuốc theo ID
  async getPlantById(id: number): Promise<Plant> {
    console.log(`Fetching plant details for ID: ${id}...`)
    try {
      const response = await this.get<Plant>(`/plants/${id}`)
      console.log('Plant details response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching plant details for ID ${id}:`, error)
      throw error
    }
  }
}

export const plantService = new PlantService()

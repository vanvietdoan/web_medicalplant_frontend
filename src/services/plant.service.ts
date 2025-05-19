import BaseService from './base.service'

import type { Plant } from '../models/Plant'

class PlantService extends BaseService {
  // Lấy danh sách tất cả cây thuốc
  async getPlants(): Promise<Plant[]> {
    console.log('Fetching plants list from API...')
    try {
      const response = await this.get<Plant[]>('/plants')
      console.log('Plants list response:', response)
      return response
    } catch (error) {
      console.error('Error fetching plants list:', error)
      throw error
    }
  }
  async getNewePlants(): Promise<Plant[]> {
    console.log('Fetching newest plants list from API...')
    try {
      const response = await this.get<Plant[]>('/plants/new-plants')
      console.log('Newest updateq plants list response:', response)
      return response
    } catch (error) {
      console.error('Error fetching newest plants list:', error)
      throw error
    }
  }
  async getMultiUsePlants(): Promise<Plant[]> {
    console.log('Fetching multi-use plants list from API...')
    try {
      const response = await this.get<Plant[]>('/plants/multiple-benefits')
      console.log('Multi-use plants list response:', response)
      return response
    } catch (error) {
      console.error('Error fetching multi-use plants list:', error)
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

  // Lấy danh sách cây thuốc mới nhất
  async getNewestPlants(limit: number = 10): Promise<Plant[]> {
    console.log(`Fetching ${limit} newest plants...`)
    try {
      const response = await this.get<Plant[]>('/plants')
      console.log('All plants fetched for sorting')
      
      // Sắp xếp theo created_at giảm dần (mới nhất lên đầu)
      const sortedPlants = response.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      
      // Lấy limit số lượng cây mới nhất
      const newestPlants = sortedPlants.slice(0, limit)
      console.log(`Returning ${newestPlants.length} newest plants`)
      return newestPlants
    } catch (error) {
      console.error('Error fetching newest plants:', error)
      throw error
    }
  }

  async getPlantsWithMostBenefits(limit: number = 10): Promise<Plant[]> {
    try {
      console.log('Fetching plants with most benefits...')
      const plants = await this.getPlants()
      const sortedPlants = plants.sort((a, b) => {
        const aBenefitsCount = a.benefits.split(',').length
        const bBenefitsCount = b.benefits.split(',').length
        return bBenefitsCount - aBenefitsCount
      })
      const topPlants = sortedPlants.slice(0, limit)
      console.log(`Returning ${topPlants.length} plants with most benefits`)
      return topPlants
    } catch (error) {
      console.error('Error fetching plants with most benefits:', error)
      throw error
    }
  }
  async getPlantSearch(query: string): Promise<Plant[]> {
    try {
      const response = await this.get<Plant[]>(`/plants/filter-plant?${query}`)
      return response
    } catch (error) {
      console.error('Error fetching plants by search:', error)
      throw error
    }
  }
}

export const plantService = new PlantService()

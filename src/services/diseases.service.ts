import BaseService from './base.service'
import type { Diseases } from '../models/Diseases'

class DiseasesService extends BaseService {
  // Lấy danh sách tất cả bệnh
  async getDiseases(): Promise<Diseases[]> {
    console.log('Fetching diseases list from API...')
    try {
      const response = await this.get<Diseases[]>('/diseases')
      console.log('Diseases list response:', response)
      return response
    } catch (error) {
      console.error('Error fetching diseases list:', error)
      throw error
    }
  }

  // Lấy chi tiết bệnh theo ID
  async getDiseaseById(id: number): Promise<Diseases> {
    console.log(`Fetching disease details for ID: ${id}...`)
    try {
      const response = await this.get<Diseases>(`/diseases/${id}`)
      console.log('Disease details response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching disease details for ID ${id}:`, error)
      throw error
    }
  }

  // Lấy danh sách bệnh mới nhất
  async getNewestDiseases(limit: number = 10): Promise<Diseases[]> {
    console.log(`Fetching ${limit} newest diseases...`)
    try {
      const response = await this.get<Diseases[]>('/diseases')
      console.log('All diseases fetched for sorting')
      
      // Sắp xếp theo created_at giảm dần (mới nhất lên đầu)
      const sortedDiseases = response.sort((a, b) => {
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      })
      
      // Lấy limit số lượng bệnh mới nhất
      const newestDiseases = sortedDiseases.slice(0, limit)
      console.log(`Returning ${newestDiseases.length} newest diseases`)
      return newestDiseases
    } catch (error) {
      console.error('Error fetching newest diseases:', error)
      throw error
    }
  }
}

export const diseasesService = new DiseasesService() 
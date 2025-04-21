import type { Advice } from '../models/Advice'
import BaseService from './base.service'

export interface IAdviceService {
  getAdvices(): Promise<Advice[]>;
  getAdviceById(id: number): Promise<Advice>;
  getAdvicesByPlant(plantId: number): Promise<Advice[]>;
  getAdviceByDiseaseID(diseaseId: number): Promise<Advice[]>;
  deleteAdvice(id: number): Promise<void>;
  createAdvice(data: {
    id_advice: number;
    title: string;
    content: string;
    plant_id: number;
    disease_id: number;
    user_id: number;
  }): Promise<Advice>;
  updateAdvice(id: number, data: Partial<Advice>): Promise<Advice>;
}

class AdviceService extends BaseService implements IAdviceService {
  async getAdvices(): Promise<Advice[]> {
    console.log('Fetching advices list from API...')
    try {
      const response = await this.get<Advice[]>('/advice')
      console.log('Advices list response:', response)
      return response
    } catch (error) {
      console.error('Error fetching advices list:', error)
      throw error
    }
  }

  async getAdviceById(id: number): Promise<Advice> {
    console.log(`Fetching advice details for ID: ${id}...`)
    try {
      const response = await this.get<Advice>(`/advice/${id}`)
      console.log('Advice details response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching advice details for ID ${id}:`, error)
      throw error
    }
  }

  async getAdvicesByPlant(plantId: number): Promise<Advice[]> {
    console.log(`Fetching advices for plant ID: ${plantId}...`)
    try {
      const response = await this.get<Advice[]>(`/advice/plant/${plantId}`)
      console.log('Plant advices response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching advices for plant ID ${plantId}:`, error)
      throw error
    }
  }

  async getAdviceByDiseaseID(diseaseId: number): Promise<Advice[]> {
    console.log(`Fetching advices for disease ID: ${diseaseId}...`)
    try {
      const response = await this.get<Advice[]>(`/advice/disease/${diseaseId}`)
      console.log('Disease advices response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching advices for disease ID ${diseaseId}:`, error)
      throw error
    }
  }

  async deleteAdvice(id: number): Promise<void> {
    console.log(`Deleting advice with ID: ${id}...`)
    try {
      await this.delete(`/advice/${id}`)
      console.log(`Advice with ID ${id} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting advice with ID ${id}:`, error)
      throw error
    }
  }

  async createAdvice(data: {
    id_advice: number;
    title: string;
    content: string;
    plant_id: number;
    disease_id: number;
    user_id: number;
  }): Promise<Advice> {
    console.log('Creating new advice...')
    try {
      const response = await this.post<Advice>('/advice', data)
      console.log('Create advice response:', response)
      return response
    } catch (error) {
      console.error('Error creating advice:', error)
      throw error
    }
  }

  async updateAdvice(id: number, data: Partial<Advice>): Promise<Advice> {
    try {
      const response = await this.api.put<Advice>(`/advice/${id}`, data)
      return response.data
    } catch (error) {
      console.error('Error updating advice:', error)
      throw error
    }
  }
}

export const adviceService = new AdviceService() 
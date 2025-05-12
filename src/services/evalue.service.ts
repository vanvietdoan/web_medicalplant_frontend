import BaseService from './base.service'
import type { EvalueCreate, EvalueUpdate, EvalueResponse } from '../models/Evalue'

class EvalueServiceClass extends BaseService {
  async getEvalues(): Promise<EvalueResponse[]> {
    console.log('Fetching evalue list from API...')
    try {
      const response = await this.get<EvalueResponse[]>('/evalue')
      console.log('Evalue list response:', response)
      return response
    } catch (error) {
      console.error('Error fetching evalue list:', error)
      throw error
    }
  }

  async getEvalueById(id: number): Promise<EvalueResponse> {
    console.log(`Fetching evalue details for ID: ${id}...`)
    try {
      const response = await this.get<EvalueResponse>(`/evalue/${id}`)
      console.log('Evalue details response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching evalue details for ID ${id}:`, error)
      throw error
    }
  }

  async getEvaluesByAdvice(adviceId: number): Promise<EvalueResponse[]> {
    console.log(`Fetching evalues for advice ID: ${adviceId}...`)
    try {
      const response = await this.get<EvalueResponse[]>(`/evalue/advice/${adviceId}`)
      console.log('Advice evalues response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching evalues for advice ID ${adviceId}:`, error)
      throw error
    }
  }

  async getEvaluesByUser(userId: number): Promise<EvalueResponse[]> {
    console.log(`Fetching evalues for user ID: ${userId}...`)
    try {
      const response = await this.get<EvalueResponse[]>(`/evalue/user/${userId}`)
      console.log('User evalues response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching evalues for user ID ${userId}:`, error)
      throw error
    }
  }

  async deleteEvalue(id: number): Promise<void> {
    console.log(`Deleting evalue with ID: ${id}...`)
    try {
      await this.delete(`/evalue/${id}`)
      console.log(`Evalue with ID ${id} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting evalue with ID ${id}:`, error)
      throw error
    }
  }

  async createEvalue(data: EvalueCreate): Promise<EvalueResponse> {
    console.log('Creating new evalue...')
    try {
      const response = await this.post<EvalueResponse>('/evalue', data)
      console.log('Create evalue response:', response)
      return response
    } catch (error) {
      console.error('Error creating evalue:', error)
      throw error
    }
  }

  async updateEvalue(id: number, data: EvalueUpdate): Promise<EvalueResponse> {
    console.log(`Updating evalue with ID: ${id}...`)
    try {
      const response = await this.put<EvalueResponse>(`/evalue/${id}`, data)
      console.log('Update evalue response:', response)
      return response
    } catch (error) {
      console.error('Error updating evalue:', error)
      throw error
    }
  }

  async getMostActiveUsers(): Promise<EvalueResponse[]> {
    console.log('Fetching most active users...')
    try {
      const response = await this.get<EvalueResponse[]>('/evalue/users/most-active')
      console.log('Most active users response:', response)
      return response
    } catch (error) {
      console.error('Error fetching most active users:', error)
      throw error
    }
  }
}

export const evalueService = new EvalueServiceClass()

import BaseService from './base.service'
import type { EvalueCreate, EvalueUpdate, EvalueResponse } from '../models/Evalue'
import axios from 'axios'

class EvalueServiceClass extends BaseService {
  async getEvalues(): Promise<EvalueResponse[]> {
    console.log('Fetching evalue list from API...')
    try {
      const response = await this.api.get<EvalueResponse[]>('/evalue')
      if (!response.data) {
        throw new Error('No data received from server')
      }
      console.log('Evalue list response:', response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('API endpoint not found')
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error('Error fetching evalue list:', error)
      throw new Error('Failed to fetch evaluations')
    }
  }

  async getEvalueById(id: number): Promise<EvalueResponse> {
    console.log(`Fetching evalue details for ID: ${id}...`)
    try {
      const response = await this.api.get<EvalueResponse>(`/evalue/${id}`)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      console.log('Evalue details response:', response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Evaluation not found')
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error(`Error fetching evalue details for ID ${id}:`, error)
      throw new Error('Failed to fetch evaluation details')
    }
  }

  async getEvaluesByAdvice(adviceId: number): Promise<EvalueResponse[]> {
    console.log(`Fetching evalues for advice ID: ${adviceId}...`)
    try {
      const response = await this.api.get<EvalueResponse[]>(`/evalue/advice/${adviceId}`)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      console.log('Advice evalues response:', response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Advice not found')
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error(`Error fetching evalues for advice ID ${adviceId}:`, error)
      throw new Error('Failed to fetch evaluations for advice')
    }
  }

  async getEvaluesByUser(userId: number): Promise<EvalueResponse[]> {
    console.log(`Fetching evalues for user ID: ${userId}...`)
    try {
      const response = await this.api.get<EvalueResponse[]>(`/evalue/user/${userId}`)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      console.log('User evalues response:', response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('User not found')
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error(`Error fetching evalues for user ID ${userId}:`, error)
      throw new Error('Failed to fetch user evaluations')
    }
  }

  async deleteEvalue(id: number): Promise<void> {
    console.log(`Deleting evalue with ID: ${id}...`)
    try {
      await this.api.delete(`/evalue/${id}`)
      console.log(`Evalue with ID ${id} deleted successfully`)
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Evaluation not found')
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error(`Error deleting evalue with ID ${id}:`, error)
      throw new Error('Failed to delete evaluation')
    }
  }

  async createEvalue(data: EvalueCreate): Promise<EvalueResponse> {
    console.log('Creating new evalue...')
    try {
      const response = await this.api.post<EvalueResponse>('/evalue', data)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      console.log('Create evalue response:', response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 400) {
          throw new Error('Invalid evaluation data')
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error('Error creating evalue:', error)
      throw new Error('Failed to create evaluation')
    }
  }

  async updateEvalue(id: number, data: EvalueUpdate): Promise<EvalueResponse> {
    console.log(`Updating evalue with ID: ${id}...`)
    try {
      const response = await this.api.put<EvalueResponse>(`/evalue/${id}`, data)
      if (!response.data) {
        throw new Error('No data received from server')
      }
      console.log('Update evalue response:', response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 404) {
          throw new Error('Evaluation not found')
        }
        if (error.response?.status === 400) {
          throw new Error('Invalid evaluation data')
        }
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error('Error updating evalue:', error)
      throw new Error('Failed to update evaluation')
    }
  }

  async getMostActiveUsers(): Promise<EvalueResponse[]> {
    console.log('Fetching most active users...')
    try {
      const response = await this.api.get<EvalueResponse[]>('/evalue/users/most-active')
      if (!response.data) {
        throw new Error('No data received from server')
      }
      console.log('Most active users response:', response.data)
      return response.data
    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.response?.status === 401) {
          throw new Error('Unauthorized access')
        }
        if (error.response?.status === 500) {
          throw new Error('Server error occurred')
        }
        if (error.response?.data?.message) {
          throw new Error(error.response.data.message)
        }
      }
      console.error('Error fetching most active users:', error)
      throw new Error('Failed to fetch most active users')
    }
  }
}

export const evalueService = new EvalueServiceClass()

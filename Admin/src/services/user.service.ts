import type { User, UserResponse, CreateUser } from '../models/User'
import BaseService from './base.service'
import axios from 'axios'

class UserService extends BaseService {
  async getUsers(): Promise<UserResponse> {
    console.log('Fetching user list from API...')
    try {
      const response = await this.get<User[]>('/users')
      console.log('User list response:', response)
      return {
        success: true,
        data: response,
        total: response.length,
        page: 1,
        limit: response.length
      }
    } catch (error) {
      console.error('Error fetching user list:', error)
      throw error
    }
  }

  async getUserById(id: number): Promise<User> {
    console.log(`Fetching user details for ID: ${id}...`)
    try {
      const response = await this.get<User>(`/users/${id}`)
      console.log('User details response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching user details for ID ${id}:`, error)
      throw error
    }
  }

  async createUser(user: CreateUser): Promise<User> {
    console.log('Creating new user with data:', user)
    try {
      const response = await this.post<User>('/users', user)
      console.log('Create user response:', response)
      return response
    } catch (error) {
      console.error('Error creating user:', error)
      throw error
    }
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    console.log(`Updating user with ID ${id}:`, user)
    try {
      const response = await this.put<User>(`/users/${id}`, user)
      console.log('Update user response:', response)
      return response
    } catch (error) {
      console.error(`Error updating user with ID ${id}:`, error)
      throw error
    }
  }

  async deleteUser(id: number): Promise<void> {
    console.log(`Deleting user with ID: ${id}...`)
    try {
      await this.delete(`/users/${id}`)
      console.log(`User with ID ${id} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting user with ID ${id}:`, error)
      throw error
    }
  }

  async uploadAvatar(id: number, file: File): Promise<{ avatar_url: string }> {
    console.log(`Uploading avatar for user ID: ${id}...`)
    try {
      const formData = new FormData()
      formData.append('avatar', file)
      const response = await this.post<{ avatar_url: string }>(`/upload/avatar`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('Avatar upload response:', response)
      return response
    } catch (error) {
      console.error(`Error uploading avatar for user ID ${id}:`, error)
      throw error
    }
  }

  async uploadAvatarNew(file: File): Promise<{ url: string; filename: string; mimetype: string; size: number }> {
    const formData = new FormData()
    formData.append('avatar', file)
    
    try {
      console.log('Uploading avatar file:', file.name, file.type, file.size)
      const response = await this.post<{ url: string; filename: string; mimetype: string; size: number }>('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('Avatar upload response:', response)
      return response
    } catch (error) {
      console.error('Error uploading avatar:', error)
      throw error
    }
  }

  async uploadProof(file: File): Promise<{ url: string; filename: string; mimetype: string; size: number }> {
    const formData = new FormData()
    formData.append('proof', file)
    
    try {
      console.log('Uploading proof file:', file.name, file.type, file.size)
      const response = await this.post<{ url: string; filename: string; mimetype: string; size: number }>('/upload/proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      console.log('Proof upload response:', response)
      return response
    } catch (error) {
      console.error('Error uploading proof:', error)
      throw error
    }
  }
}

export const userService = new UserService()

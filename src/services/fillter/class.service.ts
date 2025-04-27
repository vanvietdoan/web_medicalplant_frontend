import type { ClassResponse } from '../../models/Class';
import BaseService from '../base.service';

class ClassService extends BaseService {
  async getClasses(): Promise<ClassResponse[]> {
    console.log('Fetching classes from API...');
    try {
      const response = await this.get<ClassResponse[]>('/classes');
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error in getClasses:', error);
      throw error;
    }
  }
  //viết lại file class.service để kết nối với api

  async getClassById(id: number): Promise<ClassResponse> {
    console.log(`Fetching class details for ID: ${id}...`);
    try {
      const response = await this.get<ClassResponse>(`/classes/${id}`);
      console.log('Class details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching class details for ID ${id}:`, error);
      throw error;
    }
  }

  async createClass(classData: Omit<ClassResponse, 'class_id' | 'created_at' | 'updated_at'>): Promise<ClassResponse> {
    console.log('Creating new class...');
    try {
      const response = await this.post<ClassResponse>('/classes', classData);
      console.log('Create class response:', response);
      return response;
    } catch (error) {
      console.error('Error creating class:', error);
      throw error;
    }
  }

  async updateClass(id: number, classData: { name: string }): Promise<ClassResponse> {
    console.log(`Updating class with ID: ${id}...`);
    try {
      const response = await this.put<ClassResponse>(`/classes/${id}`, classData);
      console.log('Update class response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating class with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteClass(id: number): Promise<void> {
    console.log(`Deleting class with ID: ${id}...`);
    try {
      await this.delete(`/classes/${id}`);
      console.log('Class deleted successfully');
    } catch (error) {
      console.error(`Error deleting class with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new ClassService();

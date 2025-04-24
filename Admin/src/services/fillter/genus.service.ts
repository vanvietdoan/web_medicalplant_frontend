
import type { GenusResponse } from '../../models/Genus';
import BaseService from '../base.service';

class GenusService extends BaseService {
  async getGenuses(): Promise<GenusResponse[]> {
    console.log('Fetching genuses from API...');
    try {
      const response = await this.get<GenusResponse[]>('/genus');
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error in getGenuses:', error);
      throw error;
    }
  }
  //viết lại file class.service để kết nối với api

  async getGenusById(id: number): Promise<GenusResponse> {
    console.log(`Fetching genus details for ID: ${id}...`);
    try {
      const response = await this.get<GenusResponse>(`/genus/${id}`);
      console.log('Genus details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching genus details for ID ${id}:`, error);
      throw error;
    }
  }

  async createGenus(genusData: Omit<GenusResponse, 'genus_id' | 'created_at' | 'updated_at'>): Promise<GenusResponse> {
    console.log('Creating new genus...');
    try {
      const response = await this.post<GenusResponse>('/genus', genusData);
      console.log('Create genus response:', response);
      return response;
    } catch (error) {
      console.error('Error creating genus:', error);
      throw error;
    }
  }

  async updateGenus(id: number, genusData: { name: string }): Promise<GenusResponse> {
    console.log(`Updating genus with ID: ${id}...`);
    try {
      const response = await this.put<GenusResponse>(`/genus/${id}`, genusData);
      console.log('Update genus response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating genus with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteGenus(id: number): Promise<void> {
    console.log(`Deleting genus with ID: ${id}...`);
    try {
      await this.delete(`/genus/${id}`);
        console.log('Genus deleted successfully');
    } catch (error) {
      console.error(`Error deleting genus with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new GenusService();

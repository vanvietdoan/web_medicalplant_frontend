import type { Division } from '../../models/division';
import BaseService from '../base.service';

class DivisionService extends BaseService {
  async getDivisions(): Promise<Division[]> {
    console.log('Fetching divisions from API...');
    try {
      const response = await this.get<Division[]>('/divisions');
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error in getDivisions:', error);
      throw error;
    }
  }

  async getDivisionById(id: number): Promise<Division> {
    console.log(`Fetching division details for ID: ${id}...`);
    try {
      const response = await this.get<Division>(`/divisions/${id}`);
      console.log('Division details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching division details for ID ${id}:`, error);
      throw error;
    }
  }

  async createDivision(division: Omit<Division, 'division_id' | 'created_at' | 'updated_at'>): Promise<Division> {
    console.log('Creating new division...');
    try {
      const response = await this.post<Division>('/divisions', division);
      console.log('Create division response:', response);
      return response;
    } catch (error) {
      console.error('Error creating division:', error);
      throw error;
    }
  }

  async updateDivision(id: number, division: { name: string }): Promise<Division> {
    console.log(`Updating division with ID: ${id}...`);
    try {
      const response = await this.put<Division>(`/divisions/${id}`, division);
      console.log('Update division response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating division with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteDivision(id: number): Promise<void> {
    console.log(`Deleting division with ID: ${id}...`);
    try {
      await this.delete(`/divisions/${id}`);
      console.log('Division deleted successfully');
    } catch (error) {
      console.error(`Error deleting division with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new DivisionService();

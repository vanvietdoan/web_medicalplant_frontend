
import type { FamilyResponse } from '../../models/Family';
import BaseService from '../base.service';

class FamilyService extends BaseService {
  async getFamilies(): Promise<FamilyResponse[]> {
    console.log('Fetching families from API...');
    try {
      const response = await this.get<FamilyResponse[]>('/family');
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error in getFamilies:', error);
      throw error;
    }
  }
  //viết lại file class.service để kết nối với api

  async getFamilyById(id: number): Promise<FamilyResponse> {
    console.log(`Fetching family details for ID: ${id}...`);
    try {
      const response = await this.get<FamilyResponse>(`/family/${id}`);
      console.log('Family details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching family details for ID ${id}:`, error);
      throw error;
    }
  }

  async createFamily(familyData: Omit<FamilyResponse, 'family_id' | 'created_at' | 'updated_at'>): Promise<FamilyResponse> {
    console.log('Creating new family...');
    try {
      const response = await this.post<FamilyResponse>('/family', familyData);
        console.log('Create family response:', response);
      return response;
    } catch (error) {
      console.error('Error creating family:', error);
      throw error;
    }
  }

  async updateFamily(id: number, familyData: { name: string }): Promise<FamilyResponse> {
    console.log(`Updating family with ID: ${id}...`);
    try {
      const response = await this.put<FamilyResponse>(`/family/${id}`, familyData);
      console.log('Update family response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating family with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteFamily(id: number): Promise<void> {
    console.log(`Deleting family with ID: ${id}...`);
    try {
      await this.delete(`/family/${id}`);
        console.log('Family deleted successfully');
    } catch (error) {
      console.error(`Error deleting family with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new FamilyService();

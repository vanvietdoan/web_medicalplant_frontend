
import type { GenusResponse } from '../../models/Genus';
import type { SpeciesResponse } from '../../models/Species';
import BaseService from '../base.service';

class SpeciesService extends BaseService {
  async getSpecies(): Promise<SpeciesResponse[]> {
    console.log('Fetching species from API...');
    try {
      const response = await this.get<SpeciesResponse[]>('/species');
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error in getSpecies:', error);
      throw error;
    }
  }
  //viết lại file class.service để kết nối với api

  async getSpeciesById(id: number): Promise<SpeciesResponse> {
    console.log(`Fetching species details for ID: ${id}...`);
    try {
      const response = await this.get<SpeciesResponse>(`/species/${id}`);
      console.log('Species details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching species details for ID ${id}:`, error);
      throw error;
    }
  }

  async createSpecies(speciesData: Omit<SpeciesResponse, 'species_id' | 'created_at' | 'updated_at'>): Promise<SpeciesResponse> {
    console.log('Creating new species...');
    try {
      const response = await this.post<SpeciesResponse>('/species', speciesData);
          console.log('Create species response:', response);
      return response;
    } catch (error) {
      console.error('Error creating species:', error);
      throw error;
    }
  }

  async updateSpecies(id: number, speciesData: { name: string }): Promise<SpeciesResponse> {
    console.log(`Updating species with ID: ${id}...`);
    try {
      const response = await this.put<SpeciesResponse>(`/species/${id}`, speciesData);
      console.log('Update species response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating species with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteSpecies(id: number): Promise<void> {
    console.log(`Deleting species with ID: ${id}...`);
    try {
      await this.delete(`/species/${id}`);
        console.log('Species deleted successfully');
    } catch (error) {
      console.error(`Error deleting species with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new SpeciesService();

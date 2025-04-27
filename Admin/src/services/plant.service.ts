import type { Plant, } from '../models/Plant';
import BaseService from './base.service';

class PlantService extends BaseService {
  async getPlants(): Promise<Plant[]> {
    console.log('Fetching plants list from API...');
    try {
      const response = await this.get<Plant[]>('/plants');
      console.log('Plants list response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching plants list:', error);
      throw error;
    }
  }

  async getPlantById(id: number): Promise<Plant> {
    console.log(`Fetching plant details for ID: ${id}...`);
    try {
      const response = await this.get<Plant>(`/plants/${id}`);
      console.log('Plant details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching plant details for ID ${id}:`, error);
      throw error;
    }
  }

  async createPlant(plant: Omit<Plant, 'plant_id' | 'created_at' | 'updated_at'>): Promise<Plant> {
    console.log('Creating new plant:', plant);
    try {
      const response = await this.post<Plant>('/plants', plant);
      console.log('Create plant response:', response);
      return response;
    } catch (error) {
      console.error('Error creating plant:', error);
      throw error;
    }
  }

  async updatePlant(id: number, plant: Partial<Plant>): Promise<Plant> {
    console.log(`Updating plant with ID ${id}:`, plant);
    try {
      const response = await this.put<Plant>(`/plants/${id}`, plant);
      console.log('Update plant response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating plant with ID ${id}:`, error);
      throw error;
    }
  }

  async deletePlant(id: number): Promise<void> {
    console.log(`Deleting plant with ID: ${id}...`);
    try {
      await this.delete(`/plants/${id}`);
      console.log(`Plant with ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting plant with ID ${id}:`, error);
      throw error;
    }
  }

  async uploadImage(id: number, file: File): Promise<{ image_url: string }> {
    console.log(`Uploading image for plant ID: ${id}...`);
    try {
      const formData = new FormData();
      formData.append('image', file);
      const response = await this.post<{ image_url: string }>(`/plants/${id}/image`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log('Image upload response:', response);
      return response;
    } catch (error) {
      console.error(`Error uploading image for plant ID ${id}:`, error);
      throw error;
    }
  }
  async uploadImages(formData: FormData): Promise<{ url: string }[]> {
    console.log(`Uploading images...`);
    try {
      const response = await this.post<{ url: string }[]>('/upload/multiple', formData);
      console.log(`Images uploaded successfully`);
      return response;
    } catch (error) {
      console.error(`Error uploading images:`, error);
      throw error;
    }
  }
}

export const plantService = new PlantService(); 
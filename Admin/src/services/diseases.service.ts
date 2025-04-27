import type { Disease } from '../models/Diseases';
import BaseService from './base.service';

class DiseasesService extends BaseService {
  async getDiseases(): Promise<Disease[]> {
    console.log('Fetching diseases list from API...');
    try {
      const response = await this.get<Disease[]>('/diseases');
      console.log('Diseases list response:', response);
      return response;
    } catch (error) {
      console.error('Error fetching diseases list:', error);
      throw error;
    }
  }

  async getDiseaseById(id: number): Promise<Disease> {
    console.log(`Fetching disease details for ID: ${id}...`);
    try {
      const response = await this.get<Disease>(`/diseases/${id}`);
      console.log('Disease details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching disease details for ID ${id}:`, error);
      throw error;
    }
  }

  async createDisease(disease: Omit<Disease, 'disease_id'>): Promise<Disease> {
    console.log('Creating new disease:', disease);
    try {
      const response = await this.post<Disease>('/diseases', disease);
      console.log('Create disease response:', response);
      return response;
    } catch (error) {
      console.error('Error creating disease:', error);
      throw error;
    }
  }

  async updateDisease(id: number, disease: Partial<Disease>): Promise<Disease> {
    console.log(`Updating disease with ID ${id}:`, disease);
    try {
      const response = await this.put<Disease>(`/diseases/${id}`, disease);
      console.log('Update disease response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating disease with ID ${id}:`, error);
      throw error;
    }
  }


  async deleteDisease(id: number): Promise<void> {
    console.log(`Deleting disease with ID: ${id}...`);
    try {
      await this.delete(`/diseases/${id}`);
      console.log(`Disease with ID ${id} deleted successfully`);
    } catch (error) {
      console.error(`Error deleting disease with ID ${id}:`, error);
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

export const diseasesService = new DiseasesService(); 
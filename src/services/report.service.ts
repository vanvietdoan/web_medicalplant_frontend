import BaseService from './base.service'
import type { Report, ReportResponse } from '../models/Report'

class ReportService extends BaseService {

  async getReports(): Promise<Report[]> {
    console.log('Fetching reports list from API...')
    try {
      const response = await this.get<Report[]>('/report')
      console.log('Reports list response:', response)
      return response
    } catch (error) {
      console.error('Error fetching reports list:', error)
      throw error
    }
  }

  async getReportById(id: number): Promise<Report> {
    console.log(`Fetching report details for ID: ${id}...`)
    try {
      const response = await this.get<Report>(`/report/${id}`)
      console.log('Report details response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching report details for ID ${id}:`, error)
      throw error
    }
  }

  async getReportsByUser(userId: number): Promise<Report[]> {
    console.log(`Fetching reports for user ID: ${userId}...`)
    try {
      const response = await this.get<Report[]>(`/report/user/${userId}`)
      console.log('User reports response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching reports for user ID ${userId}:`, error)
      throw error
    }
  }

  async getReportsByPlant(plantId: number): Promise<Report[]> {
    console.log(`Fetching reports for plant ID: ${plantId}...`)
    try {
      const response = await this.get<Report[]>(`/report/plant/${plantId}`)
      console.log('Plant reports response:', response)
      return response
    } catch (error) {
      console.error(`Error fetching reports for plant ID ${plantId}:`, error)
      throw error
    }
  }


  async createReport(data: {
    plant_name: string;
    plant_english_name: string;
    plant_description: string;
    plant_instructions: string;
    plant_benefits: string;
    plant_species_id: number;
    propose: string;
    summary: string;
    proof: string;
    plant_id: number;
    user_id: number;
  }): Promise<Report> {
    console.log('Creating new report...')
    try {
      const response = await this.post<Report>('/report', data)
      console.log('Create report response:', response)
      return response
    } catch (error) {
      console.error('Error creating report:', error)
      throw error
    }
  }

  async updateReport(id: number, data: Partial<Report>): Promise<Report> {
    console.log(`Updating report with ID: ${id}...`)
    try {
      const response = await this.put<Report>(`/report/${id}`, data)
      console.log('Update report response:', response)
      return response
    } catch (error) {
      console.error(`Error updating report with ID ${id}:`, error)
      throw error
    }
  }


  async deleteReport(id: number): Promise<void> {
    console.log(`Deleting report with ID: ${id}...`)
    try {
      await this.delete(`/report/${id}`)
      console.log(`Report with ID ${id} deleted successfully`)
    } catch (error) {
      console.error(`Error deleting report with ID ${id}:`, error)
      throw error
    }
  }

  async getReportsWithPagination(page: number = 1, limit: number = 10): Promise<ReportResponse> {
    console.log(`Fetching reports with pagination (page: ${page}, limit: ${limit})...`)
    try {
      const response = await this.get<ReportResponse>(`/report?page=${page}&limit=${limit}`)
      console.log('Paginated reports response:', response)
      return response
    } catch (error) {
      console.error('Error fetching paginated reports:', error)
      throw error
    }
  }
}

export const reportService = new ReportService()  

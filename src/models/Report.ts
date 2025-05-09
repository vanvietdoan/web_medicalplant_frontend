export interface Report {
  plant_name: string;
  plant_english_name: string;
  plant_description: string;
  plant_instructions: string;
  plant_benefits: string;
  plant_species_id: number;
  report_id: number;
  propose: string;
  summary: string;
  status: number | null;
  proof: string;
  plant_id: number;
  user_id: number;
  created_at: string;
  updated_at: string;
}

export interface ReportResponse {
  data: Report[];
  total: number;
  page: number;
  limit: number;
}
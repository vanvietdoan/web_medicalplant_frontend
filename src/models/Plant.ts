export interface Plant {
  plant_id: number;
  name: string;
  english_name: string;
  description: string;
  benefits: string;
  instructions: string;
  image_url?: string;
  species_id: number;
  created_at: string;
  updated_at: string;
  images: {
    picture_id: number;
    url: string;
  }[];
}

export interface PlantResponse {
  data: Plant[];
  total: number;
  page: number;
  limit: number;
} 

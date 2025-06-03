export interface Species {
  species_id: number;
  name: string;
  genus_id: number;
  distribution: string;
  description: string;
} 

export interface SpeciesResponse {
  created_at: string;
  updated_at: string;
  species_id: number;
  distribution: string;
  description: string;
  name: string;
  genus_id: number;
}

export interface Species {
  species_id: number;
  name: string;
  genus_id: number;
} 

export interface SpeciesResponse {
  created_at: string;
  updated_at: string;
  species_id: number;
  name: string;
  genus_id: number;
}

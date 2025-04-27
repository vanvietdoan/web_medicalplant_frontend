export interface Genus {
  genus_id: number;
  name: string;
  family_id: number;
} 

export interface GenusResponse {
  created_at: string;
  updated_at: string;
  genus_id: number;
  name: string;
  family_id: number;
}

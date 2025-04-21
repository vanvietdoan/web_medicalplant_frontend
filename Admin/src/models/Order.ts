export interface Order {
  order_id: number;
  name: string;
  class_id: number;
} 

export interface OrderResponse {
  created_at: string;
  updated_at: string;
  order_id: number;
  name: string;
  class_id: number;
}

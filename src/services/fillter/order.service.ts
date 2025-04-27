
import type { OrderResponse } from '../../models/Order';
import BaseService from '../base.service';

class OrderService extends BaseService {
  async getOrders(): Promise<OrderResponse[]> {
    console.log('Fetching orders from API...');
    try {
      const response = await this.get<OrderResponse[]>('/orders');
      console.log('API Response:', response);
      return response;
    } catch (error) {
      console.error('Error in getOrders:', error);
      throw error;
    }
  }
  //viết lại file class.service để kết nối với api

  async getOrderById(id: number): Promise<OrderResponse> {
    console.log(`Fetching order details for ID: ${id}...`);
    try {
      const response = await this.get<OrderResponse>(`/orders/${id}`);
      console.log('Order details response:', response);
      return response;
    } catch (error) {
      console.error(`Error fetching order details for ID ${id}:`, error);
      throw error;
    }
  }

  async createOrder(orderData: Omit<OrderResponse, 'order_id' | 'created_at' | 'updated_at'>): Promise<OrderResponse> {
    console.log('Creating new order...');
    try {
      const response = await this.post<OrderResponse>('/orders', orderData);
      console.log('Create order response:', response);
      return response;
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  async updateOrder(id: number, orderData: { name: string }): Promise<OrderResponse> {
    console.log(`Updating order with ID: ${id}...`);
    try {
      const response = await this.put<OrderResponse>(`/orders/${id}`, orderData);
      console.log('Update order response:', response);
      return response;
    } catch (error) {
      console.error(`Error updating order with ID ${id}:`, error);
      throw error;
    }
  }

  async deleteOrder(id: number): Promise<void> {
    console.log(`Deleting order with ID: ${id}...`);
    try {
      await this.delete(`/orders/${id}`);
        console.log('Order deleted successfully');
    } catch (error) {
      console.error(`Error deleting order with ID ${id}:`, error);
      throw error;
    }
  }
}

export default new OrderService();

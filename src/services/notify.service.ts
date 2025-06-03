import type { Notify } from '../models/Notify';
import BaseService from './base.service';
import { authService } from './auth.service';
import type { Login } from '@/models/User';

class NotifyService extends BaseService {
  

  async markAsRead(notificationId: number): Promise<Notify> {
    try {
      const token = localStorage.getItem('token');
      console.log('Marking notification as read:', notificationId);
      const response = await this.put<Notify>(`/notify/update/${notificationId}`, {
        is_read: true
      }, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Mark as read response:', response);
      return response;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  async deleteNotification(notificationId: number): Promise<void> {
    try {
      const token = localStorage.getItem('token');
      await this.delete(`/notify/${notificationId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }


  async getNotifyByUser(id?: number): Promise<Notify[]> {
    console.log('Fetching notifications from API...');
    try {
      const currentUser = authService.getCurrentUser() as Login | null;
      const userId = id || (currentUser ? currentUser.id : undefined);
      const token = localStorage.getItem('token');

      if (!userId) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      console.log(`Fetching notifications for user ID: ${userId}...`);
      const response = await this.get<Notify[]>(`/notify/${userId}`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      console.log('Notifications response:', response);
      return response;
    } catch (error) {
      console.error('Error in getNotifyByUser:', error);
      throw error;
    }
  }


}

export const notifyService = new NotifyService();

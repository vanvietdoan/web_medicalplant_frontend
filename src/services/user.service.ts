import type { User, Login } from '../models/User';
import BaseService from './base.service';
import { authService } from './auth.service';

class UserService extends BaseService {
  async getUserById(id?: number): Promise<User> {
    try {
      const currentUser = authService.getCurrentUser() as Login | null;
      const userId = id || (currentUser ? currentUser.id : undefined);

      if (!userId) {
        throw new Error('User ID is required');
      }

      return await this.get<User>(`/users/${userId}`);
    } catch (error) {
      throw error;
    }
  }

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    try {
      return await this.put<User>(`/users/${id}`, user);
    } catch (error) {
      throw error;
    }
  }

  async uploadAvatarNew(file: File): Promise<{ url: string; filename: string; mimetype: string; size: number }> {
    const formData = new FormData();
    formData.append('avatar', file);
    
    try {
      return await this.post<{ url: string; filename: string; mimetype: string; size: number }>('/upload/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      throw error;
    }
  }

  async uploadProof(file: File): Promise<{ url: string; filename: string; mimetype: string; size: number }> {
    const formData = new FormData();
    formData.append('proof', file);
    
    try {
      return await this.post<{ url: string; filename: string; mimetype: string; size: number }>('/upload/proof', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
    } catch (error) {
      throw error;
    }
  }
}

export const userService = new UserService();

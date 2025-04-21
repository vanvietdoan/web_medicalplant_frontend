import type { User, Login } from '../models/User';
import BaseService from './base.service';
import { authService } from './auth.service';

class UserService extends BaseService {
  async getUserById(id?: number): Promise<User> {
    try {
      const currentUser = authService.getCurrentUser() as Login | null;
      const userId = id || (currentUser ? currentUser.id : undefined);

      console.log("Calling API with userId:", userId);
      const response = await this.get<{ success: boolean; data: User }>(`/users/${userId}`);
      console.log("Get User by id fromAPI Response:", response);

      if (!response.success || !response.data) {
        throw new Error('Không tìm thấy thông tin người dùng');
      }

      return response.data;
    } catch (error) {
      console.error("Error in getUserById:", error);
      throw error;
    }
  }
  
    

  async updateUser(id: number, user: Partial<User>): Promise<User> {
    try {
      return await this.put<User>(`/users/${id}`, user);
    } catch (error) { 
      console.error("Error in updateUser:", error);
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

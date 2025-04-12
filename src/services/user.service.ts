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
}

export const userService = new UserService();

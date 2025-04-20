import type { Login, AuthResponse, User } from '../models/User';
import BaseService from './base.service';

class AuthService extends BaseService {
  async login(credentials: Login): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', credentials);
    
    // Lưu token vào localStorage
    this.setToken(response.token);
    
    // Lưu thông tin user
    localStorage.setItem('user', JSON.stringify(response.user));
    
    return response;
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    return await this.post<{ message: string }>('/auth/forgot-password', { email });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<{ message: string }> {
    return await this.post<{ message: string }>('/auth/change-password', {
      oldPassword: currentPassword,
      newPassword: newPassword
    });
  }

  async logout(): Promise<void> {
    try {
      const currentUser = this.getCurrentUser();
      if (currentUser?.email) {
        await this.get('/auth/logout', { params: { email: currentUser.email } });
      }
    } finally {
      // Luôn xóa token và thông tin user ngay cả khi API call thất bại
      this.removeToken();
      localStorage.removeItem('user');
      // Emit event để thông báo thay đổi trạng thái đăng nhập
      window.dispatchEvent(new Event('auth-state-changed'));
    }
  }

  getCurrentUser(): User | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

  async register(data: {
    full_name: string;
    title: string;
    proof: string;
    specialty: string;
    email: string;
    password: string;
  }) {
    try {
      const response = await this.post('/auth/register', data);
      return response;
    } catch (error) {
      console.error('Error during registration:', error);
      throw error;
    }
  }
}

export const authService = new AuthService();

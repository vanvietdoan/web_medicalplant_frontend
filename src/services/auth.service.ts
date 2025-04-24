import type { Login, AuthResponse,  RegisterUser } from '../models/User';
import BaseService from './base.service';
import { userService } from './user.service';   

class AuthService extends BaseService {
  async login(credentials: Login): Promise<AuthResponse> {
    const response = await this.post<AuthResponse>('/auth/login', credentials);
    
    // Lưu token vào localStorage
    this.setToken(response.token);
    
    // Lưu thông tin user cơ bản vào localStorage
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
  async register(userData: RegisterUser): Promise<{ success: boolean; message: string }> {
    try {
      const response = await this.post<{ success: boolean; message: string }>('/auth/register', userData);
      return response;
    } catch (error) {
      console.error("Error in register:", error);
      throw error;
    }
  }
  

  getCurrentUser(): Login | null {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      return JSON.parse(userStr);
    }
    return null;
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }

}

export const authService = new AuthService();

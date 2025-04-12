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

  logout(): void {
    this.removeToken();
    localStorage.removeItem('user');
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

}

export const authService = new AuthService();

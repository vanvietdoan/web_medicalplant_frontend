import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';
import router from '../router';

const API_URL = 'http://157.20.58.220:2204/api';

class BaseService {
  protected api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL
    });

    // Thêm token vào header của mọi request
    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => {
        return Promise.reject(error);
      }
    );

    // Xử lý lỗi 401 (Unauthorized) - token hết hạn
    this.api.interceptors.response.use(
      (response) => {
        return response;
      },
      (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          // Xóa token và thông tin người dùng
          this.removeToken();
          localStorage.removeItem('user');
          
          // Chuyển hướng về trang đăng nhập
          router.push('/login');
        }
        return Promise.reject(error);
      }
    );
  }

  // Token management methods
  protected getToken(): string | null {
    return localStorage.getItem('token');
  }
  
  protected setToken(token: string): void {
    localStorage.setItem('token', token);
  }
  
  protected removeToken(): void {
    localStorage.removeItem('token');
  }

  protected async get<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.get<T>(url, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.post<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.put<T>(url, data, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    try {
      const response = await this.api.delete<T>(url, config);
      return response.data;
    } catch (error) {
      if (axios.isAxiosError(error)) {
        throw new Error(error.response?.data?.message || 'Request failed');
      }
      throw error;
    }
  }
}

export default BaseService; 
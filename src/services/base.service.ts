import axios from 'axios';
import type { AxiosInstance, AxiosRequestConfig } from 'axios';

//const API_URL = 'http://157.20.58.220:2204/api';
const API_URL = 'http://localhost:2204/api';


class BaseService {
  protected api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: API_URL
    });

    this.api.interceptors.request.use(
      (config) => {
        const token = this.getToken();
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (axios.isAxiosError(error) && error.response?.status === 401) {
          this.removeToken();
          localStorage.removeItem('user');
          
          return Promise.reject(new Error('Unauthorized'));
        }
        return Promise.reject(error);
      }
    );
  }

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
    const response = await this.api.get<T>(url, config);
    return response.data;
  }

  protected async post<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.post<T>(url, data, config);
    return response.data;
  }

  protected async put<T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.put<T>(url, data, config);
    return response.data;
  }

  protected async delete<T>(url: string, config?: AxiosRequestConfig): Promise<T> {
    const response = await this.api.delete<T>(url, config);
    return response.data;
  }
}

export default BaseService;

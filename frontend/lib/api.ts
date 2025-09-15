import axios, { AxiosError } from 'axios';
import toast from 'react-hot-toast';
import {
  HealthDeclaration,
  CreateHealthDeclarationDto,
  UpdateHealthDeclarationDto,
  PaginatedResponse,
  HealthDeclarationStats,
  ApiError,
} from '@/types/health-declaration';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

apiClient.interceptors.request.use(
  (config) => {
    console.log(`🔄 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => {
    console.log(`✅ API Response: ${response.status} ${response.config.url}`);
    return response;
  },
  (error: AxiosError<ApiError>) => {
    console.error(`❌ API Error: ${error.response?.status} ${error.config?.url}`, error.response?.data);
    
    // Handle specific error cases
    if (error.response?.status === 429) {
      toast.error('Too many requests. Please try again later.');
    } else if (error.response?.status && error.response.status >= 500) {
      toast.error('Server error. Please try again later.');
    } else if (error.response?.data?.message) {
      const message = Array.isArray(error.response.data.message) 
        ? error.response.data.message.join(', ') 
        : error.response.data.message;
      toast.error(message);
    } else if (error.code === 'ECONNABORTED') {
      toast.error('Request timeout. Please check your connection.');
    } else {
      toast.error('An unexpected error occurred.');
    }
    
    return Promise.reject(error);
  }
);

export interface FindAllOptions {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'temperature';
  sortOrder?: 'ASC' | 'DESC';
  status?: 'pending' | 'approved' | 'rejected';
  search?: string;
}

export const healthDeclarationApi = {
  // Create a new health declaration
  create: async (data: CreateHealthDeclarationDto): Promise<HealthDeclaration> => {
    const response = await apiClient.post<HealthDeclaration>('/health-declarations', data);
    return response.data;
  },

  // Get all health declarations with pagination and filters
  findAll: async (options: FindAllOptions = {}): Promise<PaginatedResponse<HealthDeclaration>> => {
    const params = new URLSearchParams();
    
    if (options.page) params.append('page', options.page.toString());
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.sortBy) params.append('sortBy', options.sortBy);
    if (options.sortOrder) params.append('sortOrder', options.sortOrder);
    if (options.status) params.append('status', options.status);
    if (options.search) params.append('search', options.search);

    const response = await apiClient.get<PaginatedResponse<HealthDeclaration>>(
      `/health-declarations?${params.toString()}`
    );
    return response.data;
  },

  // Get health declaration statistics
  getStats: async (): Promise<HealthDeclarationStats> => {
    const response = await apiClient.get<HealthDeclarationStats>('/health-declarations/stats');
    return response.data;
  },

  // Get a single health declaration by ID
  findOne: async (id: string): Promise<HealthDeclaration> => {
    const response = await apiClient.get<HealthDeclaration>(`/health-declarations/${id}`);
    return response.data;
  },

  // Update a health declaration
  update: async (id: string, data: UpdateHealthDeclarationDto): Promise<HealthDeclaration> => {
    const response = await apiClient.patch<HealthDeclaration>(`/health-declarations/${id}`, data);
    return response.data;
  },

  // Delete a health declaration
  delete: async (id: string): Promise<void> => {
    await apiClient.delete(`/health-declarations/${id}`);
  },
};

export default apiClient; 
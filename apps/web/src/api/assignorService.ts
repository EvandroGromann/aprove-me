import apiService from './apiService';
import { Assignor as AssignorType } from './client';

export interface Assignor extends AssignorType {}

export interface CreateAssignorDto {
  name: string;
  document: string;
  email: string;
  phone: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrev: boolean;
  }
}

const assignorService = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Assignor>> => {
    return await apiService.get<PaginatedResponse<Assignor>>(`/integrations/assignor?page=${page}&limit=${limit}`);
  }, 
  
  getById: async (id: string): Promise<Assignor> => {
    return await apiService.get<Assignor>(`/integrations/assignor/${id}`);
  },
  
  create: async (data: CreateAssignorDto): Promise<Assignor> => {
    return await apiService.post<Assignor>('/integrations/assignor', data);
  },
  
  update: async (id: string, data: Partial<CreateAssignorDto>): Promise<Assignor> => {
    return await apiService.patch<Assignor>(`/integrations/assignor/${id}`, data);
  },
  
  delete: async (id: string): Promise<void> => {
    return await apiService.delete<void>(`/integrations/assignor/${id}`);
  }
};

export default assignorService;

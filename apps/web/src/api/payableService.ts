import apiService from './apiService';
import { PayableResponse as PayableType } from './client';

export interface Payable extends PayableType {}

export interface CreatePayableDto {
  id: string;
  value: number;
  emissionDate: string;
  assignor: {
    id: string;
    name: string;
    document: string;
    email: string;
    phone: string;
  };
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

const payableService = {
  getAll: async (page: number = 1, limit: number = 10): Promise<PaginatedResponse<Payable>> => {
    return await apiService.get<PaginatedResponse<Payable>>(`/integrations/payable?page=${page}&limit=${limit}`);
  }, 
  
  getById: async (id: string): Promise<Payable> => {
    return await apiService.get<Payable>(`/integrations/payable/${id}`);
  },
  
  create: async (data: CreatePayableDto): Promise<Payable> => {
    return await apiService.post<Payable>('/integrations/payable', data);
  },
  
  update: async (id: string, data: Partial<CreatePayableDto>): Promise<Payable> => {
    return await apiService.patch<Payable>(`/integrations/payable/${id}`, data);
  },
  
  delete: async (id: string): Promise<void> => {
    return await apiService.delete(`/integrations/payable/${id}`);
  }
};

export default payableService;

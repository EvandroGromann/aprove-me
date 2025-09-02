import { logout } from './client';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

class ApiService {
  getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('token');
    if (!token) {
      return {};
    }
    
    return {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json'
    };
  }
  
  async get<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          logout('session-expired');
        }
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ${endpoint}:`, error);
      throw error;
    }
  }
  
  async post<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          logout('session-expired');
        }
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error posting to ${endpoint}:`, error);
      throw error;
    }
  }
  
  async patch<T = any>(endpoint: string, data: any): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PATCH',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          logout('session-expired');
        }
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error patching ${endpoint}:`, error);
      throw error;
    }
  }
  
  async delete<T = any>(endpoint: string): Promise<T> {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: this.getAuthHeaders(),
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          logout('session-expired');
        }
        throw new Error(`API error: ${response.statusText}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error(`Error deleting ${endpoint}:`, error);
      throw error;
    }
  }
}

const apiService = new ApiService();
export default apiService;

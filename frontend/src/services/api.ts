const API_URL = (import.meta.env.VITE_API_URL as string) || 'http://localhost:5000/api';

export const api = {
  async get<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options?.headers as Record<string, string>),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'GET',
      ...options,
      headers,
    });
    return this.handleResponse<T>(response);
  },

  async post<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options?.headers as Record<string, string>),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'POST',
      body: JSON.stringify(data),
      ...options,
      headers,
    });
    return this.handleResponse<T>(response);
  },

  async put<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options?.headers as Record<string, string>),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PUT',
      body: JSON.stringify(data),
      ...options,
      headers,
    });
    return this.handleResponse<T>(response);
  },

  async delete<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options?.headers as Record<string, string>),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'DELETE',
      ...options,
      headers,
    });
    return this.handleResponse<T>(response);
  },

  async patch<T>(endpoint: string, data: any, options?: RequestInit): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...this.getAuthHeader(),
      ...(options?.headers as Record<string, string>),
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
      ...options,
      headers,
    });
    return this.handleResponse<T>(response);
  },

  getAuthHeader(): Record<string, string> {
    const token = localStorage.getItem('ethara_token');
    return token ? { Authorization: `Bearer ${token}` } : {};
  },

  async handleResponse<T>(response: Response): Promise<T> {
    const data = await response.json().catch(() => ({}));
    if (response.status === 401) {
      localStorage.removeItem('ethara_token');
      localStorage.removeItem('ethara_user');
      // If the page was loaded with a bad token, reload to trigger App content reset
      window.location.reload();
    }
    if (!response.ok) {
      const errorMsg = data.message || 'Something went wrong';
      throw new Error(errorMsg);
    }
    return data as T;
  },
};

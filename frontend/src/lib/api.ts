import type {
  User,
  Pet,
  Product,
  Equipment,
  Category,
  PaginatedResponse,
  DashboardStats,
  DashboardAlerts,
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000/api';

class ApiClient {
  private token: string | null = null;

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('token', token);
    } else {
      localStorage.removeItem('token');
    }
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      const storedToken = localStorage.getItem('token');
      if (storedToken) {
        this.token = storedToken;
        return storedToken;
      }
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = this.getToken();
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    };

    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Request failed' }));
      throw new Error(error.error || 'Request failed');
    }

    return response.json();
  }

  // Auth
  async login(email: string, password: string): Promise<{ user: User; token: string }> {
    const result = await this.request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async register(email: string, password: string, name: string): Promise<{ user: User; token: string }> {
    const result = await this.request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
    });
    this.setToken(result.token);
    return result;
  }

  async checkRegistrationStatus(): Promise<{ isOpen: boolean }> {
    return this.request<{ isOpen: boolean }>('/auth/registration-status');
  }

  async getMe(): Promise<User> {
    return this.request<User>('/auth/me');
  }

  logout() {
    this.setToken(null);
  }

  // User Management (Admin only)
  async getUsers(): Promise<User[]> {
    return this.request<User[]>('/auth/users');
  }

  async createUser(data: { email: string; password: string; name: string; role: string }): Promise<User> {
    return this.request<User>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateUser(id: string, data: { name?: string; role?: string; password?: string }): Promise<User> {
    return this.request<User>(`/auth/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteUser(id: string): Promise<void> {
    await this.request(`/auth/users/${id}`, { method: 'DELETE' });
  }

  // Dashboard
  async getDashboardStats(): Promise<DashboardStats> {
    return this.request<DashboardStats>('/dashboard/stats');
  }

  async getDashboardAlerts(): Promise<DashboardAlerts> {
    return this.request<DashboardAlerts>('/dashboard/alerts');
  }

  // Pets
  async getPets(params?: Record<string, string>): Promise<PaginatedResponse<Pet>> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<PaginatedResponse<Pet>>(`/pets${query}`);
  }

  async getPet(id: string): Promise<Pet> {
    return this.request<Pet>(`/pets/${id}`);
  }

  async createPet(data: Partial<Pet>): Promise<Pet> {
    return this.request<Pet>('/pets', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updatePet(id: string, data: Partial<Pet>): Promise<Pet> {
    return this.request<Pet>(`/pets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deletePet(id: string): Promise<void> {
    await this.request(`/pets/${id}`, { method: 'DELETE' });
  }

  // Products
  async getProducts(params?: Record<string, string>): Promise<PaginatedResponse<Product>> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<PaginatedResponse<Product>>(`/products${query}`);
  }

  async getProduct(id: string): Promise<Product> {
    return this.request<Product>(`/products/${id}`);
  }

  async createProduct(data: Partial<Product>): Promise<Product> {
    return this.request<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateProduct(id: string, data: Partial<Product>): Promise<Product> {
    return this.request<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateProductStock(id: string, adjustment: number, type: 'add' | 'subtract' | 'set'): Promise<Product> {
    return this.request<Product>(`/products/${id}/stock`, {
      method: 'PATCH',
      body: JSON.stringify({ adjustment, type }),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.request(`/products/${id}`, { method: 'DELETE' });
  }

  // Equipment
  async getEquipment(params?: Record<string, string>): Promise<PaginatedResponse<Equipment>> {
    const query = params ? `?${new URLSearchParams(params)}` : '';
    return this.request<PaginatedResponse<Equipment>>(`/equipment${query}`);
  }

  async getEquipmentById(id: string): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}`);
  }

  async createEquipment(data: Partial<Equipment>): Promise<Equipment> {
    return this.request<Equipment>('/equipment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEquipment(id: string, data: Partial<Equipment>): Promise<Equipment> {
    return this.request<Equipment>(`/equipment/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEquipment(id: string): Promise<void> {
    await this.request(`/equipment/${id}`, { method: 'DELETE' });
  }

  // Categories
  async getCategories(type?: string): Promise<Category[]> {
    const query = type ? `?type=${type}` : '';
    return this.request<Category[]>(`/categories${query}`);
  }

  async getCategoryTree(type?: string): Promise<Category[]> {
    const query = type ? `?type=${type}` : '';
    return this.request<Category[]>(`/categories/tree${query}`);
  }

  async createCategory(data: Partial<Category>): Promise<Category> {
    return this.request<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateCategory(id: string, data: Partial<Category>): Promise<Category> {
    return this.request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteCategory(id: string): Promise<void> {
    await this.request(`/categories/${id}`, { method: 'DELETE' });
  }

  // Upload
  async uploadImage(file: File, folder?: string): Promise<{ url: string; publicId: string }> {
    const token = this.getToken();
    const formData = new FormData();
    formData.append('image', file);
    if (folder) formData.append('folder', folder);

    const response = await fetch(`${API_URL}/upload/single`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }

  async uploadImages(files: File[], folder?: string): Promise<{ url: string; publicId: string }[]> {
    const token = this.getToken();
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    if (folder) formData.append('folder', folder);

    const response = await fetch(`${API_URL}/upload/multiple`, {
      method: 'POST',
      headers: {
        ...(token && { Authorization: `Bearer ${token}` }),
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Upload failed');
    }

    return response.json();
  }
}

export const api = new ApiClient();
export default api;

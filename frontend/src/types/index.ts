export interface User {
  id: string;
  email: string;
  name: string;
  role: 'ADMIN' | 'MANAGER' | 'STAFF';
  image?: string;
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: 'PET' | 'PRODUCT' | 'EQUIPMENT';
  description?: string;
  parentId?: string;
  parent?: Category;
  children?: Category[];
  _count?: {
    pets: number;
    products: number;
    equipment: number;
  };
  createdAt: string;
  updatedAt: string;
}

export interface Pet {
  id: string;
  name: string;
  species: string;
  breed?: string;
  age?: number;
  ageUnit: 'DAYS' | 'WEEKS' | 'MONTHS' | 'YEARS';
  gender?: 'MALE' | 'FEMALE' | 'UNKNOWN';
  price: number;
  costPrice?: number;
  healthStatus: 'HEALTHY' | 'SICK' | 'RECOVERING' | 'QUARANTINE';
  description?: string;
  images: string[];
  categoryId?: string;
  category?: Category;
  quantity: number;
  status: 'AVAILABLE' | 'SOLD' | 'RESERVED' | 'NOT_FOR_SALE';
  weight?: number;
  color?: string;
  vaccinated: boolean;
  neutered: boolean;
  microchipped: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  costPrice?: number;
  images: string[];
  categoryId?: string;
  category?: Category;
  quantity: number;
  minStockLevel: number;
  unit?: string;
  brand?: string;
  supplier?: string;
  barcode?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Equipment {
  id: string;
  name: string;
  description?: string;
  serialNumber?: string;
  images: string[];
  categoryId?: string;
  category?: Category;
  condition: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'NEEDS_REPAIR' | 'OUT_OF_SERVICE';
  purchaseDate?: string;
  purchasePrice?: number;
  currentValue?: number;
  location?: string;
  manufacturer?: string;
  model?: string;
  warrantyExpiry?: string;
  notes?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DashboardStats {
  overview: {
    totalPets: number;
    availablePets: number;
    totalProducts: number;
    totalEquipment: number;
    lowStockProducts: number;
    equipmentNeedsAttention: number;
  };
  financials: {
    productInventoryValue: number;
    petInventoryValue: number;
  };
  recent: {
    pets: Pet[];
    products: Product[];
  };
}

export interface DashboardAlerts {
  lowStock: {
    id: string;
    name: string;
    sku: string;
    quantity: number;
    minStockLevel: number;
  }[];
  equipmentIssues: {
    id: string;
    name: string;
    condition: string;
    location?: string;
  }[];
  sickPets: {
    id: string;
    name: string;
    species: string;
    healthStatus: string;
  }[];
}

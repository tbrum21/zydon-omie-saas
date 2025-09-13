export interface ZydonCredentials {
  apiKey: string;
}

export interface ZydonProduct {
  id?: string;
  name: string;
  sku: string;
  price: number;
  description?: string;
  category?: string;
  stock?: number;
  images?: string[];
  metadata?: Record<string, any>;
}

export interface ZydonOrder {
  id: string;
  customerId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: string;
  createdAt: string;
  metadata?: Record<string, any>;
}

export interface ZydonCustomer {
  id?: string;
  name: string;
  email: string;
  phone?: string;
  document?: string;
  address?: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
  };
  metadata?: Record<string, any>;
}

export interface ZydonApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ZydonError {
  success: false;
  error: string;
  message?: string;
}

export interface ZydonConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

export interface ZydonPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ZydonListResponse<T> {
  data: T[];
  pagination: ZydonPagination;
}

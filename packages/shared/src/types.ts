export enum CredentialType {
  OMIE_APP_KEY = 'OMIE_APP_KEY',
  OMIE_APP_SECRET = 'OMIE_APP_SECRET',
  ZYDON_API_KEY = 'ZYDON_API_KEY',
}

export enum EntityType {
  PRODUCT = 'PRODUCT',
  ORDER = 'ORDER',
  CUSTOMER = 'CUSTOMER',
  INVOICE = 'INVOICE',
  PAYMENT = 'PAYMENT',
}

export enum JobStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
  RETRYING = 'RETRYING',
}

export interface Tenant {
  id: string;
  name: string;
  domain?: string;
  subdomain?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  id: string;
  email: string;
  name: string;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Credential {
  id: string;
  name: string;
  type: CredentialType;
  encryptedData: string;
  isActive: boolean;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Mapping {
  id: string;
  omieId?: string;
  zydonId?: string;
  entityType: EntityType;
  metadata?: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncCursor {
  id: string;
  entityType: EntityType;
  lastSyncId?: string;
  lastSyncAt?: Date;
  metadata?: Record<string, any>;
  tenantId: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface WebhookEvent {
  id: string;
  source: string;
  eventType: string;
  payload: Record<string, any>;
  processed: boolean;
  processedAt?: Date;
  error?: string;
  tenantId: string;
  createdAt: Date;
}

export interface JobAudit {
  id: string;
  jobId: string;
  jobType: string;
  status: JobStatus;
  payload?: Record<string, any>;
  result?: Record<string, any>;
  error?: string;
  startedAt?: Date;
  completedAt?: Date;
  duration?: number;
  tenantId: string;
  createdAt: Date;
}

// DTOs para requests/responses
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  user: User;
  tenant: Tenant;
}

export interface CreateTenantRequest {
  name: string;
  domain?: string;
  subdomain?: string;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  tenantId: string;
}

export interface CreateCredentialRequest {
  name: string;
  type: CredentialType;
  encryptedData: string;
  tenantId: string;
}

// Omie API types
export interface OmieApiRequest {
  call: string;
  app_key: string;
  app_secret: string;
  param: Record<string, any>;
}

export interface OmieApiResponse<T = any> {
  faultcode?: string;
  faultstring?: string;
  data?: T;
}

// Zydon API types
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

// Job types
export interface ProcessZydonOrderJob {
  orderId: string;
  tenantId: string;
  webhookEventId: string;
}

export interface ProcessOmieProductJob {
  productId: string;
  tenantId: string;
  action: 'create' | 'update' | 'delete';
}

export interface SyncEntityJob {
  entityType: EntityType;
  tenantId: string;
  cursor?: string;
}

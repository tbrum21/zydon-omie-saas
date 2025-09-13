import { z } from 'zod';

// Auth schemas
export const LoginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
});

export const CreateTenantSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  domain: z.string().optional(),
  subdomain: z.string().optional(),
});

export const CreateUserSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Senha deve ter pelo menos 6 caracteres'),
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  tenantId: z.string().cuid('ID do tenant inválido'),
});

export const CreateCredentialSchema = z.object({
  name: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  type: z.enum(['OMIE_APP_KEY', 'OMIE_APP_SECRET', 'ZYDON_API_KEY']),
  encryptedData: z.string().min(1, 'Dados criptografados são obrigatórios'),
  tenantId: z.string().cuid('ID do tenant inválido'),
});

// Webhook schemas
export const ZydonWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
});

export const OmieWebhookSchema = z.object({
  event: z.string(),
  data: z.record(z.any()),
  timestamp: z.string().datetime(),
});

// Product schemas
export const ZydonProductSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1, 'Nome é obrigatório'),
  sku: z.string().min(1, 'SKU é obrigatório'),
  price: z.number().positive('Preço deve ser positivo'),
  description: z.string().optional(),
  category: z.string().optional(),
  stock: z.number().int().min(0).optional(),
  images: z.array(z.string().url()).optional(),
  metadata: z.record(z.any()).optional(),
});

export const OmieProductSchema = z.object({
  codigo_produto: z.string().optional(),
  descricao: z.string().min(1, 'Descrição é obrigatória'),
  codigo: z.string().min(1, 'Código é obrigatório'),
  valor_unitario: z.number().positive('Valor unitário deve ser positivo'),
  unidade: z.string().optional(),
  categoria: z.string().optional(),
  estoque: z.number().int().min(0).optional(),
  observacoes: z.string().optional(),
  dados_adicionais: z.record(z.any()).optional(),
});

// Order schemas
export const ZydonOrderSchema = z.object({
  id: z.string(),
  customerId: z.string(),
  items: z.array(z.object({
    productId: z.string(),
    quantity: z.number().int().positive('Quantidade deve ser positiva'),
    price: z.number().positive('Preço deve ser positivo'),
  })),
  total: z.number().positive('Total deve ser positivo'),
  status: z.string(),
  createdAt: z.string().datetime(),
  metadata: z.record(z.any()).optional(),
});

// Job schemas
export const ProcessZydonOrderJobSchema = z.object({
  orderId: z.string(),
  tenantId: z.string().cuid(),
  webhookEventId: z.string().cuid(),
});

export const ProcessOmieProductJobSchema = z.object({
  productId: z.string(),
  tenantId: z.string().cuid(),
  action: z.enum(['create', 'update', 'delete']),
});

export const SyncEntityJobSchema = z.object({
  entityType: z.enum(['PRODUCT', 'ORDER', 'CUSTOMER', 'INVOICE', 'PAYMENT']),
  tenantId: z.string().cuid(),
  cursor: z.string().optional(),
});

// Health check schema
export const HealthCheckSchema = z.object({
  status: z.enum(['ok', 'error']),
  timestamp: z.string().datetime(),
  services: z.object({
    database: z.enum(['up', 'down']),
    redis: z.enum(['up', 'down']),
  }),
});

// Type exports
export type LoginInput = z.infer<typeof LoginSchema>;
export type CreateTenantInput = z.infer<typeof CreateTenantSchema>;
export type CreateUserInput = z.infer<typeof CreateUserSchema>;
export type CreateCredentialInput = z.infer<typeof CreateCredentialSchema>;
export type ZydonWebhookInput = z.infer<typeof ZydonWebhookSchema>;
export type OmieWebhookInput = z.infer<typeof OmieWebhookSchema>;
export type ZydonProductInput = z.infer<typeof ZydonProductSchema>;
export type OmieProductInput = z.infer<typeof OmieProductSchema>;
export type ZydonOrderInput = z.infer<typeof ZydonOrderSchema>;
export type ProcessZydonOrderJobInput = z.infer<typeof ProcessZydonOrderJobSchema>;
export type ProcessOmieProductJobInput = z.infer<typeof ProcessOmieProductJobSchema>;
export type SyncEntityJobInput = z.infer<typeof SyncEntityJobSchema>;
export type HealthCheckOutput = z.infer<typeof HealthCheckSchema>;

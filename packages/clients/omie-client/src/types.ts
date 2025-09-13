export interface OmieCredentials {
  appKey: string;
  appSecret: string;
}

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

export interface OmieError {
  faultcode: string;
  faultstring: string;
}

export interface OmieProduct {
  codigo_produto?: string;
  descricao: string;
  codigo: string;
  valor_unitario: number;
  unidade?: string;
  categoria?: string;
  estoque?: number;
  observacoes?: string;
  dados_adicionais?: Record<string, any>;
}

export interface OmieOrder {
  numero_pedido?: string;
  codigo_cliente: string;
  data_pedido: string;
  itens: Array<{
    codigo_produto: string;
    quantidade: number;
    valor_unitario: number;
  }>;
  valor_total: number;
  status?: string;
  observacoes?: string;
}

export interface OmieCustomer {
  codigo_cliente?: string;
  razao_social: string;
  nome_fantasia?: string;
  cnpj_cpf: string;
  email?: string;
  telefone?: string;
  endereco?: {
    logradouro: string;
    numero: string;
    bairro: string;
    cidade: string;
    estado: string;
    cep: string;
  };
}

export interface OmieInvoice {
  numero_documento?: string;
  codigo_cliente: string;
  data_emissao: string;
  data_vencimento: string;
  valor_total: number;
  status?: string;
  observacoes?: string;
}

export interface OmieConfig {
  baseUrl?: string;
  timeout?: number;
  retries?: number;
}

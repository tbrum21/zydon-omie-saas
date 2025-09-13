import got, { Got, Response } from 'got';
import { OmieCredentials, OmieApiRequest, OmieApiResponse, OmieError, OmieConfig } from './types';

export class OmieClient {
  private client: Got;
  private credentials: OmieCredentials;

  constructor(credentials: OmieCredentials, config: OmieConfig = {}) {
    this.credentials = credentials;
    
    this.client = got.extend({
      prefixUrl: config.baseUrl || 'https://app.omie.com.br/api/v1',
      timeout: {
        request: config.timeout || 30000,
      },
      retry: {
        limit: config.retries || 3,
        methods: ['POST'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': 'Zydon-Omie-SaaS/1.0.0',
      },
    });
  }

  /**
   * Método genérico para chamar qualquer endpoint da API Omie
   */
  async call<T = any>(service: string, call: string, params: Record<string, any> = {}): Promise<T> {
    const requestBody: OmieApiRequest = {
      call,
      app_key: this.credentials.appKey,
      app_secret: this.credentials.appSecret,
      param: params,
    };

    try {
      const response: Response<OmieApiResponse<T>> = await this.client.post(service, {
        json: requestBody,
      });

      const data = response.body;

      if (data.faultcode) {
        throw new Error(`Omie API Error: ${data.faultcode} - ${data.faultstring}`);
      }

      if (!data.data) {
        throw new Error('Omie API Error: No data returned');
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Omie API Error: ${error.message}`);
      }
      throw new Error('Omie API Error: Unknown error occurred');
    }
  }

  /**
   * Lista produtos
   */
  async listProducts(page: number = 1, limit: number = 50): Promise<any> {
    return this.call('produtos', 'ListarProdutos', {
      pagina: page,
      registros_por_pagina: limit,
    });
  }

  /**
   * Busca produto por código
   */
  async getProduct(codigo: string): Promise<any> {
    return this.call('produtos', 'ConsultarProduto', {
      codigo_produto: codigo,
    });
  }

  /**
   * Cria ou atualiza produto
   */
  async upsertProduct(product: any): Promise<any> {
    return this.call('produtos', 'UpsertProduto', product);
  }

  /**
   * Lista pedidos
   */
  async listOrders(page: number = 1, limit: number = 50): Promise<any> {
    return this.call('pedidos', 'ListarPedidos', {
      pagina: page,
      registros_por_pagina: limit,
    });
  }

  /**
   * Busca pedido por número
   */
  async getOrder(numeroPedido: string): Promise<any> {
    return this.call('pedidos', 'ConsultarPedido', {
      numero_pedido: numeroPedido,
    });
  }

  /**
   * Cria pedido
   */
  async createOrder(order: any): Promise<any> {
    return this.call('pedidos', 'IncluirPedido', order);
  }

  /**
   * Lista clientes
   */
  async listCustomers(page: number = 1, limit: number = 50): Promise<any> {
    return this.call('geral', 'ListarClientes', {
      pagina: page,
      registros_por_pagina: limit,
    });
  }

  /**
   * Busca cliente por código
   */
  async getCustomer(codigo: string): Promise<any> {
    return this.call('geral', 'ConsultarCliente', {
      codigo_cliente: codigo,
    });
  }

  /**
   * Cria ou atualiza cliente
   */
  async upsertCustomer(customer: any): Promise<any> {
    return this.call('geral', 'UpsertCliente', customer);
  }

  /**
   * Lista contas a receber
   */
  async listInvoices(page: number = 1, limit: number = 50): Promise<any> {
    return this.call('financas', 'ListarContasReceber', {
      pagina: page,
      registros_por_pagina: limit,
    });
  }

  /**
   * Busca conta a receber por número
   */
  async getInvoice(numeroDocumento: string): Promise<any> {
    return this.call('financas', 'ConsultarContaReceber', {
      numero_documento: numeroDocumento,
    });
  }

  /**
   * Cria conta a receber
   */
  async createInvoice(invoice: any): Promise<any> {
    return this.call('financas', 'IncluirContaReceber', invoice);
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.call('geral', 'ListarClientes', {
        pagina: 1,
        registros_por_pagina: 1,
      });
      return true;
    } catch {
      return false;
    }
  }
}

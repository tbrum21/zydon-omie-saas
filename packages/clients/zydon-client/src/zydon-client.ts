import got, { Got, Response } from 'got';
import { ZydonCredentials, ZydonProduct, ZydonOrder, ZydonCustomer, ZydonApiResponse, ZydonConfig, ZydonListResponse } from './types';

export class ZydonClient {
  private client: Got;
  private credentials: ZydonCredentials;

  constructor(credentials: ZydonCredentials, config: ZydonConfig = {}) {
    this.credentials = credentials;
    
    this.client = got.extend({
      prefixUrl: config.baseUrl || 'https://api.zydon.com/v1',
      timeout: {
        request: config.timeout || 30000,
      },
      retry: {
        limit: config.retries || 3,
        methods: ['GET', 'POST', 'PUT', 'DELETE'],
        statusCodes: [408, 413, 429, 500, 502, 503, 504],
      },
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': this.credentials.apiKey,
        'User-Agent': 'Zydon-Omie-SaaS/1.0.0',
      },
    });
  }

  /**
   * Cria ou atualiza um produto
   */
  async upsertProduct(product: ZydonProduct): Promise<ZydonProduct> {
    try {
      const response: Response<ZydonApiResponse<ZydonProduct>> = await this.client.post('products', {
        json: product,
      });

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Lista produtos
   */
  async listProducts(page: number = 1, limit: number = 50): Promise<ZydonListResponse<ZydonProduct>> {
    try {
      const response: Response<ZydonApiResponse<ZydonListResponse<ZydonProduct>>> = await this.client.get('products', {
        searchParams: {
          page,
          limit,
        },
      });

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Busca produto por ID
   */
  async getProduct(id: string): Promise<ZydonProduct> {
    try {
      const response: Response<ZydonApiResponse<ZydonProduct>> = await this.client.get(`products/${id}`);

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Deleta produto por ID
   */
  async deleteProduct(id: string): Promise<void> {
    try {
      const response: Response<ZydonApiResponse> = await this.client.delete(`products/${id}`);

      const data = response.body;

      if (!data.success) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Lista pedidos
   */
  async listOrders(page: number = 1, limit: number = 50): Promise<ZydonListResponse<ZydonOrder>> {
    try {
      const response: Response<ZydonApiResponse<ZydonListResponse<ZydonOrder>>> = await this.client.get('orders', {
        searchParams: {
          page,
          limit,
        },
      });

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Busca pedido por ID
   */
  async getOrder(id: string): Promise<ZydonOrder> {
    try {
      const response: Response<ZydonApiResponse<ZydonOrder>> = await this.client.get(`orders/${id}`);

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Atualiza status do pedido
   */
  async updateOrderStatus(id: string, status: string): Promise<ZydonOrder> {
    try {
      const response: Response<ZydonApiResponse<ZydonOrder>> = await this.client.put(`orders/${id}/status`, {
        json: { status },
      });

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Cria ou atualiza cliente
   */
  async upsertCustomer(customer: ZydonCustomer): Promise<ZydonCustomer> {
    try {
      const response: Response<ZydonApiResponse<ZydonCustomer>> = await this.client.post('customers', {
        json: customer,
      });

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Lista clientes
   */
  async listCustomers(page: number = 1, limit: number = 50): Promise<ZydonListResponse<ZydonCustomer>> {
    try {
      const response: Response<ZydonApiResponse<ZydonListResponse<ZydonCustomer>>> = await this.client.get('customers', {
        searchParams: {
          page,
          limit,
        },
      });

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Busca cliente por ID
   */
  async getCustomer(id: string): Promise<ZydonCustomer> {
    try {
      const response: Response<ZydonApiResponse<ZydonCustomer>> = await this.client.get(`customers/${id}`);

      const data = response.body;

      if (!data.success || !data.data) {
        throw new Error(`Zydon API Error: ${data.error || data.message || 'Unknown error'}`);
      }

      return data.data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(`Zydon API Error: ${error.message}`);
      }
      throw new Error('Zydon API Error: Unknown error occurred');
    }
  }

  /**
   * Testa a conexão com a API
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.client.get('health');
      return true;
    } catch {
      return false;
    }
  }
}

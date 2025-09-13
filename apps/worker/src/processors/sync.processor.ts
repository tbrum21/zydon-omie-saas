import { PrismaClient } from '@prisma/client';
import { SyncEntityJob, EntityType } from '@shared/shared';
import { OmieClient } from '@omie-client/omie-client';
import { ZydonClient } from '@zydon-client/zydon-client';

export class SyncProcessor {
  constructor(private prisma: PrismaClient) {}

  async syncEntity(jobData: SyncEntityJob) {
    const { entityType, tenantId, cursor } = jobData;

    console.log(`🔄 Sincronizando ${entityType} para tenant ${tenantId}`);

    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        credentials: true,
        syncCursors: true,
      },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} não encontrado`);
    }

    const syncCursor = tenant.syncCursors.find(c => c.entityType === entityType);
    if (!syncCursor) {
      throw new Error(`Cursor de sincronização não encontrado para ${entityType}`);
    }

    let lastSyncId = cursor || syncCursor.lastSyncId || '0';
    let syncedCount = 0;

    switch (entityType) {
      case 'PRODUCT':
        syncedCount = await this.syncProducts(tenantId, lastSyncId);
        break;
      case 'ORDER':
        syncedCount = await this.syncOrders(tenantId, lastSyncId);
        break;
      case 'CUSTOMER':
        syncedCount = await this.syncCustomers(tenantId, lastSyncId);
        break;
      default:
        throw new Error(`Tipo de entidade ${entityType} não suportado para sincronização`);
    }

    // Atualiza o cursor de sincronização
    await this.prisma.syncCursor.update({
      where: { id: syncCursor.id },
      data: {
        lastSyncId,
        lastSyncAt: new Date(),
        metadata: {
          ...syncCursor.metadata,
          lastSyncCount: syncedCount,
          syncedAt: new Date().toISOString(),
        },
      },
    });

    console.log(`✅ Sincronização de ${entityType} concluída: ${syncedCount} itens sincronizados`);

    return {
      entityType,
      syncedCount,
      lastSyncId,
      syncedAt: new Date().toISOString(),
    };
  }

  private async syncProducts(tenantId: string, lastSyncId: string): Promise<number> {
    const omieClient = await this.getOmieClient(tenantId);
    const zydonClient = await this.getZydonClient(tenantId);

    // Busca produtos do Omie
    const omieProducts = await omieClient.listProducts(1, 100);
    let syncedCount = 0;

    for (const product of omieProducts.produto_cadastro || []) {
      try {
        // Verifica se já existe mapeamento
        const existingMapping = await this.prisma.mapping.findFirst({
          where: {
            omieId: product.codigo_produto,
            entityType: 'PRODUCT',
            tenantId,
          },
        });

        if (existingMapping) {
          continue; // Já sincronizado
        }

        // Converte para formato Zydon
        const zydonProduct = {
          name: product.descricao,
          sku: product.codigo,
          price: product.valor_unitario,
          description: product.observacoes,
          category: product.categoria,
          stock: product.estoque || 0,
          metadata: {
            omieId: product.codigo_produto,
            unidade: product.unidade,
            dadosAdicionais: product.dados_adicionais,
          },
        };

        // Cria no Zydon
        const zydonResult = await zydonClient.upsertProduct(zydonProduct);

        // Cria mapeamento
        await this.prisma.mapping.create({
          data: {
            omieId: product.codigo_produto,
            zydonId: zydonResult.id,
            entityType: 'PRODUCT',
            metadata: {
              omieProduct: product,
              zydonProduct: zydonResult,
              syncedAt: new Date().toISOString(),
            },
            tenantId,
          },
        });

        syncedCount++;
        lastSyncId = product.codigo_produto;
      } catch (error) {
        console.error(`Erro ao sincronizar produto ${product.codigo_produto}:`, error);
      }
    }

    return syncedCount;
  }

  private async syncOrders(tenantId: string, lastSyncId: string): Promise<number> {
    // TODO: Implementar sincronização de pedidos
    console.log('Sincronização de pedidos não implementada ainda');
    return 0;
  }

  private async syncCustomers(tenantId: string, lastSyncId: string): Promise<number> {
    // TODO: Implementar sincronização de clientes
    console.log('Sincronização de clientes não implementada ainda');
    return 0;
  }

  private async getZydonClient(tenantId: string): Promise<ZydonClient> {
    const credential = await this.prisma.credential.findFirst({
      where: {
        tenantId,
        type: 'ZYDON_API_KEY',
        isActive: true,
      },
    });

    if (!credential) {
      throw new Error(`Credencial Zydon não encontrada para tenant ${tenantId}`);
    }

    // TODO: Implementar descriptografia real
    const apiKey = credential.encryptedData; // Por enquanto, usar dados não criptografados

    return new ZydonClient({ apiKey });
  }

  private async getOmieClient(tenantId: string): Promise<OmieClient> {
    const appKeyCredential = await this.prisma.credential.findFirst({
      where: {
        tenantId,
        type: 'OMIE_APP_KEY',
        isActive: true,
      },
    });

    const appSecretCredential = await this.prisma.credential.findFirst({
      where: {
        tenantId,
        type: 'OMIE_APP_SECRET',
        isActive: true,
      },
    });

    if (!appKeyCredential || !appSecretCredential) {
      throw new Error(`Credenciais Omie não encontradas para tenant ${tenantId}`);
    }

    // TODO: Implementar descriptografia real
    const appKey = appKeyCredential.encryptedData; // Por enquanto, usar dados não criptografados
    const appSecret = appSecretCredential.encryptedData; // Por enquanto, usar dados não criptografados

    return new OmieClient({ appKey, appSecret });
  }
}

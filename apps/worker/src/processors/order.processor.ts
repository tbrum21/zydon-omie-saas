import { PrismaClient } from '@prisma/client';
import { ProcessZydonOrderJob } from '@shared/shared';
import { OmieClient } from '@omie-client/omie-client';
import { ZydonClient } from '@zydon-client/zydon-client';
import { decryptData } from '@shared/shared';

export class OrderProcessor {
  constructor(private prisma: PrismaClient) {}

  async processZydonOrder(jobData: ProcessZydonOrderJob) {
    const { orderId, tenantId, webhookEventId } = jobData;

    console.log(`📦 Processando pedido Zydon ${orderId} para tenant ${tenantId}`);

    // Busca o pedido no Zydon
    const zydonClient = await this.getZydonClient(tenantId);
    const order = await zydonClient.getOrder(orderId);

    // Busca o tenant e suas credenciais
    const tenant = await this.prisma.tenant.findUnique({
      where: { id: tenantId },
      include: {
        credentials: true,
        mappings: true,
      },
    });

    if (!tenant) {
      throw new Error(`Tenant ${tenantId} não encontrado`);
    }

    // Cria o pedido no Omie
    const omieClient = await this.getOmieClient(tenantId);
    
    // Mapeia os itens do pedido
    const omieItems = await Promise.all(
      order.items.map(async (item) => {
        // Busca o mapeamento do produto
        const mapping = tenant.mappings.find(
          m => m.zydonId === item.productId && m.entityType === 'PRODUCT'
        );

        if (!mapping || !mapping.omieId) {
          throw new Error(`Produto ${item.productId} não mapeado no Omie`);
        }

        return {
          codigo_produto: mapping.omieId,
          quantidade: item.quantity,
          valor_unitario: item.price,
        };
      })
    );

    // Cria o pedido no Omie
    const omieOrder = {
      codigo_cliente: 'CLI001', // TODO: Mapear cliente
      data_pedido: new Date().toISOString().split('T')[0],
      itens: omieItems,
      valor_total: order.total,
      observacoes: `Pedido sincronizado do Zydon: ${orderId}`,
    };

    const omieResult = await omieClient.createOrder(omieOrder);

    // Atualiza o webhook event como processado
    await this.prisma.webhookEvent.update({
      where: { id: webhookEventId },
      data: {
        processed: true,
        processedAt: new Date(),
      },
    });

    // Cria mapeamento do pedido se necessário
    if (omieResult.numero_pedido) {
      await this.prisma.mapping.upsert({
        where: {
          omieId_entityType_tenantId: {
            omieId: omieResult.numero_pedido,
            entityType: 'ORDER',
            tenantId,
          },
        },
        update: {
          zydonId: orderId,
          metadata: {
            zydonOrder: order,
            omieOrder: omieResult,
            syncedAt: new Date().toISOString(),
          },
        },
        create: {
          omieId: omieResult.numero_pedido,
          zydonId: orderId,
          entityType: 'ORDER',
          metadata: {
            zydonOrder: order,
            omieOrder: omieResult,
            syncedAt: new Date().toISOString(),
          },
          tenantId,
        },
      });
    }

    console.log(`✅ Pedido ${orderId} sincronizado com sucesso para Omie`);

    return {
      zydonOrderId: orderId,
      omieOrderId: omieResult.numero_pedido,
      syncedAt: new Date().toISOString(),
    };
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

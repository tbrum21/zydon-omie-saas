import { PrismaClient } from '@prisma/client';
import { ProcessOmieProductJob } from '@shared/shared';
import { OmieClient } from '@omie-client/omie-client';
import { ZydonClient } from '@zydon-client/zydon-client';

export class ProductProcessor {
  constructor(private prisma: PrismaClient) {}

  async processOmieProduct(jobData: ProcessOmieProductJob) {
    const { productId, tenantId, action } = jobData;

    console.log(`📦 Processando produto Omie ${productId} (${action}) para tenant ${tenantId}`);

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

    const omieClient = await this.getOmieClient(tenantId);
    const zydonClient = await this.getZydonClient(tenantId);

    if (action === 'create' || action === 'update') {
      // Busca o produto no Omie
      const omieProduct = await omieClient.getProduct(productId);

      // Converte para formato Zydon
      const zydonProduct = {
        name: omieProduct.descricao,
        sku: omieProduct.codigo,
        price: omieProduct.valor_unitario,
        description: omieProduct.observacoes,
        category: omieProduct.categoria,
        stock: omieProduct.estoque || 0,
        metadata: {
          omieId: productId,
          unidade: omieProduct.unidade,
          dadosAdicionais: omieProduct.dados_adicionais,
        },
      };

      // Cria ou atualiza no Zydon
      const zydonResult = await zydonClient.upsertProduct(zydonProduct);

      // Cria ou atualiza mapeamento
      await this.prisma.mapping.upsert({
        where: {
          omieId_entityType_tenantId: {
            omieId: productId,
            entityType: 'PRODUCT',
            tenantId,
          },
        },
        update: {
          zydonId: zydonResult.id,
          metadata: {
            omieProduct,
            zydonProduct: zydonResult,
            syncedAt: new Date().toISOString(),
            action,
          },
        },
        create: {
          omieId: productId,
          zydonId: zydonResult.id,
          entityType: 'PRODUCT',
          metadata: {
            omieProduct,
            zydonProduct: zydonResult,
            syncedAt: new Date().toISOString(),
            action,
          },
          tenantId,
        },
      });

      console.log(`✅ Produto ${productId} sincronizado com sucesso para Zydon`);

      return {
        omieProductId: productId,
        zydonProductId: zydonResult.id,
        action,
        syncedAt: new Date().toISOString(),
      };
    } else if (action === 'delete') {
      // Busca o mapeamento para obter o ID do Zydon
      const mapping = await this.prisma.mapping.findFirst({
        where: {
          omieId: productId,
          entityType: 'PRODUCT',
          tenantId,
        },
      });

      if (mapping && mapping.zydonId) {
        // Deleta do Zydon
        await zydonClient.deleteProduct(mapping.zydonId);

        // Remove o mapeamento
        await this.prisma.mapping.delete({
          where: { id: mapping.id },
        });

        console.log(`✅ Produto ${productId} removido com sucesso do Zydon`);
      }

      return {
        omieProductId: productId,
        action,
        syncedAt: new Date().toISOString(),
      };
    }

    throw new Error(`Ação ${action} não suportada`);
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

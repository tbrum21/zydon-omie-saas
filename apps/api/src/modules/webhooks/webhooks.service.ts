import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ProcessZydonOrderJob } from '@shared/shared';

@Injectable()
export class WebhooksService {
  constructor(
    @InjectQueue('orders') private ordersQueue: Queue,
    private prisma: PrismaService,
  ) {}

  async processZydonWebhook(payload: any, tenantId: string) {
    // Salva o evento do webhook
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        source: 'zydon',
        eventType: payload.event || 'unknown',
        payload,
        tenantId,
      },
    });

    // Se for um evento de pedido, enfileira o job
    if (payload.event === 'order.created' || payload.event === 'order.updated') {
      const orderId = payload.data?.id;
      if (orderId) {
        const job: ProcessZydonOrderJob = {
          orderId,
          tenantId,
          webhookEventId: webhookEvent.id,
        };

        await this.ordersQueue.add('process-zydon-order', job, {
          attempts: 3,
          backoff: {
            type: 'exponential',
            delay: 2000,
          },
        });
      }
    }

    return webhookEvent;
  }

  async processOmieWebhook(payload: any, tenantId: string) {
    // Salva o evento do webhook
    const webhookEvent = await this.prisma.webhookEvent.create({
      data: {
        source: 'omie',
        eventType: payload.event || 'unknown',
        payload,
        tenantId,
      },
    });

    // TODO: Implementar processamento específico para webhooks do Omie
    // Por exemplo: produtos atualizados, pedidos sincronizados, etc.

    return webhookEvent;
  }
}

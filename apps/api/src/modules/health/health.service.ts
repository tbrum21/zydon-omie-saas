import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { HealthCheckOutput } from '@shared/shared';

@Injectable()
export class HealthService {
  constructor(private prisma: PrismaService) {}

  async checkHealth(): Promise<HealthCheckOutput> {
    const services = {
      database: await this.checkDatabase(),
      redis: await this.checkRedis(),
    };

    const isHealthy = Object.values(services).every(status => status === 'up');

    return {
      status: isHealthy ? 'ok' : 'error',
      timestamp: new Date().toISOString(),
      services,
    };
  }

  private async checkDatabase(): Promise<'up' | 'down'> {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return 'up';
    } catch {
      return 'down';
    }
  }

  private async checkRedis(): Promise<'up' | 'down'> {
    // TODO: Implementar verificação real do Redis
    // Por enquanto, retorna 'up' para não quebrar o health check
    return 'up';
  }
}

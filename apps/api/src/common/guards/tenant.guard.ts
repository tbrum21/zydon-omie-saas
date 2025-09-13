import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Request } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { extractTenantId } from '@shared/shared';

@Injectable()
export class TenantGuard implements CanActivate {
  constructor(private prisma: PrismaService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();
    const headers = request.headers;
    const host = request.get('host');

    const tenantId = extractTenantId(headers, host);

    if (!tenantId) {
      throw new UnauthorizedException('Tenant ID não encontrado');
    }

    // Verifica se o tenant existe e está ativo
    const tenant = await this.prisma.tenant.findFirst({
      where: {
        OR: [
          { id: tenantId },
          { subdomain: tenantId },
        ],
        isActive: true,
      },
    });

    if (!tenant) {
      throw new UnauthorizedException('Tenant não encontrado ou inativo');
    }

    // Adiciona o tenant ao request para uso posterior
    (request as any).tenant = tenant;

    return true;
  }
}

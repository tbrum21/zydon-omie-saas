import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateTenantRequest, CreateUserRequest, CreateCredentialRequest } from '@shared/shared';
import * as bcrypt from 'bcrypt';

@Injectable()
export class TenantsService {
  constructor(private prisma: PrismaService) {}

  async createTenant(data: CreateTenantRequest) {
    return this.prisma.tenant.create({
      data: {
        name: data.name,
        domain: data.domain,
        subdomain: data.subdomain,
      },
    });
  }

  async createUser(data: CreateUserRequest) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    
    return this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
        tenantId: data.tenantId,
      },
    });
  }

  async createCredential(data: CreateCredentialRequest) {
    return this.prisma.credential.create({
      data: {
        name: data.name,
        type: data.type,
        encryptedData: data.encryptedData,
        tenantId: data.tenantId,
      },
    });
  }

  async getTenantById(id: string) {
    return this.prisma.tenant.findUnique({
      where: { id },
      include: {
        users: true,
        credentials: true,
      },
    });
  }

  async getTenantBySubdomain(subdomain: string) {
    return this.prisma.tenant.findUnique({
      where: { subdomain },
      include: {
        users: true,
        credentials: true,
      },
    });
  }
}

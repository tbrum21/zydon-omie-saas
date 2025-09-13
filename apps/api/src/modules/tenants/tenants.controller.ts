import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { TenantsService } from './tenants.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';
import { CreateTenantRequest, CreateUserRequest, CreateCredentialRequest } from '@shared/shared';

@ApiTags('Tenants')
@Controller('tenants')
@UseGuards(JwtAuthGuard, TenantGuard)
@ApiBearerAuth()
export class TenantsController {
  constructor(private tenantsService: TenantsService) {}

  @Get('profile')
  @ApiOperation({ summary: 'Obter perfil do tenant' })
  @ApiResponse({ status: 200, description: 'Perfil obtido com sucesso' })
  async getTenantProfile(@Tenant() tenant: any) {
    return tenant;
  }

  @Post('users')
  @ApiOperation({ summary: 'Criar usuário no tenant' })
  @ApiResponse({ status: 201, description: 'Usuário criado com sucesso' })
  async createUser(
    @Body() createUserData: CreateUserRequest,
    @Tenant() tenant: any,
  ) {
    return this.tenantsService.createUser({
      ...createUserData,
      tenantId: tenant.id,
    });
  }

  @Post('credentials')
  @ApiOperation({ summary: 'Criar credencial no tenant' })
  @ApiResponse({ status: 201, description: 'Credencial criada com sucesso' })
  async createCredential(
    @Body() createCredentialData: CreateCredentialRequest,
    @Tenant() tenant: any,
  ) {
    return this.tenantsService.createCredential({
      ...createCredentialData,
      tenantId: tenant.id,
    });
  }
}

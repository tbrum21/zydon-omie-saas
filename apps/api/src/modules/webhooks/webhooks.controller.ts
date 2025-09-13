import { Controller, Post, Body, Headers, UseGuards, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiHeader } from '@nestjs/swagger';
import { WebhooksService } from './webhooks.service';
import { TenantGuard } from '../../common/guards/tenant.guard';
import { Tenant } from '../../common/decorators/tenant.decorator';

@ApiTags('Webhooks')
@Controller('webhooks')
@UseGuards(TenantGuard)
export class WebhooksController {
  constructor(private webhooksService: WebhooksService) {}

  @Post('zydon/orders')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook para pedidos do Zydon' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handleZydonOrderWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
    @Tenant() tenant: any,
  ) {
    console.log(`📦 Webhook Zydon recebido para tenant ${tenant.id}:`, payload);
    
    const webhookEvent = await this.webhooksService.processZydonWebhook(payload, tenant.id);
    
    return {
      success: true,
      message: 'Webhook processado com sucesso',
      webhookEventId: webhookEvent.id,
    };
  }

  @Post('omie/products')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Webhook para produtos do Omie' })
  @ApiResponse({ status: 200, description: 'Webhook processado com sucesso' })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async handleOmieProductWebhook(
    @Body() payload: any,
    @Headers() headers: Record<string, string>,
    @Tenant() tenant: any,
  ) {
    console.log(`📦 Webhook Omie recebido para tenant ${tenant.id}:`, payload);
    
    const webhookEvent = await this.webhooksService.processOmieWebhook(payload, tenant.id);
    
    return {
      success: true,
      message: 'Webhook processado com sucesso',
      webhookEventId: webhookEvent.id,
    };
  }
}

import { Worker } from 'bullmq';
import { PrismaClient } from '@prisma/client';
import * as Sentry from '@sentry/node';
import { ProcessZydonOrderJob, ProcessOmieProductJob, SyncEntityJob, JobStatus } from '@shared/shared';
import { OrderProcessor } from './processors/order.processor';
import { ProductProcessor } from './processors/product.processor';
import { SyncProcessor } from './processors/sync.processor';

// Initialize Sentry
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV || 'development',
});

const prisma = new PrismaClient();

// Redis connection
const redisConnection = {
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
};

// Initialize processors
const orderProcessor = new OrderProcessor(prisma);
const productProcessor = new ProductProcessor(prisma);
const syncProcessor = new SyncProcessor(prisma);

// Create workers
const orderWorker = new Worker<ProcessZydonOrderJob>(
  'orders',
  async (job) => {
    console.log(`🔄 Processando job de pedido: ${job.id}`);
    const startTime = new Date();
    
    try {
      // Registra início do job
      await prisma.jobAudit.create({
        data: {
          jobId: job.id!,
          jobType: 'process-zydon-order',
          status: JobStatus.PROCESSING,
          payload: job.data,
          startedAt: startTime,
          tenantId: job.data.tenantId,
        },
      });

      // Processa o pedido
      const result = await orderProcessor.processZydonOrder(job.data);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Atualiza status do job
      await prisma.jobAudit.updateMany({
        where: { jobId: job.id! },
        data: {
          status: JobStatus.COMPLETED,
          result,
          completedAt: endTime,
          duration,
        },
      });

      console.log(`✅ Job de pedido ${job.id} processado com sucesso em ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao processar job de pedido ${job.id}:`, error);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Registra erro do job
      await prisma.jobAudit.updateMany({
        where: { jobId: job.id! },
        data: {
          status: JobStatus.FAILED,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          completedAt: endTime,
          duration,
        },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
  },
);

const productWorker = new Worker<ProcessOmieProductJob>(
  'products',
  async (job) => {
    console.log(`🔄 Processando job de produto: ${job.id}`);
    const startTime = new Date();
    
    try {
      // Registra início do job
      await prisma.jobAudit.create({
        data: {
          jobId: job.id!,
          jobType: 'process-omie-product',
          status: JobStatus.PROCESSING,
          payload: job.data,
          startedAt: startTime,
          tenantId: job.data.tenantId,
        },
      });

      // Processa o produto
      const result = await productProcessor.processOmieProduct(job.data);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Atualiza status do job
      await prisma.jobAudit.updateMany({
        where: { jobId: job.id! },
        data: {
          status: JobStatus.COMPLETED,
          result,
          completedAt: endTime,
          duration,
        },
      });

      console.log(`✅ Job de produto ${job.id} processado com sucesso em ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao processar job de produto ${job.id}:`, error);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Registra erro do job
      await prisma.jobAudit.updateMany({
        where: { jobId: job.id! },
        data: {
          status: JobStatus.FAILED,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          completedAt: endTime,
          duration,
        },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 3,
  },
);

const syncWorker = new Worker<SyncEntityJob>(
  'sync',
  async (job) => {
    console.log(`🔄 Processando job de sincronização: ${job.id}`);
    const startTime = new Date();
    
    try {
      // Registra início do job
      await prisma.jobAudit.create({
        data: {
          jobId: job.id!,
          jobType: 'sync-entity',
          status: JobStatus.PROCESSING,
          payload: job.data,
          startedAt: startTime,
          tenantId: job.data.tenantId,
        },
      });

      // Processa a sincronização
      const result = await syncProcessor.syncEntity(job.data);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Atualiza status do job
      await prisma.jobAudit.updateMany({
        where: { jobId: job.id! },
        data: {
          status: JobStatus.COMPLETED,
          result,
          completedAt: endTime,
          duration,
        },
      });

      console.log(`✅ Job de sincronização ${job.id} processado com sucesso em ${duration}ms`);
      return result;
    } catch (error) {
      console.error(`❌ Erro ao processar job de sincronização ${job.id}:`, error);
      
      const endTime = new Date();
      const duration = endTime.getTime() - startTime.getTime();

      // Registra erro do job
      await prisma.jobAudit.updateMany({
        where: { jobId: job.id! },
        data: {
          status: JobStatus.FAILED,
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          completedAt: endTime,
          duration,
        },
      });

      throw error;
    }
  },
  {
    connection: redisConnection,
    concurrency: 2,
  },
);

// Event handlers
orderWorker.on('completed', (job) => {
  console.log(`✅ Job de pedido ${job.id} concluído`);
});

orderWorker.on('failed', (job, err) => {
  console.error(`❌ Job de pedido ${job?.id} falhou:`, err);
});

productWorker.on('completed', (job) => {
  console.log(`✅ Job de produto ${job.id} concluído`);
});

productWorker.on('failed', (job, err) => {
  console.error(`❌ Job de produto ${job?.id} falhou:`, err);
});

syncWorker.on('completed', (job) => {
  console.log(`✅ Job de sincronização ${job.id} concluído`);
});

syncWorker.on('failed', (job, err) => {
  console.error(`❌ Job de sincronização ${job?.id} falhou:`, err);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('🛑 Recebido SIGINT, encerrando workers...');
  
  await Promise.all([
    orderWorker.close(),
    productWorker.close(),
    syncWorker.close(),
  ]);
  
  await prisma.$disconnect();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('🛑 Recebido SIGTERM, encerrando workers...');
  
  await Promise.all([
    orderWorker.close(),
    productWorker.close(),
    syncWorker.close(),
  ]);
  
  await prisma.$disconnect();
  process.exit(0);
});

console.log('🚀 Workers iniciados com sucesso!');
console.log('📋 Workers ativos:');
console.log('   - orders (concorrência: 5)');
console.log('   - products (concorrência: 3)');
console.log('   - sync (concorrência: 2)');

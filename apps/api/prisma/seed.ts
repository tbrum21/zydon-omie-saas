import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { encryptData, generateSecretKey } from '@shared/shared';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando seed do banco de dados...');

  // Criar tenant demo
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Tenant Demo',
      subdomain: 'demo',
      domain: 'demo.zydon-omie.local',
      isActive: true,
    },
  });

  console.log(`✅ Tenant criado: ${tenant.name} (${tenant.id})`);

  // Criar usuário admin
  const hashedPassword = await bcrypt.hash('admin123', 10);
  const user = await prisma.user.upsert({
    where: { 
      email_tenantId: {
        email: 'admin@demo.local',
        tenantId: tenant.id,
      }
    },
    update: {},
    create: {
      email: 'admin@demo.local',
      password: hashedPassword,
      name: 'Administrador Demo',
      isActive: true,
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Usuário criado: ${user.email} (${user.id})`);

  // Criar credenciais de exemplo (dados fictícios)
  const encryptionKey = generateSecretKey();
  
  const omieAppKey = await prisma.credential.upsert({
    where: {
      tenantId_type: {
        tenantId: tenant.id,
        type: 'OMIE_APP_KEY',
      }
    },
    update: {},
    create: {
      name: 'Chave de Aplicação Omie',
      type: 'OMIE_APP_KEY',
      encryptedData: encryptData('demo-app-key-123', encryptionKey),
      isActive: true,
      tenantId: tenant.id,
    },
  });

  const omieAppSecret = await prisma.credential.upsert({
    where: {
      tenantId_type: {
        tenantId: tenant.id,
        type: 'OMIE_APP_SECRET',
      }
    },
    update: {},
    create: {
      name: 'Segredo de Aplicação Omie',
      type: 'OMIE_APP_SECRET',
      encryptedData: encryptData('demo-app-secret-456', encryptionKey),
      isActive: true,
      tenantId: tenant.id,
    },
  });

  const zydonApiKey = await prisma.credential.upsert({
    where: {
      tenantId_type: {
        tenantId: tenant.id,
        type: 'ZYDON_API_KEY',
      }
    },
    update: {},
    create: {
      name: 'Chave API Zydon',
      type: 'ZYDON_API_KEY',
      encryptedData: encryptData('demo-zydon-api-key-789', encryptionKey),
      isActive: true,
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Credenciais criadas para tenant ${tenant.id}`);

  // Criar alguns mapeamentos de exemplo
  const productMapping = await prisma.mapping.create({
    data: {
      omieId: 'PROD001',
      zydonId: 'zydon-prod-001',
      entityType: 'PRODUCT',
      metadata: {
        name: 'Produto de Exemplo',
        price: 99.90,
      },
      tenantId: tenant.id,
    },
  });

  const customerMapping = await prisma.mapping.create({
    data: {
      omieId: 'CLI001',
      zydonId: 'zydon-customer-001',
      entityType: 'CUSTOMER',
      metadata: {
        name: 'Cliente de Exemplo',
        email: 'cliente@exemplo.com',
      },
      tenantId: tenant.id,
    },
  });

  console.log(`✅ Mapeamentos criados para tenant ${tenant.id}`);

  // Criar cursors de sincronização
  await prisma.syncCursor.createMany({
    data: [
      {
        entityType: 'PRODUCT',
        lastSyncId: '0',
        lastSyncAt: new Date(),
        tenantId: tenant.id,
      },
      {
        entityType: 'ORDER',
        lastSyncId: '0',
        lastSyncAt: new Date(),
        tenantId: tenant.id,
      },
      {
        entityType: 'CUSTOMER',
        lastSyncId: '0',
        lastSyncAt: new Date(),
        tenantId: tenant.id,
      },
    ],
    skipDuplicates: true,
  });

  console.log(`✅ Cursors de sincronização criados para tenant ${tenant.id}`);

  console.log('🎉 Seed concluído com sucesso!');
  console.log('');
  console.log('📋 Dados criados:');
  console.log(`   Tenant: ${tenant.name} (${tenant.subdomain})`);
  console.log(`   Usuário: ${user.email} / admin123`);
  console.log(`   Credenciais: 3 credenciais de exemplo`);
  console.log(`   Mapeamentos: 2 mapeamentos de exemplo`);
  console.log(`   Cursors: 3 cursors de sincronização`);
  console.log('');
  console.log('🔑 Chave de criptografia gerada:');
  console.log(`   ${encryptionKey}`);
  console.log('');
  console.log('⚠️  IMPORTANTE: Salve a chave de criptografia em um local seguro!');
}

main()
  .catch((e) => {
    console.error('❌ Erro durante o seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

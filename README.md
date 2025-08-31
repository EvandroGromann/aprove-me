# Aprove-me - Sistema de Gestão de Pagáveis

![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Unit Tests](https://img.shields.io/badge/unit%20tests-120%20passing-brightgreen)
![E2E Tests](https://img.shields.io/badge/e2e%20tests-50%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![NestJS](https://img.shields.io/badge/NestJS-11.0-red)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)

Sistema completo de gestão de pagáveis financeiros desenvolvido com NestJS, seguindo princípios de DDD e Clean Architecture, com 100% de cobertura de testes e sistema de permissões avançado.

## 📋 Sobre o Projeto

Sistema robusto para gestão de pagáveis financeiros que permite operações completas de CRUD para:
- Pagáveis (Payables)
- Cedentes (Assignors)
- Usuários (Users)

### ✨ Funcionalidades Implementadas

- API REST completa com validação rigorosa
- Sistema de permissões com cadastro de usuários
- Autenticação JWT dinâmica baseada em banco de dados
- Hash de senhas com bcrypt
- Documentação Swagger/OpenAPI
- Soft Delete para cedentes e usuários
- Paginação e relacionamentos
- Testes unitários e E2E com cobertura total
- Arquitetura DDD com Repository Pattern
- Lotes (Bull) com rastreamento e notificação por email

## 🏗️ Arquitetura

```
apps/
├── api/                 # Backend API
│   └── src/
│       ├── modules/     # Módulos de domínio
│       │   ├── auth/
│       │   ├── assignors/
│       │   ├── payables/
│       │   └── users/
│       ├── shared/      # Componentes compartilhados
│       │   ├── auth/
│       │   └── database/
│       └── main.ts
└── web/                 # Frontend (futuro)
```

## 🚀 Tecnologias Utilizadas

- NestJS 11, TypeScript, Prisma, SQLite
- JWT, Passport, class-validator/transformer
- Swagger/OpenAPI, Jest
- Bull v4 (@nestjs/bull) para filas
- Nodemailer para envio de emails
- Winston (nest-winston) para logging

### Testes
- 120+ testes unitários e 50+ E2E
- Execução sequencial para evitar race conditions
- Mocks para Prisma, Bull, Nodemailer e transports do Winston

## 📊 Modelo de Dados

### Pagável (Payables)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificação única |
| value | Float | Valor do pagável |
| emissionDate | Date | Data de emissão |
| assignor | UUID | ID do cedente |

### Cedente (Assignors)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificação única |
| document | String(30) | CPF/CNPJ |
| email | String(140) | Email |
| phone | String(20) | Telefone |
| name | String(140) | Nome/Razão social |

### Usuário (Users)
| Campo | Tipo | Descrição |
|-------|------|-----------|
| id | UUID | Identificação única |
| login | String | Login único |
| password | String | Senha hasheada com bcrypt |
| createdAt | Date | Data de criação |
| updatedAt | Date | Data de atualização |
| deletedAt | Date? | Soft delete |

## 🛠️ Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Backend
```bash
# Clone o repositório
# git clone <repository-url>
cd aprove-me/apps/api

# Instale as dependências
npm install

# Configure o banco de dados
npx prisma generate
npx prisma migrate dev

# Seed com usuário padrão
npm run db:seed

# Desenvolvimento
npm run dev

# Testes
npm run test:all
```

A API estará disponível em:
- Aplicação: http://localhost:3000
- Swagger: http://localhost:3000/api/docs

## 🔐 Autenticação

1) Usuário padrão (criado pelo seed):
- Login: aprovame
- Senha: aprovame

2) Obter token JWT:
```bash
curl -X POST http://localhost:3000/integrations/auth \
  -H "Content-Type: application/json" \
  -d '{"login":"aprovame","password":"aprovame"}'
```

3) Criar novos usuários (requer auth):
```bash
curl -X POST http://localhost:3000/users \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "novouser",
    "password": "senha123"
  }'
```

4) Usar o token nas requisições:
```bash
curl -X GET http://localhost:3000/integrations/assignor \
  -H "Authorization: Bearer SEU_TOKEN_JWT"
```

No Swagger UI, clique em "Authorize", cole o token e teste os endpoints.

## 📡 Endpoints da API

### Autenticação
- POST /integrations/auth — Login e obtenção de token

### Usuários (JWT)
- POST /users — Criar usuário
- GET /users — Listar
- GET /users/:id — Detalhar
- PATCH /users/:id — Atualizar
- DELETE /users/:id — Soft delete

### Pagáveis (JWT)
- POST /integrations/payable — Criar pagável com cedente
- GET /integrations/payable — Listar pagáveis (paginado)
- GET /integrations/payable/:id — Detalhar pagável

### Cedentes (JWT)
- POST /integrations/assignor — Criar cedente
- GET /integrations/assignor — Listar cedentes (paginado)
- GET /integrations/assignor/:id — Detalhar cedente
- PATCH /integrations/assignor/:id — Atualizar cedente
- DELETE /integrations/assignor/:id — Soft delete
- POST /integrations/assignor/:id/restore — Restaurar cedente

### Documentação
- GET /api-docs — Swagger UI
- GET /api-docs-json — OpenAPI JSON

### Lotes (Batch) 🔒
Processamento assíncrono e escalável de até 10.000 pagáveis por requisição.

- POST /integrations/payable/batch — Enfileira um lote e retorna `{ batchId }` para acompanhamento.

Contrato de resposta:
- 201 Created
- Body: `{ "batchId": "<uuid>" }`

Notas técnicas:
- Fila: `payable-batch`, Job: `payable` (um job por item)
- Tracker Redis por lote: chave `batch:payable:<batchId>`
  - Campos: `total`, `completed`, `failed`, `notifyTo`, `notified`
  - TTL automático para limpeza
- Notificação por email ao finalizar (quando `completed + failed === total`), com lock para evitar duplicidade

Exemplo de requisição:
```bash
curl -X POST http://localhost:3000/integrations/payable/batch \
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "notifyTo": "seu.email@dominio.com",
    "items": [
      {
        "id": "9b0e3b4e-1111-2222-3333-444444444444",
        "value": 123.45,
        "emissionDate": "2025-08-30T00:00:00.000Z",
        "assignor": { "id": "a1b2c3d4-e5f6-7890-1234-56789abcdef0", "document": "12345678900", "email": "assignor@ex.com", "phone": "11999999999", "name": "Assignor SA" }
      }
    ]
  }'
```

Variáveis de ambiente para envio de email (SMTP):
- SMTP_HOST, SMTP_PORT, SMTP_SECURE (true/false)
- SMTP_USER, SMTP_PASS (opcional)
- EMAIL_FROM (opcional; fallback: SMTP_USER → no-reply@example.com)

## 🧪 Testes e Qualidade

```bash
# Executar todos os testes
npm run test:all

# Coverage
npm run test:cov

# E2E
npm run test:e2e

# Lint
npm run lint
```

### Métricas de Qualidade
- 100% de cobertura de código nos testes unitários
- 50+ testes E2E
- 120+ testes unitários
- Execução sequencial, sem race conditions

## 🐳 Docker e Execução com Compose

- Subir em modo produção: docker compose up -d --build
- Ver logs: docker compose logs -f api
- Parar: docker compose down
- Parar e limpar volumes: docker compose down -v

Detalhes:
- Build multi-stage em apps/api/Dockerfile
- Porta: 3000 (http://localhost:3000)
- Swagger: http://localhost:3000/api/docs
- Variáveis padrão: NODE_ENV=production, LOG_LEVEL=info, DATABASE_URL=file:/app/prisma/dev.db
- Volumes: api_logs (/app/logs) e api_db (/app/prisma)
- Prisma migrate deploy e seed executados no start

## 📈 Status de Implementação

- Nível 1: Validação — Concluído
- Nível 2: Persistência — Concluído
- Nível 3: Testes — Concluído
- Nível 4: Autenticação JWT — Concluído
- Nível 5: Permissões com banco — Concluído
- Nível 6: Infra e Documentação — Concluído
- Nível 7: Lotes (Bull), rastreamento em Redis e notificações por email — Concluído
- Próximos: Nível 8 (resiliência: retries/DLQ) e melhorias operacionais

## 🎯 Destaques Técnicos

- DDD e Clean Architecture
- Repository Pattern
- Permissões dinâmicas
- Hash de senhas com bcrypt
- 100% Test Coverage
- Soft Delete
- Validação robusta
- OpenAPI/Swagger
- Arquitetura modular e extensível

---

Desenvolvido por Evandro Gromann — Para detalhes de decisões, veja RACIOCINIO.md.

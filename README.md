# Aprove-me - Sistema de Gestão de Pagáveis

![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Unit Tests](https://img.shields.io/badge/unit%20tests-120%20passing-brightgreen)
![E2E Tests](https://img.shields.io/badge/e2e%20tests-50%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.0-red)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)

Sistema completo de gestão de pagáveis financeiros desenvolvido com NestJS, seguindo princípios de DDD e Clean Architecture, com 100% de cobertura de testes e sistema de permissões avançado.

## 📋 Sobre o Projeto

Sistema robusto para gestão de pagáveis financeiros que permite operações completas de CRUD para:
- **Pagáveis (Payables)**: Representações digitais de dívidas a serem pagas/recebidas
- **Cedentes (Assignors)**: Pessoas/empresas beneficiárias de um pagável
- **Usuários (Users)**: Sistema de permissões e autenticação dinâmica

### ✨ Funcionalidades Implementadas

- ✅ **API REST completa** com validação rigorosa
- ✅ **Sistema de permissões** com cadastro de usuários no banco
- ✅ **Autenticação JWT** dinâmica baseada em banco de dados
- ✅ **Hash de senhas** com bcrypt para segurança
- ✅ **Documentação Swagger/OpenAPI** interativa
- ✅ **Soft Delete** para cedentes e usuários
- ✅ **Paginação** em consultas de listagem
- ✅ **Relacionamentos** entre pagáveis e cedentes
- ✅ **Testes unitários** com 100% de cobertura
- ✅ **Testes E2E** abrangentes
- ✅ **Arquitetura DDD** com Repository Pattern

## 🏗️ Arquitetura

O projeto segue princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**, estruturado em módulos do NestJS:

```
apps/
├── api/                 # Backend API
│   └── src/
│       ├── modules/     # Módulos de domínio
│       │   ├── auth/         # Autenticação JWT
│       │   ├── assignors/    # Domínio do Cedente  
│       │   ├── payables/     # Domínio do Pagável
│       │   └── users/        # Sistema de Usuários/Permissões
│       ├── shared/      # Componentes compartilhados
│       │   ├── auth/         # Guards e estratégias JWT
│       │   └── database/     # Configuração do Prisma
│       └── main.ts
└── web/                 # Frontend (implementação futura)
```

## 🚀 Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js escalável
- **TypeScript** - Linguagem principal com tipagem estática
- **Prisma** - ORM moderno para banco de dados
- **SQLite** - Banco de dados para desenvolvimento
- **JWT** - Tokens de autenticação com expiração controlada
- **Passport** - Middleware de autenticação robusto
- **Class Validator** - Validação robusta de DTOs
- **Swagger/OpenAPI** - Documentação interativa da API
- **Jest** - Framework de testes com 100% de cobertura
- **Logger** - Logs automaticos com decorators

### Testes
- **120+ testes unitários** - Cobertura completa da lógica de negócio
- **50+ testes E2E** - Validação de todos os endpoints
- **Execução sequencial** - Evita race conditions
- **Cleanup automático** - Isolamento entre testes

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
| login | String | Login único para autenticação |
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
git clone <repository-url>
cd aprove-me/apps/api

# Instale as dependências
npm install

# Configure o banco de dados
npx prisma generate
npx prisma migrate dev

# Execute o seed para criar usuário padrão
npm run db:seed

# Execute em desenvolvimento
npm run dev

# Execute os testes
npm run test:all
```

A API estará disponível em:
- **Aplicação**: `http://localhost:3000`
- **Documentação Swagger**: `http://localhost:3000/api/docs`

### 🔐 Como usar a autenticação

O sistema agora utiliza **autenticação dinâmica baseada em banco de dados**.

1. **Usuário padrão (criado automaticamente):**
   - Login: `aprovame`
   - Senha: `aprovame`

2. **Obter token JWT:**
```bash
curl -X POST http://localhost:3000/integrations/auth \
  -H "Content-Type: application/json" \
  -d '{"login":"aprovame","password":"aprovame"}'
```

3. **Criar novos usuários (requer autenticação):**
```bash
curl -X POST http://localhost:3000/users \ 
  -H "Authorization: Bearer SEU_TOKEN_JWT" \
  -H "Content-Type: application/json" \
  -d '{
    "login": "novouser",
    "password": "senha123"
  }'
```

4. **Usar o token nas requisições:**
```bash
curl -X GET http://localhost:3000/integrations/assignor \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

5. **No Swagger UI:**
   - Clique no botão "Authorize" 🔓
   - Insira o token obtido no login
   - Todos os endpoints ficarão autenticados automaticamente

## 📡 Endpoints da API

### 🔐 Autenticação
- `POST /integrations/auth` - Realizar login e obter token JWT

> **Sistema de Permissões:**
> - Autenticação dinâmica baseada em banco de dados
> - Usuário padrão: `aprovame/aprovame`
> - Token expira em: **1 minuto**
> - Senhas hasheadas com bcrypt

### 👥 Usuários (Users) 🔒
*Todos os endpoints requerem autenticação JWT*

- `POST /users` - Criar novo usuário
- `GET /users` - Listar todos os usuários
- `GET /users/:id` - Buscar usuário específico
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Soft delete de usuário

### Pagáveis (Payables) 🔒
*Todos os endpoints requerem autenticação JWT*

- `POST /integrations/payable` - Criar pagável com cedente
- `GET /integrations/payable` - Listar pagáveis (paginado)
- `GET /integrations/payable/:id` - Buscar pagável específico

### Cedentes (Assignors) 🔒
*Todos os endpoints requerem autenticação JWT*

- `POST /integrations/assignor` - Criar cedente
- `GET /integrations/assignor` - Listar cedentes (paginado)
- `GET /integrations/assignor/:id` - Buscar cedente específico
- `PATCH /integrations/assignor/:id` - Atualizar cedente
- `DELETE /integrations/assignor/:id` - Soft delete de cedente
- `POST /integrations/assignor/:id/restore` - Restaurar cedente deletado

## 🧪 Testes e Qualidade

```bash
# Executar todos os testes
npm run test:all

# Testes unitários com coverage
npm run test:cov

# Testes E2E
npm run test:e2e

# Verificar erros de lint
npm run lint
```

### Métricas de Qualidade
- **100% de cobertura** de código nos testes unitários
- **50+ testes E2E** cobrindo todos os cenários de uso
- **120+ testes unitários** validando a lógica de negócio
- **Zero race conditions** com execução sequencial
1
## � Docker e Execução com Compose

Executar a API em ambiente conteinerizado.

Pré-requisitos:
- Docker Desktop 4+

Comandos principais:
- Subir em modo produção: docker compose up -d --build
- Ver logs: docker compose logs -f api
- Parar: docker compose down
- Parar e limpar volumes (DB/logs): docker compose down -v

Detalhes da orquestração:
- Build usando `apps/api/Dockerfile` (multi-stage, deps → build → prod)
- Porta exposta: 3000 (http://localhost:3000)
- Documentação Swagger: http://localhost:3000/api/docs
- Variáveis padrão: NODE_ENV=production, LOG_LEVEL=info, DATABASE_URL=file:/app/prisma/dev.db
- Volumes: `api_logs` (logs em /app/logs) e `api_db` (SQLite em /app/prisma)
- Migrações Prisma: aplicadas automaticamente no start (migrate deploy)

## �📈 Status de Implementação

- ✅ **Nível 1**: Validação de dados rigorosa
- ✅ **Nível 2**: Persistência completa com Prisma
- ✅ **Nível 3**: Testes unitários com 100% cobertura
- ✅ **Nível 4**: Autenticação JWT completa
- ✅ **Nível 5**: Sistema de permissões com banco de dados
- ✅ **Nível 6**: Infra e Documentação (Dockerfile, docker-compose, README)
- 🚧 **Próximos**: Nível 7 em diante conforme especificação do desafio

## 🎯 Destaques Técnicos

- **Domain-Driven Design** com separação clara de responsabilidades
- **Repository Pattern** para abstração de dados
- **Sistema de Permissões** dinâmico baseado em banco de dados
- **Hash de senhas** com bcrypt para máxima segurança
- **100% Test Coverage** garantindo qualidade e confiabilidade
- **Soft Delete** preservando integridade histórica
- **Validação robusta** em todos os pontos de entrada
- **Documentação OpenAPI** para facilitar integração
- **Execução sequencial de testes** evitando race conditions
- **Arquitetura modular** facilitando manutenção e extensibilidade

---

**Desenvolvido com 💙 por [Evandro Gromann](https://github.com/EvandroGromann)**

Para mais detalhes sobre as decisões de implementação, consulte o arquivo [RACIOCINIO.md](./RACIOCINIO.md).

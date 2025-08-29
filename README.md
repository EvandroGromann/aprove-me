# Aprove-me - Sistema de Gestão de Pagáveis

![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Unit Tests](https://img.shields.io/badge/unit%20tests-89%20passing-brightgreen)
![E2E Tests](https://img.shields.io/badge/e2e%20tests-47%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.0-red)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)

Sistema completo de gestão de pagáveis financeiros desenvolvido com NestJS, seguindo princípios de DDD e Clean Architecture, com 100% de cobertura de testes.

## 📋 Sobre o Projeto

Sistema robusto para gestão de pagáveis financeiros que permite operações completas de CRUD para:
- **Pagáveis (Payables)**: Representações digitais de dívidas a serem pagas/recebidas
- **Cedentes (Assignors)**: Pessoas/empresas beneficiárias de um pagável

### ✨ Funcionalidades Implementadas

- ✅ **API REST completa** com validação rigorosa
- ✅ **Autenticação JWT** com expiração de 1 minuto
- ✅ **Documentação Swagger/OpenAPI** interativa
- ✅ **Soft Delete** para cedentes 
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
│       │   └── payables/     # Domínio do Pagável
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

### Testes
- **70 testes unitários** - Cobertura completa da lógica de negócio
- **29 testes E2E** - Validação de todos os endpoints
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

# Execute em desenvolvimento
npm run dev

# Execute os testes
npm run test:all
```

A API estará disponível em:
- **Aplicação**: `http://localhost:3000`
- **Documentação Swagger**: `http://localhost:3000/api/docs`

### 🔐 Como usar a autenticação

1. **Obter token JWT:**
```bash
curl -X POST http://localhost:3000/integrations/auth \
  -H "Content-Type: application/json" \
  -d '{"login":"aprovame","password":"aprovame"}'
```

2. **Usar o token nas requisições:**
```bash
curl -X GET http://localhost:3000/integrations/assignor \
  -H "Authorization: Bearer SEU_TOKEN_JWT_AQUI"
```

3. **No Swagger UI:**
   - Clique no botão "Authorize" 🔓
   - Insira o token obtido no login
   - Todos os endpoints ficarão autenticados automaticamente

## 📡 Endpoints da API

### 🔐 Autenticação
- `POST /integrations/auth` - Realizar login e obter token JWT

> **Credenciais de acesso:**
> - Login: `aprovame`
> - Senha: `aprovame`
> - Token expira em: **1 minuto**

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

### Documentação
- `GET /api-docs` - Interface Swagger/OpenAPI
- `GET /api-docs-json` - Especificação JSON da API

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
- **29 testes E2E** cobrindo todos os cenários de uso
- **70 testes unitários** validando a lógica de negócio
- **Zero race conditions** com execução sequencial

## 📈 Status de Implementação

- ✅ **Nível 1**: Validação de dados rigorosa
- ✅ **Nível 2**: Persistência completa com Prisma
- ✅ **Nível 3**: Testes unitários com 100% cobertura
- ✅ **Nível 4**: Autenticação JWT completa
- 🚧 **Próximos**: Nível 5 em diante conforme especificação do desafio

## 🎯 Destaques Técnicos

- **Domain-Driven Design** com separação clara de responsabilidades
- **Repository Pattern** para abstração de dados
- **100% Test Coverage** garantindo qualidade e confiabilidade
- **Soft Delete** preservando integridade histórica
- **Validação robusta** em todos os pontos de entrada
- **Documentação OpenAPI** para facilitar integração
- **Execução sequencial de testes** evitando race conditions

---

**Desenvolvido com 💙 por [Evandro Gromann](https://github.com/EvandroGromann)**

Para mais detalhes sobre as decisões de implementação, consulte o arquivo [RACIOCINIO.md](./RACIOCINIO.md).

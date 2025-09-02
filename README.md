# AproveMe - Sistema de Gestão de recebíveis

![Test Coverage](https://img.shields.io/badge/coverage-100%25-brightgreen)
![Unit Tests](https://img.shields.io/badge/unit%20tests-120%20passing-brightgreen)
![E2E Tests](https://img.shields.io/badge/e2e%20tests-50%20passing-brightgreen)
![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)
![NestJS](https://img.shields.io/badge/NestJS-10.0-red)
![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748)

Sistema completo de gestão de pagáveis financeiros composto por API robusta (NestJS) e interface moderna (React). Desenvolvido seguindo princípios de DDD e Clean Architecture.

## Sobre o Projeto

Sistema para gestão de pagáveis financeiros que permite operações completas de CRUD para:
- **Pagáveis (Payables)**: Representações digitais de dívidas a serem pagas/recebidas
- **Cedentes (Assignors)**: Pessoas/empresas beneficiárias de um pagável
- **Usuários (Users)**: Gerenciamento de contas e autenticação

## Estrutura do Projeto

O projeto é organizado como um monorepo:

```
apps/
├── api/                 # Backend API (NestJS)
└── web/                 # Frontend (React + Vite + Tailwind)
```

## Execução com Docker

O projeto completo pode ser facilmente executado com Docker:

```bash
# Na raiz do repositório
docker compose up -d --build
```

### Serviços disponíveis:
- **API (Backend)**: http://localhost:3000
  - Documentação Swagger: http://localhost:3000/api/docs
  - Usuário padrão: `aprovame/aprovame`
  
- **Web (Frontend)**: http://localhost:5173
  - Conectado automaticamente à API

### Variáveis de ambiente:
- `VITE_API_URL` (opcional): Define a URL da API para o frontend
  ```bash
  export VITE_API_URL=http://localhost:3000   # opcional, usa default se não definida
  ```

### Comandos úteis:
```bash
# Ver logs em tempo real
docker compose logs -f

# Parar todos os serviços
docker compose down

# Reiniciar um serviço específico
docker compose restart api   # ou web
```

## Status de Implementação

### Backend
- ✅ **Nível 1**: Validação de dados rigorosa
- ✅ **Nível 2**: Persistência completa com Prisma
- ✅ **Nível 3**: Testes unitários com 100% cobertura
- ✅ **Nível 4**: Autenticação JWT completa
- ✅ **Nível 5**: Sistema de permissões com banco de dados
- ✅ **Nível 6**: Infra e Documentação
- ✅ **Nível 7**: Lotes, Observabilidade e Notificações
- ✅ **Nível 8**: Resiliência (retries, Fila Morta)
- ✅ **Nível 9**: Cloud (CI/CD para AWS App Runner)
- ✅ **Nível 10**: Infra as Code (Terraform)

### Frontend
- ✅ **Nível 1**: Interface de cadastro de pagáveis
- ✅ **Nível 2**: Integração com API e cadastro de cedentes
- ✅ **Nível 4**: Autenticação (Login, token, redirect)
- ⏳ **Nível 3**: Listagem de pagáveis
- ⏳ **Nível 5**: Testes

---

# Frontend (React)

## Funcionalidades

- ✅ **Interface moderna** desenvolvida com React e Tailwind CSS
- ✅ **Cadastro de cedentes** com validação de formulário
- ✅ **Criação de pagáveis** com seleção de cedentes via dropdown
- ✅ **Autenticação** com gestão de token JWT
- ✅ **Validações** para formatos brasileiros (CPF/CNPJ, telefone)
- ✅ **Navegação** intuitiva entre telas de cadastro

## Tecnologias

- **React** - Biblioteca para interfaces de usuário
- **Vite** - Ferramenta de build otimizada
- **Tailwind CSS** - Framework CSS utilitário
- **TypeScript** - Tipagem estática
- **React Router** - Roteamento de páginas
- **Fetch API** - Comunicação com backend

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Execução em desenvolvimento
```bash
# Clone o repositório
git clone <repository-url>
cd aprove-me/apps/web

# Crie arquivo de ambiente
cp .env.example .env
# Edite o arquivo .env com a URL da API
# VITE_API_URL=http://localhost:3000

# Instale as dependências
npm install

# Execute em desenvolvimento
npm run dev
```

O frontend estará disponível em:
- **Aplicação**: `http://localhost:5174`

### Autenticação

O frontend implementa autenticação completa:
- Login com usuário/senha
- Armazenamento de token JWT no localStorage
- Redirecionamento automático para login em caso de token expirado
- Proteção de rotas para usuários não autenticados

---

# Backend (NestJS)

## Funcionalidades

- ✅ **API REST completa** com validação rigorosa
- ✅ **Sistema de permissões** com cadastro de usuários
- ✅ **Autenticação JWT** dinâmica baseada em banco
- ✅ **Documentação Swagger/OpenAPI** interativa
- ✅ **Soft Delete** para cedentes e usuários
- ✅ **Paginação** em consultas de listagem
- ✅ **Testes** com 100% de cobertura

## Arquitetura

O backend segue princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**:

```
src/
├── modules/     # Módulos de domínio
│   ├── auth/         # Autenticação JWT
│   ├── assignors/    # Domínio do Cedente  
│   ├── payables/     # Domínio do Pagável
│   └── users/        # Sistema de Usuários/Permissões
├── shared/      # Componentes compartilhados
│   ├── auth/         # Guards e estratégias JWT
│   └── database/     # Configuração do Prisma
└── main.ts
```

## Tecnologias

- **NestJS** - Framework Node.js escalável
- **TypeScript** - Linguagem com tipagem estática
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados (desenvolvimento)
- **JWT** - Autenticação com tokens
- **Jest** - Framework de testes
- **Swagger/OpenAPI** - Documentação interativa
- **Bull/Redis** - Filas e processamento assíncrono

## Modelo de Dados

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
| password | String | Senha hasheada |
| createdAt | Date | Data de criação |
| updatedAt | Date | Data de atualização |
| deletedAt | Date? | Soft delete |

## Instalação e Execução

### Pré-requisitos
- Node.js 18+
- npm ou yarn

### Execução em desenvolvimento
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
```

A API estará disponível em:
- **Aplicação**: `http://localhost:3000`
- **Documentação Swagger**: `http://localhost:3000/api/docs`

### Testes

```bash
# Executar todos os testes
npm run test:all

# Testes unitários com coverage
npm run test:cov

# Testes E2E
npm run test:e2e
```

## Endpoints da API

### Autenticação
- `POST /integrations/auth` - Realizar login e obter token JWT

> **Sistema de Permissões:**
> - Usuário padrão: `aprovame/aprovame`
> - Token expira em: **1 minuto**

### 👥 Usuários (Users) 🔒
- `POST /users` - Criar novo usuário
- `GET /users` - Listar usuários
- `GET /users/:id` - Buscar usuário
- `PATCH /users/:id` - Atualizar usuário
- `DELETE /users/:id` - Soft delete de usuário

### Pagáveis (Payables) 🔒
- `POST /integrations/payable` - Criar pagável
- `GET /integrations/payable` - Listar pagáveis (paginado)
- `GET /integrations/payable/:id` - Buscar pagável

### Cedentes (Assignors) 🔒
- `POST /integrations/assignor` - Criar cedente
- `GET /integrations/assignor` - Listar cedentes (paginado)
- `GET /integrations/assignor/:id` - Buscar cedente
- `PATCH /integrations/assignor/:id` - Atualizar cedente
- `DELETE /integrations/assignor/:id` - Soft delete de cedente
- `POST /integrations/assignor/:id/restore` - Restaurar cedente

---

## Documentação Adicional

Para histórico de mudanças, veja:

- Backend (API): [apps/api/CHANGELOG.md](./apps/api/CHANGELOG.md)
- Frontend (Web): [apps/web/CHANGELOG.md](./apps/web/CHANGELOG.md)

Para mais detalhes sobre as decisões de implementação, consulte o arquivo [RACIOCINIO.md](./RACIOCINIO.md).

**Desenvolvido com 💙 por [Evandro Gromann](https://github.com/EvandroGromann)**

# Aprove-me - Sistema de Gestão de Pagáveis

Este projeto implementa uma API para gestão de pagáveis financeiros, desenvolvida como parte de um desafio técnico da Bankme.

## 📋 Sobre o Projeto

O sistema permite o cadastro, consulta, edição e exclusão de:
- **Pagáveis (Payables)**: Representações digitais de dívidas a serem pagas/recebidas
- **Cedentes (Assignors)**: Pessoas/empresas beneficiárias de um pagável

## 🏗️ Arquitetura

O projeto segue princípios de **Domain-Driven Design (DDD)** e **Clean Architecture**, estruturado em módulos do NestJS:

```
apps/
├── api/                 # Backend API
│   └── src/
│       ├── core/        # Configurações centrais
│       ├── modules/     # Módulos de domínio
│       │   ├── assignors/    # Domínio do Cedente  
│       │   └── payables/    # Domínio do Pagável
│       └── main.ts
└── web/                 # Frontend (implementação futura)
```

## 🚀 Tecnologias Utilizadas

### Backend
- **NestJS** - Framework Node.js
- **TypeScript** - Linguagem principal
- **Prisma** - ORM para banco de dados
- **SQLite** - Banco de dados
- **Class Validator** - Validação de dados
- **JWT** - Autenticação (implementação futura)

### DevOps
- **Docker** - Containerização (implementação futura)
- **Docker Compose** - Orquestração (implementação futura)

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
```

A API estará disponível em `http://localhost:3000`

## 📡 Endpoints da API

### Nível 1 - Validação ✅
- `POST /integrations/payable` - Criar pagável com validação

## 📈 Roadmap de Funcionalidades

- [x] **Nível 1**: Validação de dados
- [ ] **Nível 2**: Persistência com Prisma
- [ ] **Nível 3**: Testes unitários
- [ ] **Nível 4**: Autenticação JWT
- [ ] **Nível 5**: Sistema de permissões
- [ ] **Nível 6**: Containerização e documentação
- [ ] **Nível 7**: Processamento em lote
- [ ] **Nível 8**: Sistema de resilência
- [ ] **Nível 9**: Deploy em nuvem
- [ ] **Nível 10**: Infrastructure as Code

Para mais detalhes sobre as decisões de implementação, consulte o arquivo [RACIOCINIO.md](./RACIOCINIO.md).

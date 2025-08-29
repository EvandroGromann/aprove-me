# Changelog

Todas as mudanças notáveis deste projeto serão documentadas neste arquivo.

O formato é baseado em [Keep a Changelog](https://keepachangelog.com/pt-BR/1.0.0/),
e este projeto adere ao [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Unreleased]

## [1.3.0] - 2025-08-29 - Nível 3 Completo: Testes

### Added
- **100% Test Coverage** com relatórios detalhados
- **Execução sequencial de testes E2E** evitando race conditions
- **29 testes E2E** cobrindo todos os cenários de uso
- **70 testes unitários** validando lógica de negócio
- Configuração Jest otimizada com `maxWorkers: 1` para E2E
- Cleanup automático e robusto entre testes
- Estratégia de upsert para evitar conflitos de chave única
- README atualizado com badges de qualidade e documentação completa
- **Nível 3 do desafio oficialmente concluído**

### Changed
- **Simplificação radical** da estratégia de cleanup de testes
- Remoção de timeouts desnecessários e try-catch redundantes
- Cleanup de comentários de debug e código temporário
- Estrutura de testes mais limpa e maintível

### Removed
- `jest.config.simple.js` - arquivo temporário não utilizado
- Comentários de debug nos testes E2E
- Código duplicado de cleanup entre describe blocks
- Lógica complexa desnecessária de restauração de soft delete

### Fixed
- **Race conditions** entre testes paralelos completamente eliminadas
- Teste unitário do upsert corrigido para incluir `deletedAt: null`
- Estabilidade completa da suite de testes
- Isolamento perfeito entre diferentes test suites

### Technical Highlights
- **Estratégia de cleanup**: `deleteMany() → restore soft deleted → deleteMany()`
- **Execução sequencial**: Jest configurado com `maxWorkers: 1` para E2E
- **Upsert pattern**: Evita conflitos de chave única em cenários paralelos
- **Zero flakiness**: Testes 100% determinísticos e confiáveis

## [1.2.0] - 2025-08-29 - Nível 3: Infraestrutura de Testes

### Added
- Suite completa de testes unitários e de integração
- Configuração Jest para ambiente de testes
- Testes unitários para todos os services e controllers
- Testes de integração (E2E) para endpoints críticos
- Cobertura de código com relatórios detalhados
- Scripts de validação completa do projeto
- Estrutura organizada de testes separada do código de produção
- Documentação completa da estrutura de testes

### Changed
- Estrutura de testes reorganizada em `test/unit/` e `test/integration/`
- Configurações Jest otimizadas para diferentes tipos de teste
- Package.json atualizado com scripts de teste organizados
- Separação clara entre código de produção e testes
- Imports dos testes ajustados para nova estrutura

### Technical Details
- **Estrutura**: `test/unit/modules/` espelha `src/modules/`
- **Testes unitários**: 63 testes passando em 11 suites
- **Testes E2E**: 15 testes de integração com banco real
- **Cobertura**: 100% em statements, branches, functions e lines
- **Performance**: Testes rápidos e isolados
- **Qualidade**: Mocks completos e assertions robustas
- **Exclusões**: Apenas `main.ts` (bootstrap) excluído da cobertura

## [1.1.0] - 2025-08-29 - Documentação e Melhorias

### Added
- Documentação completa da API com Swagger/OpenAPI
- Configuração centralizada em `config/api-info.json` para metadados da API
- Servindo de assets estáticos para branding e configuração
- Decoradores Swagger em todos os controllers e DTOs
- Documentação detalhada de endpoints com exemplos e códigos de status
- Estrutura empresarial de configuração para deploy profissional
- Suporte a branding com logo e estilos personalizados
- Interface de documentação interativa em `/api/docs`

### Changed
- Estrutura de configuração movida para diretório `config/` 
- Main.ts atualizado para carregar configurações dinamicamente
- DTOs aprimorados com decoradores @ApiProperty para documentação

## [1.0.0] - 2025-08-29 - Nível 2 Completo: Persistência

### Added
- Sistema completo de gerenciamento de recebíveis (Aprove-me)
- API REST com NestJS e TypeScript
- Persistência com Prisma ORM e SQLite
- Soft delete para cedentes com auditoria
- Paginação em todos os endpoints de listagem
- Validação robusta com class-validator
- Arquitetura DDD com Repository Pattern
- DTOs de resposta limpos sem campos técnicos
- Estrutura modular escalável

### Changed
- **BREAKING**: Payable responses não incluem mais campo `assignorId` redundante
- **BREAKING**: CreateAssignor agora requer `id` no body da requisição
- **BREAKING**: UpdateAssignor não permite modificar `id` via body
- Payables agora retornam dados completos do assignor para melhor UX
- Movido DTOs compartilhados para `src/shared/dto/`
- Reorganizada estrutura do Prisma para `src/shared/database/`

### Security
- Campos técnicos (`deletedAt`) não são mais expostos nas APIs
- Prevenção de sobrescrita de ID em operações de update
- Validação de IDs duplicados na criação de cedentes

## [0.2.0] - 2025-08-29 - Refactor & Clean Architecture

### Added
- DTOs de resposta específicos (`AssignorResponseDto`, `PayableResponseDto`)
- DTO compartilhado `AssignorSummaryDto` em `src/shared/dto/`
- Mapeamento consistente de entidades para DTOs de resposta
- Validação de conflitos na criação de cedentes

### Changed
- Movido módulo Prisma para estrutura DDD correta
- Corrigida hierarquia de DTOs (Create/Update)
- Payables agora incluem dados completos do assignor
- Removida redundância de `assignorId` + `assignor` em responses

### Removed
- Arquivos DTOs vazios e não utilizados
- DTO duplicado de assignor no módulo payables
- Exposição de campos técnicos internos

### Fixed
- Service `create` agora usa DTOs de resposta consistentemente
- Imports corrigidos após reorganização de estrutura
- Compilação TypeScript sem erros

## [0.1.0] - 2025-08-29 - Soft Delete Implementation

### Added
- Soft delete para cedentes com campo `deletedAt`
- Endpoint de restore para cedentes (`POST /assignor/:id/restore`)
- Filtros automáticos para registros soft deleted
- Migração Prisma para suporte a soft delete

### Changed
- Repository methods agora filtram registros deletados
- Método `delete` substituído por `softDelete`
- Contadores respeitam soft delete

### Security
- Prevenção de perda acidental de dados
- Auditoria completa de operações de deleção
- Integridade referencial preservada

## [0.0.2] - 2025-08-29 - Level 2 Complete CRUD & Persistence

### Added
- Persistência completa com Prisma ORM
- CRUD completo para Assignors e Payables
- Repository Pattern com abstrações limpas
- Paginação com metadados completos
- Relacionamentos entre Assignor e Payable
- Validação de foreign keys
- Timestamps automáticos (createdAt, updatedAt)

### Changed
- Migração de validação em memória para persistência real
- Upsert de assignors durante criação de payables
- Responses com paginação incluem metadados

### Fixed
- Validação de relacionamentos entre entidades
- Prevenção de criação de payables com assignors inexistentes

## [0.0.1] - 2025-08-29 - Nível 1 Completo: Validação

### Added
- Projeto base NestJS com TypeScript
- Validação completa com class-validator
- DTOs para todas as operações
- Estrutura modular seguindo DDD
- Validação de UUID v4
- Validação de campos obrigatórios e tamanhos
- Documentação arquitetural completa (RACIOCINIO.md)
- Roteamento RESTful (`/integrations/*`)

### Technical Details
- Validation Pipe global configurado
- Decorators de validação customizados
- Estrutura de pastas seguindo Clean Architecture
- Separação clara entre camadas

---

## Convenções do Changelog

### Tipos de Mudanças
- `Added` para novas funcionalidades
- `Changed` para mudanças em funcionalidades existentes
- `Deprecated` para funcionalidades que serão removidas
- `Removed` para funcionalidades removidas
- `Fixed` para correções de bugs
- `Security` para correções de vulnerabilidades

### Breaking Changes
Marcadas com `**BREAKING**` quando alteram a API existente.

### Versionamento
- **Major** (X.0.0): Breaking changes
- **Minor** (0.X.0): Novas funcionalidades compatíveis
- **Patch** (0.0.X): Correções de bugs compatíveis

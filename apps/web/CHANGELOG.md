# Changelog (Web)

Todas as mudanças notáveis do frontend (Vite + React + Tailwind) serão documentadas aqui.

Formato baseado em Keep a Changelog e SemVer.

## [Unreleased]

## [0.3.0] - 2025-09-02 - Layout e Interface Aprimorados

### Added
- Listagem completa de pagáveis com design responsivo
- Detalhes de pagáveis com exibição formatada de dados
- Edição e exclusão de pagáveis com validações
- Interface de listagem de cedentes

### Fixed
- Consistência visual entre todos os módulos da aplicação
- Exibição adequada de IDs longos em tabelas

## [0.2.0] - 2025-09-02 - Módulo de Cedentes

### Added
- Implementação completa do módulo de Cedentes
- Página de cadastro de cedentes com validações
- Dropdown para seleção de cedentes na página de pagáveis
- Integração com API através de endpoints `/integrations/assignor`

### Changed
- Reaproveitamento de componentes UI entre formulários
- Interface mais amigável com feedback visual de validação
- Navegação entre telas de cadastro de cedentes e pagáveis

## [0.1.1] - 2025-09-01
- Tratamento centralizado de sessão expirada (401): redirecionamento ao login com aviso e retorno à rota desejada
- Botões "Gerar UUID" menores (xs), ghost indigo e com ícone sutil
- Polimento visual: Button com estados hover/active/focus acessíveis, Input com ring, Card/Label refinados

## [0.1.0] - 2025-09-01 - Primeira versão do Front (Vite + React + Tailwind)

### Added
- App Vite + React + TS com Tailwind
- Páginas: Login, Criar Pagável, Detalhe do Pagável, ProtectedRoute
- Navbar com logo e CTA "Cadastrar Pagável" (visível apenas logado)
- Design system simples: Button, Input, Label, Card
- Cliente de API tipado com Bearer token
- Validações utilitárias (UUID v4, e-mail, ISO date)

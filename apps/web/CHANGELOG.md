# Changelog (Web)

Todas as mudanças notáveis do frontend (Vite + React + Tailwind) serão documentadas aqui.

Formato baseado em Keep a Changelog e SemVer.

## [Unreleased]

- Tratamento centralizado de sessão expirada (401): redireciono ao login com aviso e retorno à rota desejada
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

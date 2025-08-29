# Estrutura de Testes

Este diretório contém todos os testes da aplicação, organizados de forma clara e separada do código de produção.

## Estrutura

```
test/
├── unit/                      # Testes unitários
│   └── modules/              # Testes organizados por módulo
│       ├── assignors/        # Testes do módulo de cedentes
│       │   ├── assignors.controller.spec.ts
│       │   └── assignors.service.spec.ts
│       └── payables/         # Testes do módulo de pagáveis
│           ├── payables.controller.spec.ts
│           └── payables.service.spec.ts
├── integration/              # Testes de integração (E2E)
│   ├── app.e2e-spec.ts      # Testes gerais da aplicação
│   └── assignors.e2e-spec.ts # Testes E2E dos cedentes
└── jest-e2e.json            # Configuração Jest para testes E2E
```

## Comandos

### Testes Unitários
```bash
npm test                    # Executar todos os testes unitários
npm run test:watch         # Executar testes em modo watch
npm run test:cov           # Executar testes com cobertura
```

### Testes de Integração
```bash
npm run test:e2e           # Executar testes de integração
```

### Validação Completa
```bash
npm run test:all           # Executar todos os tipos de teste
```

## Padrões

### Testes Unitários
- **Localização**: `test/unit/modules/{module}/{file}.spec.ts`
- **Escopo**: Testam unidades isoladas (services, controllers)
- **Mocks**: Usam mocks para dependências externas
- **Performance**: Rápidos e focados

### Testes de Integração
- **Localização**: `test/integration/{feature}.e2e-spec.ts`
- **Escopo**: Testam fluxos completos da aplicação
- **Banco**: Usam banco de dados real (limpo entre testes)
- **Performance**: Mais lentos, mas testam cenários reais

## Cobertura

A cobertura de código é gerada na pasta `coverage/` e inclui:
- Relatórios HTML interativos
- Métricas de linhas, funções e branches
- Exclusão automática de arquivos de teste

## Boas Práticas

1. **Isolamento**: Cada teste deve ser independente
2. **Limpeza**: Dados de teste devem ser limpos após cada execução
3. **Descrição**: Usar descrições claras do que está sendo testado
4. **Cenários**: Cobrir casos de sucesso, erro e edge cases
5. **Performance**: Manter testes rápidos e focados

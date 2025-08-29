# Meu Raciocínio e Decisões - Desafio Aprove-me

## Como Entendi o Problema

### O Domínio que Identifiquei
Ao ler o desafio, percebi que estamos lidando com **gestão de pagáveis financeiros**. Identifiquei dois conceitos principais:
- **Payable (Pagável)**: Um documento financeiro representando um valor a ser pago/recebido
- **Assignor (Cedente)**: A pessoa ou empresa que seria o beneficiario (cedente)

### O Relacionamento que Visualizo
- Um Cedente pode ter vários Pagáveis (1:N)
- Cada Pagável pertence a apenas um Cedente (N:1)

## Arquitetura que Escolhi

### Considerações sobre Clean Architecture vs NestJS
**Reflexão Inicial**: Cogitei inicialmente implementar uma arquitetura seguindo mais rigorosamente os princípios da Clean Architecture, com as camadas bem definidas:
- **Domain**: Entidades e regras de negócio puras
- **Application**: Casos de uso e orquestradores
- **Infrastructure**: Implementações de banco, APIs externas
- **Interface**: Controllers e adaptadores

**Por Que Mudei de Ideia**: Após pesquisar, percebi que essa abordagem não é a recomendada pelo NestJS. O framework é **opinado** e já fornece suas próprias convenções arquiteturais que funcionam bem:
- Módulos como agregadores de funcionalidades
- Services para lógica de negócio
- Repositories para acesso a dados
- Controllers para exposição de APIs

**Minha Conclusão**: A implementação rigorosa da Clean Architecture seria mais adequada em projetos **sem frameworks opinados**, usando Node.js puro com TypeScript e Express, por exemplo. Com NestJS, é melhor seguir suas convenções e adaptar os princípios da Clean Architecture dentro dessas limitações.

### Como Pensei na Estrutura de Módulos
Seguindo as boas práticas do NestJS e princípios de DDD, organizei assim:

```
src/
├── main.ts
├── app.module.ts
├── shared/
│   ├── database/          # Infraestrutura compartilhada
│   │   ├── prisma.service.ts
│   │   └── prisma.module.ts
│   └── dto/               # DTOs reutilizáveis
│       └── assignor-summary.dto.ts
└── modules/
    ├── assignors/         # Domínio de Cedentes
    │   ├── dto/
    │   ├── entities/
    │   ├── repositories/
    │   ├── assignor.controller.ts # @Controller('integrations')
    │   ├── assignor.service.ts
    │   └── assignor.module.ts
    ├── payables/          # Domínio de Pagáveis
    │   ├── dto/
    │   ├── entities/
    │   ├── repositories/
    │   ├── services/
    │   ├── payable.controller.ts # @Controller('integrations/payable') 
    │   └── payable.module.ts
    └── auth/              # Autenticação (Nível 4+)
```

### Por Que Escolhi Essa Abordagem

#### 1. Separação por Domínio
- **Assignor Module**: Cuida de tudo relacionado aos cedentes
- **Payable Module**: Gerencia os pagáveis
- **Auth Module**: Vai cuidar da autenticação quando chegarmos lá

#### 2. Camadas que Defini
- **DTOs**: Para validar os dados que chegam
- **Entities**: Modelos que representam o negócio
- **Repositories**: Para abstrair como acesso os dados
- **Services**: Onde coloco as regras de negócio
- **Controllers**: Onde exponho as APIs (com rotas `/integrations/*`)

#### 3. Como Pensei nas Rotas
- Entendi que `/integrations/*` poderia ser só um **prefixo de namespace**, como se fosse `/api`
- Cada controller define sua própria responsabilidade
- Não preciso de um módulo "IntegrationModule" - vejo só como uma convenção de rota

## Pontos Onde Fiquei em Dúvida (e Minhas Decisões)

### 🤔 **Receivable vs Payable - Decisão Terminológica**
**Minha Dúvida**: Percebi uma aparente inconsistência nos termos. O desafio fala de "recebíveis" mas a rota é `/payable`. Isso me gerou questões:
- **Receivable (Recebível)**: Dinheiro que eu TENHO A RECEBER (perspectiva de quem recebe)
- **Payable (Pagável)**: Dinheiro que eu TENHO A PAGAR (perspectiva de quem paga)

**Analisando o Contexto**:
- Descrição: "recebíveis são representações digitais de um documento que simula uma dívida a ser recebida"
- Campo `assignor`: "cedente" - quem tem o direito a receber
- Negócio: Cliente da Bankme movimenta recebíveis

**Minha Conclusão**: A terminologia depende da **perspectiva**:
- Do lado de **quem paga**: Crio um payable para alguém receber
- Do lado de **quem recebe**: Crio um receivable para ele receber

**Como Vou Implementar**: 
- Manterei **toda a nomenclatura como `payable`** (rota, entidades, módulos)
- Seguindo princípio DDD: **sempre usar o mesmo nome para coisas iguais**
- Evito confusão entre diferentes termos para o mesmo conceito
- Pode haver testes que esperam especificamente `/integrations/payable`
- Respeito a especificação e mantenho consistência

**Observação**: Idealmente, seria melhor definir uma perspectiva única (receivable ou payable) para todo o sistema, mas isso dependeria de alinhar com stakeholders sobre o ponto de vista predominante.

### 🤔 **Como Tratar o Módulo de Integrations**
**Dúvida Inicial**: A rota especificada é `/integrations/payable`, isso sugeria um módulo genérico.

**Minha Decisão**: Tratar `/integrations` apenas como **prefixo de rota** (como `/api`), mantendo os módulos de domínio separados.

**Por Que Decidi Assim**: 
- Acredito que o path ideal seria diretamente acessando a entidade `/payables` ou com prefixo `/api/payables` e sempre com a entidade principal no plural.
- Vou manter `/integrations/*` para respeitar o que o desafio pede e evitar de algum teste falhar pela rota ser diferente.
- Separo cada contexto em um módulo assim garantindo responsabilidade e autonomia para eles.
- Evito criar um "super módulo" que poderia violar Single Responsibility

### 🤔 **Onde Colocar as Validações**
**Minha Abordagem**: 
- **DTOs**: Validações técnicas (formato, tamanho, campos obrigatórios)
- **Services**: Validações de regras de negócio (lógica específica do domínio)

### 🤔 **Como Integrar Prisma Mantendo Arquitetura Limpa**
**Minha Estratégia**: 
- Criar abstrações de Repository
- Implementações concretas usam Prisma
- Services dependem apenas das abstrações (inversão de dependência)

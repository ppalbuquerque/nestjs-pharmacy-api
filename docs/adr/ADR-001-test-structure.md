# ADR-001: Estrutura de Testes e Adoção de TDD

- **Status:** Accepted
- **Date:** 2026-03-29

## Context

O projeto não possuía nenhum arquivo de teste implementado, apesar do tooling (Jest, `@nestjs/testing`, `supertest`, `ts-jest`) já estar presente como devDependencies. A ausência de testes tornava refatorações arriscadas e dificultava a validação de comportamentos de negócio.

## Decision

Adotar TDD (Test-Driven Development) como prática obrigatória, com a seguinte estrutura:

### Test Runner

**Jest 29** com **ts-jest** para transformação TypeScript. Configuração centralizada no `package.json`.

### Tipos de Teste

| Tipo | Localização | Padrão de arquivo | Ferramenta |
|------|-------------|-------------------|------------|
| Unitário | Ao lado do arquivo testado (`src/`) | `*.spec.ts` | `@nestjs/testing` + `jest.fn()` |
| E2E | `test/` | `*.e2e-spec.ts` | `supertest` + NestJS app real |

### Convenções de Nomenclatura

- `orders.service.spec.ts` — testa `OrdersService`
- `orders.controller.spec.ts` — testa `OrdersController`
- `app.e2e-spec.ts` — testa a aplicação end-to-end

### Setup de Testes Unitários

Usar `Test.createTestingModule` do `@nestjs/testing`. Repositórios TypeORM são mockados via `getRepositoryToken`:

```typescript
{
  provide: getRepositoryToken(OrderEntity),
  useValue: { findOneBy: jest.fn(), create: jest.fn(), save: jest.fn() },
}
```

`jest.clearAllMocks()` deve ser chamado no `beforeEach` para garantir isolamento entre testes.

### Ciclo TDD (Red → Green → Refactor)

1. **Red:** Escrever um teste que falha descrevendo o comportamento desejado
2. **Green:** Escrever o código mínimo para o teste passar
3. **Refactor:** Melhorar o código sem quebrar os testes

**Os testes nunca são reescritos para se adaptar ao código. O código é que deve ser reescrito para passar nos testes.**

### Resolução de Módulos

O Jest precisa de `moduleNameMapper` para resolver imports absolutos com prefixo `src/` (padrão usado no projeto):

```json
"moduleNameMapper": {
  "^src/(.*)$": "<rootDir>/$1"
}
```

## Consequences

- Maior confiança em refatorações e adição de funcionalidades
- Comportamentos de negócio documentados pelos próprios testes
- Custo inicial: escrever testes antes do código exige disciplina e desacelera a escrita da primeira versão
- Benefício a longo prazo: bugs detectados antes de chegar ao banco ou à API

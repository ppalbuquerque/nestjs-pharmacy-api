# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

NestJS-based pharmacy management API with PostgreSQL (hosted on Neon), TypeORM, AWS S3 file uploads, and OpenAI-powered medication search with vector embeddings.

## Commands

### Development
```bash
npm run start:dev       # Hot-reload dev server
npm run start:debug     # Debug mode with hot reload
npm run build           # Compile TypeScript to dist/
npm run start:prod      # Run compiled production build
```

### Testing
```bash
npm run test            # Run unit tests (*.spec.ts in src/)
npm run test:watch      # Watch mode
npm run test:cov        # Coverage report
npm run test:e2e        # E2E tests (*.e2e-spec.ts in test/)
```

Run a single test file:
```bash
npx jest src/medication/medication.service.spec.ts
```

### Code Quality
```bash
npm run lint            # ESLint with auto-fix
npm run format          # Prettier format
```

### Database Migrations (TypeORM)
```bash
npm run typeorm:generate -- --name=MigrationName   # Generate from entity changes
npm run typeorm:create -- --name=MigrationName     # Create blank migration
npm run typeorm:migrate                             # Run pending migrations
npm run typeorm:revert                              # Rollback last migration
npm run typeorm:show                               # Show migration status
npm run typeorm:drop                               # Drop entire schema
```

### Docker
```bash
docker-compose up       # Start PostgreSQL + app (local dev)
```
PostgreSQL runs on port 5432, API on port 3000.

## Architecture

### Module Structure

```
src/
├── app.module.ts           # Root module — wires all sub-modules, TypeORM, ConfigModule
├── main.ts                 # Bootstrap: Swagger at /api, CORS, port 3000
├── medication/             # Medication catalog CRUD + full-text search
├── checkout/               # Checkout session lifecycle (open/close)
├── orders/                 # Order creation and cancellation
├── files/                  # S3 file uploads via Multer + multer-s3
├── ai-search/              # OpenAI embedding-based semantic medication search
├── config/                 # TypeORM migration config (separate from app config)
└── db/migrations/          # TypeORM migration files
```

### Data Model Relationships
- `CheckoutEntity` → has many `OrderEntity` (one-to-many)
- `OrderEntity` → has many `OrderItemEntity` (cascade insert)
- `OrderItemEntity` → references `MedicationEntity` by ID

### Key Patterns
- **DTO validation**: DTOs use class-validator decorators and `@ApiProperty` for Swagger
- **Custom exceptions**: Domain-specific HTTP exceptions (e.g., `CheckoutIsOpen`, `OrderNotFound`) in each module
- **Subscribers**: `MedicationSubscriber` auto-updates the `fullTextSearch` tsvector column on save
- **Repositories**: Injected via TypeORM `@InjectRepository`

### Database Features
- PostgreSQL full-text search in **Portuguese** (pt_BR) via tsvector on `Medication.fullTextSearch`
- `pgvector` extension for AI embedding similarity search in `medication_embeddings` table
- `unaccent` extension used in text search configuration

### AI Search
- Model: `gpt-4.1-nano-2025-04-14`
- Embeddings: `text-embedding-3-small`
- Agentic tool-call loop (max 5 steps, 200 token limit) — the AI calls `getMedications` tool internally to retrieve results

### File Uploads
- Multer + multer-s3 → AWS S3 with public-read ACL
- UUID-based filenames, metadata persisted to `File` entity

## TDD Rules

All new code must be validated by tests. Follow the Red → Green → Refactor cycle:
1. **Red:** Write a failing test that describes the desired behavior
2. **Green:** Write the minimum code to make it pass
3. **Refactor:** Improve the code without breaking tests

**Tests are never rewritten to match the code — the code must be rewritten to pass the tests.**

- Unit tests live next to their source file: `<name>.service.spec.ts`, `<name>.controller.spec.ts`
- E2E tests live in `test/` with the `.e2e-spec.ts` suffix
- Mock repositories and external dependencies via `jest.fn()` — never hit a real database in unit tests
- Use `getRepositoryToken(Entity)` from `@nestjs/typeorm` to provide mock repositories
- Call `jest.clearAllMocks()` in `beforeEach` to isolate tests
- Run `npm run test` before submitting any change

The decisions behind this structure (tooling choices, mock patterns, directory conventions) are documented in `docs/adr/ADR-001-test-structure.md`.

## Dependency Rules

Before using any external library in the code, verify it is declared in `package.json`.

- If the package is **already listed**: use it normally.
- If the package is **not listed**: add it to the appropriate section (`dependencies` or `devDependencies`) and run `npm install` before proceeding.

Never import a package that is not declared in `package.json`, even if it happens to be installed transitively.

## Documentation Rules

After implementing any new feature (endpoint, service method, business rule, exception), update the corresponding documentation file in `docs/` before closing the task.

For each module doc (`docs/<module>-module.md`), update:
- The **Endpoints** table with the new route
- A **flow section** describing inputs, filters, and output
- The **test coverage table** with the new scenarios

## Environment Variables

Required in `.env`:
```
DB_HOST, DB_PORT, DB_USER, DB_PASS, DB_NAME
AWS_ACCESS_KEY, AWS_SECRET_KEY, AWS_BUCKET_NAME, AWS_REGION
OPENAI_API_KEY
```

The migration CLI config (`src/config/migrations-local-config.ts`) reads the same env vars but constructs the DataSource independently from the NestJS app.

# Application structure and reasoning

This project is a modular **NestJS** API built around a clean separation between:

- **Platform / cross-cutting infrastructure** (configuration, auth, persistence, throttling)
- **Feature modules** (business capabilities like authentication and messages)
- **Reusable shared primitives** (DTOs, filters, interceptors, utilities)

## Tech stack & tooling (what is used and why)

- **Runtime**
  - Node.js (targeting Node 24 via Docker images)
  - NestJS (`@nestjs/*`) for modular architecture + DI
  - Express platform (`@nestjs/platform-express`)
- **Database**
  - PostgreSQL (`pg`) and TypeORM (`typeorm`, `@nestjs/typeorm`)
  - Migrations via TypeORM CLI wired into npm scripts and Docker startup
  - Custom naming strategy (`CustomNamingStrategy`) based on `typeorm-naming-strategies`
- **Auth & security**
  - Passport + JWT (`@nestjs/passport`, `@nestjs/jwt`, `passport-jwt`)
  - Password hashing via `bcrypt`
  - Security headers via `helmet`
  - Cookie parsing via `cookie-parser` (tokens are stored in HTTP-only cookies)
  - Rate limiting via `@nestjs/throttler` (global guard)
- **Validation & serialization**
  - Input validation via `class-validator`
  - DTO transformation via `class-transformer` + global `ValidationPipe`
  - Response shaping via a global interceptor + Nest class serialization
- **API docs**
  - Swagger/OpenAPI via `@nestjs/swagger` (enabled outside production)
- **Dev tooling / quality**
  - ESLint (flat config) + Prettier
  - TypeScript path aliases: `@core/*`, `@common/*` (from `tsconfig.json`)
- **Containerization**
  - Multi-stage Docker build (install prod deps, build once, ship minimal runner image)
  - `docker-compose.yaml` provides Postgres + API; API waits for healthy DB
  - Production container entrypoint runs DB migrations and then starts the API (`scripts/start.sh`)

## Folder structure (how the code is laid out)

- `src/main.ts`
  - Application bootstrap and global middleware/guards/pipes/interceptors/filters
- `src/app.module.ts`
  - Root module that composes `CoreModule` + feature modules
- `src/core/*` (infrastructure modules; designed to be reusable across features)
  - `core/config/*`: typed config composition and env validation
  - `core/type-orm/*`: TypeORM initialization and naming strategy
  - `core/auth/*`: JWT strategies/guards, global guard, common auth utilities
  - `core/throttler/*`: global rate-limit guard configuration
- `src/common/*` (cross-cutting primitives)
  - `common/filters/*`: global exception mapping
  - `common/interceptors/*`: global response envelope
  - `common/dto/*`: shared request DTOs (e.g. cursor pagination)
  - `common/database/*`: base entity primitives shared by TypeORM entities
  - `common/swagger/*`: Swagger config
  - `common/utils/*`: small pure helpers (e.g. env parsing)
- `src/database/*`
  - `data-source.ts`: TypeORM DataSource used by the CLI (migrations)
  - `migrations/*`: generated migration files
- Feature modules (domain-focused)
  - `src/auth/*`: HTTP auth endpoints + auth use-cases (commands)
  - `src/message/*`: message endpoints + message use-cases (commands) + entity/DTOs
  - `src/user/*`, `src/tag/*`: entities and supporting types/exceptions

## Main architectural pattern: “controller → service facade → command (use-case)”

Feature modules intentionally keep controllers thin:

- Controllers mainly:
  - validate/parse input (DTOs)
  - read authenticated user data (`@ActiveUser()`)
  - delegate to services
- Services are lightweight facades that delegate to:
  - **command classes** (each command encapsulates one business use-case)
- Commands own:
  - authorization checks
  - query construction
  - persistence strategy (transactions, inserts/updates)
  - response mapping (DTO transformation)

This keeps most application logic in plain injectable classes that are easier to unit test than controller flows.

## Request lifecycle (global bootstrapping)

`src/main.ts` wires cross-cutting concerns for every request:

- **Middleware**
  - `cookie-parser` (JWT strategies extract tokens from cookies)
  - `helmet` (security headers)
- **CORS**
  - enabled with credentials and typed origin/header allowlists loaded from `CorsConfig`
- **Validation**
  - global `ValidationPipe` with:
    - `whitelist: true`
    - `forbidNonWhitelisted: true`
    - `transform: true` (DTO typing + implicit conversions)
- **Routing**
  - global API prefix from `BaseConfig` (`api/v1`)
- **Serialization & response shape**
  - `ClassSerializerInterceptor` with `excludeExtraneousValues: true`
  - `ResponseInterceptor` ensures a consistent success envelope
- **Error handling**
  - `HttpExceptionFilter` standardizes error responses
- **Docs**
  - Swagger is enabled only when not in production

# Decisions made (e.g. for filtering, pagination, auth, error handling)

This section documents decisions that are explicitly visible in the implementation.

## Auth: global JWT guard + opt-out `@Public()`

- `CoreAuthModule` is marked `@Global()` and registers `JwtAuthGuard` as an `APP_GUARD`.
  - Result: all routes are protected by default.
- Public endpoints explicitly opt out using `@Public()`.
- The `@ActiveUser()` decorator reads `request.user` populated by Passport.

## Cookie-based access/refresh tokens + refresh rotation

- Access and refresh tokens are JWTs signed with `HS256`.
- Tokens are transported via **HTTP-only cookies**:
  - `access_token`
  - `refresh_token`
- Refresh token flow:
  - refresh strategy reads refresh JWT from cookie and exposes it to controllers
  - refresh token is **stored hashed** in the DB (`UserEntity.refreshToken` is `select: false`)
  - on refresh, the incoming token is compared using `bcrypt.compare`, then rotated:
    - issue new tokens
    - hash new refresh token
    - store it (invalidating previous refresh tokens)

Why this approach:

- Cookies avoid the need for the frontend to store tokens in JS-accessible storage.
- Hashing refresh tokens reduces blast radius of DB leaks.
- Rotation limits the value of a stolen refresh token.

## Response envelope + pagination convention

- Success responses are normalized by `ResponseInterceptor`:
  - non-paginated handlers become `{ statusCode, data }`
  - if the handler already returns an object with `data` and `meta`, the interceptor preserves it and adds `statusCode`
- Errors are normalized by `HttpExceptionFilter`:
  - `{ statusCode, message, timestamp }`

Why:

- Clients can rely on a consistent response shape for both success and error.
- Pagination “meta” is standardized without forcing every endpoint to manually wrap.

## Cursor pagination and filtering in message listing

Messages are listed using cursor pagination in `FindAllMessagesCommand`:

- Cursor format: base64-encoded ISO timestamp (`createdAt`)
- Query strategy:
  - order by `createdAt DESC`
  - apply cursor filter `createdAt < cursorDate`
  - fetch `limit + 1` rows to compute `hasNextPage` and `nextCursor`

Filtering is applied dynamically only when provided:

- `tagNames[]` filter via join on Tag and `Tag.name IN (...)`
- `authorIds[]` filter via `authorId IN (...)`
- `startDate` / `endDate` filter via `createdAt` range

Why cursor pagination:

- Stable under inserts/deletes and avoids large-offset performance issues.

## Soft delete for messages

- `MessageEntity` uses `DeleteDateColumn` for `deletedAt`.
- Delete operations call `softDelete(id)`.
- Listing explicitly filters out deleted rows (`deletedAt IS NULL`).

Why:

- Preserves history for auditing/undo potential, while keeping API results clean.

## Data access and performance-oriented TypeORM usage

Several commands intentionally avoid expensive ORM patterns:

- **Select only needed columns**
  - List endpoint uses QueryBuilder with explicit `select` / `addSelect`.
  - Authorization checks fetch minimal fields (e.g. `authorId`, `tagId`).
- **Prefer `insert` / `update` when appropriate**
  - Create message uses `QueryRunner.manager.insert(...)` inside a transaction.
  - Update message uses `repository.update(...)` for partial writes.
- **Indexes match query patterns**
  - `MessageEntity` defines indexes on:
    - `createdAt`
    - `(authorId, createdAt)`
    - `(tagId, createdAt)`

Why:

- Predictable query plans and reduced IO.
- Avoids unnecessary reads and entity change tracking.

## CORS strategy: typed config + production safety checks

- CORS settings are loaded from `CorsConfig`.
- Origins are parsed as comma-separated lists (`parseCommaList`).
- In non-development environments:
  - wildcard origins are rejected
  - at least one allowed HTTP origin must be provided
- `credentials: true` is enabled to support cookie-based auth.

Why:

- Prevents accidental permissive CORS in production while keeping dev setup simple.

## Rate limiting as an infrastructure default

- `CoreThrottlerModule` wires `ThrottlerGuard` as a global `APP_GUARD`.
- Limits are environment-driven (`THROTTLER_TTL`, `THROTTLER_LIMIT`).

Why:

- A safe default for public endpoints and brute-force resistance, without sprinkling decorators everywhere.

## Database migrations and container startup flow

- TypeORM CLI uses `src/database/data-source.ts`.
- Docker runner starts by executing `migration:run` against the built `dist` DataSource, then starts the API.

Why:

- Production images can be started in a fresh environment and reliably converge to the correct schema.

# Suggestions for next steps (e.g. testing, CI/CD, deployment)

## Testing strategy

- Add unit tests for command classes (they are the main business logic units):
  - cursor pagination edge cases (`limit`, `cursor`, empty result, hasNextPage)
  - authorization checks (only author can update/delete)
  - auth flows (refresh token mismatch, logout invalidation)
- Add E2E tests for the cookie-based auth flow:
  - signup/login sets cookies
  - authenticated request succeeds
  - refresh rotates tokens
  - logout invalidates refresh token

## CI/CD

- Add a CI pipeline that runs:
  - `npm ci`
  - lint + formatting checks
  - unit tests + coverage
  - E2E tests with a Postgres service
  - Docker build

## Production hardening

- Review cookie settings for production deployment:
  - ensure HTTPS + `secure: true`
  - confirm `sameSite` works with your frontend domain setup
  - add CSRF mitigation if you expose state-changing endpoints to browsers
- Consider structured logging (and avoid raw `console.error` in commands).

## Observability and operations

- Add health/readiness endpoints (including a DB connectivity check).
- Add request correlation IDs and structured logs.
- Consider metrics/tracing (OpenTelemetry).

## API consistency and docs

- Swagger currently advertises a bearer token scheme, while auth is cookie-based.
  - Either document the cookie approach explicitly (recommended) or add an optional bearer-token extractor for tooling.

## Domain completeness

- `UserModule` is currently empty; if user endpoints/queries are planned, follow the existing pattern:
  - controller → service facade → commands
  - DTO validation + response shaping via existing global middleware.

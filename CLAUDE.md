# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Student Affairs Management System (學校課程管理系統) - A monorepo containing a NestJS API backend and a React (Refine + Ant Design) dashboard frontend, managed by Turborepo.

## Monorepo Structure

```
apps/
  api/          # NestJS 11 backend (Port 8000, prefix /api)
  dashboard/    # React 18 + Refine 4 + Ant Design 5 frontend (Vite)
```

Package manager: npm (workspaces configured in root package.json).

## Common Commands

### From root (runs across all apps via Turborepo)
- `npm run dev` — Start all apps in development mode
- `npm run build` — Production build for all apps
- `npm run lint` — ESLint check across all apps

### API (`apps/api`)
- `npm run dev` — NestJS watch mode
- `npm run build:local` — `nest build` (local development)
- `npm run build` — `prisma generate && tsc` (production/Vercel)
- `npm run start:prod` — `node dist/main`
- `npm run test` — Jest unit tests
- `npm run test:cov` — Jest with coverage
- `npm run prisma:migrate` — Run Prisma migrations
- `npm run db:seed` — Seed database
- `npm run create:admin` — Interactive admin user creation script
- `npx tsc --noEmit` — TypeScript compilation check (known pre-existing error in `rbac.guard.spec.ts`)

### Dashboard (`apps/dashboard`)
- `npm run dev` — Vite dev server via Refine CLI
- `npm run build` — TypeScript check + Refine/Vite build

## Architecture

### API (NestJS)

**Database**: PostgreSQL on Neon, accessed via Prisma ORM.

**Data models**: User → School → Course → Student → Attendance / GradeSheet. All entities track `modifier_id` (the user who last modified) and timestamps.

**Roles** (enum): `admin > manager > staff` — hierarchical via Casbin grouping (`g, role:admin, role:manager` / `g, role:manager, role:staff`).

**Auth flow**:
- Login: Local strategy (account + password with Argon2) → JWT access_token (1h) + refresh_token (7d)
- Refresh: `POST /auth/refresh` with refresh_token → new token pair
- Password reset: `POST /auth/forgot-password` → reset token (15min) → `POST /auth/reset-password`

**Authorization**: Casbin RBAC with ACL model (`apps/api/casbin/`). Policies in `policy.csv.ts`, model in `model.conf.ts`. Guards (`JwtAuthGuard` + `RbacGuard`) applied at class-level on all protected controllers.

**Rate Limiting**: `@nestjs/throttler` — global 60 req/min, login 5/min, password reset 3/min.

**API Documentation**: Swagger UI at `/api/docs` — all controllers decorated with `@ApiTags` and `@ApiBearerAuth`.

**Modules** (`src/core/`):

| Module | Routes | Key Features |
|--------|--------|-------------|
| Auth | `/auth/*` | login, refresh, me, forgot-password, reset-password |
| User | `/v1/user` | CRUD |
| School | `/v1/school` | CRUD, search: name/code, filter: is_active |
| Course | `/v1/course` | CRUD, search: name, filter: grade/school_id |
| Student | `/v1/student` | CRUD, export (.xlsx), import (.xlsx), search: name/number, filter: is_active/course_id/gender |
| Attendance | `/v1/attendance` | CRUD, batch create, statistics, export (.xlsx), filter: student_id/status |
| GradeSheet | `/v1/grade-sheet` | CRUD, statistics (distribution), export (.xlsx), filter: student_id |
| Dashboard | `/v1/dashboard` | statistics (aggregated counts + today's attendance) |
| Upload | `/v1/upload` | Cloudinary image upload/delete (multipart form-data) |

**Shared infrastructure** (`src/common/`):
- `guards/` — JwtAuthGuard, LocalAuthGuard, RbacGuard
- `providers/` — Global validation pipe, exception filters, response interceptor
- `modules/authorization/` — Casbin module (register with model + policy adapter)
- `utils/prisma-query-builder.ts` — Reusable search/filter/sort/pagination builder (auto-detects boolean/number/string filter types)
- `utility.ts` — CommonUtility (hashPassword, verifyPassword with Argon2)

**Response format**: All responses wrapped by `ResponseInterceptor`:
```json
{ "statusCode": 200, "success": true, "timestamp": "...", "data": {...}, "operationTime": "...", "bytesTransferred": "..." }
```

**Route ordering rule**: Named routes (e.g., `statistics`, `export`, `batch`) must be declared BEFORE parameterized `:id` routes to avoid NestJS routing conflicts.

### Dashboard (React + Refine)

**Framework**: Refine v4 — provides CRUD operations, auth, access control, and routing out of the box.

**Key providers** (`src/providers/`):
- `authProvider.ts` — JWT auth via localStorage (`TOKEN_KEY`), handles login/logout/token expiry
- `accessControlProvider.ts` — Maps backend roles to frontend permissions
- `rest-data-provider/` — Custom Refine data provider wrapping Axios

**API client** (`src/services/api/apiClient.ts`): Axios instance with request interceptor (Bearer token injection) and response interceptor (401 redirect, error handling). Base URL from `VITE_API_URL` env var.

**Path alias**: `@` → `src/` (configured in vite.config.ts and tsconfig.json). Note: use relative imports in files that need to pass `tsc --noEmit` directly.

**Styling**: SCSS with variables auto-injected via Vite config + Styled Components.

**Pages**: Located in `src/pages/` — school and course have full CRUD pages (list/create/edit/show). Dashboard page includes statistics cards and quick export buttons.

## Environment Variables

### API (`apps/api/.env.development.local`)
- `DATABASE_URL` — PostgreSQL connection string (Neon)
- `PORT` — Server port (default 8000)
- `JWT_SECRET` — JWT signing key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — File upload service

### Dashboard (`apps/dashboard/.env.development.local`)
- `VITE_API_URL` — Backend API base URL (e.g., `http://localhost:8000/api`)

## Code Style

- **Indentation**: Tabs (displayed as 4 spaces)
- **TypeScript**: `@typescript-eslint/no-explicit-any` is disabled
- ESLint + Prettier integration via shared root config (`eslint.config.mjs`)

## Deployment

Both apps are configured for Vercel deployment. API has a `main.vercel.ts` entry point. CORS whitelist in `src/config/cors.config.ts` controls allowed origins.

## Git

- **Remote**: `git@selfhub:yishan1331/student-affairs-management.git` (GitHub, custom SSH config)
- **Branch**: `master`
- **Commit format**: `type: description` with `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

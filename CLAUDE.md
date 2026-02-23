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

### Dashboard (`apps/dashboard`)
- `npm run dev` — Vite dev server via Refine CLI
- `npm run build` — TypeScript check + Refine/Vite build

## Architecture

### API (NestJS)

**Database**: PostgreSQL on Neon, accessed via Prisma ORM.

**Data models**: User → School → Course → Student → Attendance / GradeSheet. All entities track `modifier_id` (the user who last modified) and timestamps.

**Roles** (enum): `admin`, `manager`, `staff`

**Auth flow**: Local strategy (account + password with Argon2) → JWT token issued → Bearer token auth on protected routes.

**Authorization**: Casbin RBAC with ACL model (`apps/api/casbin/`). Guards in `src/common/guards/` enforce permissions. Policy defines per-role access to API resources.

**Module pattern**: Each domain entity has its own NestJS module under `src/core/` with controller, service, DTO, and module files. Shared infrastructure lives in:
- `src/common/guards/` — JwtAuthGuard, LocalAuthGuard, RBACGuard
- `src/common/providers/` — Validation pipe, exception filters, response interceptors
- `src/common/modules/` — Authorization (Casbin) module
- `src/prisma/` — Global PrismaService and PrismaModule
- `src/config/` — Configuration factory, JWT secret, CORS whitelist

### Dashboard (React + Refine)

**Framework**: Refine v4 — provides CRUD operations, auth, access control, and routing out of the box.

**Key providers** (`src/providers/`):
- `authProvider.ts` — JWT auth via localStorage (`TOKEN_KEY`), handles login/logout/token expiry
- `accessControlProvider.ts` — Maps backend roles to frontend permissions
- `rest-data-provider/` — Custom Refine data provider wrapping Axios

**API client** (`src/services/api/apiClient.ts`): Axios instance with request interceptor (Bearer token injection) and response interceptor (401 redirect, error handling). Base URL from `VITE_API_URL` env var.

**Path alias**: `@` → `src/` (configured in both vite.config.ts and tsconfig.json)

**Styling**: SCSS with variables auto-injected via Vite config + Styled Components.

**Pages**: Located in `src/pages/` — each resource (school, course, etc.) has list/create/edit/show sub-pages following Refine conventions.

## Environment Variables

### API (`apps/api/.env`)
- `DATABASE_URL` — PostgreSQL connection string (Neon)
- `PORT` — Server port (default 8000)
- `JWT_SECRET` — JWT signing key
- `CLOUDINARY_CLOUD_NAME`, `CLOUDINARY_API_KEY`, `CLOUDINARY_API_SECRET` — File upload service

### Dashboard (`apps/dashboard/.env.development.local`)
- `VITE_API_URL` — Backend API base URL (e.g., `http://localhost:8000/api`)

## Code Style

- **Indentation**: 4 spaces (enforced by ESLint)
- **TypeScript**: `@typescript-eslint/no-explicit-any` is disabled
- ESLint + Prettier integration via shared root config (`eslint.config.mjs`)

## Deployment

Both apps are configured for Vercel deployment. API has a `main.vercel.ts` entry point. CORS whitelist in `src/config/cors.config.ts` controls allowed origins.

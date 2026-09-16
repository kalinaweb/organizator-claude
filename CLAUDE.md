# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

**Development:**
```bash
npm run dev              # Start both backend and frontend
npm run dev:backend      # Start NestJS backend (port 3001)
npm run dev:frontend     # Start Next.js frontend (port 3000)
```

**Building:**
```bash
npm run build            # Build both backend and frontend
npm run build:backend    # Build NestJS backend
npm run build:frontend   # Build Next.js frontend
```

**Linting and Formatting:**
```bash
npm run lint             # Lint all workspaces
npm run format           # Format code with Prettier
```

**Prisma (Backend):**
```bash
npm run prisma:generate --workspace=@todo-app/backend   # Generate Prisma client
npm run prisma:migrate --workspace=@todo-app/backend    # Run migrations
npm run prisma:studio --workspace=@todo-app/backend     # Open Prisma Studio
```

## Architecture

### Monorepo Structure
This is an npm workspaces monorepo with three packages:
- `apps/frontend` - Next.js 15 frontend with App Router
- `apps/backend` - NestJS 10 backend with Prisma ORM
- `packages/shared` - Shared TypeScript types used by both apps

The shared package is transpiled and referenced via `transpilePackages: ['@todo-app/shared']` in `next.config.js`.

### Data Model
Hierarchical structure with cascade deletes enforced at database level:

```
User → Page → List → Task
```

Each entity has an `order` field (List, Task) for user-defined ordering. All delete operations cascade down the hierarchy automatically via Prisma's `onDelete: Cascade`.

### Authentication
- JWT-based authentication with passport-jwt strategy
- Tokens stored in localStorage on frontend
- axios interceptor adds `Authorization: Bearer <token>` headers automatically
- 401 responses redirect to `/login`
- User ownership verification at each service layer (PagesService, ListsService, TasksService) to prevent cross-user data access

### Backend Modules
NestJS modules are organized by resource:
- `AuthModule` - User registration, login, JWT strategy
- `PagesModule` - CRUD operations for pages (verifies userId)
- `ListsModule` - CRUD operations for lists (verifies page ownership)
- `TasksModule` - CRUD operations for tasks (verifies list ownership)
- `PrismaModule` - Global Prisma client

Each service verifies ownership chain: Tasks check List ownership, Lists check Page ownership, Pages check User ownership.

### Frontend Architecture
- App Router structure (`app/` directory)
- Material-UI components with Tailwind CSS (preflight disabled to avoid conflicts)
- React Hook Form + Zod for form validation
- API client in `lib/api.ts` with axios interceptors
- Protected routes checked client-side (redirect to login if no token)

### Type Safety
Shared types in `packages/shared/src/types/index.ts` define interfaces for:
- User, Page, List, Task entities
- DTOs: CreatePageDto, UpdatePageDto, CreateListDto, UpdateListDto, CreateTaskDto, UpdateTaskDto, RegisterDto, LoginDto

Backend uses class-validator and class-transformer decorators; frontend uses Zod schemas.

## Setup Requirements
Before first run:
1. Install dependencies: `npm install`
2. Configure PostgreSQL connection in `apps/backend/.env` with `DATABASE_URL`
3. Generate Prisma client: `npm run prisma:generate --workspace=@todo-app/backend`
4. Run migrations: `npm run prisma:migrate --workspace=@todo-app/backend`

## Important Notes
- Backend port 3001, frontend port 3000 (hardcoded in `lib/api.ts`)
- All passwords are hashed with bcryptjs before storage
- No dependencies have been installed yet - project contains only file structure
- Documentation is in Russian (README.md)

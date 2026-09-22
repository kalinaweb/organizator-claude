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
- **Feature-Sliced Design (FSD)**: Architecture methodology organizing code by business features
  - `features/` - Business features (e.g., `features/auth/` for authentication)
  - Each feature contains: `ui/` (components), `model/` (hooks/state), `api/` (API calls), `index.ts` (public exports)
  - Pages in `app/` directory import from features via barrel exports
- App Router structure (`app/` directory) with Next.js 15
- Material-UI components with Tailwind CSS (preflight disabled to avoid conflicts)
- React Hook Form + Zod for form validation (@hookform/resolvers for integration)
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

## Feature Structure (Feature-Sliced Design)
Example feature structure (`features/auth/`):
```
features/auth/
├── index.ts              # Public API (exports)
├── ui/
│   ├── LoginForm.tsx     # Login component
│   └── RegisterForm.tsx  # Registration component
├── model/
│   └── useAuth.ts        # Authentication hook
└── api/
    └── authApi.ts        # Auth API methods
```

Pages consume features via their public exports:
```tsx
import { LoginForm } from '@/features/auth';
```

## Commit Conventions
This project follows conventional commits with messages in Russian:

**Format:**
```
<type>: <краткое описание>

<подробное описание изменений>
- список изменений
- ...

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

**Types:**
- `feat` - новая функциональность
- `fix` - исправление бага
- `refactor` - рефакторинг без изменения функциональности
- `docs` - изменения в документации
- `style` - форматирование кода (без изменения логики)
- `test` - добавление или обновление тестов
- `chore` - обновление зависимостей, конфигурации

**Examples:**
```bash
# Feature commit
git commit -m "feat: добавлена функциональность регистрации

Реализована полная система аутентификации с JWT
- Добавлены страницы /login и /register
- Создана feature auth по FSD методологии
- Настроен axios interceptor

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"

# Bug fix commit
git commit -m "fix: исправлена ошибка валидации email

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"
```

## Branching Workflow (GitHub Flow)

This project follows **GitHub Flow** for feature development:

**Branch Naming:**
```
feature/<feature-name>       # New features
fix/<bug-description>        # Bug fixes
refactor/<component-name>    # Refactoring
docs/<update-description>    # Documentation updates
```

**Workflow:**
1. **Create feature branch** from `main`:
   ```bash
   git checkout main
   git pull origin main
   git checkout -b feature/feature-name
   ```

2. **Work on feature**: Make commits following commit conventions

3. **Push and create Pull Request**:
   ```bash
   git push -u origin feature/feature-name
   gh pr create --title "feat: краткое описание" --body "Описание изменений"
   ```

4. **Code Review**: Wait for review approval

5. **Merge to main**: Squash and merge via GitHub UI

6. **Delete feature branch** after merge:
   ```bash
   git checkout main
   git pull origin main
   git branch -d feature/feature-name
   ```

**Branch Protection:**
- Always work in feature branches, never commit directly to `main`
- `main` branch is the stable branch for production-ready code
- Create PR for every feature/fix before merging to `main`

## Important Notes
- Backend port 3001, frontend port 3000 (hardcoded in `lib/api.ts`)
- All passwords are hashed with bcryptjs before storage
- Documentation is in Russian (README.md)
- Auth pages implemented: `/login` and `/register` with MUI forms

# Developer Guide

Руководство для разработчиков, работающих над Todo App.

## Содержание

- [Быстрый старт](#быстрый-старт)
- [Настройка окружения](#настройка-окружения)
- [Структура проекта](#структура-проекта)
- [Разработка Frontend](#разработка-frontend)
- [Разработка Backend](#разработка-backend)
- [Работа с базой данных](#работа-с-базой-данных)
- [Тестирование](#тестирование)
- [Git workflow](#git-workflow)
- [Code Review](#code-review)
- [Деплой](#деплой)
- [Troubleshooting](#troubleshooting)
---

## Быстрый старт

### Предварительные требования

- **Node.js** >= 18.x (рекомендуется 20.x)
- **npm** >= 9.x
- **PostgreSQL** >= 14.x
- **Git**

### Первый запуск

```bash
# 1. Клонировать репозиторий
git clone <repository-url>
cd todo

# 2. Установить зависимости
npm install

# 3. Настроить PostgreSQL
# Создать базу данных
createdb todo_db

# 4. Настроить backend environment
cd apps/backend
cp .env.example .env
# Отредактировать .env с вашими настройками БД

# 5. Запустить миграции
npm run prisma:migrate --workspace=@todo-app/backend

# 6. Сгенерировать Prisma Client
npm run prisma:generate --workspace=@todo-app/backend

# 7. Вернуться в root и запустить приложение
cd ../..
npm run dev
```

Приложение запустится:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Documentation**: см. `.claude/docs/api.md`

---

## Настройка окружения

### Environment Variables

#### Backend (`apps/backend/.env`)

```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/todo_db"

# JWT
JWT_SECRET="your-secret-key-change-in-production"

# Server
PORT=3001
```

**Важно:** Никогда не коммитьте `.env` файлы! Они в `.gitignore`.

#### Frontend (`apps/frontend/.env.local`)

```env
# API URL
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

По умолчанию используется `http://localhost:3001/api`, если переменная не задана.

### IDE Setup

#### VS Code

Рекомендуемые расширения:
```json
{
  "recommendations": [
    "dbaeumer.vscode-eslint",
    "esbenp.prettier-vscode",
    "prisma.prisma",
    "bradlc.vscode-tailwindcss"
  ]
}
```

Настройки workspace (`.vscode/settings.json`):
```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "[prisma]": {
    "editor.defaultFormatter": "prisma.prisma"
  }
}
```

---

## Структура проекта

### Монорепозиторий (npm workspaces)

```
todo-app/
├── apps/
│   ├── frontend/              # Next.js приложение
│   │   ├── src/
│   │   │   ├── app/          # Next.js App Router pages
│   │   │   ├── features/     # Бизнес-фичи (FSD)
│   │   │   ├── shared/       # Общие компоненты
│   │   │   └── lib/          # Утилиты (axios config и др.)
│   │   ├── public/           # Статические файлы
│   │   └── package.json
│   │
│   └── backend/               # NestJS API
│       ├── src/
│       │   ├── auth/         # Аутентификация
│       │   ├── pages/        # Pages CRUD
│       │   ├── lists/        # Lists CRUD
│       │   ├── tasks/        # Tasks CRUD
│       │   └── prisma/       # Prisma service
│       ├── prisma/
│       │   ├── schema.prisma # Database schema
│       │   └── migrations/   # Database migrations
│       └── package.json
│
├── packages/
│   └── shared/                # Общие TypeScript типы
│       └── src/
│           └── types/
│               └── index.ts   # Интерфейсы для entities и DTOs
│
├── .claude/
│   └── docs/                  # Техническая документация
│       ├── architecture.md
│       ├── api.md
│       ├── database.md
│       └── developer-guide.md
│
├── CLAUDE.md                  # Общие инструкции для AI
├── REVIEW.md                  # Правила Code Review
├── README.md                  # Описание проекта
└── package.json               # Root workspace config
```

### Workspace Commands

Команды из root директории:

```bash
# Запуск dev серверов
npm run dev                   # Frontend + Backend одновременно
npm run dev:frontend          # Только Frontend
npm run dev:backend           # Только Backend

# Build
npm run build                 # Собрать всё
npm run build:frontend        # Собрать Frontend
npm run build:backend         # Собрать Backend

# Линтинг и форматирование
npm run lint                  # ESLint для всех workspaces
npm run format                # Prettier для всех файлов

# Работа с конкретным workspace
npm run <script> --workspace=@todo-app/frontend
npm run <script> --workspace=@todo-app/backend
npm run <script> --workspace=@todo-app/shared
```

---

## Разработка Frontend

### Технологии

- **Next.js 15** (App Router)
- **React 18**
- **Material-UI (MUI)** для компонентов
- **Tailwind CSS** для стилизации
- **React Hook Form + Zod** для форм
- **Axios** для HTTP запросов

### Feature-Sliced Design (FSD)

Каждая бизнес-функция изолирована в фиче с такой структурой:

```
features/<feature-name>/
├── index.ts          # Публичный API (barrel export)
├── ui/               # React компоненты
├── api/              # API методы
├── model/            # Hooks, состояние
└── types/            # Типы специфичные для фичи
```

**Правила импортов:**
```typescript
// ✅ Правильно — через публичный API
import { LoginForm } from '@/features/auth';

// ❌ Неправильно — прямой импорт
import { LoginForm } from '@/features/auth/ui/LoginForm';
```

### Создание новой фичи

1. Создать директорию в `src/features/<feature-name>/`
2. Создать слои: `ui/`, `api/`, `model/`, `types/`
3. Экспортировать публичный API через `index.ts`:

```typescript
// features/my-feature/index.ts
export { MyComponent } from './ui/MyComponent';
export { useMyFeature } from './model/useMyFeature';
export { myApi } from './api/myApi';
export type { MyFeatureData } from './types';
```

### Работа с API

Использовать настроенный `api` instance из `lib/api.ts`:

```typescript
import { api } from '@/lib/api';

// GET запрос
const response = await api.get('/pages');
const pages = response.data;

// POST запрос
const response = await api.post('/pages', { title: 'New Page' });

// JWT токен добавляется автоматически через interceptor
```

### Формы с валидацией

```typescript
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export function MyForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    await api.post('/endpoint', data);
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <TextField
        {...register('title')}
        error={!!errors.title}
        helperText={errors.title?.message}
      />
      <Button type="submit">Submit</Button>
    </form>
  );
}
```

### Типы из shared пакета

```typescript
import type { User, Page, List, Task } from '@todo-app/shared';
import type { CreatePageDto, UpdatePageDto } from '@todo-app/shared';

// Использовать в компонентах
interface Props {
  page: Page;
  onUpdate: (data: UpdatePageDto) => void;
}
```

---

## Разработка Backend

### Технологии

- **NestJS 10**
- **Prisma ORM**
- **Passport JWT** для аутентификации
- **class-validator** для валидации
- **bcryptjs** для хеширования паролей

### Создание нового модуля

```bash
cd apps/backend

# Сгенерировать модуль, контроллер, сервис
npx nest g module <name>
npx nest g controller <name>
npx nest g service <name>
```

### Структура модуля

```typescript
// <name>.module.ts
import { Module } from '@nestjs/common';
import { NameController } from './<name>.controller';
import { NameService } from './<name>.service';

@Module({
  controllers: [NameController],
  providers: [NameService],
})
export class NameModule {}
```

```typescript
// <name>.controller.ts
import { Controller, Get, Post, Body, UseGuards, Request } from '@nestjs/common';
import { NameService } from './<name>.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('name')
@UseGuards(JwtAuthGuard)  // Защита всех endpoints JWT
export class NameController {
  constructor(private nameService: NameService) {}

  @Get()
  findAll(@Request() req) {
    return this.nameService.findAll(req.user.id);
  }

  @Post()
  create(@Request() req, @Body() dto: CreateDto) {
    return this.nameService.create(req.user.id, dto);
  }
}
```

```typescript
// <name>.service.ts
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class NameService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.entity.findMany({
      where: { userId },
    });
  }

  async findOne(id: string, userId: string) {
    const entity = await this.prisma.entity.findFirst({
      where: { id, userId },  // Проверка владения
    });

    if (!entity) {
      throw new NotFoundException('Entity not found');
    }

    return entity;
  }
}
```

### Валидация DTO

```typescript
import { IsString, IsEmail, MinLength, IsOptional } from 'class-validator';

export class CreateDto {
  @IsString()
  @MinLength(1)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;
}
```

### Безопасность

**Обязательно для каждого protected endpoint:**

1. Применить `@UseGuards(JwtAuthGuard)` к контроллеру или методу
2. В сервисе проверить владение ресурса через `userId`:

```typescript
// ✅ Правильно
async findOne(id: string, userId: string) {
  const resource = await this.prisma.resource.findFirst({
    where: { id, userId }  // Проверка владения
  });

  if (!resource) {
    throw new NotFoundException('Resource not found');
  }

  return resource;
}

// ❌ Неправильно — отсутствует проверка владения
async findOne(id: string) {
  return this.prisma.resource.findUnique({ where: { id } });
}
```

3. Для вложенных ресурсов проверять через цепочку:

```typescript
// Task → List → Page → User
const task = await this.prisma.task.findUnique({
  where: { id },
  include: {
    list: {
      include: { page: true }
    }
  }
});

if (!task || task.list.page.userId !== userId) {
  throw new NotFoundException('Task not found');
}
```

### Хеширование паролей

```typescript
import * as bcrypt from 'bcryptjs';

// Хеширование при регистрации
const hashedPassword = await bcrypt.hash(password, 10);

// Проверка при логине
const isValid = await bcrypt.compare(password, user.password);
```

---

## Работа с базой данных

### Prisma Commands

```bash
# Генерация Prisma Client (после изменения schema.prisma)
npm run prisma:generate --workspace=@todo-app/backend

# Создание миграции
cd apps/backend
npx prisma migrate dev --name <migration-name>

# Применение миграций (production)
npx prisma migrate deploy

# Открыть Prisma Studio (GUI для БД)
npm run prisma:studio --workspace=@todo-app/backend

# Форматирование schema.prisma
npx prisma format
```

### Изменение схемы БД

1. Отредактировать `apps/backend/prisma/schema.prisma`
2. Создать миграцию: `npx prisma migrate dev --name <name>`
3. Регенерировать Client: `npm run prisma:generate --workspace=@todo-app/backend`
4. Обновить TypeScript типы в `packages/shared/src/types/index.ts` (при необходимости)

### Prisma Query Examples

```typescript
// Создание
const page = await prisma.page.create({
  data: {
    title: 'New Page',
    userId: 'uuid',
  },
});

// Чтение с include
const page = await prisma.page.findUnique({
  where: { id: 'uuid' },
  include: {
    lists: {
      orderBy: { order: 'asc' },
      include: {
        tasks: true,
      },
    },
  },
});

// Обновление
const updated = await prisma.page.update({
  where: { id: 'uuid' },
  data: { title: 'Updated Title' },
});

// Удаление
await prisma.page.delete({
  where: { id: 'uuid' },
});

// Фильтрация
const pages = await prisma.page.findMany({
  where: { userId: 'uuid' },
  orderBy: { createdAt: 'desc' },
});
```

---

## Тестирование

### Unit Tests (TODO)

Пока не реализованы. Рекомендуется добавить:
- **Frontend**: Jest + React Testing Library
- **Backend**: Jest + Supertest

### Manual Testing

```bash
# Запустить приложение
npm run dev

# Frontend: http://localhost:3000
# Backend: http://localhost:3001

# Тестовые сценарии:
# 1. Регистрация нового пользователя
# 2. Вход в систему
# 3. Создание страницы
# 4. Создание списка
# 5. Создание задачи
# 6. Обновление задачи
# 7. Удаление ресурсов (каскадное удаление)
```

### API Testing (cURL / Postman)

Примеры в `.claude/docs/api.md`.

---

## Git Workflow

### Branching Strategy: GitHub Flow

```bash
# 1. Создать feature branch от main
git checkout main
git pull origin main
git checkout -b feature/feature-name

# 2. Работать над фичей, делать коммиты
git add .
git commit -m "feat: добавлена новая функциональность

Подробное описание изменений
- список изменений

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>"

# 3. Push и создание PR
git push -u origin feature/feature-name
gh pr create --title "feat: краткое описание" --body "Описание изменений"

# 4. После одобрения PR — merge через GitHub UI (Squash and merge)

# 5. Удалить ветку после merge
git checkout main
git pull origin main
git branch -d feature/feature-name
```

### Commit Message Convention

Формат: Conventional Commits на русском языке

```
<type>: <краткое описание>

<подробное описание изменений>
- список изменений
- ...

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

**Types:**
- `feat` — новая функциональность
- `fix` — исправление бага
- `refactor` — рефакторинг без изменения функциональности
- `docs` — изменения в документации
- `style` — форматирование кода
- `test` — добавление/обновление тестов
- `chore` — обновление зависимостей, конфигурации

**Примеры:**
```bash
feat: добавлена аутентификация через JWT

Реализована полная система аутентификации
- JWT стратегия с passport
- Auth guard для защиты endpoints
- Хеширование паролей через bcryptjs

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

```bash
fix: исправлена проверка владения в TasksService

Добавлена проверка userId через цепочку task → list → page

Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>
```

---

## Code Review

### Чек-лист ревьюера

См. полный чек-лист в `REVIEW.md`.

**Ключевые моменты:**

1. **Безопасность (блокирующие):**
   - JWT guard на protected endpoints
   - Проверка владения ресурса в сервисах
   - Хеширование паролей
   - Нет утечки конфиденциальных данных

2. **Архитектура:**
   - FSD методология на frontend
   - Импорты через публичный API фич
   - Модульная структура NestJS
   - Типы из `@todo-app/shared`

3. **Код:**
   - TypeScript без `any`
   - Нет дублирования кода
   - Понятные имена переменных/функций
   - JSDoc для public API

4. **Git:**
   - Commit message по conventional commits
   - Attribution строка присутствует
   - PR description описывает изменения

### Комментарии в PR

Формат: `[Тип] Описание проблемы`

**Типы:**
- `[CRITICAL]` — блокирующая проблема
- `[BUG]` — потенциальный баг
- `[ARCH]` — нарушение архитектуры
- `[STYLE]` — несоответствие code style
- `[SUGGESTION]` — необязательное улучшение

---

## Деплой

### Production Checklist

- [ ] Изменить `JWT_SECRET` в production `.env`
- [ ] Настроить production `DATABASE_URL`
- [ ] Убедиться что `.env` не коммитится
- [ ] Запустить миграции: `npx prisma migrate deploy`
- [ ] Настроить CORS для production домена
- [ ] Настроить HTTPS
- [ ] Настроить environment variables на хостинге
- [ ] Провести smoke testing после деплоя

### Build для production

```bash
# Build всех приложений
npm run build

# Frontend будет в apps/frontend/.next
# Backend будет в apps/backend/dist
```

### Deployment платформы (рекомендации)

**Frontend:**
- Vercel (рекомендуется для Next.js)
- Netlify
- AWS Amplify

**Backend:**
- Railway
- Render
- Heroku
- AWS ECS / EB

**Database:**
- Railway PostgreSQL
- Supabase
- AWS RDS
- Heroku Postgres

---

## Troubleshooting

### Проблемы с установкой зависимостей

```bash
# Очистить node_modules и lock файлы
rm -rf node_modules package-lock.json
rm -rf apps/*/node_modules apps/*/package-lock.json
rm -rf packages/*/node_modules packages/*/package-lock.json

# Переустановить
npm install
```

### Prisma Client не генерируется

```bash
# Убедитесь что вы в правильной директории
cd apps/backend

# Регенерировать
npx prisma generate

# Проверить что schema.prisma валиден
npx prisma format
npx prisma validate
```

### Backend не подключается к БД

1. Проверить что PostgreSQL запущен: `psql -U username -d todo_db`
2. Проверить `DATABASE_URL` в `.env`
3. Проверить что БД существует: `psql -l`
4. Создать БД если нужно: `createdb todo_db`
5. Запустить миграции: `npx prisma migrate dev`

### Frontend не видит Backend API

1. Убедиться что Backend запущен на порту 3001
2. Проверить `NEXT_PUBLIC_API_URL` в `.env.local` (или использовать дефолт)
3. Проверить что CORS включен в `main.ts`: `app.enableCors()`
4. Проверить Network tab в DevTools для деталей ошибки

### JWT токен не работает

1. Убедиться что токен сохраняется в `localStorage`:
   ```javascript
   localStorage.getItem('token')
   ```
2. Проверить что axios interceptor добавляет заголовок:
   ```javascript
   // Смотреть в Network tab: Authorization: Bearer <token>
   ```
3. Проверить что `JWT_SECRET` одинаковый при генерации и валидации токена
4. Проверить что токен не просрочен (если установлен `expiresIn`)

### "Module not found" ошибки

Если TypeScript не находит модули из `@todo-app/shared`:

```bash
# Пересобрать shared пакет
npm run build --workspace=@todo-app/shared

# Или перезапустить dev сервер
npm run dev
```

### Hot reload не работает

```bash
# Перезапустить dev сервер
npm run dev

# Очистить .next кеш
rm -rf apps/frontend/.next
```

---

## Полезные команды

### Git

```bash
git status                    # Статус репозитория
git log --oneline -10         # Последние 10 коммитов
git diff                      # Изменения в рабочей директории
git stash                     # Сохранить изменения временно
git stash pop                 # Восстановить сохранённые изменения
```

### npm

```bash
npm list                      # Список установленных пакетов
npm outdated                  # Устаревшие пакеты
npm update                    # Обновить пакеты
```

### PostgreSQL

```bash
psql -U username -d todo_db   # Подключиться к БД
\dt                           # Список таблиц
\d <table_name>               # Схема таблицы
\q                            # Выход
```

---

## Дополнительные ресурсы

npm outdated                  # Устаревшие пакеты
npm update                    # Обновить пакеты
```

### PostgreSQL

```bash
psql -U username -d todo_db   # Подключиться к БД
\dt                           # Список таблиц
\d <table_name>               # Схема таблицы
\q                            # Выход
```

---

## Дополнительные ресурсы

### Документация

- [Architecture](./architecture.md) — архитектура проекта
- [API](./api.md) — описание REST API
- [Database](./database.md) — схема БД
- [REVIEW.md](../../REVIEW.md) — правила Code Review
- [CLAUDE.md](../../CLAUDE.md) — инструкции для AI

### Внешние ресурсы

- [Next.js Docs](https://nextjs.org/docs)
- [NestJS Docs](https://docs.nestjs.com/)
- [Prisma Docs](https://www.prisma.io/docs)
- [Material-UI Docs](https://mui.com/)
- [Feature-Sliced Design](https://feature-sliced.design/)

---

## Контакты и поддержка

- **Issues**: создавайте issue в GitHub для багов и feature requests
- **Pull Requests**: следуйте Git workflow и правилам Code Review
- **Вопросы**: используйте Discussions в GitHub

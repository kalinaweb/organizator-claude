# Архитектура проекта Todo App

## Обзор

Todo App — монорепозиторий, построенный на npm workspaces, объединяющий три пакета:
- **Frontend** — Next.js 15 с App Router и Material-UI
- **Backend** — NestJS 10 с Prisma ORM и PostgreSQL
- **Shared** — общие TypeScript-типы для фронтенда и бэкенда

## Структура монорепозитория

```
todo-app/
├── apps/
│   ├── frontend/         # Next.js приложение (порт 3000)
│   └── backend/          # NestJS API (порт 3001)
├── packages/
│   └── shared/           # Общие TypeScript типы
├── package.json          # Root workspace config
└── CLAUDE.md             # Документация для AI-ассистентов
```

## Frontend архитектура

### Стек технологий
- **Next.js 15** с App Router (`app/` directory)
- **React 18** с серверными и клиентскими компонентами
- **Material-UI (MUI)** для UI-компонентов
- **Tailwind CSS** для стилизации (preflight отключен)
- **React Hook Form + Zod** для форм и валидации
- **Axios** для HTTP-запросов с interceptors

### Feature-Sliced Design (FSD)

Frontend организован по методологии FSD — каждая бизнес-функция изолирована в отдельной "фиче":

```
src/
├── app/                  # Next.js App Router
│   ├── layout.tsx        # Root layout с MUI providers
│   ├── providers.tsx     # Client-side providers
│   ├── login/            # Страница входа
│   └── register/         # Страница регистрации
├── features/             # Бизнес-фичи (FSD)
│   └── auth/
│       ├── index.ts      # Публичный API фичи (barrel export)
│       ├── ui/           # React компоненты
│       ├── api/          # API методы
│       └── types/        # Типы специфичные для фичи
├── shared/               # Общие утилиты
│   └── ui/               # Переиспользуемые UI-компоненты
└── lib/
    └── api.ts            # Настроенный axios instance
```

**Правила FSD:**
- Каждая фича экспортирует публичный API через `index.ts`
- Импорты из фич только через публичный API: `import { LoginForm } from '@/features/auth'`
- Прямые импорты из внутренних слоёв запрещены

### Axios interceptors

HTTP-клиент настроен в `lib/api.ts`:
- **Request interceptor** — автоматически добавляет JWT токен из `localStorage` в заголовок `Authorization: Bearer <token>`
- **Response interceptor** — при 401 ошибке удаляет токен и редиректит на `/login`

### Аутентификация на frontend

- JWT токен хранится в `localStorage` (ключ `'token'`)
- Компонент `ProtectedRoute` проверяет наличие токена и редиректит на `/login` при его отсутствии
- Axios автоматически добавляет токен во все запросы

## Backend архитектура

### Стек технологий
- **NestJS 10** — прогрессивный Node.js фреймворк
- **Prisma ORM** — type-safe доступ к PostgreSQL
- **Passport JWT** — стратегия аутентификации
- **bcryptjs** — хеширование паролей
- **class-validator** — валидация DTO

### Модульная структура

```
src/
├── main.ts               # Entry point
├── app.module.ts         # Root module
├── prisma/               # Prisma service (глобальный)
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── auth/                 # Аутентификация
│   ├── auth.module.ts
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── strategies/
│   │   └── jwt.strategy.ts
│   └── guards/
│       └── jwt-auth.guard.ts
├── pages/                # CRUD для страниц
│   ├── pages.module.ts
│   ├── pages.controller.ts
│   └── pages.service.ts
├── lists/                # CRUD для списков
│   ├── lists.module.ts
│   ├── lists.controller.ts
│   └── lists.service.ts
└── tasks/                # CRUD для задач
    ├── tasks.module.ts
    ├── tasks.controller.ts
    └── tasks.service.ts
```

### Иерархия данных

Приложение реализует строгую иерархию владения:

```
User → Page → List → Task
```

**Принципы:**
- Каждый ресурс принадлежит пользователю через цепочку владения
- Удаление верхнего уровня каскадно удаляет вложенные ресурсы (на уровне БД)
- Каждый сервис проверяет владение перед операциями изменения/удаления

### Безопасность и проверка владения

**Многоуровневая защита:**

1. **JWT Guard на контроллерах** — все endpoints защищены `@UseGuards(JwtAuthGuard)`, проверяющим валидность токена
2. **Извлечение userId** — `JwtStrategy` декодирует токен и устанавливает `req.user.id`
3. **Проверка владения в сервисах** — каждый метод сервиса верифицирует принадлежность ресурса пользователю

**Примеры проверки:**
```typescript
// PagesService — прямая проверка
const page = await this.prisma.page.findFirst({
  where: { id, userId }
});

// ListsService — проверка через родительскую page
const list = await this.prisma.list.findUnique({
  where: { id },
  include: { page: true }
});
if (!list || list.page.userId !== userId) {
  throw new NotFoundException('List not found');
}

// TasksService — проверка через цепочку list → page
const task = await this.prisma.task.findUnique({
  where: { id },
  include: { list: { include: { page: true } } }
});
if (!task || task.list.page.userId !== userId) {
  throw new NotFoundException('Task not found');
}
```

### JWT аутентификация

**Механизм:**
1. Пользователь отправляет `email` + `password` на `/auth/login`
2. `AuthService` проверяет пароль через `bcrypt.compare()`
3. При успехе генерируется JWT токен с payload: `{ sub: userId, email }`
4. Токен возвращается клиенту в поле `accessToken`
5. Клиент сохраняет токен и передаёт его в заголовке `Authorization: Bearer <token>`
6. `JwtStrategy` валидирует токен и извлекает `userId`

**Настройка JWT:**
- Secret: `process.env.JWT_SECRET` (по умолчанию `'your-secret-key'`)
- Срок жизни токена: не ограничен (можно добавить `expiresIn`)
- Алгоритм: HS256 (по умолчанию в `@nestjs/jwt`)

### Валидация данных

**Global ValidationPipe:**
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,      // Удаляет поля не описанные в DTO
  transform: true,      // Автоматическая трансформация типов
}));
```

**DTO с декораторами class-validator:**
```typescript
export class CreatePageDto {
  @IsString()
  @MinLength(1)
  title: string;
}
```

## Shared Package

### Назначение
Пакет `@todo-app/shared` содержит общие TypeScript-типы, используемые и фронтендом, и бэкендом:
- Интерфейсы entities: `User`, `Page`, `List`, `Task`
- DTO интерфейсы: `CreatePageDto`, `UpdatePageDto`, `LoginDto`, `RegisterDto` и др.

### Интеграция
- **Backend** — импортирует типы как базу для DTO классов с декораторами
- **Frontend** — импортирует типы напрямую + использует для Zod схем
- **Транспиляция** — Next.js транспилирует shared пакет через `transpilePackages: ['@todo-app/shared']` в `next.config.js`

## Базы данных и ORM

### Prisma ORM
- **Schema** — определён в `apps/backend/prisma/schema.prisma`
- **Client** — генерируется командой `npm run prisma:generate --workspace=@todo-app/backend`
- **Миграции** — управляются через `npx prisma migrate dev`
- **Prisma Studio** — GUI для просмотра БД: `npm run prisma:studio --workspace=@todo-app/backend`

### Каскадное удаление
Настроено на уровне БД через `onDelete: Cascade` в Prisma schema:
```prisma
model Page {
  user   User   @relation(fields: [userId], references: [id], onDelete: Cascade)
  lists  List[]
}

model List {
  page  Page   @relation(fields: [pageId], references: [id], onDelete: Cascade)
  tasks Task[]
}

model Task {
  list List @relation(fields: [listId], references: [id], onDelete: Cascade)
}
```

При удалении страницы автоматически удаляются все списки и задачи без дополнительного кода в сервисах.

## Паттерны проектирования

### Dependency Injection (NestJS)
Все зависимости инжектируются через конструкторы:
```typescript
@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}
}
```

### Repository Pattern (Prisma)
`PrismaService` выступает как универсальный репозиторий, предоставляя type-safe доступ к entities через `this.prisma.page`, `this.prisma.list` и т.д.

### Guard Pattern (NestJS)
`JwtAuthGuard` реализует паттерн Guard для защиты роутов:
```typescript
@Controller('pages')
@UseGuards(JwtAuthGuard)
export class PagesController { }
```

### Strategy Pattern (Passport)
Аутентификация реализована через `JwtStrategy`, расширяющую `PassportStrategy`:
```typescript
export class JwtStrategy extends PassportStrategy(Strategy) {
  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

## Взаимодействие Frontend ↔ Backend

### Типичный флоу запроса

1. **Пользователь** взаимодействует с React-компонентом (например, создаёт страницу)
2. **Компонент** вызывает метод из `features/*/api/` (например, `createPage()`)
3. **API метод** использует `api` instance (axios) для отправки запроса
4. **Axios interceptor** добавляет JWT токен в заголовок
5. **NestJS контроллер** получает запрос, `JwtAuthGuard` проверяет токен
6. **JwtStrategy** извлекает `userId` из токена и устанавливает `req.user`
7. **Контроллер** вызывает метод сервиса, передавая `userId`
8. **Сервис** проверяет владение ресурса и выполняет операцию через Prisma
9. **Prisma** выполняет SQL-запрос к PostgreSQL
10. **Ответ** возвращается через цепочку: Prisma → Service → Controller → HTTP → Axios → Frontend

### Обработка ошибок

**Backend:**
- `NotFoundException` → HTTP 404
- `UnauthorizedException` → HTTP 401
- Validation errors → HTTP 400
- Unhandled exceptions → HTTP 500

**Frontend:**
- HTTP 401 → axios interceptor удаляет токен и редиректит на `/login`
- HTTP 4xx/5xx → обрабатываются в компонентах через `try/catch`

## Конфигурация окружения

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@localhost:5432/todo_db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

### Frontend (.env.local)
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

По умолчанию frontend использует `http://localhost:3001/api`, если переменная не задана.

## Development Workflow

### Запуск приложения
```bash
# Одновременный запуск frontend + backend
npm run dev

# Раздельный запуск
npm run dev:frontend    # http://localhost:3000
npm run dev:backend     # http://localhost:3001
```

### Работа с БД
```bash
# Генерация Prisma Client после изменений schema
npm run prisma:generate --workspace=@todo-app/backend

# Создание и применение миграции
cd apps/backend
npx prisma migrate dev --name migration_name

# Открыть Prisma Studio
npm run prisma:studio --workspace=@todo-app/backend
```

### Линтинг и форматирование
```bash
npm run lint      # ESLint для всех workspaces
npm run format    # Prettier для всех файлов
```

## Production Deployment

### Build
```bash
npm run build              # Сборка всех приложений
npm run build:frontend     # Next.js production build
npm run build:backend      # NestJS production build
```

### Checklist перед деплоем
- [ ] Изменить `JWT_SECRET` в production окружении
- [ ] Настроить реальный `DATABASE_URL` для PostgreSQL
- [ ] Убедиться, что `.env` не коммитится в git
- [ ] Запустить миграции на production БД
- [ ] Настроить CORS для production домена
- [ ] Настроить HTTPS для API и frontend

## Масштабирование

### Горизонтальное масштабирование
- **Frontend** — stateless, легко масштабируется через CDN/load balancer
- **Backend** — stateless (JWT токены без сессий), можно запускать несколько инстансов за load balancer
- **Database** — PostgreSQL с read replicas для чтения

### Кэширование
Текущая архитектура не использует кэширование. Потенциальные точки для кэша:
- Redis для сессий (если перейти с JWT на session-based auth)
- Query results caching в Prisma
- HTTP response caching в Next.js

### Мониторинг
Рекомендуется добавить:
- Логирование через Winston/Pino (NestJS)
- APM мониторинг (New Relic, Datadog)
- Health checks endpoints (`/health`, `/metrics`)
- Prisma query logging в production

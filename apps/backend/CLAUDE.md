# Backend Documentation

## Architecture Overview
- **NestJS 10** - прогрессивный Node.js фреймворк
- **Prisma ORM** - type-safe работа с PostgreSQL
- **JWT Authentication** - passport-jwt стратегия
- **bcryptjs** - хеширование паролей
- **class-validator** и **class-transformer** - валидация и трансформация DTO
- **TypeScript** с общими типами из `@todo-app/shared`

## Структура проекта
```
apps/backend/
├── src/
│   ├── main.ts                    # Entry point
│   ├── app.module.ts              # Root module
│   ├── prisma/                    # Prisma module
│   │   ├── prisma.module.ts
│   │   └── prisma.service.ts
│   ├── auth/                      # Authentication
│   │   ├── auth.module.ts
│   │   ├── auth.controller.ts
│   │   ├── auth.service.ts
│   │   ├── strategies/
│   │   │   └── jwt.strategy.ts
│   │   └── guards/
│   │       └── jwt-auth.guard.ts
│   ├── pages/                     # Pages CRUD
│   │   ├── pages.module.ts
│   │   ├── pages.controller.ts
│   │   └── pages.service.ts
│   ├── lists/                     # Lists CRUD
│   │   ├── lists.module.ts
│   │   ├── lists.controller.ts
│   │   └── lists.service.ts
│   └── tasks/                     # Tasks CRUD
│       ├── tasks.module.ts
│       ├── tasks.controller.ts
│       └── tasks.service.ts
├── prisma/
│   └── schema.prisma              # Database schema
└── .env                           # Environment variables
```

## NestJS Modules

### AuthModule
Аутентификация и регистрация пользователей:
- `POST /api/auth/register` - регистрация нового пользователя
- `POST /api/auth/login` - вход в систему
- JWT стратегия с passport-jwt
- Пароли хешируются через bcryptjs (salt rounds: 10)

**Ключевые файлы:**
- `auth.service.ts` - бизнес-логика: register, login, validateUser
- `jwt.strategy.ts` - JWT стратегия (извлекает userId из токена)
- `jwt-auth.guard.ts` - guard для защиты endpoints

### PagesModule
CRUD операции для страниц с проверкой владельца:
- `POST /api/pages` - создание страницы
- `GET /api/pages` - список страниц пользователя
- `GET /api/pages/:id` - страница со всеми списками и задачами
- `PATCH /api/pages/:id` - обновление страницы
- `DELETE /api/pages/:id` - удаление страницы (каскадное удаление)

**Проверка владельца:** каждый запрос верифицирует `userId` из JWT токена.

### ListsModule
CRUD операции для списков с проверкой владельца страницы:
- `POST /api/lists` - создание списка
- `GET /api/lists/:id` - получение списка с задачами
- `PATCH /api/lists/:id` - обновление списка (title, order)
- `DELETE /api/lists/:id` - удаление списка (каскадное удаление)

**Проверка владельца:** верифицирует, что страница принадлежит пользователю через `pages.findFirst({ where: { id: pageId, userId } })`.

### TasksModule
CRUD операции для задач с проверкой владельца списка:
- `POST /api/tasks` - создание задачи
- `GET /api/tasks/:id` - получение задачи
- `PATCH /api/tasks/:id` - обновление задачи (title, description, completed, order)
- `DELETE /api/tasks/:id` - удаление задачи

**Проверка владельца:** верифицирует, что список принадлежит пользователю через цепочку проверок list → page → user.

### PrismaModule
Глобальный модуль с PrismaService для доступа к БД:
- Экспортирует `PrismaService` для использования во всех модулях
- `@Global()` декоратор - доступен везде без повторного импорта
- Автоматическое подключение/отключение к PostgreSQL

## Prisma Schema

### Модели данных
Иерархическая структура с каскадным удалением:
```
User → Page → List → Task
```

**User:**
- `id` (uuid), `email` (unique), `password` (hashed), `name` (optional)
- Связь: `pages Page[]`

**Page:**
- `id` (uuid), `title`, `userId`
- Связи: `user User`, `lists List[]`
- Cascade delete: при удалении пользователя удаляются все его страницы

**List:**
- `id` (uuid), `title`, `pageId`, `order` (default 0)
- Связи: `page Page`, `tasks Task[]`
- Cascade delete: при удалении страницы удаляются все списки

**Task:**
- `id` (uuid), `title`, `description` (optional), `completed` (default false), `listId`, `order` (default 0)
- Связь: `list List`
- Cascade delete: при удалении списка удаляются все задачи

### Сортировка
- Lists: сортируются по `order ASC`
- Tasks: сортируются по `order ASC`
- Pages: сортируются по `createdAt DESC`

## JWT Authentication

### Стратегия
```typescript
// jwt.strategy.ts
@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    return { userId: payload.sub, email: payload.email };
  }
}
```

### Защита endpoints
```typescript
// Применение guard к controller
@UseGuards(JwtAuthGuard)
@Controller('pages')
export class PagesController {
  @Get()
  findAll(@Request() req) {
    return this.pagesService.findAll(req.user.userId);
  }
}
```

### Token payload
```typescript
const payload = { 
  sub: user.id,      // userId
  email: user.email 
};
const accessToken = this.jwtService.sign(payload);
```

## Validation & DTOs

### Class-validator декораторы
```typescript
import { IsString, IsEmail, MinLength, IsOptional, IsBoolean, IsInt } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  @IsOptional()
  name?: string;
}
```

### Global validation pipe
Включен в `main.ts`:
```typescript
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,      // Удаляет поля не описанные в DTO
  transform: true,      // Автоматическая трансформация типов
}));
```

## Security Patterns

### Ownership verification
Каждый сервис проверяет владельца перед операциями:

```typescript
// PagesService
async findOne(id: string, userId: string) {
  const page = await this.prisma.page.findFirst({
    where: { id, userId },  // ✅ Проверка владельца
  });
  
  if (!page) {
    throw new NotFoundException('Page not found');
  }
  
  return page;
}
```

### Password hashing
Пароли никогда не хранятся в открытом виде:
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
const isPasswordValid = await bcrypt.compare(password, user.password);
```

### Cascade deletes
Удаление на уровне БД через Prisma:
```prisma
model Page {
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
}
```

## Environment Variables
```env
# .env file
DATABASE_URL="postgresql://user:password@localhost:5432/todo_db"
JWT_SECRET="your-secret-key-change-in-production"
PORT=3001
```

## Prisma Commands
```bash
# Generate Prisma Client
npm run prisma:generate --workspace=@todo-app/backend

# Run migrations
npm run prisma:migrate --workspace=@todo-app/backend

# Open Prisma Studio (GUI для БД)
npm run prisma:studio --workspace=@todo-app/backend

# Create new migration
cd apps/backend
npx prisma migrate dev --name migration_name
```

## API Endpoints Reference

### Auth
- `POST /api/auth/register` - регистрация
  ```json
  { "email": "user@example.com", "password": "secret123", "name": "John" }
  ```
- `POST /api/auth/login` - вход
  ```json
  { "email": "user@example.com", "password": "secret123" }
  ```

### Pages (Protected)
- `POST /api/pages` - создать страницу
  ```json
  { "title": "My Page" }
  ```
- `GET /api/pages` - список страниц
- `GET /api/pages/:id` - страница со списками и задачами
- `PATCH /api/pages/:id` - обновить страницу
  ```json
  { "title": "Updated Title" }
  ```
- `DELETE /api/pages/:id` - удалить страницу

### Lists (Protected)
- `POST /api/lists` - создать список
  ```json
  { "title": "To Do", "pageId": "uuid" }
  ```
- `GET /api/lists/:id` - список с задачами
- `PATCH /api/lists/:id` - обновить список
  ```json
  { "title": "Updated", "order": 1 }
  ```
- `DELETE /api/lists/:id` - удалить список

### Tasks (Protected)
- `POST /api/tasks` - создать задачу
  ```json
  { "title": "Task", "description": "Details", "listId": "uuid" }
  ```
- `GET /api/tasks/:id` - задача
- `PATCH /api/tasks/:id` - обновить задачу
  ```json
  { "title": "Updated", "completed": true, "order": 2 }
  ```
- `DELETE /api/tasks/:id` - удалить задачу

## Development Commands
```bash
npm run dev:backend          # Запуск dev сервера (port 3001)
npm run build:backend        # Production build
npm run start:prod           # Запуск production build
npm run lint                 # ESLint проверка
npm run format               # Prettier форматирование
```

## Important Notes
- Все protected endpoints требуют `Authorization: Bearer <token>` header
- Используйте типы из `@todo-app/shared` вместо дублирования
- Всегда проверяйте владельца перед операциями изменения/удаления
- Каскадное удаление настроено на уровне БД - не требует ручной обработки
- JWT_SECRET должен быть изменен в production окружении
- Порт 3001 используется для backend API
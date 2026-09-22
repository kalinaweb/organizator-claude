# Database Schema

Подробное описание схемы базы данных PostgreSQL для Todo App.

## Обзор

База данных реализует иерархическую структуру владения ресурсами:

```
User (пользователь)
  └── Page (страница)
        └── List (список)
              └── Task (задача)
```

Каждый уровень иерархии связан с родительским через внешний ключ с каскадным удалением (`ON DELETE CASCADE`).

## Entity Relationship Diagram

```
┌─────────────────┐
│      User       │
├─────────────────┤
│ id (PK)         │◄──┐
│ email (unique)  │   │
│ password        │   │
│ name            │   │
│ createdAt       │   │
│ updatedAt       │   │
└─────────────────┘   │
                      │ userId (FK)
                      │ ON DELETE CASCADE
┌─────────────────┐   │
│      Page       │   │
├─────────────────┤   │
│ id (PK)         │   │
│ title           │   │
│ userId (FK)     ├───┘
│ createdAt       │
│ updatedAt       │◄──┐
└─────────────────┘   │
                      │ pageId (FK)
                      │ ON DELETE CASCADE
┌─────────────────┐   │
│      List       │   │
├─────────────────┤   │
│ id (PK)         │   │
│ title           │   │
│ pageId (FK)     ├───┘
│ order           │
│ createdAt       │
│ updatedAt       │◄──┐
└─────────────────┘   │
                      │ listId (FK)
                      │ ON DELETE CASCADE
┌─────────────────┐   │
│      Task       │   │
├─────────────────┤   │
│ id (PK)         │   │
│ title           │   │
│ description     │   │
│ completed       │   │
│ listId (FK)     ├───┘
│ order           │
│ createdAt       │
│ updatedAt       │
└─────────────────┘
```

## Prisma Schema

Полная схема находится в `apps/backend/prisma/schema.prisma`.

---

## Model: User

Представляет зарегистрированного пользователя приложения.

### Поля

| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | String (UUID) | ✗ | `uuid()` | Уникальный идентификатор пользователя (Primary Key) |
| `email` | String | ✗ | - | Email пользователя (уникальный, используется для входа) |
| `password` | String | ✗ | - | Хешированный пароль (bcrypt, salt rounds: 10) |
| `name` | String | ✓ | `null` | Отображаемое имя пользователя |
| `createdAt` | DateTime | ✗ | `now()` | Дата и время регистрации |
| `updatedAt` | DateTime | ✗ | `now()` | Дата и время последнего обновления (автообновляется) |

### Relations

- `pages` — один-ко-многим с `Page` (один пользователь может иметь много страниц)

### Индексы

- `@@unique([email])` — уникальный индекс на поле `email` для быстрого поиска по email и предотвращения дублирования

### Constraints

- `email` должен быть валидным email-адресом (проверяется на уровне приложения через class-validator)
- `password` минимум 6 символов в plaintext (хешируется перед сохранением)

### Примечания

- Поле `password` **никогда** не должно возвращаться в API responses
- При удалении пользователя каскадно удаляются все его страницы (а также вложенные списки и задачи)
- `createdAt` и `updatedAt` управляются Prisma автоматически

### Пример записи

```json
{
  "id": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "email": "john.doe@example.com",
  "password": "$2b$10$XOPxVGlJw5Yz.dKqH8mI5euKZm5LGFQcCZj9z8iN0mU3WqVDJhBla",
  "name": "John Doe",
  "createdAt": "2026-09-22T10:00:00.000Z",
  "updatedAt": "2026-09-22T10:00:00.000Z"
}
```

---

## Model: Page

Представляет страницу — верхний уровень организации контента пользователя.

### Поля

| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | String (UUID) | ✗ | `uuid()` | Уникальный идентификатор страницы (Primary Key) |
| `title` | String | ✗ | - | Заголовок страницы |
| `userId` | String (UUID) | ✗ | - | Foreign Key на `User.id` (владелец страницы) |
| `createdAt` | DateTime | ✗ | `now()` | Дата и время создания страницы |
| `updatedAt` | DateTime | ✗ | `now()` | Дата и время последнего обновления |

### Relations

- `user` — многие-к-одному с `User` (каждая страница принадлежит одному пользователю)
- `lists` — один-ко-многим с `List` (одна страница может содержать много списков)

### Foreign Keys

- `userId` → `User.id` с `onDelete: Cascade` (при удалении пользователя удаляются все его страницы)

### Сортировка

При запросе страниц пользователя используется сортировка:
```typescript
orderBy: { createdAt: 'desc' }
```
Новые страницы отображаются первыми.

### Примечания

- `title` не имеет ограничения на уникальность — пользователь может создать несколько страниц с одинаковыми названиями
- При удалении страницы каскадно удаляются все вложенные списки и задачи
- Проверка владения происходит через `where: { id, userId }` в сервисе

### Пример записи

```json
{
  "id": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "title": "Work Projects",
  "userId": "a1b2c3d4-e5f6-7890-abcd-ef1234567890",
  "createdAt": "2026-09-22T10:05:00.000Z",
  "updatedAt": "2026-09-22T10:05:00.000Z"
}
```

---

## Model: List

Представляет список задач внутри страницы.

### Поля

| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | String (UUID) | ✗ | `uuid()` | Уникальный идентификатор списка (Primary Key) |
| `title` | String | ✗ | - | Заголовок списка (например, "To Do", "In Progress", "Done") |
| `pageId` | String (UUID) | ✗ | - | Foreign Key на `Page.id` (родительская страница) |
| `order` | Int | ✗ | `0` | Порядковый номер для сортировки списков внутри страницы |
| `createdAt` | DateTime | ✗ | `now()` | Дата и время создания списка |
| `updatedAt` | DateTime | ✗ | `now()` | Дата и время последнего обновления |

### Relations

- `page` — многие-к-одному с `Page` (каждый список принадлежит одной странице)
- `tasks` — один-ко-многим с `Task` (один список может содержать много задач)

### Foreign Keys

- `pageId` → `Page.id` с `onDelete: Cascade` (при удалении страницы удаляются все её списки)

### Поле `order`

**Назначение:** Определяет позицию списка на странице для пользовательской сортировки (drag-and-drop).

**Логика присвоения:**
- При создании нового списка ищется максимальный `order` среди существующих списков страницы
- Новому списку присваивается `order = max(order) + 1`
- Если список первый на странице, `order = 0`

**Сортировка:**
```typescript
orderBy: { order: 'asc' }
```

**Изменение порядка:**
Пользователь может обновить `order` через `PUT /lists/:id` с телом `{ order: newOrder }`.

### Примечания

- Каскадное удаление: при удалении списка удаляются все вложенные задачи
- Проверка владения происходит через загрузку родительской страницы: `list.page.userId === userId`
- `title` не уникален — на одной странице могут быть списки с одинаковыми названиями

### Пример записи

```json
{
  "id": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "title": "To Do",
  "pageId": "b2c3d4e5-f6a7-8901-bcde-f12345678901",
  "order": 0,
  "createdAt": "2026-09-22T10:10:00.000Z",
  "updatedAt": "2026-09-22T10:10:00.000Z"
}
```

---

## Model: Task

Представляет задачу внутри списка — атомарную единицу работы.

### Поля

| Поле | Тип | Nullable | Default | Описание |
|------|-----|----------|---------|----------|
| `id` | String (UUID) | ✗ | `uuid()` | Уникальный идентификатор задачи (Primary Key) |
| `title` | String | ✗ | - | Заголовок задачи (краткое описание) |
| `description` | String | ✓ | `null` | Подробное описание задачи (опционально) |
| `completed` | Boolean | ✗ | `false` | Статус выполнения задачи (false = активная, true = завершённая) |
| `listId` | String (UUID) | ✗ | - | Foreign Key на `List.id` (родительский список) |
| `order` | Int | ✗ | `0` | Порядковый номер для сортировки задач внутри списка |
| `createdAt` | DateTime | ✗ | `now()` | Дата и время создания задачи |
| `updatedAt` | DateTime | ✗ | `now()` | Дата и время последнего обновления |

### Relations

- `list` — многие-к-одному с `List` (каждая задача принадлежит одному списку)

### Foreign Keys

- `listId` → `List.id` с `onDelete: Cascade` (при удалении списка удаляются все его задачи)

### Поле `completed`

**Назначение:** Отмечает задачу как выполненную.

**Логика:**
- По умолчанию все новые задачи `completed = false`
- Пользователь может переключить статус через `PUT /tasks/:id` с телом `{ completed: true }` или `{ completed: false }`
- Frontend может визуально отличать выполненные задачи (зачеркивание, серый цвет и т.д.)

### Поле `order`

**Назначение:** Определяет позицию задачи в списке для пользовательской сортировки.

**Логика присвоения:**
- При создании новой задачи ищется максимальный `order` среди существующих задач списка
- Новой задаче присваивается `order = max(order) + 1`
- Если задача первая в списке, `order = 0`

**Сортировка:**
```typescript
orderBy: { order: 'asc' }
```

**Изменение порядка:**
Пользователь может обновить `order` через `PUT /tasks/:id` с телом `{ order: newOrder }`.

### Поле `description`

**Назначение:** Дополнительный текст для описания задачи (markdown, plain text и т.д.).

**Nullable:** Поле опционально (`null` если не задано).

**Use cases:**
- Подробности задачи
- Чек-лист подзадач
- Ссылки на ресурсы
- Заметки

### Примечания

- Проверка владения происходит через загрузку цепочки: `task.list.page.userId === userId`
- `title` не уникален — в одном списке могут быть задачи с одинаковыми названиями
- Поле `description` может содержать большой текст (ограничение зависит от настроек PostgreSQL, по умолчанию до ~1GB для `TEXT`)

### Пример записи

```json
{
  "id": "d4e5f6a7-b8c9-0123-def0-123456789013",
  "title": "Buy groceries",
  "description": "- Milk\n- Eggs\n- Bread\n- Butter",
  "completed": false,
  "listId": "c3d4e5f6-a7b8-9012-cdef-123456789012",
  "order": 0,
  "createdAt": "2026-09-22T10:15:00.000Z",
  "updatedAt": "2026-09-22T10:15:00.000Z"
}
```

---

## Каскадное удаление

Все связи настроены с `onDelete: Cascade` на уровне БД через Prisma:

### Цепочка удаления

```
DELETE User
  ↓ CASCADE
DELETE Page(s)
  ↓ CASCADE
DELETE List(s)
  ↓ CASCADE
DELETE Task(s)
```

**Примеры:**
- Удаление пользователя удаляет все его страницы, списки и задачи
- Удаление страницы удаляет все её списки и вложенные задачи
- Удаление списка удаляет все его задачи
- Удаление задачи не имеет каскадного эффекта (конечный узел)

**Важно:** Каскадное удаление происходит на уровне БД, не требуя дополнительной логики в сервисах NestJS.

---

## Индексы

### Автоматические индексы (Primary Keys)

Prisma автоматически создаёт уникальные индексы для всех `@id` полей:
- `User.id`
- `Page.id`
- `List.id`
- `Task.id`

### Индексы на Foreign Keys

PostgreSQL автоматически создаёт индексы для внешних ключей:
- `Page.userId` — ускоряет запросы `WHERE userId = ?`
- `List.pageId` — ускоряет запросы `WHERE pageId = ?`
- `Task.listId` — ускоряет запросы `WHERE listId = ?`

### Уникальные индексы

- `User.email` — `@@unique([email])` для быстрого поиска по email и предотвращения дублей

### Составные индексы (рекомендуемые для оптимизации)

В текущей схеме отсутствуют, но можно добавить:

```prisma
model List {
  @@index([pageId, order]) // Оптимизация для сортировки списков страницы
}

model Task {
  @@index([listId, order])      // Оптимизация для сортировки задач списка
  @@index([listId, completed])  // Фильтрация по статусу внутри списка
}
```

---

## Миграции

### Текущие миграции

Миграции находятся в `apps/backend/prisma/migrations/`.

### Создание новой миграции

```bash
cd apps/backend
npx prisma migrate dev --name migration_name
```

### Применение миграций на production

```bash
npx prisma migrate deploy
```

### Откат миграций

Prisma не поддерживает автоматический откат миграций. Для отката:
1. Создайте новую миграцию, отменяющую изменения
2. Или восстановите БД из бэкапа

---

## Prisma Client

### Генерация клиента

После изменения `schema.prisma` необходимо регенерировать клиент:

```bash
npm run prisma:generate --workspace=@todo-app/backend
```

### Использование в коде

```typescript
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class PagesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.page.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }
}
```

---

## Типы данных PostgreSQL

| Prisma Type | PostgreSQL Type | Описание |
|-------------|-----------------|----------|
| `String` | `TEXT` | Текст произвольной длины |
| `String @id @default(uuid())` | `UUID` | Уникальный идентификатор |
| `Int` | `INTEGER` | Целое число (32-bit) |
| `Boolean` | `BOOLEAN` | true/false |
| `DateTime` | `TIMESTAMP(3)` | Дата и время с точностью до миллисекунд |

---

## Seed Data (опционально)

Для локальной разработки можно создать seed script:

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const hashedPassword = await bcrypt.hash('password123', 10);
  
  const user = await prisma.user.create({
    data: {
      email: 'test@example.com',
      password: hashedPassword,
      name: 'Test User',
    },
  });

  const page = await prisma.page.create({
    data: {
      title: 'My First Page',
      userId: user.id,
    },
  });

  const list = await prisma.list.create({
    data: {
      title: 'To Do',
      pageId: page.id,
      order: 0,
    },
  });

  await prisma.task.createMany({
    data: [
      {
        title: 'Buy groceries',
        description: 'Milk, eggs, bread',
        listId: list.id,
        order: 0,
      },
      {
        title: 'Walk the dog',
        listId: list.id,
        order: 1,
      },
    ],
  });
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect());
```

Запуск seed:
```bash
npx prisma db seed
```

---

## Backup & Restore

### Backup

```bash
pg_dump -U username -d todo_db -F c -b -v -f backup.dump
```

### Restore

```bash
pg_restore -U username -d todo_db -v backup.dump
```

---

## Производительность

### Оптимизации

1. **Индексы** — добавить составные индексы для частых запросов (см. секцию "Индексы")
2. **Connection pooling** — Prisma использует встроенный connection pool (настраивается в `DATABASE_URL`)
3. **SELECT only needed fields** — использовать `select` вместо загрузки всех полей
4. **Pagination** — добавить `skip` и `take` для больших списков задач

### Мониторинг запросов

Включить логирование Prisma запросов:

```typescript
// prisma.service.ts
const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
});
```

---

## Ограничения и потенциальные улучшения

### Текущие ограничения

- Нет soft delete (удаление окончательное)
- Нет истории изменений (audit log)
- Нет разделения прав (все пользователи имеют равные права на свои ресурсы)
- Нет лимита на количество страниц/списков/задач на пользователя

### Потенциальные улучшения

1. **Soft delete** — добавить поле `deletedAt` для восстановления удалённых ресурсов
2. **Audit log** — таблица для отслеживания изменений (кто, что, когда изменил)
3. **Shared pages** — возможность совместного доступа к страницам между пользователями
4. **Tags/Labels** — система тегов для задач
5. **Due dates** — добавить поле `dueDate` для задач с дедлайнами
6. **Attachments** — таблица для файлов, прикреплённых к задачам
7. **Comments** — возможность комментировать задачи
8. **Priority** — поле приоритета для задач (low/medium/high)

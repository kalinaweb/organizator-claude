# Code Review Guidelines

Этот документ определяет правила и стандарты для Code Review в проекте Todo App.

## Общие принципы

### 1. Цели Code Review
- Обеспечение качества и корректности кода
- Предотвращение багов и уязвимостей безопасности
- Поддержание единообразия кодовой базы
- Обмен знаниями между разработчиками
- Проверка соответствия архитектурным решениям

### 2. Культура Review
- Фокус на коде, а не на человеке
- Конструктивная критика с предложением решений
- Быстрый фидбек (в течение 24 часов)
- Одобрение PR только после устранения всех критичных замечаний

## Архитектурные требования

### Frontend (Next.js + FSD)

#### Feature-Sliced Design
- ✅ Фичи организованы по слоям: `ui/`, `api/`, `model/`, `types/`
- ✅ Публичный API фичи экспортируется через `index.ts`
- ✅ Импорты из фич только через публичный API
- ❌ Прямые импорты из внутренних слоев фичи запрещены

```typescript
// ✅ Правильно
import { LoginForm } from '@/features/auth';

// ❌ Неправильно
import { LoginForm } from '@/features/auth/ui/LoginForm';
```

#### Material-UI и стилизация
- Использовать компоненты MUI для единообразия UI
- Tailwind preflight отключен — не включать его
- CssBaseline применяется в root layout

#### Формы и валидация
- React Hook Form для управления формами
- Zod для схем валидации
- `@hookform/resolvers/zod` для интеграции

#### Типы
- Импортировать общие типы из `@todo-app/shared`
- Не дублировать типы, определенные в shared пакете
- Использовать `type` imports для типов

### Backend (NestJS + Prisma)

#### Модульная архитектура
- Каждый ресурс в отдельном модуле: `*.module.ts`, `*.controller.ts`, `*.service.ts`
- PrismaModule с декоратором `@Global()`
- Используйте dependency injection для сервисов

#### Безопасность (КРИТИЧНО)
**Каждый endpoint должен:**
1. Проверять JWT токен через `@UseGuards(JwtAuthGuard)`
2. Верифицировать владельца ресурса в сервисе
3. Использовать `userId` из `req.user` для фильтрации данных

```typescript
// ✅ Правильно - проверка владельца
async findOne(id: string, userId: string) {
  const page = await this.prisma.page.findFirst({
    where: { id, userId }, // Проверка владельца
  });
  
  if (!page) {
    throw new NotFoundException('Page not found');
  }
  
  return page;
}

// ❌ Неправильно - отсутствует проверка владельца
async findOne(id: string) {
  return this.prisma.page.findUnique({ where: { id } });
}
```

#### Валидация DTO
- class-validator декораторы на всех DTO
- ValidationPipe настроен глобально с `whitelist: true` и `transform: true`
- Использовать типы из `@todo-app/shared` как базу для DTO

#### Хеширование паролей
- Всегда хешировать пароли через bcryptjs (salt rounds: 10)
- Никогда не возвращать поле `password` в ответах API

### Shared Package

- Типы для всех entities: User, Page, List, Task
- DTO интерфейсы для создания и обновления
- Никакой бизнес-логики в shared — только типы

## Чек-лист для Code Review

### Безопасность (Блокирующие проблемы)
- [ ] JWT guard применен ко всем protected endpoints
- [ ] Проверка владельца ресурса перед операциями изменения/удаления
- [ ] Пароли хешируются перед сохранением
- [ ] SQL injection предотвращен (используется Prisma, но проверить raw queries)
- [ ] XSS предотвращен (sanitization пользовательского ввода)
- [ ] Нет утечки конфиденциальных данных в ответах API
- [ ] Environment переменные не коммитятся (`.env` в `.gitignore`)

### Корректность
- [ ] Код решает поставленную задачу
- [ ] Обработаны edge cases и error scenarios
- [ ] Каскадное удаление работает корректно (на уровне БД через Prisma)
- [ ] Сортировка по `order` поле для Lists и Tasks
- [ ] HTTP статус коды соответствуют семантике (200, 201, 404, 401, 403)

### Типобезопасность
- [ ] TypeScript без `any` (исключения должны быть обоснованы)
- [ ] Использованы типы из `@todo-app/shared`
- [ ] Prisma types использованы корректно
- [ ] Zod схемы синхронизированы с DTO

### Архитектура и стиль
- [ ] Код следует архитектуре проекта (FSD для frontend, NestJS modules для backend)
- [ ] Нет дублирования кода (DRY принцип)
- [ ] Функции и переменные имеют понятные имена
- [ ] Импорты организованы: сторонние библиотеки → внутренние модули
- [ ] Нет мертвого кода (unused imports, commented code)

### Тестируемость
- [ ] Код легко тестируется (dependency injection, чистые функции)
- [ ] Нет хардкода значений (magic numbers, URLs)
- [ ] Сервисы изолированы от внешних зависимостей через интерфейсы

### Git и документация
- [ ] Commit message следует conventional commits (feat/fix/refactor/docs)
- [ ] Commit message на русском языке
- [ ] Attribution строка `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>` присутствует
- [ ] PR description описывает изменения и test plan
- [ ] Обновлен CLAUDE.md при изменении архитектуры

## Типичные проблемы

### Frontend
❌ **Проблема:** Импорт из внутренностей фичи
```typescript
import { LoginForm } from '@/features/auth/ui/LoginForm';
```
✅ **Решение:** Использовать публичный API
```typescript
import { LoginForm } from '@/features/auth';
```

---

❌ **Проблема:** Токен не добавляется в запрос
```typescript
axios.post('/api/pages', data);
```
✅ **Решение:** Использовать настроенный api instance
```typescript
import { api } from '@/lib/api';
api.post('/pages', data); // токен добавляется автоматически
```

---

❌ **Проблема:** Дублирование типов из shared
```typescript
interface User {
  id: string;
  email: string;
}
```
✅ **Решение:** Импортировать из shared
```typescript
import type { User } from '@todo-app/shared';
```

### Backend
❌ **Проблема:** Отсутствует проверка владельца
```typescript
async delete(id: string) {
  return this.prisma.page.delete({ where: { id } });
}
```
✅ **Решение:** Проверить владельца перед удалением
```typescript
async delete(id: string, userId: string) {
  const page = await this.prisma.page.findFirst({
    where: { id, userId }
  });
  
  if (!page) {
    throw new NotFoundException('Page not found');
  }
  
  return this.prisma.page.delete({ where: { id } });
}
```

---

❌ **Проблема:** Пароль не хешируется
```typescript
await this.prisma.user.create({
  data: { email, password }
});
```
✅ **Решение:** Хешировать перед сохранением
```typescript
const hashedPassword = await bcrypt.hash(password, 10);
await this.prisma.user.create({
  data: { email, password: hashedPassword }
});
```

---

❌ **Проблема:** Пароль возвращается в ответе
```typescript
return user; // содержит поле password
```
✅ **Решение:** Исключить чувствительные поля
```typescript
const { password, ...result } = user;
return result;
```

## Комментарии в PR

### Формат комментария
```
[Тип] Описание проблемы

Пояснение и/или предложение решения

```typescript
// Пример кода при необходимости
```

**Типы:**
- `[CRITICAL]` — блокирующая проблема (безопасность, критичный баг)
- `[BUG]` — потенциальный баг
- `[ARCH]` — нарушение архитектуры
- `[STYLE]` — несоответствие code style
- `[SUGGESTION]` — необязательное улучшение
- `[QUESTION]` — вопрос для уточнения

### Примеры комментариев

```
[CRITICAL] Отсутствует проверка владельца ресурса

Любой авторизованный пользователь может удалить чужую страницу.
Необходимо добавить проверку userId перед удалением.
```

```
[ARCH] Прямой импорт из внутренностей фичи

Нарушает FSD методологию. Используйте публичный API фичи:
`import { LoginForm } from '@/features/auth';`
```

```
[SUGGESTION] Можно упростить через optional chaining

`user?.name ?? 'Anonymous'` читается проще чем `user && user.name ? user.name : 'Anonymous'`
```

## Критерии одобрения PR

PR может быть одобрен (Approve) когда:
- ✅ Нет CRITICAL и BUG замечаний
- ✅ Все ARCH замечания устранены
- ✅ CI/CD пайплайн успешно прошел
- ✅ Код протестирован локально (если применимо)
- ✅ Commit messages соответствуют conventional commits

PR блокируется (Request Changes) если:
- ❌ Есть уязвимости безопасности
- ❌ Нарушена архитектура проекта
- ❌ Критичные баги
- ❌ Не работает локально

## Пропускать
- Сгенерированные файлы миграций в prisma/migration/*
- Изменения в *.lock файлах

# API Documentation

Полное описание REST API endpoints для Todo App.

## Base URL

```
http://localhost:3001/api
```

Все endpoints используют префикс `/api` (настроен в `main.ts` через `app.setGlobalPrefix('api')`).

## Аутентификация

### POST /auth/register

Регистрация нового пользователя.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe"  // optional
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "email": "user@example.com",
  "name": "John Doe",
  "createdAt": "2026-09-22T10:00:00.000Z"
}
```

**Validation:**
- `email` — должен быть валидным email
- `password` — минимум 6 символов
- `name` — опционально, строка

**Errors:**
- `400 Bad Request` — невалидные данные (ошибка валидации)
- `409 Conflict` — пользователь с таким email уже существует

**Notes:**
- Пароль хешируется через bcryptjs (salt rounds: 10) перед сохранением
- Поле `password` не возвращается в ответе

---

### POST /auth/login

Вход в систему и получение JWT токена.

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:** `200 OK`
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Validation:**
- `email` — должен быть валидным email
- `password` — строка, минимум 6 символов

**Errors:**
- `400 Bad Request` — невалидные данные
- `401 Unauthorized` — неверный email или пароль

**Notes:**
- Токен содержит payload: `{ sub: userId, email: userEmail }`
- Срок жизни токена: не ограничен (можно добавить `expiresIn` в JWT config)
- Используйте токен в заголовке: `Authorization: Bearer <accessToken>`

---

## Pages

Все endpoints защищены JWT. Требуется заголовок `Authorization: Bearer <token>`.

### POST /pages

Создание новой страницы для текущего пользователя.

**Request:**
```json
{
  "title": "My First Page"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "My First Page",
  "userId": "uuid",
  "createdAt": "2026-09-22T10:00:00.000Z",
  "updatedAt": "2026-09-22T10:00:00.000Z"
}
```

**Validation:**
- `title` — строка, минимум 1 символ

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `400 Bad Request` — невалидные данные

---

### GET /pages

Получение списка всех страниц текущего пользователя.

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "My First Page",
    "userId": "uuid",
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  },
  {
    "id": "uuid",
    "title": "Another Page",
    "userId": "uuid",
    "createdAt": "2026-09-21T12:00:00.000Z",
    "updatedAt": "2026-09-21T12:00:00.000Z"
  }
]
```

**Notes:**
- Страницы отсортированы по дате создания (убывание): `orderBy: { createdAt: 'desc' }`
- Возвращаются только страницы текущего пользователя

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен

---

### GET /pages/:id

Получение страницы по ID вместе со всеми вложенными списками и задачами.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "My First Page",
  "userId": "uuid",
  "createdAt": "2026-09-22T10:00:00.000Z",
  "updatedAt": "2026-09-22T10:00:00.000Z",
  "lists": [
    {
      "id": "uuid",
      "title": "To Do",
      "pageId": "uuid",
      "order": 0,
      "createdAt": "2026-09-22T10:05:00.000Z",
      "updatedAt": "2026-09-22T10:05:00.000Z",
      "tasks": [
        {
          "id": "uuid",
          "title": "Buy groceries",
          "description": "Milk, eggs, bread",
          "completed": false,
          "listId": "uuid",
          "order": 0,
          "createdAt": "2026-09-22T10:10:00.000Z",
          "updatedAt": "2026-09-22T10:10:00.000Z"
        }
      ]
    }
  ]
}
```

**Notes:**
- Списки отсортированы по `order` (возрастание)
- Задачи внутри каждого списка отсортированы по `order` (возрастание)
- Полная иерархия: `Page → Lists → Tasks`

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — страница не найдена или не принадлежит текущему пользователю

---

### PUT /pages/:id

Обновление заголовка страницы.

**Request:**
```json
{
  "title": "Updated Page Title"
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated Page Title",
  "userId": "uuid",
  "createdAt": "2026-09-22T10:00:00.000Z",
  "updatedAt": "2026-09-22T11:00:00.000Z"
}
```

**Validation:**
- `title` — строка, минимум 1 символ

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — страница не найдена или не принадлежит текущему пользователю
- `400 Bad Request` — невалидные данные

---

### DELETE /pages/:id

Удаление страницы вместе со всеми вложенными списками и задачами.

**Response:** `200 OK`
```json
{
  "message": "Page deleted successfully"
}
```

**Notes:**
- Каскадное удаление настроено на уровне БД через Prisma (`onDelete: Cascade`)
- При удалении страницы автоматически удаляются все связанные списки и задачи

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — страница не найдена или не принадлежит текущему пользователю

---

## Lists

Все endpoints защищены JWT. Требуется заголовок `Authorization: Bearer <token>`.

### POST /lists

Создание нового списка на указанной странице.

**Request:**
```json
{
  "title": "To Do",
  "pageId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "To Do",
  "pageId": "uuid",
  "order": 0,
  "createdAt": "2026-09-22T10:05:00.000Z",
  "updatedAt": "2026-09-22T10:05:00.000Z"
}
```

**Validation:**
- `title` — строка, минимум 1 символ
- `pageId` — UUID страницы

**Notes:**
- Новому списку присваивается `order = max(order) + 1` среди списков страницы
- Если список первый на странице, `order = 0`

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — страница не найдена или не принадлежит текущему пользователю
- `400 Bad Request` — невалидные данные

---

### GET /lists?pageId=:pageId

Получение списков указанной страницы вместе с задачами.

**Query Parameters:**
- `pageId` (required) — UUID страницы

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "To Do",
    "pageId": "uuid",
    "order": 0,
    "createdAt": "2026-09-22T10:05:00.000Z",
    "updatedAt": "2026-09-22T10:05:00.000Z",
    "tasks": [
      {
        "id": "uuid",
        "title": "Buy groceries",
        "description": "Milk, eggs, bread",
        "completed": false,
        "listId": "uuid",
        "order": 0,
        "createdAt": "2026-09-22T10:10:00.000Z",
        "updatedAt": "2026-09-22T10:10:00.000Z"
      }
    ]
  }
]
```

**Notes:**
- Списки отсортированы по `order` (возрастание)
- Задачи внутри каждого списка отсортированы по `order` (возрастание)

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — страница не найдена или не принадлежит текущему пользователю

---

### GET /lists/:id

Получение списка по ID вместе с задачами и родительской страницей.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "To Do",
  "pageId": "uuid",
  "order": 0,
  "createdAt": "2026-09-22T10:05:00.000Z",
  "updatedAt": "2026-09-22T10:05:00.000Z",
  "page": {
    "id": "uuid",
    "title": "My First Page",
    "userId": "uuid",
    "createdAt": "2026-09-22T10:00:00.000Z",
    "updatedAt": "2026-09-22T10:00:00.000Z"
  },
  "tasks": [
    {
      "id": "uuid",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "listId": "uuid",
      "order": 0,
      "createdAt": "2026-09-22T10:10:00.000Z",
      "updatedAt": "2026-09-22T10:10:00.000Z"
    }
  ]
}
```

**Notes:**
- Задачи отсортированы по `order` (возрастание)

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — список не найден или страница-владелец не принадлежит текущему пользователю

---

### PUT /lists/:id

Обновление заголовка и/или порядка списка.

**Request:**
```json
{
  "title": "Updated List Title",  // optional
  "order": 2                      // optional
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Updated List Title",
  "pageId": "uuid",
  "order": 2,
  "createdAt": "2026-09-22T10:05:00.000Z",
  "updatedAt": "2026-09-22T11:00:00.000Z"
}
```

**Validation:**
- `title` — строка, минимум 1 символ (опционально)
- `order` — целое число (опционально)

**Notes:**
- Можно обновить оба поля или только одно

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — список не найден или страница-владелец не принадлежит текущему пользователю
- `400 Bad Request` — невалидные данные

---

### DELETE /lists/:id

Удаление списка вместе со всеми вложенными задачами.

**Response:** `200 OK`
```json
{
  "message": "List deleted successfully"
}
```

**Notes:**
- Каскадное удаление настроено на уровне БД через Prisma
- При удалении списка автоматически удаляются все связанные задачи

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — список не найден или страница-владелец не принадлежит текущему пользователю

---

## Tasks

Все endpoints защищены JWT. Требуется заголовок `Authorization: Bearer <token>`.

### POST /tasks

Создание новой задачи в указанном списке.

**Request:**
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",  // optional
  "listId": "uuid"
}
```

**Response:** `201 Created`
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "listId": "uuid",
  "order": 0,
  "createdAt": "2026-09-22T10:10:00.000Z",
  "updatedAt": "2026-09-22T10:10:00.000Z"
}
```

**Validation:**
- `title` — строка, минимум 1 символ
- `description` — строка (опционально)
- `listId` — UUID списка

**Notes:**
- Новой задаче присваивается `order = max(order) + 1` среди задач списка
- Если задача первая в списке, `order = 0`
- По умолчанию `completed = false`

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — список не найден или не принадлежит текущему пользователю
- `400 Bad Request` — невалидные данные

---

### GET /tasks?listId=:listId

Получение задач указанного списка.

**Query Parameters:**
- `listId` (required) — UUID списка

**Response:** `200 OK`
```json
[
  {
    "id": "uuid",
    "title": "Buy groceries",
    "description": "Milk, eggs, bread",
    "completed": false,
    "listId": "uuid",
    "order": 0,
    "createdAt": "2026-09-22T10:10:00.000Z",
    "updatedAt": "2026-09-22T10:10:00.000Z"
  },
  {
    "id": "uuid",
    "title": "Walk the dog",
    "description": null,
    "completed": true,
    "listId": "uuid",
    "order": 1,
    "createdAt": "2026-09-22T11:00:00.000Z",
    "updatedAt": "2026-09-22T12:00:00.000Z"
  }
]
```

**Notes:**
- Задачи отсортированы по `order` (возрастание)

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — список не найден или не принадлежит текущему пользователю

---

### GET /tasks/:id

Получение задачи по ID.

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "listId": "uuid",
  "order": 0,
  "createdAt": "2026-09-22T10:10:00.000Z",
  "updatedAt": "2026-09-22T10:10:00.000Z",
  "list": {
    "id": "uuid",
    "title": "To Do",
    "pageId": "uuid",
    "order": 0,
    "page": {
      "id": "uuid",
      "title": "My First Page",
      "userId": "uuid"
    }
  }
}
```

**Notes:**
- Включает полную цепочку владения: `task → list → page`

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — задача не найдена или не принадлежит текущему пользователю

---

### PUT /tasks/:id

Обновление задачи (заголовок, описание, статус, порядок).

**Request:**
```json
{
  "title": "Buy groceries and cook dinner",  // optional
  "description": "Updated description",       // optional
  "completed": true,                          // optional
  "order": 5                                  // optional
}
```

**Response:** `200 OK`
```json
{
  "id": "uuid",
  "title": "Buy groceries and cook dinner",
  "description": "Updated description",
  "completed": true,
  "listId": "uuid",
  "order": 5,
  "createdAt": "2026-09-22T10:10:00.000Z",
  "updatedAt": "2026-09-22T13:00:00.000Z"
}
```

**Validation:**
- `title` — строка, минимум 1 символ (опционально)
- `description` — строка (опционально)
- `completed` — boolean (опционально)
- `order` — целое число (опционально)

**Notes:**
- Все поля опциональны — можно обновить только нужные

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — задача не найдена или не принадлежит текущему пользователю
- `400 Bad Request` — невалидные данные

---

### DELETE /tasks/:id

Удаление задачи.

**Response:** `200 OK`
```json
{
  "message": "Task deleted successfully"
}
```

**Errors:**
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — задача не найдена или не принадлежит текущему пользователю

---

## HTTP Status Codes

### Success codes
- `200 OK` — успешный GET, PUT, DELETE запрос
- `201 Created` — успешный POST запрос с созданием ресурса

### Error codes
- `400 Bad Request` — ошибка валидации данных (class-validator)
- `401 Unauthorized` — отсутствует или невалидный JWT токен
- `404 Not Found` — ресурс не найден или не принадлежит пользователю
- `409 Conflict` — конфликт (например, email уже занят)
- `500 Internal Server Error` — необработанное исключение на сервере

---

## Error Response Format

Все ошибки возвращаются в стандартном формате NestJS:

```json
{
  "statusCode": 404,
  "message": "Page not found",
  "error": "Not Found"
}
```

Для ошибок валидации (`400 Bad Request`):

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be longer than or equal to 6 characters"
  ],
  "error": "Bad Request"
}
```

---

## CORS Configuration

Backend настроен на прием запросов с любых origins (для разработки):

```typescript
app.enableCors();
```

Для production необходимо ограничить origins:

```typescript
app.enableCors({
  origin: 'https://yourdomain.com',
  credentials: true,
});
```

---

## Rate Limiting

В текущей версии rate limiting не настроен. Для production рекомендуется добавить:
- `@nestjs/throttler` для защиты от DDoS
- Rate limits на auth endpoints (например, 5 попыток логина в минуту)

---

## Testing API

### cURL Examples

**Register:**
```bash
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test User"}'
```

**Login:**
```bash
curl -X POST http://localhost:3001/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123"}'
```

**Create Page:**
```bash
curl -X POST http://localhost:3001/api/pages \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -d '{"title":"My Page"}'
```

**Get Pages:**
```bash
curl http://localhost:3001/api/pages \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Postman / Insomnia

1. Создайте environment variable `token`
2. В auth/login сохраните `accessToken` в переменную
3. Используйте `Bearer {{token}}` в заголовке Authorization для protected endpoints

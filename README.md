# Todo App

Монорепозиторий приложения "Списки дел" с Next.js frontend и NestJS backend.

## Структура проекта

```
todo-app/
├── apps/
│   ├── frontend/    # Next.js приложение (порт 3000)
│   └── backend/     # NestJS приложение (порт 3001)
├── packages/
│   └── shared/      # Общие типы и схемы
```

## Технологический стек

### Frontend
- Next.js 15 (App Router)
- TypeScript
- Material-UI (MUI)
- React Hook Form + Zod
- Axios

### Backend
- NestJS 10
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT Authentication

## Установка

```bash
# Установка всех зависимостей
npm install
```

## Разработка

```bash
# Запуск frontend и backend одновременно
npm run dev

# Запуск только frontend (порт 3000)
npm run dev:frontend

# Запуск только backend (порт 3001)
npm run dev:backend
```

## Сборка

```bash
# Сборка всех приложений
npm run build

# Сборка только frontend
npm run build:frontend

# Сборка только backend
npm run build:backend
```

## Функционал

- **Страницы**: Создание, редактирование, удаление страниц
- **Списки**: Управление списками внутри страниц
- **Задачи**: Управление задачами внутри списков
- **Аутентификация**: JWT-based авторизация

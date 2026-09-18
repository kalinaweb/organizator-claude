# Frontend Setup Guide

## Установка зависимостей

Перед запуском фронтенда необходимо установить дополнительный пакет:

```bash
cd apps/frontend
npm install @hookform/resolvers
```

## Структура Feature-Sliced Design

Проект использует Feature-Sliced Design архитектуру для организации кода:

```
src/
├── app/                    # Next.js App Router pages
│   ├── login/             # Страница входа
│   ├── register/          # Страница регистрации
│   ├── layout.tsx         # Root layout с Providers
│   └── providers.tsx      # MUI Theme Provider
├── features/              # Бизнес-фичи
│   └── auth/              # Фича аутентификации
│       ├── index.ts       # Public API
│       ├── ui/            # UI компоненты
│       ├── model/         # Хуки и логика
│       ├── api/           # API методы
│       └── types/         # Типы и схемы валидации
├── shared/                # Общие компоненты
│   ├── ui/                # UI компоненты (ProtectedRoute)
│   └── index.ts           # Public API
└── lib/                   # Утилиты и конфигурация
    └── api.ts             # Axios instance
```

## Реализованные страницы

### `/login` - Страница входа
- Форма входа с валидацией (email, password)
- Обработка ошибок
- Редирект на главную после успешного входа
- Ссылка на регистрацию

### `/register` - Страница регистрации
- Форма регистрации с валидацией (email, password, name)
- Обработка ошибок
- Автоматический вход после регистрации
- Ссылка на страницу входа

## Использование

### Аутентификация в компонентах

```tsx
import { useAuth } from '@/features/auth';

function MyComponent() {
  const { login, register, logout, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    await login({ 
      email: 'user@example.com', 
      password: '123456' 
    });
  };
}
```

### Защищенные роуты

```tsx
import { ProtectedRoute } from '@/shared';

export default function DashboardPage() {
  return (
    <ProtectedRoute>
      <Dashboard />
    </ProtectedRoute>
  );
}
```

## Технологический стек

- **Next.js 15** - App Router
- **Material-UI 5** - UI компоненты
- **React Hook Form** - управление формами
- **Zod** - валидация схем
- **@hookform/resolvers** - интеграция Zod с React Hook Form
- **Axios** - HTTP клиент с interceptors

## Запуск

```bash
# Из корня проекта
npm run dev:frontend

# Или из директории frontend
cd apps/frontend
npm run dev
```

Фронтенд будет доступен на `http://localhost:3000`

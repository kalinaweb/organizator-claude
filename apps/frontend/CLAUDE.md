# Frontend Documentation

## Architecture Overview
- **Next.js 15** с App Router (`app/` directory)
- **Feature-Sliced Design (FSD)** - методология организации кода по бизнес-функциям
- **Material-UI (MUI)** для UI компонентов
- **Tailwind CSS** для стилизации (preflight отключен во избежание конфликтов с MUI)
- **React Hook Form + Zod** для валидации форм
- **Axios** для HTTP запросов с interceptors для аутентификации
- **TypeScript** с общими типами из `@todo-app/shared`

## Структура проекта
```
apps/frontend/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── layout.tsx          # Root layout with MUI providers
│   │   ├── providers.tsx       # Client-side providers wrapper
│   │   ├── login/              # Login page
│   │   └── register/           # Register page
│   ├── features/               # Business features (FSD)
│   │   └── auth/               # Authentication feature
│   │       ├── index.ts        # Public exports
│   │       ├── ui/             # React components
│   │       ├── api/            # API methods
│   │       └── types/          # Feature-specific types
│   ├── shared/                 # Shared utilities
│   │   ├── ui/                 # Shared UI components
│   │   │   └── ProtectedRoute.tsx
│   │   └── index.ts            # Public exports
│   └── lib/
│       └── api.ts              # Axios instance with interceptors
└── package.json
```

## Feature-Sliced Design (FSD)
Каждая фича организована по слоям:
- `ui/` - React компоненты
- `api/` - API методы для взаимодействия с backend
- `model/` - Hooks, состояние, бизнес-логика
- `types/` - TypeScript типы специфичные для фичи
- `index.ts` - Публичный API фичи (barrel export)

### Пример структуры фичи (`features/auth/`):
```
features/auth/
├── index.ts              # Public API (exports)
├── ui/
│   ├── LoginForm.tsx     # Форма входа
│   └── RegisterForm.tsx  # Форма регистрации
├── api/
│   └── authApi.ts        # API методы (login, register)
└── types/
    └── index.ts          # Типы для форм (LoginFormData, RegisterFormData)
```

### Импорт из фич:
Страницы импортируют только через публичный API фичи:
```tsx
// ✅ Правильно
import { LoginForm } from '@/features/auth';

// ❌ Неправильно - прямой импорт из внутренностей фичи
import { LoginForm } from '@/features/auth/ui/LoginForm';
```

## API Client (`lib/api.ts`)
Axios instance с настроенными interceptors:

```tsx
import { api } from '@/lib/api';

// Request interceptor автоматически добавляет JWT токен
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor обрабатывает 401 ошибки
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

**Использование:**
```tsx
const response = await api.post('/auth/login', { email, password });
const { accessToken } = response.data;
localStorage.setItem('token', accessToken);
```

## Аутентификация
- JWT токены хранятся в `localStorage`
- Токен автоматически добавляется в заголовки всех запросов
- При 401 ответе происходит автоматический редирект на `/login`
- Protected routes используют `ProtectedRoute` компонент для проверки токена

### Protected Routes:
```tsx
import { ProtectedRoute } from '@/shared';

export default function Page() {
  return (
    <ProtectedRoute>
      <YourProtectedContent />
    </ProtectedRoute>
  );
}
```

## Формы и валидация
- **React Hook Form** для управления формами
- **Zod** для схем валидации
- **@hookform/resolvers** для интеграции Zod с React Hook Form

### Пример формы:
```tsx
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

const schema = z.object({
  email: z.string().email('Некорректный email'),
  password: z.string().min(6, 'Минимум 6 символов'),
});

type FormData = z.infer<typeof schema>;

export function LoginForm() {
  const { register, handleSubmit, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
  });

  const onSubmit = async (data: FormData) => {
    // API call
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      {/* Form fields */}
    </form>
  );
}
```

## Material-UI Setup
- `providers.tsx` - обертка с `ThemeProvider` и `CssBaseline`
- Root layout импортирует MUI providers
- Tailwind preflight отключен в `tailwind.config.ts` для совместимости

## Типы из shared пакета
Frontend импортирует типы из `@todo-app/shared`:
```tsx
import type { User, Page, List, Task } from '@todo-app/shared';
import type { LoginDto, RegisterDto } from '@todo-app/shared';
```

Shared пакет транспилируется через `next.config.js`:
```js
transpilePackages: ['@todo-app/shared']
```

## Environment Variables
```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

По умолчанию используется `http://localhost:3001/api` если переменная не задана.

## Команды разработки
```bash
npm run dev:frontend          # Запуск dev сервера (port 3000)
npm run build:frontend        # Production build
npm run lint                  # ESLint проверка
npm run format                # Prettier форматирование
```

## Важные замечания
- Всегда проверяйте наличие токена перед защищенными запросами
- Используйте общие типы из `@todo-app/shared` вместо дублирования
- Следуйте FSD методологии при создании новых фич
- Импортируйте из фич только через публичный API (`index.ts`)
- Material-UI компоненты предпочтительнее кастомных для единообразия UI
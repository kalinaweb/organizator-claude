# Auth Feature

Feature-модуль для аутентификации пользователей.

## Структура

```
features/auth/
├── index.ts              # Public API
├── ui/
│   ├── LoginForm.tsx     # Форма входа
│   └── RegisterForm.tsx  # Форма регистрации
├── model/
│   └── useAuth.ts        # Хук для работы с аутентификацией
└── api/
    └── authApi.ts        # API методы
```

## Использование

```tsx
import { LoginForm, RegisterForm, useAuth } from '@/features/auth';

// В странице
export default function LoginPage() {
  return <LoginForm />;
}

// Или напрямую хук
function MyComponent() {
  const { login, logout, isLoading, error } = useAuth();
  
  const handleLogin = async () => {
    await login({ email: 'user@example.com', password: '123456' });
  };
}
```

## API

### useAuth()

Хук для управления аутентификацией:

- `login(credentials: LoginDto)` - вход в систему
- `register(userData: RegisterDto)` - регистрация нового пользователя
- `logout()` - выход из системы
- `isLoading: boolean` - индикатор загрузки
- `error: string | null` - сообщение об ошибке

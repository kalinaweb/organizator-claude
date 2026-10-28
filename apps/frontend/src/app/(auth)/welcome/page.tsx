'use client';

import { useState } from 'react';
import { Box, Container, Typography, Button, TextField, Card, InputAdornment, IconButton, Alert, LinearProgress } from '@mui/material';
import { CheckCircle, Email, Lock, Person, Visibility, VisibilityOff } from '@mui/icons-material';
import { useRouter } from 'next/navigation';
import { authApi } from '@/features/auth';
import { enterLocalMode } from '@/lib/auth';
import { pagesApi } from '@/features/pages';
import { listsApi } from '@/features/lists';
import { tasksApi } from '@/features/tasks';
import {
  getLocalPages,
  getAllLocalLists,
  getAllLocalTasks,
  STORAGE_KEYS,
} from '@/lib/storage';

const features = [
  {
    title: 'Организация задач',
    description: 'Создавайте страницы, списки и задачи для структурированного управления проектами',
  },
  {
    title: 'Отслеживание прогресса',
    description: 'Визуальные индикаторы прогресса помогают видеть выполнение задач в реальном времени',
  },
  {
    title: 'Простой интерфейс',
    description: 'Интуитивный дизайн позволяет начать работу без обучения',
  },
];

export default function WelcomePage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
  });

  const syncLocalStorageToServer = async () => {
    const localPages = getLocalPages();
    if (localPages.length === 0) return;

    const pageMapping: Record<string, string> = {};

    // Sync pages
    for (const localPage of localPages) {
      try {
        const serverPage = await pagesApi.create({ title: localPage.title });
        pageMapping[localPage.localId] = serverPage.id;
      } catch (err) {
        console.error('Failed to sync page:', localPage.localId, err);
      }
    }

    // Sync lists
    const localLists = getAllLocalLists();
    const listMapping: Record<string, string> = {};

    for (const localList of localLists) {
      const serverPageId = pageMapping[localList.pageId];
      if (!serverPageId) continue;

      try {
        const serverList = await listsApi.create({
          title: localList.title,
          pageId: serverPageId,
        });
        listMapping[localList.localId] = serverList.id;
      } catch (err) {
        console.error('Failed to sync list:', localList.localId, err);
      }
    }

    // Sync tasks
    const localTasks = getAllLocalTasks();

    for (const localTask of localTasks) {
      const serverListId = listMapping[localTask.listId];
      if (!serverListId) continue;

      try {
        await tasksApi.create({
          title: localTask.title,
          listId: serverListId,
          description: localTask.description,
        });
      } catch (err) {
        console.error('Failed to sync task:', localTask.localId, err);
      }
    }

    // Clear all local storage after successful sync
    localStorage.setItem(STORAGE_KEYS.PAGES, '[]');
    localStorage.setItem(STORAGE_KEYS.LISTS, '[]');
    localStorage.setItem(STORAGE_KEYS.TASKS, '[]');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isLogin) {
        const { accessToken } = await authApi.login({
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', accessToken);
      } else {
        const { accessToken } = await authApi.register({
          name: formData.name,
          email: formData.email,
          password: formData.password,
        });
        localStorage.setItem('token', accessToken);

        // Sync local data to server
        setSyncing(true);
        try {
          await syncLocalStorageToServer();
        } catch (err) {
          console.error('Sync failed:', err);
        } finally {
          setSyncing(false);
        }
      }
      router.push('/');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Произошла ошибка');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [field]: e.target.value });
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        backgroundImage: 'url(/background.svg)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 1, py: 8 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: '80vh' }}>
          {/* Left side - Hero content */}
          <Box sx={{ flex: 1, color: '#2C3E50' }}>
            <Typography
              variant="h3"
              sx={{
                fontWeight: 800,
                mb: 3,
                fontSize: { xs: '2rem', md: '3rem' },
                lineHeight: 1.2,
              }}
            >
              Управляйте задачами
              <br />
              эффективно
            </Typography>
            <Typography
              variant="h6"
              sx={{
                mb: 5,
                opacity: 0.95,
                fontWeight: 400,
                lineHeight: 1.6,
              }}
            >
              Организуйте работу с помощью страниц, списков и задач.
              Следите за прогрессом в режиме реального времени.
            </Typography>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
              {features.map((feature, index) => (
                <Box key={index} sx={{ display: 'flex', gap: 2 }}>
                  <CheckCircle sx={{ fontSize: 28, flexShrink: 0 }} />
                  <Box>
                    <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                      {feature.title}
                    </Typography>
                    <Typography variant="body2" sx={{ opacity: 0.9 }}>
                      {feature.description}
                    </Typography>
                  </Box>
                </Box>
              ))}
            </Box>
          </Box>

          {/* Right side - Auth form */}
          <Box sx={{ flex: '0 0 450px' }}>
            <Card
              sx={{
                p: 4,
                borderRadius: 4,
                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.3)',
              }}
            >
              <Typography variant="h5" sx={{ fontWeight: 700, mb: 1, textAlign: 'center' }}>
                {isLogin ? 'Вход в систему' : 'Регистрация'}
              </Typography>
              <Typography variant="body2" sx={{ color: 'text.secondary', mb: 3, textAlign: 'center' }}>
                {isLogin ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт'}
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              {syncing && (
                <Box sx={{ mb: 3 }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary', mb: 1, textAlign: 'center' }}>
                    Синхронизация данных...
                  </Typography>
                  <LinearProgress />
                </Box>
              )}

              <Box component="form" onSubmit={handleSubmit}>
                {!isLogin && (
                  <TextField
                    fullWidth
                    label="Имя"
                    value={formData.name}
                    onChange={handleChange('name')}
                    sx={{ mb: 2.5 }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <Person sx={{ color: 'text.secondary' }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                )}

                <TextField
                  fullWidth
                  label="Email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange('email')}
                  required
                  sx={{ mb: 2.5 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Email sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                  }}
                />

                <TextField
                  fullWidth
                  label="Пароль"
                  type={showPassword ? 'text' : 'password'}
                  value={formData.password}
                  onChange={handleChange('password')}
                  required
                  sx={{ mb: 3 }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <Lock sx={{ color: 'text.secondary' }} />
                      </InputAdornment>
                    ),
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton
                          onClick={() => setShowPassword(!showPassword)}
                          edge="end"
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
                

                <Button
                  fullWidth
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || syncing}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    mb: 2,
                    background: 'linear-gradient(135deg, #9ce1f8 0%, #4f9ff8 100%)',
                    color: '#fff',
                    '&:hover': {
                      background: 'linear-gradient(135deg, #8dd5ec 0%, #4590e6 100%)',
                    },
                  }}
                >
                  {loading ? 'Загрузка...' : isLogin ? 'Войти' : 'Зарегистрироваться'}
                </Button>

                <Button
                  fullWidth
                  variant="outlined"
                  size="large"
                  onClick={() => {
                    enterLocalMode();
                    router.push('/');
                  }}
                  sx={{
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: '1rem',
                    mb: 2,
                    color: '#4f9ff8',
                    borderColor: '#4f9ff8',
                    borderWidth: '2px',
                    '&:hover': {
                      borderColor: '#4590e6',
                      borderWidth: '2px',
                      background: 'rgba(79, 159, 248, 0.08)',
                    },
                  }}
                >
                  Попробовать без регистрации
                </Button>

                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                    {isLogin ? 'Нет аккаунта?' : 'Уже есть аккаунт?'}{' '}
                    <Button
                      onClick={() => {
                        setIsLogin(!isLogin);
                        setError('');
                        setFormData({ name: '', email: '', password: '' });
                      }}
                      sx={{ fontWeight: 600, textTransform: 'none' }}
                    >
                      {isLogin ? 'Зарегистрироваться' : 'Войти'}
                    </Button>
                  </Typography>
                </Box>
              </Box>
            </Card>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}

'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from '@mui/material';
import Link from 'next/link';
import { useAuth } from '../model/useAuth';
import { registerSchema, type RegisterFormData } from '../types';

export const RegisterForm = () => {
  const { register: registerUser, isLoading, error } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const onSubmit = async (data: RegisterFormData) => {
    await registerUser(data);
  };

  return (
    <Box
      component="form"
      onSubmit={handleSubmit(onSubmit)}
      sx={{
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        maxWidth: 400,
        mx: 'auto',
        mt: 8,
        p: 3,
        boxShadow: 3,
        borderRadius: 2,
      }}
    >
      <Typography variant="h4" component="h1" textAlign="center" mb={2}>
        Регистрация
      </Typography>

      {error && <Alert severity="error">{error}</Alert>}

      <TextField
        label="Email"
        type="email"
        {...register('email')}
        error={!!errors.email}
        helperText={errors.email?.message}
        disabled={isLoading}
        fullWidth
      />

      <TextField
        label="Имя (необязательно)"
        {...register('name')}
        error={!!errors.name}
        helperText={errors.name?.message}
        disabled={isLoading}
        fullWidth
      />

      <TextField
        label="Пароль"
        type="password"
        {...register('password')}
        error={!!errors.password}
        helperText={errors.password?.message}
        disabled={isLoading}
        fullWidth
      />

      <Button
        type="submit"
        variant="contained"
        size="large"
        disabled={isLoading}
        fullWidth
      >
        {isLoading ? <CircularProgress size={24} /> : 'Зарегистрироваться'}
      </Button>

      <Typography textAlign="center" variant="body2">
        Уже есть аккаунт?{' '}
        <Link href="/login" style={{ color: '#1976d2' }}>
          Войти
        </Link>
      </Typography>
    </Box>
  );
};

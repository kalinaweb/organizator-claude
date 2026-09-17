import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Регистрация | Todo App',
  description: 'Создайте новый аккаунт',
};

export default function RegisterLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

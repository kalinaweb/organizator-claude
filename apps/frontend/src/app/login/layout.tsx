import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Вход | Todo App',
  description: 'Войдите в свой аккаунт',
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}

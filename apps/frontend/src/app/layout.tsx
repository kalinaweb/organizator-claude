import type { Metadata } from 'next';
import './globals.css';
import { ThemeProviderWrapper } from './providers';

export const metadata: Metadata = {
  title: 'Todo App',
  description: 'Manage your tasks with pages, lists, and todos',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru">
      <body>
        <ThemeProviderWrapper>{children}</ThemeProviderWrapper>
      </body>
    </html>
  );
}

/**
 * Утилиты для проверки авторизации.
 */

export function isAuthenticated(): boolean {
  return !!localStorage.getItem('token');
}

export function isLocalMode(): boolean {
  return localStorage.getItem('localMode') === 'true';
}

export function getToken(): string | null {
  return localStorage.getItem('token');
}

export function logout(): void {
  localStorage.removeItem('token');
}

export function enterLocalMode(): void {
  localStorage.setItem('localMode', 'true');
}

export function exitLocalMode(): void {
  localStorage.removeItem('localMode');
}

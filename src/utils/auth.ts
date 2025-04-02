// Утилиты для аутентификации администратора
import { authService } from './api';

// Ключ для хранения статуса аутентификации в localStorage
// const AUTH_STORAGE_KEY = 'hotel_forest_admin_auth';

/**
 * Проверка учетных данных администратора
 */
export const loginAdmin = async (login: string, password: string): Promise<boolean> => {
  try {
    // Используем authService из api.ts для входа
    await authService.login(login, password);
    return true;
  } catch (error) {
    console.error('Ошибка при входе:', error);
    return false;
  }
};

/**
 * Выход из системы
 */
export const logoutAdmin = (): void => {
  authService.logout();
};

/**
 * Проверка статуса аутентификации администратора
 */
export const isAdminAuthenticated = (): boolean => {
  return authService.isAuthenticated();
}; 
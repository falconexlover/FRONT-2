// Утилиты для работы с паролями
import bcrypt from 'bcryptjs';

/**
 * Хеширует пароль с использованием bcryptjs
 * @param password Пароль для хеширования
 * @returns Хешированный пароль
 */
export const hashPassword = async (password: string): Promise<string> => {
  const salt = await bcrypt.genSalt(10);
  return bcrypt.hash(password, salt);
};

/**
 * Сравнивает пароль с хешем
 * @param password Пароль для проверки
 * @param hash Хеш для сравнения
 * @returns true если пароль соответствует хешу
 */
export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
}; 
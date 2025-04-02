declare module 'bcryptjs' {
  /**
   * Генерирует синхронную соль
   * @param rounds Сложность (количество раундов)
   * @returns Сгенерированная соль
   */
  export function genSaltSync(rounds?: number): string;

  /**
   * Генерирует асинхронную соль
   * @param rounds Сложность (количество раундов)
   * @param callback Функция обратного вызова
   */
  export function genSalt(rounds: number, callback: (err: Error, salt: string) => void): void;
  export function genSalt(callback: (err: Error, salt: string) => void): void;
  export function genSalt(rounds?: number): Promise<string>;

  /**
   * Хеширует данные синхронно
   * @param data Данные для хеширования
   * @param salt Соль для хеширования
   * @returns Хешированная строка
   */
  export function hashSync(data: string | Buffer, salt: string | number): string;

  /**
   * Хеширует данные асинхронно
   * @param data Данные для хеширования
   * @param salt Соль для хеширования
   * @param callback Функция обратного вызова
   */
  export function hash(data: string | Buffer, salt: string | number, callback: (err: Error, hash: string) => void): void;
  export function hash(data: string | Buffer, salt: string | number): Promise<string>;

  /**
   * Сравнивает данные с хешем синхронно
   * @param data Проверяемые данные
   * @param hash Хеш для сравнения
   * @returns true если соответствует, иначе false
   */
  export function compareSync(data: string | Buffer, hash: string): boolean;

  /**
   * Сравнивает данные с хешем асинхронно
   * @param data Проверяемые данные
   * @param hash Хеш для сравнения
   * @param callback Функция обратного вызова
   */
  export function compare(data: string | Buffer, hash: string, callback: (err: Error, isMatch: boolean) => void): void;
  export function compare(data: string | Buffer, hash: string): Promise<boolean>;

  /**
   * Получает количество раундов из хеша
   * @param hash Хеш для проверки
   * @returns Количество раундов
   */
  export function getRounds(hash: string): number;

  /**
   * Получает соль из хеша
   * @param hash Хеш для извлечения соли
   * @returns Извлеченная соль
   */
  export function getSalt(hash: string): string;
} 
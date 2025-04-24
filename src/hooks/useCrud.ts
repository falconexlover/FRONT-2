import { useState, useCallback } from 'react';

/**
 * Универсальный CRUD-хук для работы с сущностями через сервисы API
 * @param service - объект с методами getAll, create, update, delete
 */
export function useCrud<T, CreatePayload = Partial<T>, UpdatePayload = Partial<T>>() {
  const [items, setItems] = useState<T[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Загрузка всех сущностей
  const loadAll = useCallback(async (getAll: () => Promise<T[]>) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getAll();
      setItems(data);
    } catch (err: any) {
      setError(err.message || 'Ошибка загрузки данных');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Создание новой сущности
  const createItem = useCallback(async (create: (payload: CreatePayload) => Promise<T>, payload: CreatePayload) => {
    setIsSaving(true);
    setError(null);
    try {
      const newItem = await create(payload);
      setItems(prev => [newItem, ...prev]);
      return newItem;
    } catch (err: any) {
      setError(err.message || 'Ошибка создания');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Обновление сущности
  const updateItem = useCallback(async (update: (id: string, payload: UpdatePayload) => Promise<T>, id: string, payload: UpdatePayload) => {
    setIsSaving(true);
    setError(null);
    try {
      const updated = await update(id, payload);
      setItems(prev => prev.map(item => (item as any)._id === id ? updated : item));
      return updated;
    } catch (err: any) {
      setError(err.message || 'Ошибка обновления');
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, []);

  // Удаление сущности
  const deleteItem = useCallback(async (del: (id: string) => Promise<any>, id: string) => {
    setIsDeleting(true);
    setError(null);
    try {
      await del(id);
      setItems(prev => prev.filter(item => (item as any)._id !== id));
    } catch (err: any) {
      setError(err.message || 'Ошибка удаления');
      throw err;
    } finally {
      setIsDeleting(false);
    }
  }, []);

  return {
    items,
    setItems,
    isLoading,
    isSaving,
    isDeleting,
    error,
    loadAll,
    createItem,
    updateItem,
    deleteItem,
  };
} 
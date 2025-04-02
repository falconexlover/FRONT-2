import { useState } from 'react';
import { addImagesToStorage } from './localStorageUtils';

/**
 * Интерфейс для загруженного изображения
 */
export interface UploadedImage {
  id: string;
  file: File;
  url: string;
  category: string;
  title: string;
  description: string;
  createdAt: Date;
}

/**
 * Функция для изменения размера изображения
 * @param file - Файл изображения
 * @param maxWidth - Максимальная ширина изображения после изменения размера
 * @returns Promise с новым файлом изображения измененного размера
 */
export const resizeImage = (file: File, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Создаем FileReader для чтения файла
    const reader = new FileReader();
    
    reader.onload = (event) => {
      if (!event.target || !event.target.result) {
        reject(new Error('Не удалось прочитать файл'));
        return;
      }
      
      // Создаем изображение для загрузки данных
      const img = new Image();
      
      img.onload = () => {
        // Если изображение меньше максимальной ширины, не меняем размер
        if (img.width <= maxWidth) {
          resolve(file);
          return;
        }
        
        // Вычисляем новые размеры, сохраняя пропорции
        const ratio = img.height / img.width;
        const newWidth = maxWidth;
        const newHeight = Math.round(newWidth * ratio);
        
        // Создаем canvas для рисования изображения с новым размером
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Рисуем изображение на canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось создать контекст canvas'));
          return;
        }
        
        ctx.drawImage(img, 0, 0, newWidth, newHeight);
        
        // Преобразуем canvas в blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Не удалось создать blob'));
            return;
          }
          
          // Создаем новый файл с измененным размером изображения
          const resizedFile = new File(
            [blob], 
            file.name, 
            { 
              type: file.type, 
              lastModified: Date.now() 
            }
          );
          
          resolve(resizedFile);
        }, file.type, 0.9); // качество сжатия 0.9 (90%)
      };
      
      img.onerror = () => {
        reject(new Error('Не удалось загрузить изображение'));
      };
      
      // Загружаем изображение из данных
      img.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка при чтении файла'));
    };
    
    // Читаем содержимое файла
    reader.readAsDataURL(file);
  });
};

/**
 * Хук для управления загрузкой изображений
 */
export const useImageUpload = () => {
  const [uploadedImages, setUploadedImages] = useState<UploadedImage[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /**
   * Функция для загрузки изображений
   */
  const uploadImages = async (
    files: File[], 
    category: string, 
    title: string = '', 
    description: string = ''
  ) => {
    setIsUploading(true);
    setUploadError(null);
    
    try {
      const newImages: UploadedImage[] = [];
      
      for (const file of files) {
        // Проверка типа файла
        if (!file.type.startsWith('image/')) {
          throw new Error(`Файл ${file.name} не является изображением`);
        }
        
        // Создание URL для предпросмотра
        const imageUrl = URL.createObjectURL(file);
        
        // В реальном проекте здесь будет загрузка на сервер
        // Сейчас просто добавляем в локальный стейт
        const newImage: UploadedImage = {
          id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
          file,
          url: imageUrl,
          category,
          title: title || file.name,
          description,
          createdAt: new Date()
        };
        
        newImages.push(newImage);
      }
      
      setUploadedImages(prev => [...prev, ...newImages]);
      
      // Сохраняем изображения в localStorage
      addImagesToStorage(newImages);
      
      return newImages;
    } catch (error) {
      setUploadError(error instanceof Error ? error.message : 'Произошла ошибка при загрузке изображений');
      return [];
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * Функция для удаления изображения
   */
  const removeImage = (id: string) => {
    setUploadedImages(prev => {
      const filtered = prev.filter(img => img.id !== id);
      // Освобождаем объектные URL, чтобы избежать утечек памяти
      const removed = prev.find(img => img.id === id);
      if (removed) {
        URL.revokeObjectURL(removed.url);
      }
      return filtered;
    });
  };

  /**
   * Функция для обновления метаданных изображения
   */
  const updateImageDetails = (
    id: string, 
    details: Partial<Pick<UploadedImage, 'category' | 'title' | 'description'>>
  ) => {
    setUploadedImages(prev => 
      prev.map(img => 
        img.id === id ? { ...img, ...details } : img
      )
    );
  };

  return {
    uploadedImages,
    isUploading,
    uploadError,
    uploadImages,
    removeImage,
    updateImageDetails
  };
};

/**
 * Функция для сохранения изображения на сервере
 * В реальном проекте эта функция будет отправлять файлы на бэкенд
 */
export const saveImageToServer = async (image: File, category: string): Promise<string> => {
  // Здесь будет реальная логика загрузки на сервер
  // Сейчас просто имитируем асинхронную загрузку
  return new Promise((resolve) => {
    setTimeout(() => {
      // Возвращаем путь к изображению в публичной папке
      // В реальности это будет URL, возвращенный сервером
      resolve(`/images/gallery/${category.toLowerCase()}/${image.name}`);
    }, 1000);
  });
}; 
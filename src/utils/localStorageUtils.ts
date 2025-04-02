import { UploadedImage } from './imageUpload';

// Ключ для сохранения данных в localStorage
const GALLERY_STORAGE_KEY = 'hotel_forest_gallery_images';

/**
 * Сохраняет массив загруженных изображений в localStorage
 */
export const saveGalleryToStorage = (images: UploadedImage[]): void => {
  try {
    // Преобразуем объекты File в сериализуемый формат (только URL и мета-информация)
    const serializableImages = images.map(img => ({
      id: img.id,
      url: img.url,
      category: img.category,
      title: img.title,
      description: img.description,
      createdAt: img.createdAt.toISOString(),
      // Добавляем метаданные файла, которые могут пригодиться
      fileName: img.file.name,
      fileType: img.file.type,
      fileSize: img.file.size
    }));
    
    localStorage.setItem(GALLERY_STORAGE_KEY, JSON.stringify(serializableImages));
  } catch (error) {
    console.error('Ошибка при сохранении галереи в localStorage:', error);
  }
};

/**
 * Загружает массив изображений из localStorage
 * В реальном проекте здесь была бы загрузка с сервера
 */
export const loadGalleryFromStorage = (): Partial<UploadedImage>[] => {
  try {
    const storedData = localStorage.getItem(GALLERY_STORAGE_KEY);
    if (!storedData) return [];
    
    const parsedData = JSON.parse(storedData);
    
    // Преобразуем даты обратно в объекты Date
    return parsedData.map((item: any) => ({
      ...item,
      createdAt: new Date(item.createdAt)
    }));
  } catch (error) {
    console.error('Ошибка при загрузке галереи из localStorage:', error);
    return [];
  }
};

/**
 * Удаляет сохраненную галерею из localStorage
 */
export const clearGalleryStorage = (): void => {
  try {
    localStorage.removeItem(GALLERY_STORAGE_KEY);
  } catch (error) {
    console.error('Ошибка при очистке галереи в localStorage:', error);
  }
};

/**
 * Добавляет новые изображения в сохраненную галерею
 */
export const addImagesToStorage = (newImages: UploadedImage[]): void => {
  try {
    const existingImages = loadGalleryFromStorage();
    const allImages = [...existingImages, ...newImages.map(img => ({
      id: img.id,
      url: img.url,
      category: img.category,
      title: img.title,
      description: img.description,
      createdAt: img.createdAt,
      fileName: img.file.name,
      fileType: img.file.type,
      fileSize: img.file.size
    }))];
    
    saveGalleryToStorage(allImages as UploadedImage[]);
  } catch (error) {
    console.error('Ошибка при добавлении изображений в localStorage:', error);
  }
};

/**
 * Удаляет изображение из сохраненной галереи
 */
export const removeImageFromStorage = (imageId: string): void => {
  try {
    const images = loadGalleryFromStorage();
    const filteredImages = images.filter(img => img.id !== imageId);
    saveGalleryToStorage(filteredImages as UploadedImage[]);
  } catch (error) {
    console.error('Ошибка при удалении изображения из localStorage:', error);
  }
};

/**
 * Обновляет метаданные изображения в сохраненной галерее
 */
export const updateImageInStorage = (
  imageId: string, 
  updates: Partial<Pick<UploadedImage, 'category' | 'title' | 'description'>>
): void => {
  try {
    const images = loadGalleryFromStorage();
    const updatedImages = images.map(img => 
      img.id === imageId ? { ...img, ...updates } : img
    );
    saveGalleryToStorage(updatedImages as UploadedImage[]);
  } catch (error) {
    console.error('Ошибка при обновлении изображения в localStorage:', error);
  }
}; 
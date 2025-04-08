// Общий тип для изображения галереи
export interface GalleryImageItem {
  _id: string;
  imageUrl: string;
  cloudinaryPublicId?: string; // ID для удаления из Cloudinary
  category: string;
  title?: string; // Название может быть опциональным
  description?: string; // Описание может быть опциональным
  createdAt?: string; // Дата добавления (если нужна)
  updatedAt?: string;
} 
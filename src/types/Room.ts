// FRONT-2/src/types/Room.ts

// Общий интерфейс для данных номера, используемый во всем фронтенде
export interface RoomType {
  _id?: string; // ID от MongoDB (присутствует у существующих номеров)
  title: string;
  description?: string; // Добавляем необязательное поле description
  imageUrl?: string; // URL изображения (может отсутствовать при создании)
  price: string; // Строковое представление цены (напр., "3 500 ₽ / сутки")
  priceValue: number; // Числовое значение цены
  capacity: number; // Вместимость
  features: string[]; // Массив удобств
  isAvailable?: boolean; // Доступность (опционально, может управляться бэкендом)
  cloudinaryPublicId?: string; // ID изображения в Cloudinary (опционально)
  createdAt?: string; // Дата создания (опционально)
  updatedAt?: string; // Дата обновления (опционально)
} 
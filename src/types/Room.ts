// FRONT-2/src/types/Room.ts

// Общий интерфейс для данных номера, используемый во всем фронтенде
export interface RoomType {
  _id: string; // ID из MongoDB
  title: string;
  // Заменяем imageUrl на массив
  imageUrls: string[]; 
  // Добавляем массив ID из Cloudinary (может понадобиться в админке)
  cloudinaryPublicIds?: string[]; 
  price: string; // Строка для отображения (напр. "2500 Р / сутки")
  pricePerNight: number; // Числовое значение цены для расчетов (переименовал из priceValue)
  capacity: number;
  features: string[];
  description?: string; // Описание номера
  fullDescription?: string; // Подробное описание номера
  isAvailable?: boolean; // Доступность номера
  displayOrder?: number; // Добавляем поле для порядка
  createdAt?: string; // Дата создания (опционально)
  updatedAt?: string; // Дата обновления (опционально)
  bathroomImages?: string[];
  bathroomCloudinaryPublicIds?: string[];
} 
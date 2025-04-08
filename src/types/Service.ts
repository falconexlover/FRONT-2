// Тип для услуги
export interface ServiceType {
  _id: string;
  name: string;
  description: string;
  icon: string; // Класс иконки FontAwesome или путь к SVG
  price?: number; // Цена может быть необязательной
  createdAt?: string;
  updatedAt?: string;
} 
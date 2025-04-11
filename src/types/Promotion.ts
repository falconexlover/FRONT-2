export interface PromotionType {
  _id: string; // Добавляется MongoDB
  title: string;
  description?: string; // Опциональное описание
  imageUrl?: string; // <-- Добавлено опциональное поле для URL изображения
  discountType: 'percentage' | 'fixed_amount';
  discountValue: number;
  code?: string; // Опциональный промокод
  startDate?: string; // Дата в виде строки (ISO format), т.к. JSON не поддерживает Date
  endDate?: string;   // Дата в виде строки (ISO format)
  isActive: boolean;
  createdAt: string; // Добавляется timestamps
  updatedAt: string; // Добавляется timestamps
} 
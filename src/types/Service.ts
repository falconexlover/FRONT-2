export interface ServiceType {
  _id?: string; // ID от MongoDB (присутствует у существующих услуг)
  title: string;
  description?: string; // Необязательное описание услуги
  icon?: string; // URL иконки (может отсутствовать при создании)
} 
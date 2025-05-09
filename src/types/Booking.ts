// FRONT-2/src/types/Booking.ts

// Создаем отдельный файл для типов, связанных с бронированием

export interface BookingData {
  roomId: string;
  checkIn: string; // Можно использовать тип Date, если требуется более строгая типизация
  checkOut: string; // Можно использовать тип Date
  guests: { adults: number; children?: number }; // Изменяем тип на объект
  guestName: string;
  guestEmail: string;
  guestPhone: string;
  notes?: string; // Делаем заметки необязательными
  totalPrice: number;
  numberOfNights: number;
  // Дополнительные поля, если они используются в API, но не ожидаются от формы
}

export interface BookingConfirmation {
  _id?: string; // ID созданного бронирования
  bookingId?: string; // Используем bookingId вместо _id для единообразия
  bookingNumber: string; // Номер бронирования для клиента
  status: string; // Статус бронирования (e.g., 'waiting_for_payment', 'paid')
  confirmationUrl?: string; // URL для редиректа на оплату
  message?: string; // Дополнительное сообщение от бэкенда
  // Можно добавить детали бронирования, если API их возвращает
  room?: { // Пример: детали комнаты
    name: string;
    // ... другие поля комнаты
  };
  checkIn?: string;
  checkOut?: string;
  guestName?: string;
  totalPrice?: number;
}

// Можно добавить и другие связанные типы, если они есть (например, для ошибок) 
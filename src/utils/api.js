const API_URL = process.env.REACT_APP_API_URL || 'https://your-api-url.com/api';

// Функция для получения всех комнат
export const getRooms = async () => {
  try {
    const response = await fetch(`${API_URL}/rooms`);
    
    if (!response.ok) {
      throw new Error('Не удалось получить список комнат');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при загрузке комнат:', error);
    throw error;
  }
};

// Функция для получения комнаты по ID
export const getRoomById = async (roomId) => {
  try {
    const response = await fetch(`${API_URL}/rooms/${roomId}`);
    
    if (!response.ok) {
      throw new Error('Не удалось получить данные о комнате');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Ошибка при загрузке комнаты ${roomId}:`, error);
    throw error;
  }
};

// Функция для проверки доступности комнаты
export const checkRoomAvailability = async (roomId, checkIn, checkOut) => {
  try {
    const response = await fetch(`${API_URL}/rooms/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        roomId,
        checkIn,
        checkOut,
      }),
    });
    
    if (!response.ok) {
      throw new Error('Не удалось проверить доступность комнаты');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при проверке доступности:', error);
    throw error;
  }
};

// Функция для создания бронирования
export const createBooking = async (bookingData) => {
  try {
    const response = await fetch(`${API_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Не удалось создать бронирование');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Ошибка при создании бронирования:', error);
    throw error;
  }
};

// Функция для получения бронирования по номеру
export const getBookingByNumber = async (bookingNumber) => {
  try {
    const response = await fetch(`${API_URL}/bookings/${bookingNumber}`);
    
    if (!response.ok) {
      throw new Error('Не удалось получить данные о бронировании');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Ошибка при загрузке бронирования ${bookingNumber}:`, error);
    throw error;
  }
}; 
// Импорт необходимых типов
import { RoomType } from '../types/Room'; // Раскомментируем импорт
import { ServiceType } from '../types/Service';
import { HomePageContent } from '../types/HomePage'; // Импортируем тип для главной страницы
// Убираем временные определения типов Booking и импортируем из нового файла
import { BookingData, BookingConfirmation } from '../types/Booking';
import { GalleryImageItem } from '../types/GalleryImage';
import { PromotionType } from '../types/Promotion'; // <<< Раскомментируем и используем
import axios from 'axios';
import { toast } from 'react-toastify';

// API сервис для взаимодействия с бэкендом
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

// Создаем экземпляр axios
const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
});

// Добавляем интерцептор для обработки ошибок 401/403
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && (error.response.status === 401 || error.response.status === 403)) {
      // Очищаем токен и перезагружаем страницу для редиректа на вход (или показываем сообщение)
      localStorage.removeItem('authToken');
      toast.error('Сессия истекла или доступ запрещен. Пожалуйста, войдите снова.');
      // Можно добавить редирект window.location.href = '/login';
    }
    // Прокидываем ошибку дальше
    return Promise.reject(error);
  }
);

// --- Временно возвращаем тип для элемента галереи --- 
// TODO: Вынести в /types/Gallery.ts
// --------------------------------------------------

// --- УБИРАЕМ ВРЕМЕННЫЕ ОПРЕДЕЛЕНИЯ ТИПОВ Booking ---
// ... (комментарии и удаленные интерфейсы Booking)
// --------------------------------------------------

// Интерфейс для токена аутентификации - ВОЗВРАЩАЕМ ОПРЕДЕЛЕНИЕ
interface TokenData {
  token: string;
  expiresIn: string;
}

// --- Обновляем handleResponse, делаем дженериком --- 
// Функция для проверки ответа от сервера
async function handleResponse<T>(response: Response): Promise<T> {
  // Проверка на пустой ответ (например, при DELETE запросе)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    // Возвращаем null или пустой объект/массив в зависимости от ожидаемого T
    // Для простоты пока вернем null, но это может потребовать уточнений
    return null as T; 
  }

  const data = await response.json();
  
  if (!response.ok) {
    // Уточняем тип ошибки, если возможно
    const error = (data && typeof data === 'object' && data.message) || response.statusText || `Request failed with status ${response.status}`;
    return Promise.reject(new Error(error)); // Возвращаем объект Error
  }
  
  return data as T; // Используем утверждение типа, доверяя API
}
// ----------------------------------------------------

/**
 * Функции для работы с аутентификацией
 */
export const authService = {
  // Вход в систему
  async login(username: string, password: string): Promise<TokenData> {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await handleResponse<TokenData>(response);
    
    if (data.token) {
      // Сохраняем токен в localStorage
      localStorage.setItem('hotel_forest_admin_auth', JSON.stringify({
        isAuthenticated: true,
        token: data.token,
        timestamp: Date.now(),
        expiresIn: data.expiresIn || 3600000
      }));
    }
    
    return data;
  },
  
  // Выход из системы
  logout(): void {
    localStorage.removeItem('hotel_forest_admin_auth');
  },
  
  // Проверка статуса аутентификации
  isAuthenticated(): boolean {
    try {
      const authData = localStorage.getItem('hotel_forest_admin_auth');
      if (!authData) return false;
      
      const { isAuthenticated, timestamp, expiresIn } = JSON.parse(authData);
      
      // Проверяем, не истек ли срок действия токена
      if (isAuthenticated && Date.now() - timestamp < expiresIn) {
        return true;
      }
      
      // Если срок истек, удаляем токен
      localStorage.removeItem('hotel_forest_admin_auth');
      return false;
    } catch (error) {
      console.error('Ошибка при проверке аутентификации:', error);
      return false;
    }
  },
  
  // Получение токена
  getToken(): string | null {
    try {
      const authData = localStorage.getItem('hotel_forest_admin_auth');
      if (!authData) return null;
      
      const { token } = JSON.parse(authData);
      return token;
    } catch {
      return null;
    }
  }
};

/**
 * Функции для работы с галереей
 */
export const galleryService = {
  // Получить все изображения
  async getAllImages(category?: string): Promise<GalleryImageItem[]> {
    const url = category ? `${API_BASE_URL}/gallery?category=${category}` : `${API_BASE_URL}/gallery`;
    const response = await fetch(url);
    const result = await handleResponse<GalleryImageItem[] | null>(response);
    return Array.isArray(result) ? result : [];
  },
  
  // Получить изображение по ID
  async getImageById(id: string): Promise<GalleryImageItem | null> {
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`);
    return handleResponse<GalleryImageItem | null>(response);
  },
  
  // Загрузить новое изображение
  async uploadImage(formData: FormData): Promise<GalleryImageItem> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse<GalleryImageItem>(response);
  },
  
  // Обновить информацию об изображении
  async updateImage(id: string, updates: Partial<GalleryImageItem>): Promise<GalleryImageItem> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    return handleResponse<GalleryImageItem>(response);
  },
  
  // Удалить изображение
  async deleteImage(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    await handleResponse<null>(response);
  }
};

/**
 * Функции для работы с номерами
 */
export const roomsService = {
  // Получить все номера
  async getAllRooms(): Promise<RoomType[]> {
    const response = await fetch(`${API_BASE_URL}/rooms`);
    // Указываем ожидаемый тип в handleResponse
    const result = await handleResponse<RoomType[] | null>(response);
    // Возвращаем массив или пустой массив, если null
    return Array.isArray(result) ? result : [];
  },
  
  // Получить номер по ID
  async getRoomById(id: string): Promise<RoomType | null> {
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`);
    return handleResponse<RoomType | null>(response);
  },
  
  // Создать новый номер
  async createRoom(formData: FormData): Promise<RoomType> {
    const token = authService.getToken();
    
    if (!token) {
      // Возвращаем отклоненный промис с ошибкой
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    // Ожидаем созданный объект RoomType
    return handleResponse<RoomType>(response);
  },
  
  // Обновить информацию о номере
  async updateRoom(id: string, formData: FormData): Promise<RoomType> {
    const token = authService.getToken();
    
    if (!token) {
      // Возвращаем отклоненный промис с ошибкой
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    // Ожидаем обновленный объект RoomType
    return handleResponse<RoomType>(response);
  },
  
  // Удалить номер
  async deleteRoom(id: string): Promise<void> {
    const token = authService.getToken();
    
    if (!token) {
      // Возвращаем отклоненный промис с ошибкой
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/rooms/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Ожидаем null или void
    await handleResponse<null>(response); // handleResponse<void> не сработает, т.к. нужен тип для JSON
  }
};

/**
 * Функции для работы с главной страницей
 */
export const homePageService = {
  // Получить контент главной страницы
  async getHomePage(): Promise<HomePageContent | null> {
    const response = await fetch(`${API_BASE_URL}/homepage`);
    return handleResponse<HomePageContent | null>(response);
  },
  
  // Загрузить изображение для главной страницы
  async uploadHomePageImage(file: File, section: string): Promise<HomePageContent | null> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Требуется аутентификация');
    }
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', section);

    const response = await fetch(`${API_BASE_URL}/homepage/image`, { // ВНИМАНИЕ: Этот роут может не существовать на бэке
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
      body: formData,
    });
    // Эта функция может возвращать не HomePageContent, а { imageUrl: string } или другое
    // Требуется проверка бэкенда
    return handleResponse<HomePageContent | null>(response); 
  },
  
  // Обновить все данные главной страницы
  async updateHomePageData(data: Partial<HomePageContent>): Promise<HomePageContent | null> {
    const token = authService.getToken();
    if (!token) throw new Error('Требуется аутентификация');
    const response = await fetch(`${API_BASE_URL}/homepage`, { // Используем корневой PUT роут
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(data), // Отправляем весь объект данных
    });
    return handleResponse<HomePageContent | null>(response);
  }
};

/**
 * Функции для работы с бронированиями
 */
export const bookingService = {
  // Проверка доступности номера
  async checkRoomAvailability(roomId: string, checkIn: string, checkOut: string): Promise<{ isAvailable: boolean; message?: string }> {
    const response = await fetch(`${API_BASE_URL}/rooms/check-availability`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ roomId, checkIn, checkOut }),
    });
    return handleResponse<{ isAvailable: boolean; message?: string }>(response);
  },

  // Создание бронирования
  async createBooking(bookingData: BookingData): Promise<BookingConfirmation> {
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(bookingData),
    });
    return handleResponse<BookingConfirmation>(response);
  },

  // Можно добавить метод для получения бронирования по номеру, если он будет нужен
  // async getBookingByNumber(bookingNumber: string): Promise<any> { ... }
};

/**
 * Функции для работы с Услугами
 */
export const servicesService = {
    // Получить все услуги
    async getAllServices(): Promise<ServiceType[]> { 
        const response = await fetch(`${API_BASE_URL}/services`);
        return handleResponse<ServiceType[]>(response);
    },

    // Создать новую услугу
    async createService(serviceData: Partial<Omit<ServiceType, '_id'>>): Promise<ServiceType> {
        const token = authService.getToken();
        if (!token) throw new Error('Требуется аутентификация');
        
        const response = await fetch(`${API_BASE_URL}/services`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serviceData)
        });
        return handleResponse<ServiceType>(response);
    },

    // Обновить услугу
    async updateService(id: string, serviceData: Partial<Omit<ServiceType, '_id'>>): Promise<ServiceType> {
        const token = authService.getToken();
        if (!token) throw new Error('Требуется аутентификация');

        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(serviceData)
        });
        return handleResponse<ServiceType>(response);
    },

    // Удалить услугу
    async deleteService(id: string): Promise<{ message: string }> {
        const token = authService.getToken();
        if (!token) throw new Error('Требуется аутентификация');

        const response = await fetch(`${API_BASE_URL}/services/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        return handleResponse<{ message: string }>(response);
    }
};

// Не забудьте добавить тип ServiceItem в файл типов, например, types/Service.ts
// export interface ServiceItem {
//   _id: string;
//   name: string;
//   description: string;
//   icon: string;
//   price?: number;
//   createdAt?: string;
//   updatedAt?: string;
// }

// Убедимся, что ServiceType импортирован или определен
// Если нет, нужно добавить:
// import { ServiceType } from '../types/Service'; 
// Или определить интерфейс здесь, если он простой
/* 
interface ServiceType {
  _id?: string;
  title: string;
  description?: string;
  icon?: string;
} 
*/ 

// --- Promotions Service --- 
export const promotionsService = {
  getAllPromotions: async (): Promise<PromotionType[]> => {
    const token = authService.getToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}/promotions`, { headers });
    return handleResponse<PromotionType[]>(response);
  },

  getPromotionById: async (id: string): Promise<PromotionType> => {
    const token = authService.getToken();
    const headers: HeadersInit = token ? { 'Authorization': `Bearer ${token}` } : {};
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, { headers });
    return handleResponse<PromotionType>(response);
  },

  createPromotion: async (promotionData: Omit<PromotionType, '_id' | 'createdAt' | 'updatedAt'>): Promise<PromotionType> => {
    const token = authService.getToken();
    if (!token) throw new Error('Требуется аутентификация');
    const response = await fetch(`${API_BASE_URL}/promotions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(promotionData),
    });
    return handleResponse<PromotionType>(response);
  },

  updatePromotion: async (id: string, promotionData: Partial<Omit<PromotionType, '_id' | 'createdAt' | 'updatedAt'>>): Promise<PromotionType> => {
    const token = authService.getToken();
    if (!token) throw new Error('Требуется аутентификация');
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify(promotionData),
    });
    return handleResponse<PromotionType>(response);
  },

  deletePromotion: async (id: string): Promise<{ message: string }> => {
    const token = authService.getToken();
    if (!token) throw new Error('Требуется аутентификация');
    const response = await fetch(`${API_BASE_URL}/promotions/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(errorData.message || `Ошибка удаления: ${response.status}`);
    }
    try {
      return await response.json();
    } catch (e) {
      return { message: 'Акция успешно удалена' }; 
    }
  },
}; 
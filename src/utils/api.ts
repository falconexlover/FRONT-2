import { RoomType } from '../types/Room'; // Раскомментируем импорт
import { ServiceType } from '../types/Service';
import { HomePageContent } from '../types/HomePage'; // Импортируем тип для главной страницы
// Убираем временные определения типов Booking и импортируем из нового файла
import { BookingData, BookingConfirmation } from '../types/Booking';
import { GalleryImageItem } from '../types/GalleryImage';
import { PromotionType } from '../types/Promotion'; // <<< Раскомментируем и используем
import { ArticleType } from '../types/Article'; // <<< Убираем неиспользуемый ContentBlock
import axios from 'axios';
import { toast } from 'react-toastify';

// API сервис для взаимодействия с бэкендом
export const API_BASE_URL: string = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

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
export interface TokenData {
  token: string;
  expiresIn: number;
}

// --- Обновляем handleResponse, делаем дженериком --- 
// Функция для проверки ответа от сервера
async function handleResponse<T>(response: Response): Promise<T> {
  // Проверка на пустой ответ (например, при DELETE запросе)
  if (response.status === 204 || response.headers.get('content-length') === '0') {
    return null as T;
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    // Если ответ не JSON, но статус OK, возможно, это не ошибка API
    if (response.ok) {
        console.warn("Ответ сервера не является JSON, но статус OK:", response.status, response.statusText);
        // Возвращаем что-то осмысленное или null
        return null as T; 
    } else {
        // Если статус не OK и не JSON, выбрасываем ошибку со статусом
        return Promise.reject(new Error(response.statusText || `Request failed with status ${response.status}`));
    }
  }
  
  if (!response.ok) {
    // Формируем сообщение об ошибке
    let errorMessage = (data && typeof data === 'object' && data.message) || response.statusText || `Request failed with status ${response.status}`;
    
    // Если есть детали валидации (errors), добавляем их
    if (data && data.errors && Array.isArray(data.errors)) {
        const validationErrors = data.errors.map((e: any) => `${e.field}: ${e.message}`).join('\n');
        errorMessage += `\nДетали:\n${validationErrors}`;
    }
    
    // Возвращаем объект Error с полным сообщением
    return Promise.reject(new Error(errorMessage)); 
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
  },
  
  // Проверка токена на бэкенде
  async verifyToken(token: string): Promise<any> {
    const response = await fetch(`${API_BASE_URL}/auth/verify`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Если ответ не OK, handleResponse выбросит ошибку, и проверка не пройдет
    return handleResponse<any>(response);
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
  },
  
  // Обновить порядок изображений
  async updateImageOrder(orderedIds: string[]): Promise<{ message: string, modifiedCount: number }> {
      const token = authService.getToken();
      if (!token) {
          return Promise.reject(new Error('Требуется аутентификация'));
      }
      
      const response = await fetch(`${API_BASE_URL}/gallery/order`, {
          method: 'PUT',
          headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ orderedIds })
      });
      return handleResponse<{ message: string, modifiedCount: number }>(response);
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
  },

  // Обновить порядок комнат
  async updateRoomsOrder(orderedIds: string[]): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/rooms/order`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ orderedIds })
    });
    return handleResponse<{ message: string }>(response);
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
  
  // Загрузить ОДИНОЧНОЕ изображение для секции (banner, about)
  async uploadHomePageImage(file: File, section: string): Promise<HomePageContent | null> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', section);
    
    const response = await fetch(`${API_BASE_URL}/homepage/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    return handleResponse<HomePageContent | null>(response);
  },

  // Добавить изображение в МАССИВ секции (conference, party)
  async addHomePageSectionImage(file: File, section: 'conference' | 'party'): Promise<HomePageContent['conference'] | HomePageContent['party'] | null> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const formData = new FormData();
    formData.append('image', file);
    formData.append('section', section);
    
    const response = await fetch(`${API_BASE_URL}/homepage/section-image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    // Бэкенд возвращает обновленную секцию
    return handleResponse<HomePageContent['conference'] | HomePageContent['party'] | null>(response);
  },

  // Удалить изображение из МАССИВА секции (conference, party)
  async deleteHomePageSectionImage(publicId: string, section: 'conference' | 'party'): Promise<HomePageContent['conference'] | HomePageContent['party'] | null> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }
    
    const response = await fetch(`${API_BASE_URL}/homepage/section-image`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ publicId, section })
    });
    // Бэкенд возвращает обновленную секцию
    return handleResponse<HomePageContent['conference'] | HomePageContent['party'] | null>(response);
  },

  // Обновить текстовые данные главной страницы (весь объект или частично)
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

  // Получить бронирование по номеру бронирования
  async getBookingByNumber(bookingNumber: string): Promise<BookingConfirmation> {
    const response = await fetch(`${API_BASE_URL}/bookings/${bookingNumber}`);
    return handleResponse<BookingConfirmation>(response);
  },
  
  // Получить бронирование по ID
  async getBookingById(id: string): Promise<BookingConfirmation> {
      const response = await fetch(`${API_BASE_URL}/bookings/id/${id}`);
      return handleResponse<BookingConfirmation>(response);
  },

  // Получить все бронирования (для админа)
  async getAllBookings(): Promise<BookingConfirmation[]> { // Уточняем тип возвращаемого массива
    const token = authService.getToken();
    if (!token) return Promise.reject(new Error('Требуется аутентификация'));
    
    const response = await fetch(`${API_BASE_URL}/bookings`, {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });
    const result = await handleResponse<BookingConfirmation[] | null>(response);
    return Array.isArray(result) ? result : [];
  },
  
  // Удалить бронирование (для админа)
  async deleteBooking(id: string): Promise<void> {
    const token = authService.getToken();
    if (!token) return Promise.reject(new Error('Требуется аутентификация'));
    
    const response = await fetch(`${API_BASE_URL}/bookings/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
        }
    });
    await handleResponse<null>(response);
  },
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
// Тип для данных, отправляемых при создании/обновлении акции
// Может быть либо FormData, либо объект с частичными данными
type PromotionPayload = FormData | Partial<Omit<PromotionType, '_id' | 'createdAt' | 'updatedAt'>>;

export const promotionsService = {
  // Получить все акции
  async getAllPromotions(): Promise<PromotionType[]> {
    try {
      const response = await axiosInstance.get('/promotions');
      return response.data;
    } catch (error) {
      console.error("Ошибка при получении акций:", error);
      throw error; // Перебрасываем ошибку для обработки в компоненте
    }
  },

  // Создать новую акцию
  async createPromotion(promotionData: PromotionPayload): Promise<PromotionType> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Требуется аутентификация');
    }
    try {
      const headers: Record<string, string> = {
        'Authorization': `Bearer ${token}`
      };
      // Не устанавливаем Content-Type, если это FormData, axios сделает это сам
      if (!(promotionData instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
      }
      const response = await axiosInstance.post('/promotions', promotionData, { headers });
      return response.data;
    } catch (error) {
      console.error("Ошибка при создании акции:", error);
      throw error;
    }
  },

  // Обновить акцию
  async updatePromotion(id: string, promotionData: PromotionPayload): Promise<PromotionType> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Требуется аутентификация');
    }
    try {
      const headers: Record<string, string> = {
          'Authorization': `Bearer ${token}`
      };
      // Не устанавливаем Content-Type, если это FormData
      if (!(promotionData instanceof FormData)) {
          headers['Content-Type'] = 'application/json';
      }
      const response = await axiosInstance.put(`/promotions/${id}`, promotionData, { headers });
      return response.data;
    } catch (error) {
      console.error(`Ошибка при обновлении акции ${id}:`, error);
      throw error;
    }
  },

  // Удалить акцию
  async deletePromotion(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      throw new Error('Требуется аутентификация');
    }
    try {
      const response = await axiosInstance.delete(`/promotions/${id}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      return response.data; // Ожидаем объект с сообщением
    } catch (error) {
      console.error(`Ошибка при удалении акции ${id}:`, error);
      throw error;
    }
  }
};

// --- Page Service ---
// const PROMOTIONS_API_URL = `${API_BASE_URL}/promotions`; // Удалено
// const ARTICLES_API_URL = `${API_BASE_URL}/articles`; // Удалено
// const SETTINGS_API_URL = `${API_BASE_URL}/settings`; // Удалено

// Тип для ответа API (содержит content)
interface PageApiResponse {
  _id?: string;
  pageId: string;
  content: any; 
  createdAt?: string;
  updatedAt?: string;
}

export const pageService = {
  // Получить контент страницы по ID
  getPageContent: async (pageId: string): Promise<PageApiResponse> => {
    console.log(`[API] Fetching content for page: ${pageId}`);
    // Используем axiosInstance для консистентности и обработки ошибок
    try {
        const response = await axiosInstance.get(`/pages/${pageId}`);
        return response.data;
    } catch (error) {
        console.error(`[API] Error fetching content for page ${pageId}:`, error);
        // Можно вернуть null или пробросить ошибку
        // Если возвращаем null, компоненты должны это обрабатывать
        // Пробрасывание ошибки позволит использовать try/catch в компонентах
        throw error; // Пробрасываем для обработки в компоненте
    }
  },

  // Обновить контент страницы по ID
  updatePageContent: async (pageId: string, content: any): Promise<PageApiResponse> => {
    console.log(`[API] Updating content for page: ${pageId}`);
    const token = authService.getToken();
    if (!token) throw new Error('Требуется аутентификация');
    // Используем axiosInstance
    try {
        const response = await axiosInstance.put(`/pages/${pageId}`, { content }, {
             headers: { 'Authorization': `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        console.error(`[API] Error updating content for page ${pageId}:`, error);
        throw error;
    }
  },

  /**
   * Добавить изображение на страницу
   * Запрос: POST /api/pages/:pageId/image
   * Тело: FormData с полем 'image' (файл)
   * Ответ: Обновленный документ Page
   */
  addPageImage: async (pageId: string, file: File): Promise<PageApiResponse> => {
    console.log(`[API] Добавление изображения для pageId=${pageId}, file=${file.name}`);
    const token = authService.getToken();
    if (!token) throw new Error('Требуется аутентификация');

    const formData = new FormData();
    formData.append('image', file); 

    try {
        const response = await axiosInstance.post(`/pages/${pageId}/image`, formData, {
            headers: {
                'Authorization': `Bearer ${token}`,
                // Content-Type не указываем, axios сделает это для FormData
            }
        });
        return response.data;
    } catch (error) {
        console.error(`[API] Ошибка добавления изображения для pageId=${pageId}:`, error);
        throw error;
    }
  },

  /**
   * Удалить изображение со страницы
   * Запрос: DELETE /api/pages/:pageId/image
   * Тело: { publicId: string }
   * Ответ: Обновленный документ Page
   */
  deletePageImage: async (pageId: string, publicId: string): Promise<PageApiResponse> => {
    console.log(`[API] Удаление изображения для pageId=${pageId}, publicId=${publicId}`);
    const token = authService.getToken();
    if (!token) throw new Error('Требуется аутентификация');

    try {
        const response = await axiosInstance.delete(`/pages/${pageId}/image`, {
            headers: { 'Authorization': `Bearer ${token}` },
            data: { publicId } // Передаем publicId в теле запроса
        });
        return response.data;
    } catch (error) {
        console.error(`[API] Ошибка удаления изображения для pageId=${pageId}:`, error);
        throw error;
    }
  },
};

/**
 * Функции для работы со статьями (блогом)
 */
export const articleService = {
  // Получить все статьи (админка и публичная часть)
  async getAllArticles(): Promise<ArticleType[]> {
    const response = await fetch(`${API_BASE_URL}/articles`);
    const result = await handleResponse<ArticleType[] | null>(response);
    return Array.isArray(result) ? result : [];
  },

  // Получить статью по slug (публичная часть)
  async getArticleBySlug(slug: string): Promise<ArticleType | null> {
    const response = await fetch(`${API_BASE_URL}/articles/slug/${slug}`);
    // Обработка случая 404 Not Found
    if (response.status === 404) {
      return null;
    }
    return handleResponse<ArticleType | null>(response);
  },

  // Создать новую статью (админка)
  // Теперь поддерживается загрузка фото сразу при создании
  async createArticle(articleData: Partial<Omit<ArticleType, '_id' | 'slug' | 'createdAt' | 'updatedAt'>> & { imageFile?: File }): Promise<ArticleType> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }

    if (!articleData.title || !articleData.contentBlocks) {
      return Promise.reject(new Error('Заголовок и контент статьи обязательны'));
    }

    const content = Array.isArray(articleData.contentBlocks)
      ? (
          articleData.contentBlocks.find(
            (b) => b.type === 'intro'
          ) as { text: string } | undefined
        )?.text || ''
      : '';

    // Если есть файл изображения — отправляем FormData
    if (articleData.imageFile) {
      const formData = new FormData();
      formData.append('title', articleData.title);
      formData.append('content', content);
      formData.append('contentBlocks', JSON.stringify(articleData.contentBlocks));
      formData.append('image', articleData.imageFile);
      // Добавить остальные поля, если нужно
      if (articleData.excerpt) formData.append('excerpt', articleData.excerpt);
      if (articleData.author) formData.append('author', articleData.author);
      // ... другие поля по необходимости

      const response = await fetch(`${API_BASE_URL}/articles`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      return handleResponse<ArticleType>(response);
    }

    // Если файла нет — отправляем JSON
    const response = await fetch(`${API_BASE_URL}/articles`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify({ ...articleData, content }),
    });
    return handleResponse<ArticleType>(response);
  },

  // Обновить статью по ID (админка)
  // Принимаем Partial<Omit<ArticleType, '_id' | 'slug' | 'createdAt' | 'updatedAt'>> для обновления
  async updateArticle(id: string, articleData: Partial<Omit<ArticleType, '_id' | 'slug' | 'createdAt' | 'updatedAt'>>): Promise<ArticleType> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }

    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(articleData)
    });
    return handleResponse<ArticleType>(response);
  },

  // Удалить статью по ID (админка)
  async deleteArticle(id: string): Promise<{ message: string }> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }

    const response = await fetch(`${API_BASE_URL}/articles/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    // Ожидаем объект с сообщением или null при 204
    const result = await handleResponse<{ message: string } | null>(response);
    return result || { message: 'Статья успешно удалена' }; // Возвращаем стандартное сообщение, если ответ пустой
  },

  // Загрузить/обновить изображение для статьи (админка)
  async uploadArticleImage(id: string, file: File): Promise<ArticleType> {
    const token = authService.getToken();
    if (!token) {
      return Promise.reject(new Error('Требуется аутентификация'));
    }

    const formData = new FormData();
    formData.append('image', file);

    const response = await fetch(`${API_BASE_URL}/articles/${id}/image`, {
      method: 'POST', // Или PUT, если бэкенд так настроен для обновления
      headers: {
        'Authorization': `Bearer ${token}`
        // Content-Type не указываем, браузер сделает это сам для FormData
      },
      body: formData
    });
    return handleResponse<ArticleType>(response);
  }
}; 
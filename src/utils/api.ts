// API сервис для взаимодействия с бэкендом
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Интерфейс для токена аутентификации
interface TokenData {
  token: string;
  expiresIn: string;
}

// Функция для проверки ответа от сервера
const handleResponse = async (response: Response) => {
  const data = await response.json();
  
  if (!response.ok) {
    const error = data.message || response.statusText;
    return Promise.reject(error);
  }
  
  return data;
};

/**
 * Функции для работы с аутентификацией
 */
export const authService = {
  // Вход в систему
  async login(username: string, password: string): Promise<TokenData> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });
    
    const data = await handleResponse(response);
    
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
  async getAllImages(category?: string): Promise<any> {
    const url = category ? `${API_URL}/gallery?category=${category}` : `${API_URL}/gallery`;
    
    const response = await fetch(url);
    return handleResponse(response);
  },
  
  // Получить изображение по ID
  async getImageById(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/gallery/${id}`);
    return handleResponse(response);
  },
  
  // Загрузить новое изображение
  async uploadImage(formData: FormData): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/gallery`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleResponse(response);
  },
  
  // Обновить информацию об изображении
  async updateImage(id: string, updates: any): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(updates)
    });
    
    return handleResponse(response);
  },
  
  // Удалить изображение
  async deleteImage(id: string): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/gallery/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

/**
 * Функции для работы с номерами
 */
export const roomsService = {
  // Получить все номера
  async getAllRooms(): Promise<any> {
    const response = await fetch(`${API_URL}/rooms`);
    return handleResponse(response);
  },
  
  // Получить номер по ID
  async getRoomById(id: string): Promise<any> {
    const response = await fetch(`${API_URL}/rooms/${id}`);
    return handleResponse(response);
  },
  
  // Создать новый номер
  async createRoom(formData: FormData): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/rooms`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleResponse(response);
  },
  
  // Обновить информацию о номере
  async updateRoom(id: string, formData: FormData): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleResponse(response);
  },
  
  // Удалить номер
  async deleteRoom(id: string): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/rooms/${id}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    return handleResponse(response);
  }
};

/**
 * Функции для работы с главной страницей
 */
export const homepageService = {
  // Получить контент главной страницы
  async getHomePage(): Promise<any> {
    const response = await fetch(`${API_URL}/homepage`);
    return handleResponse(response);
  },
  
  // Обновить секцию главной страницы
  async updateSection(section: string, data: any): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/homepage/section/${section}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(data)
    });
    
    return handleResponse(response);
  },
  
  // Загрузить изображение для главной страницы
  async uploadImage(formData: FormData): Promise<any> {
    const token = authService.getToken();
    
    if (!token) {
      return Promise.reject('Требуется аутентификация');
    }
    
    const response = await fetch(`${API_URL}/homepage/image`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`
      },
      body: formData
    });
    
    return handleResponse(response);
  }
}; 
import axios from 'axios';
import { ServiceType } from '../types/Service';

const API_URL = '/api/services'; // Предполагаемый URL API для услуг

const servicesService = {
  /**
   * Получает все услуги с сервера.
   * @returns {Promise<ServiceType[]>} Промис с массивом услуг.
   */
  async getAllServices(): Promise<ServiceType[]> {
    try {
      const response = await axios.get<ServiceType[]>(API_URL);
      return response.data;
    } catch (error) {
      console.error('Ошибка при загрузке услуг:', error);
      // Можно добавить более специфичную обработку ошибок или выбросить кастомную ошибку
      throw new Error('Не удалось получить список услуг.');
    }
  },

  // Можно добавить другие методы для работы с услугами (getById, create, update, delete)
  // async getServiceById(id: string): Promise<ServiceType> { ... }
  // async createService(serviceData: Omit<ServiceType, '_id'>): Promise<ServiceType> { ... }
  // async updateService(id: string, serviceData: Partial<ServiceType>): Promise<ServiceType> { ... }
  // async deleteService(id: string): Promise<void> { ... }
};

export default servicesService; 
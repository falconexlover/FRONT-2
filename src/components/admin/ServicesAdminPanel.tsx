import React, { useState, useEffect, useCallback } from 'react';
import EditServicesForm from './EditServicesForm';
import { servicesService } from '../../utils/api';
import { ServiceType } from '../../types/Service';
import { toast } from 'react-toastify';

const ServicesAdminPanel: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isSaving, setIsSaving] = useState(false);

  const loadServices = useCallback(async () => {
    setIsSaving(true);
    try {
      const items = await servicesService.getAllServices();
      setServices(items);
    } catch (err) {
      console.error("Ошибка загрузки услуг:", err);
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      toast.error(`Не удалось загрузить услуги: ${errorMsg}`);
    } finally {
      setIsSaving(false);
    }
  }, []);

  useEffect(() => {
    loadServices();
  }, [loadServices]);

  const handleSaveService = async (id: string | null, data: Partial<Omit<ServiceType, '_id'>> | ServiceType) => {
    setIsSaving(true);
    try {
      if (id) {
        await servicesService.updateService(id, data as Partial<Omit<ServiceType, '_id'>>);
        toast.success(`Услуга "${data.name}" обновлена.`);
      } else {
        await servicesService.createService(data as Omit<ServiceType, '_id'>);
        toast.success(`Услуга "${data.name}" создана.`);
      }
      loadServices();
    } catch (err) {
      console.error("Ошибка сохранения услуги:", err);
      const message = err instanceof Error ? err.message : 'Неизвестная ошибка сервера';
      toast.error(`Ошибка сохранения услуги: ${message}`);
    }
  };

  const handleDeleteService = async (id: string) => {
    toast.info('Логика удаления временно отключена.');
  };

  return (
    <EditServicesForm
      services={services}
      onSave={handleSaveService}
      onDelete={handleDeleteService}
      isSaving={isSaving}
    />
  );
};

export default ServicesAdminPanel; 
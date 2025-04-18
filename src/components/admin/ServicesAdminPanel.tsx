import React, { useState, useEffect, useCallback } from 'react';
import EditServicesForm from './EditServicesForm';
import { servicesService } from '../../utils/api';
import { ServiceType } from '../../types/Service';
import { toast } from 'react-toastify';

const ServicesAdminPanel: React.FC = () => {
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);

  const loadServices = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await servicesService.getAllServices();
      setServices(items);
    } catch (err) {
      console.error("Ошибка загрузки услуг:", err);
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Не удалось загрузить услуги: ${errorMsg}`);
      toast.error(`Не удалось загрузить услуги: ${errorMsg}`);
    } finally {
      setIsLoading(false);
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
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteService = async (id: string) => {
    setDeletingServiceId(id);
    setShowDeleteConfirm(true);
  };

  const cancelServiceDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingServiceId(null);
  };

  const confirmServiceDelete = async () => {
    if (!deletingServiceId) return;
    setIsDeleting(true);
    try {
      await servicesService.deleteService(deletingServiceId);
      toast.success('Услуга успешно удалена');
      loadServices();
    } catch (err) {
      console.error("Ошибка удаления услуги:", err);
      toast.error(`Не удалось удалить услугу: ${err instanceof Error ? err.message : 'Ошибка сервера'}`);
    } finally {
      setShowDeleteConfirm(false);
      setDeletingServiceId(null);
      setIsDeleting(false);
    }
  };

  return (
    <EditServicesForm
      services={services}
      onSave={handleSaveService}
      onDelete={handleDeleteService}
      isSaving={isSaving}
      isDeleting={isDeleting}
    />
  );
};

export default ServicesAdminPanel; 
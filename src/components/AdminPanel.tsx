import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import GalleryUploadManager from './GalleryUploadManager';
import ExistingImagesList from './admin/ExistingImagesList';
import ImageEditForm from './admin/ImageEditForm';
import ConfirmModal from './ui/ConfirmModal';
import { TabItem } from './ui/Tabs';
import HomePageEditor from './HomePageEditor';
import { galleryService, servicesService } from '../utils/api';
import { GalleryImageItem } from '../types/GalleryImage';
import { toast } from 'react-toastify';
import RoomsAdminPanel from './RoomsAdminPanel';
import AdminLayout from './admin/AdminLayout';
import EditServicesForm from './admin/EditServicesForm';
import Dashboard from './admin/Dashboard';
import PromotionsAdminPanel from './admin/PromotionsAdminPanel';
import { ServiceType } from '../types/Service';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import ConferencePageEditor from './admin/editors/ConferencePageEditor';
import PartyPageEditor from './admin/editors/PartyPageEditor';

interface AdminPanelProps {
  // Пустой интерфейс, т.к. пропсы больше не нужны здесь
}

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

export const LoadingSpinner = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1rem;
  font-size: 2rem;
  color: var(--primary-color);
  flex-direction: column;
  gap: 1rem;

  i {
    animation: ${spin} 1s linear infinite;
  }
`;

const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' }
];

const adminTabs: TabItem[] = [
    { id: 'dashboard', label: 'Дашборд' },
    { id: 'homepage', label: 'Главная страница' },
    { id: 'rooms', label: 'Номера' },
    { id: 'services', label: 'Услуги' },
    { id: 'edit-conference', label: 'Ред. Конференц-зал' }, 
    { id: 'edit-party', label: 'Ред. Детские праздники' }, 
    { id: 'gallery', label: 'Галерея' },
    { id: 'upload', label: 'Загрузить фото' },
    { id: 'promotions', label: 'Акции' },
];

const AdminPanel: React.FC<AdminPanelProps> = () => {
  const [activeTab, setActiveTab] = useState(adminTabs[0].id);

  const [galleryItems, setGalleryItems] = useState<GalleryImageItem[]>([]);
  const [services, setServices] = useState<ServiceType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [editingImage, setEditingImage] = useState<GalleryImageItem | null>(null);
  const [editedData, setEditedData] = useState<Partial<GalleryImageItem>>({});

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [showServiceDeleteConfirm, setShowServiceDeleteConfirm] = useState(false);
  const [deletingServiceId, setDeletingServiceId] = useState<string | null>(null);
  const [isDeletingService, setIsDeletingService] = useState(false);

  const loadGalleryItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const items = await galleryService.getAllImages();
      setGalleryItems(items);
    } catch (err) {
      console.error("Ошибка загрузки галереи:", err);
      const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
      setError(`Не удалось загрузить изображения: ${errorMsg}`);
      toast.error(`Не удалось загрузить изображения: ${errorMsg}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

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
    setEditingImage(null);
    setEditedData({});
    setError(null);
    if (activeTab === 'gallery') {
      loadGalleryItems();
    } else if (activeTab === 'services') {
      loadServices();
    } else {
      setIsLoading(false);
    }
  }, [activeTab, loadGalleryItems, loadServices]);

  const handleImageUpload = useCallback(() => {
    loadGalleryItems();
    setActiveTab('gallery');
  }, [loadGalleryItems]);

  const handleEditClick = (image: GalleryImageItem) => {
    setEditingImage(image);
    setEditedData({
      title: image.title,
      description: image.description,
      category: image.category
    });
  };

  const cancelEdit = () => {
    setEditingImage(null);
    setEditedData({});
  };

  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setEditedData((prev: Partial<GalleryImageItem>) => ({ ...prev, [name]: value }));
  };

  const saveImageChanges = async () => {
    if (!editingImage?._id) return;
    setIsSaving(true);
    try {
        await galleryService.updateImage(editingImage._id, editedData);
        toast.success("Изменения сохранены!");
        setEditingImage(null);
        setEditedData({});
        loadGalleryItems();
    } catch (err) {
        console.error("Ошибка обновления изображения:", err);
        toast.error("Не удалось сохранить изменения.");
    } finally {
        setIsSaving(false);
    }
  };

  const handleDeleteClick = (imageId: string) => {
    setDeletingImageId(imageId);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingImageId(null);
  };

  const confirmDelete = async () => {
    if (!deletingImageId) return;
    setIsDeleting(true);
    try {
        await galleryService.deleteImage(deletingImageId);
        toast.success("Изображение удалено.");
        setGalleryItems(prev => prev.filter(item => item._id !== deletingImageId));
    } catch (err) {
        console.error("Ошибка удаления изображения:", err);
        toast.error("Не удалось удалить изображение.");
    } finally {
        setShowDeleteConfirm(false);
        setDeletingImageId(null);
        setIsDeleting(false);
    }
  };

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
    setShowServiceDeleteConfirm(true);
  };

  const cancelServiceDelete = () => {
    setShowServiceDeleteConfirm(false);
    setDeletingServiceId(null);
  };

  const confirmServiceDelete = async () => {
    if (!deletingServiceId) return;
    setIsDeletingService(true);
    try {
      await servicesService.deleteService(deletingServiceId);
      toast.success('Услуга успешно удалена');
      loadServices();
    } catch (err) {
      console.error("Ошибка удаления услуги:", err);
      toast.error(`Не удалось удалить услугу: ${err instanceof Error ? err.message : 'Ошибка сервера'}`);
    } finally {
      setShowServiceDeleteConfirm(false);
      setDeletingServiceId(null);
      setIsDeletingService(false);
    }
  };

  const handleGalleryDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      const oldIndex = galleryItems.findIndex((item) => item._id === active.id);
      const newIndex = galleryItems.findIndex((item) => item._id === over.id);

      if (oldIndex === -1 || newIndex === -1) {
        return;
      }

      const reorderedItems = arrayMove(galleryItems, oldIndex, newIndex);
      setGalleryItems(reorderedItems);

      const orderedIds = reorderedItems.map(item => item._id);
      
      console.log('Sending updated order to backend:', orderedIds);

      await galleryService.updateImageOrder(orderedIds);
    }
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'homepage':
        return <HomePageEditor />;
      case 'rooms':
        return <RoomsAdminPanel />;
      case 'services':
        if (isLoading) return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка...</LoadingSpinner>;
        if (error) return <p style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</p>; 
        return (
          <EditServicesForm 
            services={services} 
            onSave={handleSaveService} 
            onDelete={handleDeleteService} 
            isSaving={isSaving}
            isDeleting={isDeletingService}
          />
        );
      case 'edit-conference':
        return <ConferencePageEditor />;
      case 'edit-party':
        return <PartyPageEditor />;
      case 'gallery':
        if (isLoading) return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка...</LoadingSpinner>;
        if (error) return <p style={{ color: 'red' }}>{error}</p>;
        if (editingImage) {
          return (
            <ImageEditForm
              key={editingImage._id}
              image={editingImage}
              editedData={editedData}
              onFormChange={handleEditFormChange}
              onSave={saveImageChanges}
              onCancel={cancelEdit}
              isSaving={isSaving}
              categories={CATEGORIES}
            />
          );
        }
        return (
          <ExistingImagesList
            images={galleryItems}
            onEdit={handleEditClick}
            onDelete={handleDeleteClick}
            onDragEnd={handleGalleryDragEnd}
          />
        );
      case 'upload':
        return <GalleryUploadManager categories={CATEGORIES} onImageUpload={handleImageUpload} />;
      case 'promotions':
        return <PromotionsAdminPanel />;
      default:
        return <div>Выберите раздел</div>;
    }
  };

  return (
    <AdminLayout 
      menuItems={adminTabs} 
      activeMenuItemId={activeTab} 
      onMenuItemSelect={setActiveTab}
    >
      <AnimatePresence mode="wait">
        <motion.div 
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()} 
        </motion.div>
      </AnimatePresence>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        title="Подтвердите удаление"
        message="Вы уверены, что хотите удалить это изображение? Действие необратимо."
        onConfirm={confirmDelete}
        onCancel={cancelDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmButtonClass="danger"
        isConfirming={isDeleting}
      />
       <ConfirmModal
        isOpen={showServiceDeleteConfirm}
        title="Подтвердите удаление услуги"
        message={`Вы уверены, что хотите удалить услугу "${services.find(s => s._id === deletingServiceId)?.name}"? Это действие необратимо.`}
        onConfirm={confirmServiceDelete}
        onCancel={cancelServiceDelete}
        confirmText="Удалить"
        cancelText="Отмена"
        confirmButtonClass="danger"
        isConfirming={isDeletingService}
      />

    </AdminLayout>
  );
};

export default AdminPanel; 
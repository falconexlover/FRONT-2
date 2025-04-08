import React, { useState, useEffect, useCallback } from 'react';
import styled, { keyframes } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import GalleryUploadManager from './GalleryUploadManager';
import ExistingImagesList from './admin/ExistingImagesList';
import ImageEditForm from './admin/ImageEditForm';
import ConfirmModal from './ui/ConfirmModal';
import { TabItem } from './ui/Tabs';
import HomePageEditor from './HomePageEditor';
import { galleryService } from '../utils/api';
import { GalleryImageItem } from '../types/GalleryImage';
import { toast } from 'react-toastify';
import RoomsAdminPanel from './RoomsAdminPanel';
import AdminLayout from './admin/AdminLayout';
import Sidebar from './admin/Sidebar';
import EditServicesForm from './admin/EditServicesForm';
import Dashboard from './admin/Dashboard';
import PromotionsAdminPanel from './admin/PromotionsAdminPanel';
import { ServiceType } from '../types/Service';
import { servicesService } from '../utils/api';

interface AdminPanelProps {
  onLogout: () => void;
}

const Panel = styled(motion.div)`
  padding: 0;
  height: 100%;
`;

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
    { id: 'gallery', label: 'Галерея' },
    { id: 'upload', label: 'Загрузить фото' },
    { id: 'promotions', label: 'Акции' },
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
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

  const [galleryKey, setGalleryKey] = useState(Date.now());

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

  const handleImageUpload = () => {
    loadGalleryItems();
    setActiveTab('gallery');
    setGalleryKey(Date.now());
  };

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
        // Обновление существующей услуги
        await servicesService.updateService(id, data as Partial<Omit<ServiceType, '_id'>>);
        toast.success(`Услуга "${data.name}" обновлена.`);
      } else {
        // Создание новой услуги
        await servicesService.createService(data as Omit<ServiceType, '_id'>);
        toast.success(`Услуга "${data.name}" создана.`);
      }
      loadServices(); // Перезагружаем список услуг после сохранения
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

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <Dashboard setActiveTab={setActiveTab} />;
      case 'homepage':
        return <HomePageEditor />;
      case 'rooms':
        return <RoomsAdminPanel onLogout={onLogout} />;
      case 'services':
        if (isLoading) return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка услуг...</LoadingSpinner>;
        if (error && activeTab === 'services') return <p style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</p>; 
        return (
          <EditServicesForm 
            services={services} 
            onSave={handleSaveService} 
            onDelete={handleDeleteService} 
            isSaving={isSaving}
            isDeleting={isDeletingService}
          />
        );
      case 'gallery':
        if (editingImage) {
          return (
            <ImageEditForm
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
        if (isLoading) return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка галереи...</LoadingSpinner>;
        if (error && activeTab === 'gallery') return <p style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</p>;
        return (
          <ExistingImagesList
            key={galleryKey}
            images={galleryItems}
            onEditClick={handleEditClick}
            onDeleteClick={handleDeleteClick}
          />
        );
      case 'upload':
        return <GalleryUploadManager onImageUpload={handleImageUpload} categories={CATEGORIES} />;
      case 'promotions':
        return <PromotionsAdminPanel />;
      default:
        return <div>Выберите раздел</div>;
    }
  };

  return (
    <AdminLayout 
      sidebar={(
        <Sidebar
          menuItems={adminTabs}
          activeItemId={activeTab}
          onItemClick={setActiveTab}
          onLogout={onLogout}
        />
      )}
    >
      <AnimatePresence mode="wait">
        <Panel
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
          transition={{ duration: 0.2 }}
        >
          {renderContent()}
        </Panel>
      </AnimatePresence>
      
      <AnimatePresence>
        {showDeleteConfirm && (
          <ConfirmModal
            key="confirm-delete-modal"
            isOpen={showDeleteConfirm}
            title="Подтвердите удаление"
            message="Вы уверены, что хотите удалить это изображение? Это действие необратимо."
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            confirmText="Удалить"
            cancelText="Отмена"
            isConfirming={isDeleting}
            confirmButtonClass="danger"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {showServiceDeleteConfirm && (
          <ConfirmModal
            key="confirm-delete-service-modal"
            isOpen={showServiceDeleteConfirm}
            title="Подтвердите удаление услуги"
            message={`Вы уверены, что хотите удалить услугу "${services.find(s => s._id === deletingServiceId)?.name}"? Это действие необратимо.`}
            onConfirm={confirmServiceDelete}
            onCancel={cancelServiceDelete}
            confirmText="Удалить"
            cancelText="Отмена"
            isConfirming={isDeletingService}
            confirmButtonClass="danger"
          />
        )}
      </AnimatePresence>
    </AdminLayout>
  );
};

export default AdminPanel; 
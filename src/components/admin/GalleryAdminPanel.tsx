import React, { useState, useEffect, useCallback } from 'react';
import GalleryUploadManager from '../GalleryUploadManager';
import ExistingImagesList from './ExistingImagesList';
import ImageEditForm from './ImageEditForm';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import { galleryService } from '../../utils/api';
import { GalleryImageItem } from '../../types/GalleryImage';
import { toast } from 'react-toastify';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import styled, { keyframes } from 'styled-components';

const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' },
  { id: 'food', label: 'Питание' },
];

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

const GalleryAdminPanel: React.FC = () => {
  const [galleryItems, setGalleryItems] = useState<GalleryImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [editingImage, setEditingImage] = useState<GalleryImageItem | null>(null);
  const [editedData, setEditedData] = useState<Partial<GalleryImageItem>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

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

  useEffect(() => {
    loadGalleryItems();
  }, [loadGalleryItems]);

  const handleImageUpload = useCallback(() => {
    loadGalleryItems();
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

  const handleGalleryDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    if (over && active.id !== over.id) {
      setGalleryItems((items) => {
        const oldIndex = items.findIndex(item => item._id === active.id);
        const newIndex = items.findIndex(item => item._id === over.id);
        if (oldIndex === -1 || newIndex === -1) return items;
        const newOrder = arrayMove(items, oldIndex, newIndex);
        const orderedIds = newOrder.map(item => item._id);
        galleryService.updateImageOrder(orderedIds)
          .then(() => toast.success('Порядок изображений сохранен'))
          .catch((err: any) => {
            toast.error('Ошибка сохранения порядка изображений');
            console.error(err);
          });
        return newOrder;
      });
    }
  };

  return (
    <>
      <GalleryUploadManager categories={CATEGORIES} onImageUpload={handleImageUpload} />
      {isLoading ? (
        <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка...</LoadingSpinner>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <ExistingImagesList 
          images={galleryItems}
          onEdit={handleEditClick} 
          onDelete={handleDeleteClick}
          onDragEnd={handleGalleryDragEnd}
          onRefresh={loadGalleryItems}
        />
      )}

      <Modal isOpen={!!editingImage} onClose={cancelEdit} title="Редактировать информацию">
        {editingImage && (
          <ImageEditForm 
            image={editingImage}
            editedData={editedData}
            onFormChange={handleEditFormChange}
            onSave={saveImageChanges}
            onCancel={cancelEdit}
            isSaving={isSaving}
            categories={CATEGORIES}
          />
        )}
      </Modal>

      <ConfirmModal
        isOpen={showDeleteConfirm}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Подтверждение удаления"
        isConfirming={isDeleting}
        message="Вы уверены, что хотите удалить это изображение?"
      />
    </>
  );
};

export default GalleryAdminPanel; 
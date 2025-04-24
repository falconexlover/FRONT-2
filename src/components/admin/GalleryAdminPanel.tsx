import React, { useState, useEffect } from 'react';
import GalleryUploadManager from './GalleryUploadManager';
import ImageEditForm from './ImageEditForm';
import ConfirmModal from '../ui/ConfirmModal';
import Modal from '../ui/Modal';
import { galleryService } from '../../utils/api';
import { GalleryImageItem } from '../../types/GalleryImage';
import { toast } from 'react-toastify';
import { arrayMove } from '@dnd-kit/sortable';
import { DragEndEvent } from '@dnd-kit/core';
import styled, { keyframes } from 'styled-components';
import { useCrud } from '../../hooks/useCrud';
import GalleryImagesBlock from './GalleryImagesBlock';    

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
  const {
    items: galleryItems,
    setItems: setGalleryItems,
    isLoading,
    isSaving,
    isDeleting,
    error,
    loadAll,
    updateItem,
    deleteItem,
  } = useCrud<GalleryImageItem, Partial<GalleryImageItem>>();

  const [editingImage, setEditingImage] = useState<GalleryImageItem | null>(null);
  const [editedData, setEditedData] = useState<Partial<GalleryImageItem>>({});
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingImageId, setDeletingImageId] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    loadAll(() => galleryService.getAllImages(selectedCategory));
  }, [loadAll, selectedCategory]);

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
    try {
      await updateItem(galleryService.updateImage, editingImage._id, editedData);
      setEditingImage(null);
      setEditedData({});
    } catch (err) {
      // Ошибка уже обработана в useCrud
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
    try {
      await deleteItem(galleryService.deleteImage, deletingImageId);
    } catch (err) {
      // Ошибка уже обработана в useCrud
      toast.error('Не удалось удалить изображение. Возможно, оно уже было удалено.');
    } finally {
      loadAll(() => galleryService.getAllImages(selectedCategory));
      setShowDeleteConfirm(false);
      setDeletingImageId(null);
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

  const handleCategoryChange = async (id: string, category: string) => {
    try {
      await updateItem(galleryService.updateImage, id, { category });
      toast.success('Категория обновлена');
      loadAll(() => galleryService.getAllImages(selectedCategory));
    } catch (err) {
      toast.error('Ошибка при обновлении категории');
    }
  };

  return (
    <>
      <GalleryUploadManager 
        categories={CATEGORIES} 
        onImageUpload={() => loadAll(() => galleryService.getAllImages(selectedCategory))} 
      />
      <GalleryImagesBlock
        images={galleryItems}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
        onDragEnd={handleGalleryDragEnd}
        onRefresh={() => loadAll(() => galleryService.getAllImages(selectedCategory))}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        isLoading={isLoading}
        error={error}
        onCategoryChange={handleCategoryChange}
      />
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
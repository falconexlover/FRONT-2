import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import RoomForm from './RoomForm';
import { roomsService, galleryService } from '../utils/api';
import { RoomType } from '../types/Room';
import { toast } from 'react-toastify';
import ConfirmModal from './ui/ConfirmModal';
import { AnimatePresence, motion } from 'framer-motion';

interface RoomsAdminPanelProps {
  onLogout: () => void;
}

const AdminPanelContainer = styled.div`
  /* Стили фона, рамки и т.д. убираем, т.к. они теперь в AdminLayout */
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color); /* Темная граница */
  padding-bottom: 1rem;
`;

const Title = styled.h2`
  color: var(--text-primary); /* Светлый заголовок */
  font-family: 'Playfair Display', serif;
  margin: 0;
  font-size: 1.6rem; /* Сделаем заголовок чуть меньше */
`;

const Button = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  
  &.primary {
    background-color: var(--primary-color);
    color: var(--text-on-primary-bg);
    
    &:hover:not(:disabled) {
      background-color: var(--secondary-color);
    }
  }
  
  &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }
`;

const TableContainer = styled.div`
  margin-top: 2rem;
  overflow-x: auto;
  width: 100%;
  background-color: var(--bg-secondary); /* Фон для таблицы */
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 1rem 1.2rem; /* Скорректируем padding */
  text-align: left;
  border-bottom: 1px solid var(--border-color); /* Темная граница */
  color: var(--text-secondary); /* Вторичный цвет для заголовков */
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase; /* Заголовки капсом */
  letter-spacing: 0.5px;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: var(--bg-tertiary); /* Фон при наведении */
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.2rem;
  vertical-align: middle;
  color: var(--text-primary); /* Основной цвет текста */
  border-bottom: 1px solid var(--border-color); /* Темная граница */
  white-space: normal;
  font-size: 0.95rem;

  &:last-child {
     white-space: nowrap;
  }
`;

const RoomImagePreview = styled.div` /* Оборачиваем img в div для стилизации */
  width: 100px; /* Уменьшим превью */
  height: 65px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--bg-primary); /* Фон-заглушка */
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const ActionButtonsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
    justify-content: flex-start;
`;

const IconButton = styled.button` // Наследуемся от button, не ActionButton
    padding: 0.5rem;
    min-width: auto;
    line-height: 1;
    font-size: 1rem;
    background: none;
    border: none;
    color: var(--text-secondary); /* Вторичный цвет по умолчанию */
    border-radius: 50%; /* Сделаем круглыми */
    width: 32px;
    height: 32px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover:not(:disabled) {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
    }

    &.edit {
       &:hover:not(:disabled) {
           color: var(--primary-color);
           background-color: rgba(42, 167, 110, 0.1);
       }
    }

    &.delete {
        &:hover:not(:disabled) {
            color: var(--danger-color);
            background-color: rgba(229, 115, 115, 0.1);
        }
    }

    i {
        margin: 0;
        font-size: 0.9rem; /* Уменьшим иконки */
    }
    
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`;

const ErrorMessage = styled.p`
  text-align: center;
  padding: 1rem 1.5rem;
  color: var(--danger-color);
  background-color: rgba(229, 115, 115, 0.1);
  border: 1px solid rgba(229, 115, 115, 0.3);
  border-radius: var(--radius-sm);
  margin: 1.5rem 0;
`;

const NoRoomsMessage = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-top: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: var(--text-primary);
    font-size: 1.3rem;
  }
  
  p {
    margin-bottom: 1.5rem;
    color: var(--text-secondary);
  }
`;

const RoomsAdminPanel: React.FC<RoomsAdminPanelProps> = ({ onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isProcessingDelete, setIsProcessingDelete] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roomsService.getAllRooms();
      setRooms(Array.isArray(data) ? data : []);
    } catch (err: any) {
      console.error("Ошибка при загрузке номеров:", err);
      const errorMsg = err.message || 'Не удалось загрузить список номеров.';
      setError(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchRooms();
  }, [fetchRooms]);

  const handleAddRoomClick = () => {
    setEditingRoom(null);
    setShowForm(true);
  };

  const handleEditRoomClick = (room: RoomType) => {
    setEditingRoom(room);
    setShowForm(true);
  };

  const handleDeleteRoomClick = (id: string) => {
    setDeletingRoomId(id);
    setShowDeleteConfirm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  const handleSaveFromForm = async (
      roomData: Omit<RoomType, '_id' | 'imageUrls' | 'cloudinaryPublicIds'>, 
      newFiles: File[], 
      deletedPublicIds: string[]
  ) => {
    setIsLoading(true);
    let finalImageUrls: string[] = editingRoom?.imageUrls?.filter((url, index) => 
        !deletedPublicIds.includes(editingRoom?.cloudinaryPublicIds?.[index] || '')
    ) || [];
    let finalCloudinaryIds: string[] = editingRoom?.cloudinaryPublicIds?.filter(id => !deletedPublicIds.includes(id)) || [];

    try {
        if (newFiles.length > 0) {
            console.log(`Загрузка ${newFiles.length} новых изображений...`);
            const uploadPromises = newFiles.map(file => {
                const formData = new FormData();
                formData.append('image', file);
                formData.append('category', 'rooms');
                return galleryService.uploadImage(formData);
            });
            const uploadedImages = await Promise.all(uploadPromises);
            finalImageUrls = [...finalImageUrls, ...uploadedImages.map(img => img.imageUrl)];
            finalCloudinaryIds = [
                ...finalCloudinaryIds, 
                ...uploadedImages.map(img => img.cloudinaryPublicId).filter((id): id is string => id !== undefined)
            ];
            console.log('Новые изображения загружены.');
        }

        const formData = new FormData();
        
        Object.entries(roomData).forEach(([key, value]) => {
            if (key !== 'features' && value !== undefined && value !== null) {
                 if (typeof value === 'boolean') {
                     formData.append(key, value.toString());
                 } else {
                     formData.append(key, String(value));
                 }
            }
        });

        formData.append('features', JSON.stringify(roomData.features));
        
        finalImageUrls.forEach(url => formData.append('imageUrls', url));
        finalCloudinaryIds.forEach(id => formData.append('cloudinaryPublicIds', id));
        
        newFiles.forEach((file) => {
            formData.append('images', file, file.name); 
        });
        
        deletedPublicIds.forEach(id => formData.append('deletedPublicIds', id));
        
        if (editingRoom) {
            console.log('Обновление номера (FormData):', editingRoom._id);
            await roomsService.updateRoom(editingRoom._id, formData);
            toast.success(`Номер "${roomData.title}" обновлен.`);
        } else {
            console.log('Создание нового номера (FormData)...');
            await roomsService.createRoom(formData);
            toast.success(`Номер "${roomData.title}" создан.`);
        }

        if (deletedPublicIds.length > 0) {
            console.log(`Удаление ${deletedPublicIds.length} старых изображений из Cloudinary...`);
            console.warn('API для удаления изображений из Cloudinary не реализовано!');
            toast.warn('Старые изображения не были удалены из хранилища.');
        }

        fetchRooms();
        handleFormCancel();

    } catch (err) {
        console.error('Ошибка при сохранении номера:', err);
        const message = err instanceof Error ? err.message : 'Неизвестная ошибка сервера';
        toast.error(`Ошибка сохранения: ${message}`);
    } finally {
        setIsLoading(false);
    }
  };
  
  const confirmDelete = async () => {
    if (!deletingRoomId) return;
    setIsProcessingDelete(true);
    try {
      await roomsService.deleteRoom(deletingRoomId);
      toast.success('Номер успешно удален');
      setShowDeleteConfirm(false);
      setDeletingRoomId(null);
      fetchRooms();
    } catch (err: any) {
      console.error("Ошибка удаления номера:", err);
      toast.error(`Ошибка удаления: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsProcessingDelete(false);
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingRoomId(null);
  };

  const renderRoomsTable = () => {
    if (error && rooms.length === 0) {
      return <ErrorMessage>{error}</ErrorMessage>;
    }
    if (!isLoading && rooms.length === 0) {
       return (
            <NoRoomsMessage>
              <h3>Номеров пока нет</h3>
              <p>Нажмите "Добавить номер", чтобы создать первый.</p>
              <Button onClick={handleAddRoomClick} className="primary">
                  <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
                  Добавить номер
              </Button>
            </NoRoomsMessage>
       );
    }
    
    return (
      <TableContainer>
        <StyledTable>
          <thead>
            <tr>
              <TableHeader>Фото</TableHeader>
              <TableHeader>Название</TableHeader>
              <TableHeader>Цена (₽/ночь)</TableHeader>
              <TableHeader>Вместимость</TableHeader>
              <TableHeader>Действия</TableHeader>
            </tr>
          </thead>
          <tbody>
            {rooms.map((room) => (
              <TableRow key={room._id}>
                <TableCell>
                    <RoomImagePreview>
                        {room.imageUrls && room.imageUrls.length > 0 ? (
                            <img src={room.imageUrls[0]} alt={room.title} loading="lazy" />
                        ) : (
                            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: 'var(--text-secondary)', fontSize: '0.8rem' }}>Нет фото</div>
                        )}
                     </RoomImagePreview>
                </TableCell>
                <TableCell>{room.title}</TableCell>
                <TableCell>{room.price ? `${room.price} ₽` : '--'}</TableCell>
                <TableCell>{room.capacity ? `${room.capacity} чел.` : '--'}</TableCell>
                <TableCell>
                  <ActionButtonsContainer>
                    <IconButton 
                        className="edit" 
                        onClick={() => handleEditRoomClick(room)} 
                        title="Редактировать"
                        disabled={showForm}
                    >
                      <i className="fas fa-pencil-alt"></i>
                    </IconButton>
                    <IconButton 
                        className="delete" 
                        onClick={() => handleDeleteRoomClick(room._id!)} 
                        title="Удалить"
                        disabled={showForm}
                    >
                      <i className="fas fa-trash-alt"></i>
                    </IconButton>
                  </ActionButtonsContainer>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </StyledTable>
      </TableContainer>
    );
  };

  return (
    <AdminPanelContainer>
      <Header>
        <Title>Управление номерами</Title>
        {!showForm && (
          <Button onClick={handleAddRoomClick} className="primary">
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
            Добавить номер
          </Button>
        )}
      </Header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <RoomForm 
              initialData={editingRoom || undefined}
              onSave={handleSaveFromForm}
              onCancel={handleFormCancel}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {error && !isLoading && (
        <ErrorMessage style={{ textAlign: 'center', marginBottom: '1rem' }}>
          {error}
        </ErrorMessage>
      )}
      
      {isLoading && <p style={{textAlign: 'center', padding: '2rem'}}>Загрузка...</p>}

      {!isLoading && !showForm && rooms.length > 0 && (
        renderRoomsTable()
      )}
      
      {!isLoading && !showForm && rooms.length === 0 && (
        <NoRoomsMessage>
          <h3>Номеров пока нет</h3>
          <p>Нажмите "Добавить номер", чтобы создать первый.</p>
        </NoRoomsMessage>
      )}

      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Подтвердите удаление"
          message={`Вы уверены, что хотите удалить номер "${rooms.find(r => r._id === deletingRoomId)?.title}"? Это действие необратимо.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="Удалить"
          cancelText="Отмена"
          isConfirming={isProcessingDelete}
          confirmButtonClass="danger"
        />
      )}
    </AdminPanelContainer>
  );
};

export default RoomsAdminPanel; 
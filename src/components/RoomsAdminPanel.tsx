import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import RoomForm from './RoomForm';
import { roomsService } from '../utils/api';
import { RoomType } from '../types/Room';
import { toast } from 'react-toastify';
import ConfirmModal from './ui/ConfirmModal';
import { AnimatePresence, motion } from 'framer-motion';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { 
  DndContext, 
  closestCenter, 
  KeyboardSensor, 
  PointerSensor, 
  useSensor, 
  useSensors, 
  DragEndEvent 
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import RoomAdminCard from './admin/RoomAdminCard';
import { 
    TableContainer, 
    StyledTable, 
    StyledTableRow, 
    StyledTableCell, 
    TableHeader, 
    ActionButtonsContainer, 
    IconButton 
} from './styles/TableStyles';

interface RoomsAdminPanelProps {
  onLogout?: () => void;
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

// Контейнер для карточек, теперь всегда grid
const CardsContainer = styled.div`
  display: grid;
  margin-top: 2rem;
  grid-template-columns: repeat(auto-fit, minmax(340px, 1fr));
  gap: 1.5rem;
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

// Добавляю недостающий styled-компонент для превью изображения номера
const RoomImagePreview = styled.div`
  width: 100px;
  height: 60px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--bg-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

interface SortableRoomRowProps {
  room: RoomType;
  onEdit: (room: RoomType) => void;
  onDelete: (id: string) => void;
  disabled?: boolean;
}

function SortableRoomRow({ room, onEdit, onDelete, disabled }: SortableRoomRowProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging
  } = useSortable({id: room._id!});

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <StyledTableRow ref={setNodeRef} style={style} $isDragging={isDragging}>
      <StyledTableCell className="drag-handle" {...listeners} {...attributes}>
         <i className="fas fa-grip-vertical"></i>
      </StyledTableCell>
      <StyledTableCell className="image-cell">
         <RoomImagePreview>
           {room.imageUrls && room.imageUrls.length > 0 && (
             <img src={optimizeCloudinaryImage(room.imageUrls[0], 'f_auto,q_auto,w_100,h_60,c_fill')} alt={room.title} loading="lazy" />
           )}
         </RoomImagePreview>
       </StyledTableCell>
       <StyledTableCell>{room.title}</StyledTableCell>
       <StyledTableCell>{room.price}</StyledTableCell>
       <StyledTableCell className="hide-mobile">{room.capacity} чел.</StyledTableCell>
       <StyledTableCell className="hide-mobile features-cell"
          title={Array.isArray(room.features) ? room.features.join(', ') : room.features}
       >
         {Array.isArray(room.features) ? room.features.join(', ') : room.features}
       </StyledTableCell>
       <StyledTableCell className="actions">
         <ActionButtonsContainer>
           <IconButton className="edit" onClick={() => onEdit(room)} title="Редактировать" disabled={disabled}>
             <i className="fas fa-pencil-alt"></i>
           </IconButton>
           <IconButton className="delete" onClick={() => onDelete(room._id!)} title="Удалить" disabled={disabled}>
             <i className="fas fa-trash-alt"></i>
           </IconButton>
         </ActionButtonsContainer>
       </StyledTableCell>
    </StyledTableRow>
  );
}

const RoomsAdminPanel: React.FC<RoomsAdminPanelProps> = ({ onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const fetchedRooms = await roomsService.getAllRooms();
      setRooms(fetchedRooms);
    } catch (err: any) {
      console.error("Ошибка загрузки номеров:", err);
      setError(err.message || 'Не удалось загрузить список номеров');
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
    setIsSaving(false);
  };

  const handleSaveRoom = async (
    roomData: Omit<RoomType, '_id' | 'imageUrls' | 'cloudinaryPublicIds'>, 
    newFiles: File[], 
    imagesToDelete: { url: string, publicId: string | null }[]
  ) => {
    setIsSaving(true);
    setError(null);
    const isEditing = !!editingRoom?._id;
    const roomId = editingRoom?._id;
    
    try {
      // Создаем FormData
      const formData = new FormData();

      // Добавляем текстовые данные
      Object.entries(roomData).forEach(([key, value]) => {
        // Проверяем на null/undefined перед добавлением
        if (value !== null && value !== undefined) {
          if (key === 'features' && Array.isArray(value)) {
            // Если features - массив, отправляем каждый элемент отдельно
            // Бэкенд должен уметь собирать массив из одинаковых ключей
            value.forEach(feature => formData.append(key, feature));
          } else {
            // Преобразуем другие значения в строку (на всякий случай)
            formData.append(key, String(value));
          }
        }
      });

      // Добавляем новые файлы
      newFiles.forEach((file) => {
        formData.append('images', file); // Ключ 'images' должен совпадать с ожидаемым на бэкенде (multer)
      });

      // Добавляем ID удаляемых изображений (если они есть и имеют publicId)
      const deletedPublicIds = imagesToDelete
        .map(img => img.publicId)
        .filter((id): id is string => id !== null); // Убираем null и сужаем тип
        
      if (deletedPublicIds.length > 0) {
        // Отправляем как JSON-строку или по одному, зависит от бэкенда
        // Вариант 1: JSON-строка
        formData.append('deletedImagePublicIds', JSON.stringify(deletedPublicIds));
        // Вариант 2: По одному (если бэк умеет собирать массив)
        // deletedPublicIds.forEach(id => formData.append('deletedImagePublicIds', id));
      }

      // Вызываем API
      if (isEditing && roomId) {
        await roomsService.updateRoom(roomId, formData);
        toast.success(`Номер "${roomData.title}" успешно обновлен!`);
      } else {
        await roomsService.createRoom(formData);
        toast.success(`Номер "${roomData.title}" успешно создан!`);
      }

      // Обновляем список и закрываем форму
      await fetchRooms(); 
      handleFormCancel();

    } catch (err: any) {
      const message = err.message || (isEditing ? 'Ошибка обновления номера' : 'Ошибка создания номера');
      setError(message);
      toast.error(message);
      console.error("Ошибка сохранения номера:", err);
      // Не закрываем форму при ошибке
    } finally {
      setIsSaving(false);
    }
  };
  
  const confirmDelete = async () => {
    if (deletingRoomId) {
      setError(null);
      try {
        await roomsService.deleteRoom(deletingRoomId);
        toast.success('Номер успешно удален');
        setDeletingRoomId(null);
        setShowDeleteConfirm(false);
        fetchRooms();
      } catch (err: any) {
        console.error("Ошибка удаления номера:", err);
        toast.error(`Ошибка удаления: ${err.message || 'Не удалось удалить номер'}`);
      }
    }
  };
  
  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingRoomId(null);
  };

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = async (event: DragEndEvent) => {
    const {active, over} = event;
    console.log('[DragEnd] Event:', event);
    console.log('[DragEnd] Active ID:', active.id, 'Over ID:', over?.id);

    if (over && active.id !== over.id) {
      const oldIndex = rooms.findIndex((room) => room._id === active.id);
      const newIndex = rooms.findIndex((room) => room._id === over.id);
      console.log(`[DragEnd] Old Index: ${oldIndex}, New Index: ${newIndex}`);

      if (oldIndex === -1 || newIndex === -1) {
        console.warn('[DragEnd] Could not find indices for dragged items.');
        return;
      }

      const newOrderRooms = arrayMove(rooms, oldIndex, newIndex);
      console.log('[DragEnd] New optimistic order:', newOrderRooms.map(r => ({ id: r._id, title: r.title, order: r.displayOrder })) ); // Показываем id, title и текущий order
      setRooms(newOrderRooms); // Оптимистичное обновление

      const orderedIds = newOrderRooms.map(room => room._id!);
      console.log('[DragEnd] Sending orderedIds to backend:', orderedIds);

      try {
        await roomsService.updateRoomsOrder(orderedIds);
        console.log('[DragEnd] Backend update successful.');
        toast.success('Порядок номеров обновлен.');
        // Может быть, стоит перезапросить номера после успешного обновления?
        // fetchRooms(); 
      } catch (err) {
        console.error("[DragEnd] Ошибка обновления порядка номеров:", err);
        toast.error('Не удалось сохранить новый порядок номеров. Возвращаем старый порядок.');
        // Откат оптимистичного обновления
        const previousOrder = arrayMove(newOrderRooms, newIndex, oldIndex); // Возвращаем обратно
        setRooms(previousOrder);
        console.log('[DragEnd] Reverted optimistic update.');
      }
    } else {
        console.log('[DragEnd] Drag ended without a valid target or on the same item.');
    }
  };

  return (
    <AdminPanelContainer>
      <Header>
        <Title>Управление номерами</Title>
        {!showForm && (
          <Button onClick={handleAddRoomClick} className="primary" disabled={isSaving}>
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
              key={editingRoom?._id || 'new'} 
              initialData={editingRoom} 
              onSave={handleSaveRoom}
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
        <CardsContainer>
          {rooms.map((room) => (
            <RoomAdminCard 
              key={room._id} 
              room={room} 
              onEdit={() => handleEditRoomClick(room)} 
              onDelete={() => handleDeleteRoomClick(room._id)} 
            />
          ))}
        </CardsContainer>
      )}
      
      {!isLoading && !showForm && rooms.length === 0 && (
        <NoRoomsMessage>
          <h3>Номеров пока нет</h3>
          <p>Нажмите "Добавить номер", чтобы создать первый.</p>
        </NoRoomsMessage>
      )}
      
      <AnimatePresence>
        {showDeleteConfirm && (
          <ConfirmModal
            key="confirm-delete-modal"
            isOpen={showDeleteConfirm}
            title="Подтвердите удаление"
            message={`Вы уверены, что хотите удалить номер "${rooms.find(r => r._id === deletingRoomId)?.title}"? Это действие необратимо.`}
            onConfirm={confirmDelete}
            onCancel={cancelDelete}
            confirmText="Удалить"
            cancelText="Отмена"
            confirmButtonClass="danger"
          />
        )}
      </AnimatePresence>
    </AdminPanelContainer>
  );
};

export default RoomsAdminPanel; 
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

const StyledTableRow = styled.tr<{ isDragging?: boolean }>`
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-tertiary); /* Легкое выделение при наведении */
  }

  // Стили для перетаскивания
  opacity: ${({ isDragging }) => (isDragging ? 0.5 : 1)};
  box-shadow: ${({ isDragging }) => (isDragging ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none')};
`;

const StyledTableCell = styled.td`
  padding: 1rem 1.2rem; /* Такой же padding, как у заголовков */
  color: var(--text-primary);
  vertical-align: middle; /* Выравниваем по центру вертикально */
  white-space: normal; /* Разрешаем перенос текста */
  font-size: 0.9rem;

  &.drag-handle {
    width: 40px; // Явно задаем ширину для ручки
    cursor: grab;
    text-align: center;
    color: var(--text-secondary);
    &:active {
        cursor: grabbing;
    }
  }

  &.image-cell {
    width: 120px; // Увеличим немного для превью
    @media screen and (max-width: 768px) {
      padding-right: 0.5rem; // Меньше отступ справа на мобильных
    }
  }

  &.features-cell {
    max-width: 200px; /* Ограничим ширину для фич */
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default; /* Чтобы title всплывал */
  }

  &.actions {
    width: 100px; // Фиксированная ширина для кнопок
    white-space: nowrap;
    text-align: right; /* Выравниваем кнопки вправо */
    @media screen and (max-width: 768px) {
      width: auto; // Автоматическая ширина на мобильных
      text-align: left;
      padding-left: 0.5rem; // Меньше отступ слева на мобильных
    }
  }

  // Скрываем колонки на мобильных
  &.hide-mobile {
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
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

  // Скрываем колонки на мобильных
  &.hide-mobile {
    @media screen and (max-width: 768px) {
      display: none;
    }
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

interface SortableRoomRowProps {
  room: RoomType;
  onEdit: (room: RoomType) => void;
  onDelete: (id: string) => void;
}

function SortableRoomRow({ room, onEdit, onDelete }: SortableRoomRowProps) {
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
  };

  return (
    <StyledTableRow ref={setNodeRef} style={style} isDragging={isDragging}>
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
           <IconButton className="edit" onClick={() => onEdit(room)} title="Редактировать">
             <i className="fas fa-pencil-alt"></i>
           </IconButton>
           <IconButton className="delete" onClick={() => onDelete(room._id!)} title="Удалить">
             <i className="fas fa-trash-alt"></i>
           </IconButton>
         </ActionButtonsContainer>
       </StyledTableCell>
    </StyledTableRow>
  );
}

// Добавляем тип для данных формы без ID и полей изображений
type RoomDataToSave = Omit<RoomType, '_id' | 'imageUrls' | 'cloudinaryPublicIds'>;

const RoomsAdminPanel: React.FC<RoomsAdminPanelProps> = ({ onLogout }) => {
  const [showForm, setShowForm] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingRoomId, setDeletingRoomId] = useState<string | null>(null);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRooms = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await roomsService.getAllRooms();
      setRooms(Array.isArray(data) ? data.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0)) : []);
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

  // Обработчик сохранения (создание или обновление)
  const handleSaveRoom = useCallback(async (
      // Обновляем тип первого аргумента
      roomData: RoomDataToSave,
      // Добавляем новые аргументы
      newFiles: File[],
      deletedPublicIds: string[]
    ) => {
    setIsLoading(true);
    setError(null);

    // Создаем FormData для отправки данных, включая файлы
    const formData = new FormData();

    // Добавляем поля комнаты в FormData
    Object.entries(roomData).forEach(([key, value]) => {
        // Преобразуем массивы (например, features) в строки или обрабатываем иначе,
        // если бэкенд ожидает специфичный формат для FormData
        if (Array.isArray(value)) {
            // Для features, отправим каждый элемент отдельно, если бэкенд поддерживает
            // Или JSON строку
            // Пока отправим как JSON строку
             if (key === 'features') {
                formData.append(key, JSON.stringify(value));
            } else {
                 // Для других массивов (если появятся) нужно будет решить
            }
        } else if (typeof value === 'boolean') {
             formData.append(key, value.toString()); // Boolean как строки 'true'/'false'
        } else if (value !== null && value !== undefined) {
            formData.append(key, value as string | Blob); // Остальные как строки или Blob
        }
    });

    // Добавляем новые файлы
    newFiles.forEach((file) => {
        // Используем одинаковое имя поля для всех файлов, 
        // бэкенд (multer) должен обработать это как массив
        formData.append('imageFiles', file);
    });

    // Добавляем ID удаляемых изображений (как JSON строку)
    if (deletedPublicIds.length > 0) {
        formData.append('deletedImages', JSON.stringify(deletedPublicIds));
    }

    try {
      let savedRoom;
      if (editingRoom) {
        // Обновление существующего номера
        savedRoom = await roomsService.updateRoom(editingRoom._id, formData);
        toast.success(`Номер "${savedRoom.title}" успешно обновлен.`);
      } else {
        // Создание нового номера
        savedRoom = await roomsService.createRoom(formData);
        toast.success(`Номер "${savedRoom.title}" успешно создан.`);
      }
      setShowForm(false);
      setEditingRoom(null);
      // Перезагружаем список номеров, чтобы увидеть изменения
      fetchRooms(); 
    } catch (err) {
      console.error("Ошибка сохранения номера:", err);
      const message = err instanceof Error ? err.message : 'Не удалось сохранить номер';
      setError(message);
      toast.error(message);
      // Не закрываем форму при ошибке, чтобы пользователь мог исправить
    } finally {
      setIsLoading(false);
    }
  }, [editingRoom, fetchRooms]); // Добавляем fetchRooms в зависимости

  const confirmDelete = async () => {
    if (!deletingRoomId) return;
    try {
      await roomsService.deleteRoom(deletingRoomId);
      toast.success('Номер успешно удален');
      setShowDeleteConfirm(false);
      setDeletingRoomId(null);
      fetchRooms();
    } catch (err: any) {
      console.error("Ошибка удаления номера:", err);
      toast.error(`Ошибка удаления: ${err.message || 'Неизвестная ошибка'}`);
      setShowDeleteConfirm(false);
      setDeletingRoomId(null);
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
    
    if (over && active.id !== over.id) {
      const oldIndex = rooms.findIndex((room) => room._id === active.id);
      const newIndex = rooms.findIndex((room) => room._id === over.id);

      if (oldIndex === -1 || newIndex === -1) return;

      const newOrderRooms = arrayMove(rooms, oldIndex, newIndex);
      setRooms(newOrderRooms);

      const orderedIds = newOrderRooms.map(room => room._id!);
      try {
        await roomsService.updateRoomsOrder(orderedIds);
        toast.success('Порядок номеров обновлен.');
      } catch (err) {
        console.error("Ошибка обновления порядка номеров:", err);
        toast.error('Не удалось сохранить новый порядок номеров.');
        setRooms(rooms); 
      }
    }
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
              key={editingRoom?._id || 'new'} // Ключ для сброса состояния формы
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
        <TableContainer>
          <StyledTable>
            <thead>
              <tr>
                <TableHeader style={{ width: '40px' }}></TableHeader>
                <TableHeader>Фото</TableHeader>
                <TableHeader>Название</TableHeader>
                <TableHeader>Цена</TableHeader>
                <TableHeader className="hide-mobile">Вмест.</TableHeader>
                <TableHeader className="hide-mobile">Особенности</TableHeader>
                <TableHeader>Действия</TableHeader>
              </tr>
            </thead>
            <DndContext 
              sensors={sensors}
              collisionDetection={closestCenter}
              onDragEnd={handleDragEnd}
            >
              <SortableContext 
                items={rooms.map(r => r._id!)}
                strategy={verticalListSortingStrategy}
              >
                <tbody>
                  {rooms.map(room => (
                    <SortableRoomRow 
                      key={room._id} 
                      room={room} 
                      onEdit={handleEditRoomClick} 
                      onDelete={handleDeleteRoomClick} 
                    />
                  ))}
                </tbody>
              </SortableContext>
            </DndContext>
          </StyledTable>
        </TableContainer>
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
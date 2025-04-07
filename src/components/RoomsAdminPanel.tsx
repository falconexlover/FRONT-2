import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { roomsService } from '../utils/api';
import { RoomType } from '../types/Room';
import RoomForm from './RoomForm';
import { toast } from 'react-toastify';

interface RoomsAdminPanelProps {
  onLogout: () => void;
}

const AdminPanelContainer = styled.div`
  padding: 2rem;
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 3rem;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  
  h2 {
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
    margin: 0;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
`;

const ActionButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--dark-color);
    }
  }
  
  &.danger {
    background-color: #e53935;
    color: white;
    
    &:hover {
      background-color: #c62828;
    }
  }
  
  &.outline {
    background: none;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
    
    &:hover {
      background-color: rgba(33, 113, 72, 0.1);
    }
  }
`;

const RoomsList = styled.div`
  margin-top: 2rem;
`;

const RoomCard = styled.div`
  display: grid;
  grid-template-columns: 120px 1fr auto;
  gap: 1.5rem;
  background-color: white;
  border-radius: var(--radius-md);
  padding: 1.5rem;
  box-shadow: var(--shadow-sm);
  margin-bottom: 1.5rem;
  transition: var(--transition);
  
  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
  }
  
  .room-image {
    width: 120px;
    height: 80px;
    border-radius: var(--radius-sm);
    overflow: hidden;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
  
  .room-info {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    
    h3 {
      margin: 0 0 0.5rem;
      color: var(--dark-color);
      font-size: 1.3rem;
    }
    
    .room-details {
      display: flex;
      flex-wrap: wrap;
      gap: 1rem;
      margin-bottom: 0.5rem;
      
      span {
        display: inline-flex;
        align-items: center;
        font-size: 0.9rem;
        color: var(--text-color);
        
        i {
          color: var(--primary-color);
          margin-right: 0.3rem;
        }
      }
    }
    
    .room-price {
      font-weight: 600;
      color: var(--primary-color);
    }
  }
  
  .room-actions {
    display: flex;
    flex-direction: column;
    justify-content: center;
    gap: 0.5rem;
    
    button {
      padding: 0.5rem 1rem;
      border: none;
      border-radius: var(--radius-sm);
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: var(--transition);
      
      &.edit {
        background-color: #f0f0f0;
        color: var(--dark-color);
        
        &:hover {
          background-color: #e0e0e0;
        }
      }
      
      &.delete {
        background-color: #ffebee;
        color: #c62828;
        
        &:hover {
          background-color: #ffcdd2;
        }
      }
    }
  }
  
  @media screen and (max-width: 768px) {
    grid-template-columns: 80px 1fr;
    
    .room-image {
      width: 80px;
      height: 60px;
    }
    
    .room-actions {
      grid-column: 1 / 3;
      flex-direction: row;
      justify-content: flex-end;
      margin-top: 1rem;
    }
  }
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  background-color: #f9f9f9;
  border-radius: var(--radius-md);
  
  h3 {
    margin-bottom: 1rem;
    color: var(--dark-color);
  }
  
  p {
    margin-bottom: 1.5rem;
    color: var(--text-color);
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  .dialog-content {
    background: white;
    padding: 2rem;
    border-radius: var(--radius-md);
    max-width: 500px;
    width: 100%;
    
    h3 {
      margin-bottom: 1rem;
      color: var(--dark-color);
    }
    
    p {
      margin-bottom: 2rem;
      color: var(--text-color);
    }
    
    .dialog-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: var(--text-color);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e53935;
  background-color: #ffebee;
  border: 1px solid #e53935;
  border-radius: var(--radius-sm);
`;

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
      setRooms(data || []);
    } catch (err: any) {
      console.error("Ошибка при загрузке номеров:", err);
      setError(err.message || 'Не удалось загрузить список номеров.');
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

  const confirmDeleteRoom = async () => {
    if (!deletingRoomId) return;

    setIsLoading(true);
    setError(null);
    setShowDeleteConfirm(false);

    try {
      console.log(`Удаление номера с ID: ${deletingRoomId}...`);
      await roomsService.deleteRoom(deletingRoomId);
      toast.success('Номер успешно удален!');
      await fetchRooms();
    } catch (err: any) {
      console.error("Ошибка при удалении номера:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Не удалось удалить номер.';
      setError(errorMessage);
      toast.error(`Ошибка: ${errorMessage}`);
    } finally {
      setIsLoading(false);
      setDeletingRoomId(null);
    }
  };

  const cancelDeleteRoom = () => {
    setShowDeleteConfirm(false);
    setDeletingRoomId(null);
  };

  const handleFormSave = async (roomData: RoomType, imageFile: File | null) => {
    const isEditing = !!editingRoom?._id;
    const roomId = editingRoom?._id;

    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('title', roomData.title);
    formData.append('price', roomData.price);
    formData.append('priceValue', roomData.priceValue.toString());
    formData.append('capacity', roomData.capacity.toString());
    formData.append('features', JSON.stringify(roomData.features));
    
    if (imageFile) {
      formData.append('image', imageFile);
    }
    
    try {
      let savedRoom;
      if (isEditing && roomId) {
        console.log(`Обновление номера с ID: ${roomId}...`);
        savedRoom = await roomsService.updateRoom(roomId, formData);
        toast.success('Номер успешно обновлен!');
      } else {
        console.log("Добавление нового номера...");
        savedRoom = await roomsService.createRoom(formData);
        toast.success('Номер успешно добавлен!');
      }
      
      await fetchRooms(); 
      setShowForm(false);
      setEditingRoom(null);
      
    } catch (err: any) {
      console.error("Ошибка при сохранении номера:", err);
      const errorMessage = err.response?.data?.message || err.message || 'Не удалось сохранить номер.';
      setError(errorMessage);
      toast.error(`Ошибка: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingRoom(null);
  };

  const roomToDelete = deletingRoomId ? rooms.find(room => room._id === deletingRoomId) : null;
  const roomToDeleteTitle = roomToDelete ? roomToDelete.title : 'этот номер';
  
  return (
    <AdminPanelContainer>
      <PanelHeader>
        <h2>Управление номерами</h2>
      </PanelHeader>
      
      <ActionButtonsContainer>
        <ActionButton 
          className="primary"
          onClick={handleAddRoomClick} 
          disabled={isLoading}
        >
          <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Добавить номер
        </ActionButton>
      </ActionButtonsContainer>
      
      {showForm && (
        <RoomForm 
          initialData={editingRoom ?? undefined}
          onSave={handleFormSave}
          onCancel={handleFormCancel}
          isLoading={isLoading}
        />
      )}
      
      <RoomsList>
        {isLoading && <LoadingIndicator>Загрузка номеров...</LoadingIndicator>}
        {error && <ErrorMessage>Ошибка: {error}</ErrorMessage>}
        {!isLoading && !error && rooms.length === 0 && <LoadingIndicator>Номера еще не добавлены.</LoadingIndicator>}
        {!isLoading && !error && rooms.map((room) => (
          <RoomCard key={room._id}>
              <div className="room-image">
              <img src={room.imageUrl || '/placeholder-image.jpg'} alt={room.title} />
              </div>
              <div className="room-info">
                <h3>{room.title}</h3>
                <div className="room-details">
                <span><i className="fas fa-users"></i> {room.capacity} чел.</span>
              </div>
              <div className="room-price">{room.price}</div>
              {room.features && room.features.length > 0 && (
                <div style={{fontSize: '0.8em', color: '#666', marginTop: '0.5rem'}}>
                  {room.features.join(', ')}
                </div>
                  )}
                </div>
              <div className="room-actions">
                <button 
                  className="edit"
                onClick={() => handleEditRoomClick(room)} 
                disabled={isLoading}
                >
                <i className="fas fa-pencil-alt" style={{ marginRight: '0.5rem' }}></i> Редактировать
                </button>
                <button 
                  className="delete"
                onClick={() => {
                  if (room._id) {
                    handleDeleteRoomClick(room._id);
                  }
                }}
                disabled={isLoading}
              >
                <i className="fas fa-trash" style={{ marginRight: '0.5rem' }}></i> Удалить
                </button>
              </div>
            </RoomCard>
        ))}
      </RoomsList>
      
      {showDeleteConfirm && (
        <ConfirmDialog>
          <div className="dialog-content">
             <h3>Подтвердите удаление</h3>
             <p>Вы уверены, что хотите удалить номер "{roomToDeleteTitle}"? Это действие необратимо.</p>
            <div className="dialog-buttons">
              <ActionButton 
                className="outline"
                   onClick={cancelDeleteRoom} 
                   disabled={isLoading}
              >
                Отмена
              </ActionButton>
              <ActionButton 
                className="danger"
                onClick={confirmDeleteRoom}
                   disabled={isLoading}
                >
                   {isLoading ? 'Удаление...' : 'Удалить'}
              </ActionButton>
            </div>
          </div>
        </ConfirmDialog>
      )}
    </AdminPanelContainer>
  );
};

export default RoomsAdminPanel; 
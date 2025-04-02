import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RoomType, loadRoomsFromStorage, addRoom, updateRoom, deleteRoom, resetToDefaultRooms } from '../utils/roomsData';
import RoomForm from './RoomForm';

/**
 * Функция для изменения размера изображения
 * @param file - Исходный файл изображения
 * @param maxWidth - Максимальная ширина выходного изображения
 * @returns Promise с объектом File уменьшенного размера
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const resizeImage = (file: File, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve, reject) => {
    // Создаем объекты для работы с изображением
    const reader = new FileReader();
    const image = new Image();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        reject(new Error('Не удалось прочитать файл'));
        return;
      }
      
      image.onload = () => {
        // Проверяем, нужно ли изменять размер
        if (image.width <= maxWidth) {
          resolve(file); // Если изображение меньше maxWidth, возвращаем исходный файл
          return;
        }
        
        // Вычисляем новые размеры с сохранением пропорций
        const ratio = image.height / image.width;
        const newWidth = maxWidth;
        const newHeight = Math.round(newWidth * ratio);
        
        // Создаем canvas для изменения размера
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        // Рисуем изображение на canvas
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Не удалось создать контекст canvas'));
          return;
        }
        
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        
        // Конвертируем canvas в blob
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Не удалось создать blob'));
            return;
          }
          
          // Создаем новый файл с тем же именем и типом
          const resizedFile = new File([blob], file.name, {
            type: file.type,
            lastModified: Date.now()
          });
          
          resolve(resizedFile);
        }, file.type, 0.85); // Качество 0.85 (85%)
      };
      
      image.onerror = () => {
        reject(new Error('Не удалось загрузить изображение'));
      };
      
      // Загружаем URL изображения
      image.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Не удалось прочитать файл'));
    };
    
    // Читаем файл как Data URL
    reader.readAsDataURL(file);
  });
};

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

const RoomsAdminPanel: React.FC<RoomsAdminPanelProps> = ({ onLogout }) => {
  // Состояния
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isAddingRoom, setIsAddingRoom] = useState(false);
  const [editingRoom, setEditingRoom] = useState<RoomType | null>(null);
  const [roomToDelete, setRoomToDelete] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  
  // Загрузка номеров при монтировании компонента
  useEffect(() => {
    loadRooms();
  }, []);
  
  // Функция для загрузки номеров
  const loadRooms = () => {
    const loadedRooms = loadRoomsFromStorage();
    setRooms(loadedRooms);
  };
  
  // Обработчик для добавления нового номера
  const handleAddRoom = (newRoom: RoomType) => {
    const updatedRooms = addRoom(newRoom);
    setRooms(updatedRooms);
    setIsAddingRoom(false);
  };
  
  // Обработчик для обновления номера
  const handleUpdateRoom = (updatedRoom: RoomType) => {
    const updatedRooms = updateRoom(updatedRoom.id, updatedRoom);
    setRooms(updatedRooms);
    setEditingRoom(null);
  };
  
  // Обработчик для удаления номера
  const handleDeleteRoom = (roomId: string) => {
    setRoomToDelete(roomId);
  };
  
  // Подтверждение удаления
  const confirmDeleteRoom = () => {
    if (roomToDelete) {
      const updatedRooms = deleteRoom(roomToDelete);
      setRooms(updatedRooms);
      setRoomToDelete(null);
    }
  };
  
  // Сброс к исходным номерам
  const handleResetRooms = () => {
    const defaultRooms = resetToDefaultRooms();
    setRooms(defaultRooms);
    setShowResetConfirm(false);
  };
  
  return (
    <AdminPanelContainer>
      <PanelHeader>
        <h2>Управление номерами</h2>
        <ActionButton className="outline" onClick={onLogout}>
          Выйти из режима администратора
        </ActionButton>
      </PanelHeader>
      
      <ActionButtonsContainer>
        <ActionButton 
          className="primary"
          onClick={() => setIsAddingRoom(true)}
        >
          Добавить новый номер
        </ActionButton>
        
        <ActionButton 
          className="danger"
          onClick={() => setShowResetConfirm(true)}
        >
          Сбросить к исходным номерам
        </ActionButton>
      </ActionButtonsContainer>
      
      {isAddingRoom && (
        <RoomForm 
          onSubmit={handleAddRoom}
          onCancel={() => setIsAddingRoom(false)}
        />
      )}
      
      {editingRoom && (
        <RoomForm 
          initialData={editingRoom}
          onSubmit={handleUpdateRoom}
          onCancel={() => setEditingRoom(null)}
        />
      )}
      
      <RoomsList>
        <h3>Список номеров ({rooms.length})</h3>
        
        {rooms.length === 0 ? (
          <EmptyState>
            <h3>Номера не найдены</h3>
            <p>Добавьте первый номер, нажав на кнопку "Добавить номер"</p>
            <ActionButton 
              className="primary"
              onClick={() => setIsAddingRoom(true)}
            >
              Добавить номер
            </ActionButton>
          </EmptyState>
        ) : (
          rooms.map(room => (
            <RoomCard key={room.id}>
              <div className="room-image">
                <img src={room.image} alt={room.title} />
              </div>
              
              <div className="room-info">
                <h3>{room.title}</h3>
                
                <div className="room-details">
                  <span><i className="fas fa-user"></i> {room.capacity} гостя</span>
                  <span><i className="fas fa-expand"></i> {room.size} м²</span>
                  <span><i className="fas fa-bed"></i> {room.bedType}</span>
                  {room.roomCount && (
                    <span><i className="fas fa-door-closed"></i> {room.roomCount} номеров</span>
                  )}
                </div>
                
                <div className="room-price">
                  {room.price} {room.priceNote}
                  {room.additionalPrice && (
                    <span> / {room.additionalPrice} {room.additionalPriceNote}</span>
                  )}
                </div>
              </div>
              
              <div className="room-actions">
                <button 
                  className="edit"
                  onClick={() => setEditingRoom(room)}
                >
                  Редактировать
                </button>
                <button 
                  className="delete"
                  onClick={() => handleDeleteRoom(room.id)}
                >
                  Удалить
                </button>
              </div>
            </RoomCard>
          ))
        )}
      </RoomsList>
      
      {/* Диалог подтверждения удаления */}
      {roomToDelete && (
        <ConfirmDialog>
          <div className="dialog-content">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить этот номер? Это действие нельзя будет отменить.</p>
            <div className="dialog-buttons">
              <ActionButton 
                className="outline"
                onClick={() => setRoomToDelete(null)}
              >
                Отмена
              </ActionButton>
              <ActionButton 
                className="danger"
                onClick={confirmDeleteRoom}
              >
                Удалить
              </ActionButton>
            </div>
          </div>
        </ConfirmDialog>
      )}
      
      {/* Диалог подтверждения сброса */}
      {showResetConfirm && (
        <ConfirmDialog>
          <div className="dialog-content">
            <h3>Сбросить к исходным номерам?</h3>
            <p>Вы собираетесь сбросить все изменения и вернуться к исходному списку номеров. Это действие нельзя будет отменить.</p>
            <div className="dialog-buttons">
              <ActionButton 
                className="outline"
                onClick={() => setShowResetConfirm(false)}
              >
                Отмена
              </ActionButton>
              <ActionButton 
                className="danger"
                onClick={handleResetRooms}
              >
                Сбросить
              </ActionButton>
            </div>
          </div>
        </ConfirmDialog>
      )}
    </AdminPanelContainer>
  );
};

export default RoomsAdminPanel; 
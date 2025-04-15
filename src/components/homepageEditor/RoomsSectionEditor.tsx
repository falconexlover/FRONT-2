import React from 'react';
import styled from 'styled-components';
import { HomePageContent, RoomPreview } from '../../types/HomePage';

// --- Styled Components (адаптировано из HomePageEditor) ---
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    transition: var(--transition);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(33, 113, 72, 0.2);
    }
  }
  
  textarea {
    min-height: 100px; 
    resize: vertical;
  }
`;

const RoomCard = styled.div`
  border: 1px solid #eee;
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #fdfdfd; // Slightly different background
  
  h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
  }
`;

// --- Component Props --- 
type RoomsContent = HomePageContent['rooms'];

interface RoomsSectionEditorProps {
  content: NonNullable<RoomsContent>;
  onSectionChange: (field: 'title' | 'subtitle', value: string) => void;
  onRoomChange: (index: number, field: keyof RoomPreview, value: string) => void;
  // Возможно, понадобится функция для добавления/удаления комнат, если это будет необходимо
}

// --- Component --- 
const RoomsSectionEditor: React.FC<RoomsSectionEditorProps> = ({ 
  content, 
  onSectionChange, 
  onRoomChange 
}) => {

  // Обработчик для общих полей секции (title, subtitle)
  const handleSectionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'subtitle') {
      onSectionChange(name, value);
    }
  };

  // Обработчик для полей конкретной комнаты
  const handleRoomInputChange = (
    index: number, 
    field: keyof RoomPreview,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onRoomChange(index, field, e.target.value);
  };

  return (
    <div>
      <h4>Редактирование секции "Номера"</h4>
      <FormGroup>
        <label htmlFor="rooms-title">Заголовок раздела:</label>
        <input 
          type="text" 
          id="rooms-title"
          name="title" 
          value={content.title || ''} 
          onChange={handleSectionInputChange} 
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="rooms-subtitle">Подзаголовок:</label>
        <input 
          type="text" 
          id="rooms-subtitle"
          name="subtitle" 
          value={content.subtitle || ''} 
          onChange={handleSectionInputChange} 
        />
      </FormGroup>

      <h3>Список номеров (превью для главной)</h3>
      <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem'}}>
        Примечание: здесь редактируются только данные, которые показываются на главной странице (название, цена).
      </p>

      {(content.roomsData || []).map((room, index) => (
        <RoomCard key={room._id || index}>
          <h4>{room.title || 'Номер без названия'}</h4>
          
          <FormGroup>
            <label htmlFor={`room-${index}-title`}>Название:</label>
            <input 
              id={`room-${index}-title`}
              type="text"
              value={room.title || ''}
              onChange={(e) => handleRoomInputChange(index, 'title', e)}
            />
          </FormGroup>
          
          <FormGroup style={{marginBottom: 0}}>
            <label htmlFor={`room-${index}-price`}>Цена (текст):</label>
            <input 
              id={`room-${index}-price`}
              type="text"
              value={room.price || ''}
              onChange={(e) => handleRoomInputChange(index, 'price', e)}
              placeholder='например, "от 3500 ₽ / сутки"'
            />
          </FormGroup>
        </RoomCard>
      ))}
      {/* Здесь можно добавить кнопку для добавления новой комнаты, если это требуется */} 
    </div>
  );
};

export default RoomsSectionEditor; 
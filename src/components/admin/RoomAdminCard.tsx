import React from 'react';
import styled from 'styled-components';
import { RoomType } from '../../types/Room';
import { optimizeCloudinaryImage } from '../../utils/cloudinaryUtils';

interface RoomAdminCardProps {
  room: RoomType;
  onEdit: (room: RoomType) => void;
  onDelete: (id: string) => void;
}

// Стили для карточки
const Card = styled.div`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  color: var(--text-primary);
  transition: var(--transition);
  box-shadow: var(--shadow-sm);

  &:hover {
    border-color: var(--primary-color-light);
    box-shadow: var(--shadow-md);
  }
`;

const CardHeader = styled.div`
  display: flex;
  gap: 1rem;
  align-items: flex-start; /* Выравниваем по верху */
`;

const CardImagePreview = styled.div`
  flex-shrink: 0;
  width: 100px;
  height: 65px;
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--bg-primary);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

const CardTitlePrice = styled.div`
  flex-grow: 1;
  min-width: 0; /* Позволяет тексту сокращаться */
`;

const CardRoomName = styled.h4`
  margin: 0 0 0.3rem 0;
  font-size: 1.1rem;
  font-weight: 600;
  white-space: normal; /* Разрешаем перенос */
  word-break: break-word; /* Ломаем слова если нужно */
  color: var(--text-primary);
  font-family: 'Playfair Display', serif;
`;

const CardRoomPrice = styled.p`
  margin: 0;
  font-size: 0.95rem;
  color: var(--primary-color);
  font-weight: 500;
`;

const CardDetails = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const DetailItem = styled.div`
  display: flex;
  align-items: center;
  gap: 0.5rem;

  i {
    width: 16px; /* Фиксируем ширину иконки */
    text-align: center;
    color: var(--text-secondary);
  }
`;


const CardActions = styled.div`
  display: flex;
  justify-content: flex-end; /* Кнопки вправо */
  gap: 0.8rem;
  margin-top: 0.5rem; /* Небольшой отступ сверху */
  border-top: 1px solid var(--border-color);
  padding-top: 1rem;
`;

// Используем IconButton из RoomsAdminPanel для консистентности
const IconButton = styled.button`
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


// Функция для форматирования особенностей (можно вынести в утилиты, если используется еще где-то)
const formatFeaturesForDisplay = (features: string[] | string): string => {
  let featuresArray: string[] = [];
  if (typeof features === 'string') {
    try {
      const parsed = JSON.parse(features);
      if (Array.isArray(parsed)) {
        featuresArray = parsed;
      }
    } catch (e) {
      console.warn("Could not parse features string:", features);
    }
  } else if (Array.isArray(features)) {
    featuresArray = features;
  }
  const maxFeaturesToShow = 4;
  const displayedFeatures = featuresArray.slice(0, maxFeaturesToShow).join(', ');
  const moreFeaturesCount = featuresArray.length - maxFeaturesToShow;

  return displayedFeatures + (moreFeaturesCount > 0 ? ` и еще ${moreFeaturesCount}...` : '');
};

const RoomAdminCard: React.FC<RoomAdminCardProps> = ({ room, onEdit, onDelete }) => {
  // Генерируем отображаемую цену только на основе room.price
  const displayPrice = `${room.price} р/сутки`;
  // Форматируем особенности
  const displayFeatures = formatFeaturesForDisplay(room.features);

  const handleDeleteClick = () => {
      if (room._id) {
          onDelete(room._id);
      } else {
          console.error("Cannot delete room without an ID");
          // Возможно, показать toast с ошибкой?
      }
  };

  return (
    <Card>
      <CardHeader>
        <CardImagePreview>
          {room.imageUrls?.[0] ? (
            <img
              src={optimizeCloudinaryImage(room.imageUrls[0], 'f_auto,q_auto,w_100,h_60,c_fill')}
              alt={room.title}
              loading="lazy"
            />
          ) : <i className="fas fa-image" style={{ fontSize: '2rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}></i>}
        </CardImagePreview>
        <CardTitlePrice>
          <CardRoomName>{room.title}</CardRoomName>
          <CardRoomPrice>{displayPrice}</CardRoomPrice>
        </CardTitlePrice>
      </CardHeader>

      <CardDetails>
        <DetailItem>
          <i className="fas fa-users"></i>
          <span>Вместимость: {room.capacity} чел.</span>
        </DetailItem>
        <DetailItem>
           <i className="fas fa-star"></i>
           <span>Особенности: {displayFeatures}</span>
        </DetailItem>
        {room.description && (
          <DetailItem>
            <i className="fas fa-info-circle"></i>
            <span>Описание: {room.description}</span>
          </DetailItem>
        )}
      </CardDetails>

      <CardActions>
        <IconButton className="edit" onClick={() => onEdit(room)} title="Редактировать">
          <i className="fas fa-pencil-alt"></i>
        </IconButton>
        <IconButton className="delete" onClick={handleDeleteClick} title="Удалить">
          <i className="fas fa-trash-alt"></i>
        </IconButton>
      </CardActions>
    </Card>
  );
};

export default RoomAdminCard; 
import React from 'react';
import styled from 'styled-components';
// import { motion } from 'framer-motion'; // Убираем неиспользуемый импорт
// Импортируем общий тип
import { GalleryImageItem } from '../../types/GalleryImage';
import { optimizeCloudinaryImage } from '../../utils/cloudinaryUtils'; // Импортируем утилиту
import ActionButton from '../ui/ActionButton';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

// Удаляем локальное определение типа
/*
interface GalleryImageItem {
  _id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string;
  cloudinaryPublicId?: string;
}
*/

interface ImageCardProps {
  image: GalleryImageItem;
  onEdit: (image: GalleryImageItem) => void;
  onDelete: (id: string) => void;
  isEditing?: boolean;
}

// Добавляем isDragging пропс для стилизации во время перетаскивания
const Card = styled.div<{ $isDragging?: boolean; $isEditing?: boolean }>`
  position: relative;
  border-radius: var(--radius-md);
  background-color: var(--bg-primary);
  border: 2px solid ${props => props.$isEditing ? 'var(--primary-color)' : 'var(--border-color)'};
  overflow: hidden;
  display: flex;
  flex-direction: column;
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border 0.2s;
  cursor: grab;
  touch-action: none; // Для мобильных устройств

  // Стили для состояния перетаскивания
  opacity: ${props => props.$isDragging ? 0.5 : 1};
  box-shadow: ${props => props.$isDragging ? '0 10px 20px rgba(0,0,0,0.2)' : 'none'};
  transform: ${props => props.$isDragging ? 'scale(1.03)' : 'scale(1)'};
`;

const CardImageContainer = styled.div`
  height: 150px; // Фиксированная высота для изображения
  overflow: hidden;
  position: relative;
`;

const CardImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  height: 100%;
  background: var(--bg-secondary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1rem;
`;

// Добавляем "ручку" для перетаскивания
const DragHandle = styled.div`
    position: absolute;
    top: 8px;
    left: 8px;
    background: rgba(0,0,0,0.5);
    color: white;
    padding: 4px 8px;
    border-radius: var(--radius-sm);
    cursor: grab;
    font-size: 1.2rem;
    line-height: 1;
    z-index: 10;
    transition: background-color 0.2s ease;

    &:active {
        cursor: grabbing;
        background: rgba(0,0,0,0.8);
    }
`;

const CardContent = styled.div`
  padding: 1rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const CardTitle = styled.h4`
  margin: 0 0 0.5rem;
  font-size: 1rem;
  color: var(--text-primary);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const CardDescription = styled.p`
  font-size: 0.85rem;
  color: var(--text-secondary);
  margin: 0 0 1rem;
  flex-grow: 1;
  // Ограничение по строкам (не идеально, но лучше чем ничего)
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;  
  overflow: hidden;
`;

const CardCategory = styled.span`
    font-size: 0.8rem;
    color: var(--text-secondary);
    background-color: var(--bg-secondary);
    padding: 0.2rem 0.5rem;
    border-radius: var(--radius-sm);
    align-self: flex-start; // Прижимаем к левому краю
    margin-bottom: 1rem;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end; // Кнопки справа
  gap: 0.5rem;
  margin-top: auto; // Прижимаем к низу
`;

const ImageCard: React.FC<ImageCardProps> = ({ image, onEdit, onDelete, isEditing }) => {
    
    // --- DND Kit Hooks ---
    const { 
        attributes, 
        listeners, 
        setNodeRef, 
        transform, 
        transition, 
        isDragging // Состояние перетаскивания
    } = useSortable({ id: image._id });

    const style = {
        transform: CSS.Transform.toString(transform),
        transition,
    };
    // ---------------------

    const [imgError, setImgError] = React.useState(false);
    const [showConfirm, setShowConfirm] = React.useState(false);

    // Если картинка битая — не рендерим карточку вообще
    if (imgError) return null;

    return (
        <Card ref={setNodeRef} style={style} $isDragging={isDragging} $isEditing={isEditing}>
            <CardImageContainer>
                {/* Передаем listeners и attributes ручке */}
                <DragHandle {...listeners} {...attributes} title="Перетащить для сортировки">
                    <i className="fas fa-grip-vertical"></i>
                </DragHandle>
                <CardImage 
                    src={optimizeCloudinaryImage(image.imageUrl, 'f_auto,q_auto,w_400')} 
                    alt={image.title || 'Gallery image'} 
                    loading="lazy" 
                    onError={() => setImgError(true)}
                />
            </CardImageContainer>
            <CardContent>
                <CardTitle title={image.title || '(без названия)'}>{image.title || '(без названия)'}</CardTitle>
                <CardDescription title={image.description || ''}>{image.description || ''}</CardDescription>
                <CardCategory>{image.category}</CardCategory>
                <CardActions>
                    <ActionButton 
                        className="secondary small" 
                        onClick={() => onEdit(image)}
                        title="Редактировать"
                    >
                        <i className="fas fa-pencil-alt"></i>
                    </ActionButton>
                    <ActionButton 
                        className="danger small" 
                        onClick={() => setShowConfirm(true)}
                        title="Удалить"
                    >
                         <i className="fas fa-trash-alt"></i>
                    </ActionButton>
                </CardActions>
                {showConfirm && (
                  <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'rgba(0,0,0,0.4)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 20
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: 8,
                      padding: 24,
                      boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
                      textAlign: 'center',
                      minWidth: 220
                    }}>
                      <p style={{marginBottom: 16}}>Удалить изображение?</p>
                      <button style={{marginRight: 12, padding: '6px 18px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--danger-color)', color: 'white', cursor: 'pointer'}} onClick={() => { onDelete(image._id); setShowConfirm(false); }}>Удалить</button>
                      <button style={{padding: '6px 18px', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer'}} onClick={() => setShowConfirm(false)}>Отмена</button>
                    </div>
                  </div>
                )}
            </CardContent>
        </Card>
    );
}

export default ImageCard; 
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// Импортируем общий тип
import { GalleryImageItem } from '../../types/GalleryImage';
import { optimizeCloudinaryImage } from '../../utils/cloudinaryUtils'; // Импортируем утилиту

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
  onEditClick: () => void; // Теперь просто вызывает коллбэк
  onDeleteClick: () => void; // Теперь просто вызывает коллбэк
}

// Стили для карточки (из комментариев в ExistingImagesList)
const ImageCardStyled = styled(motion.div)` 
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-secondary); // Фон карточки
  border: 1px solid var(--border-color); // Граница карточки
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out; // Добавим border-color в transition
  box-shadow: none; // Убираем тень по умолчанию

  &:hover {
      transform: translateY(-4px);
      border-color: var(--primary-color); // Меняем границу при наведении
      /* Убираем тень, т.к. граница дает акцент */
      /* box-shadow: 0 4px 12px rgba(0,0,0, 0.2); */
  }

  .image-container {
    height: 200px;
    position: relative;
    cursor: pointer;
    background-color: var(--bg-primary); // Фон-заглушка для изображения
    overflow: hidden; // Скроем вылезающее изображение при зуме
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
      transition: transform 0.3s ease; // Плавный зум для картинки
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.1) 40%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.7) 100%); // Градиент вместо сплошного
      display: flex;
      flex-direction: column; /* Расположим кнопки друг под другом */
      align-items: flex-end; /* Прижмем к правому краю */
      justify-content: space-between; /* Разнесем кнопки по вертикали */
      padding: 0.8rem; /* Отступы внутри оверлея */
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      
      button {
        margin: 0;
        width: 36px; /* Фиксированный размер */
        height: 36px;
        border-radius: 50%; /* Круглые кнопки */
        background: rgba(0, 0, 0, 0.5); /* Полупрозрачный фон */
        border: none;
        color: rgba(255, 255, 255, 0.8); // Иконки
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: background-color 0.2s, color 0.2s, transform 0.2s;
        
        &:hover {
          background: var(--primary-color); // Акцентный фон при наведении
          color: white;
          transform: scale(1.1);
        }
        
         i {
            font-size: 0.9rem; /* Уменьшим иконки */
        }
        
        /* Стили для кнопки удаления */
        &.delete:hover {
            background: var(--danger-color);
        }
      }
    }
    
    /* Показываем оверлей при наведении на контейнер */
    &:hover .image-overlay {
      opacity: 1;
    }
    /* Зум картинки при наведении */
     &:hover img {
       transform: scale(1.05);
    }
  }
  
  .card-content {
    padding: 1rem 1.2rem;
    
    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.05rem;
      color: var(--text-primary);
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    p {
      font-size: 0.9rem;
      color: var(--text-secondary);
      margin: 0 0 0.8rem 0;
      line-height: 1.4;
      height: calc(1.4 * 2 * 0.9rem); 
      overflow: hidden;
      text-overflow: ellipsis;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    
    .card-category {
      display: inline-block; // Чтобы применить padding
      font-size: 0.8rem; // Уменьшим
      color: var(--primary-color);
      background-color: rgba(42, 167, 110, 0.1); // Легкий фон под цвет
      font-weight: 600;
      text-transform: capitalize;
      padding: 0.2rem 0.6rem; // Паддинги для тега
      border-radius: var(--radius-sm);
    }
  }
`;

const ImageCard: React.FC<ImageCardProps> = ({ image, onEditClick, onDeleteClick }) => {
    return (
        <ImageCardStyled 
            layout // Для анимации при фильтрации/удалении
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
        >
            <div className="image-container">
                <img src={optimizeCloudinaryImage(image.imageUrl, 'f_auto,q_auto,w_400')} alt={image.title || 'Gallery image'} loading="lazy" />
                <div className="image-overlay">
                    <button onClick={onEditClick} title="Редактировать">
                        <i className="fas fa-pencil-alt"></i>
                    </button>
                    <button className="delete" onClick={onDeleteClick} title="Удалить">
                        <i className="fas fa-trash-alt"></i>
                    </button>
                </div>
            </div>
            <div className="card-content">
                <h4>{image.title || "(Без названия)"}</h4>
                <p>{image.description || "(Без описания)"}</p>
                {image.category && (
                    <span className="card-category">{image.category}</span>
                )}
            </div>
        </ImageCardStyled>
    );
}

export default ImageCard; 
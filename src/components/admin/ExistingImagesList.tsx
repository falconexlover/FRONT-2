import React from 'react';
import styled from 'styled-components';
// import { motion } from 'framer-motion'; // Импорт motion удален
import ImageCard from './ImageCard'; 
// Исправляем путь импорта на правильный относительный путь
import { GalleryImageItem } from '../../types/GalleryImage';

// Удаляем локальное определение типа
/*
interface GalleryImageItem {
  _id: string;
  imageUrl: string;
  category: string;
  title?: string; 
  description?: string;
  cloudinaryPublicId?: string;
}
*/

interface ExistingImagesListProps {
  images: GalleryImageItem[];
  onEditClick: (image: GalleryImageItem) => void;
  onDeleteClick: (imageId: string) => void;
  categoryFilter?: string; // Необязательный фильтр по категории
}

// Адаптация стилей под темную тему
const ExistingImagesPanel = styled.div`
  h3 {
    margin-bottom: 1.5rem;
    color: var(--text-primary); /* Светлый заголовок */
    font-size: 1.4rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color); /* Темная граница */
    padding-bottom: 0.8rem;
  }
  p {
    color: var(--text-secondary); /* Вторичный цвет для сообщений */
    text-align: center;
    padding: 2rem 0;
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  /* Оставляем адаптивные колонки, возможно, увеличим minmax */
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); 
  gap: 1.5rem;
`;

// Стили для ImageCard вынесены в отдельный компонент ImageCard.tsx
// Если ImageCard не вынесен, нужно будет адаптировать стили здесь:
/*
const ImageCardStyled = styled(motion.div)` 
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--bg-secondary); // Фон карточки
  border: 1px solid var(--border-color); // Граница карточки
  transition: transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out;
  box-shadow: none; // Убираем тень по умолчанию

  &:hover {
      transform: translateY(-4px);
      // Можно добавить легкую тень при наведении или изменить границу
      border-color: var(--primary-color);
      box-shadow: 0 4px 12px rgba(0,0,0, 0.2);
  }

  .image-container {
    height: 200px;
    position: relative;
    cursor: pointer;
    background-color: var(--bg-primary); // Фон-заглушка для изображения
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.7); // Затемнение можно оставить
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      opacity: 0;
      transition: opacity 0.2s ease-in-out;
      
      button {
        margin: 0;
        width: auto;
        height: auto;
        border-radius: 0;
        background: transparent;
        border: none;
        color: rgba(255, 255, 255, 0.8); // Чуть тусклее белый для иконок
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: color 0.2s, transform 0.2s;
        
        &:hover {
          background: transparent;
          color: white; // Ярче при наведении
          transform: scale(1.1);
        }
        
         i {
            font-size: 1.6rem;
        }
      }
    }
    
    &:hover .image-overlay {
      opacity: 1;
    }
  }
  
  .card-content {
    padding: 1rem 1.2rem; // Немного изменим падинг
    
    h4 {
      margin: 0 0 0.5rem 0;
      font-size: 1.05rem;
      color: var(--text-primary); // Основной цвет текста
      font-weight: 600;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    p {
      font-size: 0.9rem;
      color: var(--text-secondary); // Вторичный цвет текста
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
      font-size: 0.85rem;
      color: var(--primary-color); // Акцентный цвет для категории
      font-weight: 600;
      text-transform: capitalize;
    }
  }
`;
*/

const ExistingImagesList: React.FC<ExistingImagesListProps> = ({ images, onEditClick, onDeleteClick, categoryFilter }) => {

    const filteredImages = categoryFilter 
        ? images.filter(img => img.category === categoryFilter) 
        : images;

  return (
    <ExistingImagesPanel>
      <h3>{categoryFilter ? `Изображения: ${categoryFilter}` : 'Все изображения галереи'} ({filteredImages.length})</h3>
      {filteredImages.length === 0 ? (
        <p>Нет изображений для отображения.</p>
      ) : (
        <ImagesGrid>
          {filteredImages.map((image) => (
            // Используем компонент ImageCard
            <ImageCard 
                key={image._id}
                image={image}
                onEditClick={() => onEditClick(image)} // Передаем image в обработчик
                onDeleteClick={() => onDeleteClick(image._id)} // Передаем id в обработчик
            />
          ))}
        </ImagesGrid>
      )}
    </ExistingImagesPanel>
  );
};

export default ExistingImagesList; 
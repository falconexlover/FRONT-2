import React from 'react';
import styled from 'styled-components';
import { GalleryImageItem } from '../../types/GalleryImage';
import ImageCard from './ImageCard';
import { 
    DndContext, 
    closestCenter, 
    KeyboardSensor, 
    PointerSensor, 
    useSensor, 
    useSensors 
} from '@dnd-kit/core';
import {
    SortableContext,
    sortableKeyboardCoordinates,
    rectSortingStrategy // Используем для сетки
} from '@dnd-kit/sortable';

interface ExistingImagesListProps {
  images: GalleryImageItem[];
  onEdit: (image: GalleryImageItem) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: any) => void; // Коллбэк для обновления порядка
  onRefresh?: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  onCategoryChange?: (id: string, category: string) => void;
}

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); // Настраиваем колонки
  gap: 1.5rem;
`;

const NoImagesMessage = styled.p`
    text-align: center;
    color: var(--text-secondary);
    margin-top: 2rem;
    padding: 1rem;
    background-color: var(--bg-primary);
    border-radius: var(--radius-sm);
`;

const ExistingImagesList: React.FC<ExistingImagesListProps> = ({ images, onEdit, onDelete, onDragEnd, onRefresh, selectedCategory, setSelectedCategory, searchTerm, setSearchTerm, onCategoryChange }) => {
  // Фильтрация изображений по поиску и категории
  let filteredImages: GalleryImageItem[] = images;
  if (selectedCategory) {
    filteredImages = images.filter(image => image.category === selectedCategory);
  }
  // Поиск только по видимым фото
  if (searchTerm) {
    filteredImages = filteredImages.filter(image =>
      (image.title && image.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );
  }
  // Фото без категории только при фильтре 'Все категории'
  const uncategorizedImages = !selectedCategory ? images.filter(img => !img.category) : [];

  if (selectedCategory === 'party') {
    console.log('categorizedImages:', filteredImages);
  }

  // --- DND Kit Sensors ---
  const sensors = useSensors(
      useSensor(PointerSensor, {
          activationConstraint: {
              distance: 8,
          },
      }),
      useSensor(KeyboardSensor, {
          coordinateGetter: sortableKeyboardCoordinates,
      })
  );
  // ---------------------

  // Фильтры всегда отображаются
  return (
      <>
          {/* Если нет изображений после фильтрации — показываем сообщение */}
          {filteredImages.length === 0 && uncategorizedImages.length === 0 ? (
            <NoImagesMessage>Нет загруженных изображений в этой категории.</NoImagesMessage>
          ) : <>
            {!selectedCategory && uncategorizedImages.length > 0 && (
              <div style={{marginBottom: 16}}>
                <strong style={{color: 'var(--danger-color)'}}>Без категории:</strong>
                <ImageGrid>
                  {uncategorizedImages.map((image) => (
                    <ImageCard 
                      key={image._id} 
                      image={image} 
                      onEdit={onEdit} 
                      onDelete={onDelete} 
                    />
                  ))}
                </ImageGrid>
              </div>
            )}
            <DndContext 
                sensors={sensors}
                collisionDetection={closestCenter}
                onDragEnd={onDragEnd}
            >
                <SortableContext 
                    items={filteredImages.map(img => img._id)}
                    strategy={rectSortingStrategy}
                >
                    <ImageGrid>
                        {filteredImages.map((image) => (
                            <ImageCard 
                                key={image._id} 
                                image={image} 
                                onEdit={onEdit} 
                                onDelete={onDelete} 
                            />
                        ))}
                    </ImageGrid>
                </SortableContext>
            </DndContext>
          </>}
      </>
  );
}

export default ExistingImagesList; 
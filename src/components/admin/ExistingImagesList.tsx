import React, { useState } from 'react';
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

const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' },
  { id: 'food', label: 'Питание' },
];

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.2);
  }
`;

const CategoryFilter = styled.select`
  flex: 0;
  min-width: 150px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.2);
  }
`;

const ExistingImagesList: React.FC<ExistingImagesListProps & { onRefresh?: () => void }> = ({ images, onEdit, onDelete, onDragEnd, onRefresh }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Фильтрация изображений по поиску и категории
  const filteredImages = images.filter(image => {
    const matchesSearch = (image.title && image.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
                         (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()));
    // Если категория не выбрана, показываем все, включая без категории
    const matchesCategory = selectedCategory === '' || image.category === selectedCategory || (!image.category && selectedCategory === '');
    return matchesSearch && matchesCategory;
  });

  // Фото без категории для отдельного отображения
  const uncategorizedImages = filteredImages.filter(img => !img.category);
  const categorizedImages = filteredImages.filter(img => !!img.category);

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

  if (!images || images.length === 0) {
      return <NoImagesMessage>Нет загруженных изображений в этой категории.</NoImagesMessage>;
  }

  return (
      <>
          <SearchFilterContainer>
              <SearchInput 
                  type="text" 
                  placeholder="Поиск по названию или описанию..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
              />
              <CategoryFilter 
                  value={selectedCategory} 
                  onChange={(e) => setSelectedCategory(e.target.value)}
              >
                  <option value="">Все категории</option>
                  {CATEGORIES.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.label}</option>
                  ))}
              </CategoryFilter>
              {onRefresh && (
                <button type="button" onClick={onRefresh} style={{padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer'}}>Обновить список</button>
              )}
          </SearchFilterContainer>
          {uncategorizedImages.length > 0 && selectedCategory === '' && (
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
                  items={categorizedImages.map(img => img._id)}
                  strategy={rectSortingStrategy}
              >
                  <ImageGrid>
                      {categorizedImages.map((image) => (
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
      </>
  );
}

export default ExistingImagesList; 
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
  { id: 'party', label: 'Детские праздники' }
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

const ExistingImagesList: React.FC<ExistingImagesListProps> = ({ images, onEdit, onDelete, onDragEnd }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  
  // Фильтрация изображений по поиску и категории
  const filteredImages = images.filter(image => {
    const matchesSearch = (image.title && image.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
                         (image.description && image.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesCategory = selectedCategory === '' || image.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });
  
    // --- DND Kit Sensors ---
    const sensors = useSensors(
        useSensor(PointerSensor, {
            // Настройка для предотвращения срабатывания drag при клике на кнопки
            activationConstraint: {
                distance: 8, // Начать перетаскивание только после смещения на 8px
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
            </SearchFilterContainer>
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
        </>
    );
}

export default ExistingImagesList; 
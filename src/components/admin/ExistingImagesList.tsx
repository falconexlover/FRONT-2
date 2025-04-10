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

const ExistingImagesList: React.FC<ExistingImagesListProps> = ({ images, onEdit, onDelete, onDragEnd }) => {
  
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
        <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={onDragEnd} // Передаем обработчик завершения перетаскивания
        >
            <SortableContext 
                items={images.map(img => img._id)} // Передаем массив ID
                strategy={rectSortingStrategy} // Стратегия сортировки для сетки
            >
                <ImageGrid>
                    {images.map((image) => (
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
    );
}

export default ExistingImagesList; 
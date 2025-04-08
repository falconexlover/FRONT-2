import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import ImageUploader from './ImageUploader';
import { galleryService } from '../utils/api';
import { toast } from 'react-toastify';

const UploadManagerContainer = styled.div`
  padding: 2rem;
  background-color: var(--light-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 3rem;
`;

// Создаем общий стиль для заголовков секций
const SectionHeader = styled.h3`
    margin-bottom: 1rem;
    color: var(--dark-color); // Используем темный цвет темы
    text-align: center; // Центрируем
`;

const CategorySelector = styled.div`
  margin-bottom: 2rem;
  
  // Используем SectionHeader вместо прямого h3
  // h3 {
  //   margin-bottom: 1rem;
  //   color: var(--dark-color);
  //   text-align: center;
  // }
  
  .category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

const CategoryButton = styled.button<{ active: boolean }>`
  padding: 0.7rem 1.5rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--dark-color)'};
  border: 2px solid ${props => props.active ? 'var(--primary-color)' : '#eee'};
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-bg)'};
    transform: translateY(-3px);
    box-shadow: var(--shadow-sm);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const UploadStatusList = styled.ul`
  margin-top: 2rem;
  list-style: none;
  padding: 0;
  max-height: 40vh;
  overflow-y: auto;
`;

const UploadStatusItem = styled.li<{ status: 'pending' | 'uploading' | 'success' | 'error' }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem 1rem;
  margin-bottom: 0.5rem;
  border-radius: var(--radius-sm);
  background-color: white;
  border: 1px solid #eee;
  font-size: 0.9rem;

  .file-info {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    margin-right: 1rem;
  }

  .file-status {
    font-weight: 600;
    white-space: nowrap;
    color: ${props =>
      props.status === 'success' ? 'var(--secondary-color)' :
      props.status === 'error' ? '#e53935' :
      props.status === 'pending' ? 'gray' :
      'var(--text-color)'};
  }
`;

// Хардкодим категории здесь, пока не передаем через пропсы
/* const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' }
]; */

interface FileUploadStatus {
  id: string;
  name: string;
  status: 'pending' | 'uploading' | 'success' | 'error';
  message?: string;
}

// Добавляем categories в интерфейс пропсов
interface GalleryUploadManagerProps {
  onImageUpload: () => void;
  categories: { id: string; label: string; }[]; // Добавляем этот проп
}

// Используем categories из пропсов
const GalleryUploadManager: React.FC<GalleryUploadManagerProps> = ({ onImageUpload, categories }) => {
  // Инициализируем выбранную категорию первой из полученного списка
  const [selectedCategory, setSelectedCategory] = useState(categories.length > 0 ? categories[0].id : '');
  const [uploadQueue, setUploadQueue] = useState<FileUploadStatus[]>([]);
  const [isUploading, setIsUploading] = useState<boolean>(false);
  const [overallError, setOverallError] = useState<string | null>(null);

  // handleCategorySelect остается без изменений
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };
  
  // handleUpload остается без изменений
  const handleUpload = useCallback(async (files: File[], category: string) => {
    if (files.length === 0) return;

    setIsUploading(true);
    setOverallError(null);
    
    const initialQueue: FileUploadStatus[] = files.map((file, index) => ({
      id: `${Date.now()}-${index}-${file.name}`,
      name: file.name,
      status: 'pending',
    }));
    setUploadQueue(initialQueue);

    let uploadSuccessCount = 0;
    let uploadErrorCount = 0;

    const updateFileStatus = (id: string, status: FileUploadStatus['status'], message?: string) => {
      setUploadQueue(prev => 
        prev.map(item => item.id === id ? { ...item, status, message } : item)
      );
    };

    const uploadPromises = initialQueue.map(async (fileStatus) => {
      const fileIndex = files.findIndex(f => f.name === fileStatus.name);
      const file = files[fileIndex];

      if (!file) {
        console.error(`File not found for status: ${fileStatus.name}`);
        updateFileStatus(fileStatus.id, 'error', 'Внутренняя ошибка: файл не найден');
        uploadErrorCount++;
        return;
      }

      updateFileStatus(fileStatus.id, 'uploading');
      
      const formData = new FormData();
      formData.append('image', file);
      formData.append('category', category);
      
      try {
        await galleryService.uploadImage(formData);
        updateFileStatus(fileStatus.id, 'success');
        uploadSuccessCount++;
      } catch (err: any) {
        const message = err.message || 'Ошибка загрузки';
        console.error(`Ошибка загрузки файла ${fileStatus.name}:`, err);
        updateFileStatus(fileStatus.id, 'error', message);
        uploadErrorCount++;
        setOverallError('При загрузке некоторых файлов произошла ошибка.');
      }
    });

    await Promise.all(uploadPromises);

    setIsUploading(false);

    if (uploadErrorCount === 0 && uploadSuccessCount > 0) {
      const imageWord = uploadSuccessCount === 1 ? 'изображение' : (uploadSuccessCount >= 2 && uploadSuccessCount <= 4) ? 'изображения' : 'изображений';
      toast.success(`${uploadSuccessCount} ${imageWord} успешно загружено!`);
    } else if (uploadSuccessCount > 0 && uploadErrorCount > 0) {
      toast.warning(`Загружено ${uploadSuccessCount} из ${files.length} изображений. Проверьте ошибки.`);
    } else if (uploadErrorCount > 0 && uploadSuccessCount === 0) {
      toast.error(`Не удалось загрузить изображения. Проверьте ошибки.`);
    }
    
    if (onImageUpload) {
      onImageUpload();
    }

    setTimeout(() => {
      if (uploadErrorCount === 0) {
        setUploadQueue([]);
      }
    }, 5000);

  }, [onImageUpload]);
  
  return (
    <UploadManagerContainer>
      <CategorySelector>
        <SectionHeader>1. Выберите категорию для загрузки</SectionHeader>
        <div className="category-buttons">
          {/* Используем categories из пропсов */} 
          {categories.map(category => (
            <CategoryButton
              key={category.id}
              active={selectedCategory === category.id}
              onClick={() => handleCategorySelect(category.id)}
              disabled={isUploading}
            >
              {category.label}
            </CategoryButton>
          ))}
        </div>
      </CategorySelector>
      
      <div>
        <SectionHeader>2. Выберите файлы для загрузки</SectionHeader>
        <ImageUploader
          // Убедимся, что передаем актуальную категорию
          category={selectedCategory} 
          onUpload={handleUpload}
          isUploading={isUploading}
          error={overallError}
        />
      </div>
      
      {uploadQueue.length > 0 && (
        <>
          <h3>Статус загрузки:</h3>
          <UploadStatusList>
            {uploadQueue.map(item => (
              <UploadStatusItem key={item.id} status={item.status}>
                <span className="file-info" title={item.name}>{item.name}</span>
                <span className="file-status">
                  {item.status === 'pending' && 'Ожидание...'}
                  {item.status === 'uploading' && 'Загрузка...'}
                  {item.status === 'success' && '✓ Успешно'}
                  {item.status === 'error' && `✗ Ошибка: ${item.message}`}
                </span>
              </UploadStatusItem>
            ))}
          </UploadStatusList>
        </>
      )}
    </UploadManagerContainer>
  );
};

export default GalleryUploadManager; 
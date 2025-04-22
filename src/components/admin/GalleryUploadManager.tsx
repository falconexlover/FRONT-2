import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { galleryService } from '../../utils/api';
import { toast } from 'react-toastify';
import { LoadingSpinner } from './GalleryAdminPanel'; // Импортируем спиннер

interface Category {
  id: string;
  label: string;
}

interface GalleryUploadManagerProps {
  categories: Category[];
  onImageUpload: () => void; // Callback после успешной загрузки
}

const DropZoneWrapper = styled.div`
  width: 100%;
`;

const DropZoneButton = styled.div<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  border: 2px dashed ${props => props.$active ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--radius-md);
  background-color: ${props => props.$active ? 'var(--primary-light-bg)' : 'var(--bg-secondary)'};
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  cursor: pointer;
  text-align: center;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
`;

const UploadSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
`;

const CategorySelector = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(33, 113, 72, 0.1);
  }
`;

const UploadStatus = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin-top: 0.5rem;
`;

const GalleryUploadManager: React.FC<GalleryUploadManagerProps> = ({ categories, onImageUpload }) => {
  const [active, setActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>(categories.length > 0 ? categories[0].id : '');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!selectedCategory) {
      toast.warn('Пожалуйста, выберите категорию перед загрузкой.');
      return;
    }
    if (files.length === 0) {
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    let uploadSuccess = false;

    // Используем Promise.allSettled для обработки всех загрузок
    const uploadPromises = files.map(file => {
      const formData = new FormData();
      formData.append('image', file); // Ключ 'image' ожидается на бэкенде (проверить!)
      formData.append('category', selectedCategory);
      // formData.append('description', ''); // Можно добавить, если нужно

      return galleryService.uploadImage(formData)
        .then(uploadedImage => {
          console.log(`Файл ${file.name} успешно загружен:`, uploadedImage);
          toast.success(`Файл ${file.name} загружен в категорию "${categories.find(c => c.id === selectedCategory)?.label}".`);
          return { status: 'fulfilled', value: uploadedImage };
        })
        .catch(err => {
          console.error(`Ошибка загрузки файла ${file.name}:`, err);
          const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
          toast.error(`Ошибка загрузки файла ${file.name}: ${errorMsg}`);
          setUploadError(prev => prev ? `${prev}
Ошибка: ${file.name}` : `Ошибка загрузки: ${file.name}`);
          return { status: 'rejected', reason: err };
        });
    });

    const results = await Promise.allSettled(uploadPromises);
    setIsUploading(false);

    // Проверяем, был ли хотя бы один успешный результат
    if (results.some(result => result.status === 'fulfilled')) {
      uploadSuccess = true;
    }

    if (uploadSuccess) {
      onImageUpload(); // Вызываем callback для обновления списка
    }
  }, [selectedCategory, onImageUpload, categories]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      handleFiles(acceptedFiles);
      setActive(false);
    },
    onDragEnter: () => setActive(true),
    onDragLeave: () => setActive(false),
    accept: { // Указываем принимаемые типы файлов
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': []
    },
    disabled: isUploading // Блокируем дропзону во время загрузки
  });

  return (
    <UploadSection>
      <SectionTitle>Загрузить новые изображения</SectionTitle>

      <CategorySelector
        value={selectedCategory}
        onChange={(e) => setSelectedCategory(e.target.value)}
        disabled={isUploading}
      >
        <option value="" disabled>-- Выберите категорию --</option>
        {categories.map(category => (
          <option key={category.id} value={category.id}>{category.label}</option>
        ))}
      </CategorySelector>

      <DropZoneWrapper>
        <DropZoneButton {...getRootProps()} $active={isDragActive || active} >
          <input {...getInputProps()} disabled={isUploading} />
          <i className={`fas fa-cloud-upload-alt fa-3x mb-3 ${isDragActive ? 'animate-pulse' : ''}`}></i>
          {isDragActive ? (
            <p>Отпустите файлы здесь ...</p>
          ) : (
            <p>Перетащите файлы сюда или нажмите для выбора</p>
          )}
        </DropZoneButton>
      </DropZoneWrapper>

      {isUploading && (
        <UploadStatus>
          <LoadingSpinner>
             <i className="fas fa-spinner"></i> Загрузка...
          </LoadingSpinner>
        </UploadStatus>
      )}
      {uploadError && <ErrorMessage>{uploadError}</ErrorMessage>}

    </UploadSection>
  );
};

export default GalleryUploadManager; 
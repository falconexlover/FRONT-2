import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService } from '../utils/api';
import { toast } from 'react-toastify';

type HomePageSectionType = 'banner' | 'about' | 'room' | 'background' | string;

interface HomeImageUploaderProps {}

const UploadContainer = styled.div`
  margin-bottom: 2rem;
`;

const UploadArea = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed ${props => props.isDragActive ? 'var(--primary-color)' : '#ddd'};
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  transition: all 0.3s;
  background-color: ${props => props.isDragActive ? 'rgba(33, 113, 72, 0.1)' : 'transparent'};
  cursor: pointer;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: rgba(33, 113, 72, 0.05);
  }
`;

const UploadIcon = styled.i`
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const UploadText = styled.p`
  color: #666;
  margin-bottom: 1rem;
`;

const UploadButton = styled.label`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--dark-color);
  }
  
  input {
    display: none;
  }

  &[aria-disabled="true"] {
    background-color: #ccc;
    cursor: not-allowed;
    pointer-events: none;
  }
`;

const TypeSelector = styled.div`
  margin-bottom: 1.5rem;
  
  select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: var(--radius-sm);
    background-color: white;
    font-size: 1rem;

    &:disabled {
       background-color: #f5f5f5;
       cursor: not-allowed;
    }
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const StatusMessage = styled.div`
  color: var(--dark-color);
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const HomeImageUploader: React.FC<HomeImageUploaderProps> = ({}) => {
  const [imageType, setImageType] = useState<HomePageSectionType>('banner');
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading) {
       setIsDragActive(true);
    }
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isLoading && !isDragActive) {
      setIsDragActive(true);
    }
  };
  
  const uploadFile = useCallback(async (file: File | null) => {
    if (!file) return;
    
    setError(null);
    setIsLoading(true);
    
    if (!file.type.startsWith('image/')) {
      setError(`Файл "${file.name}" не является изображением.`);
      setIsLoading(false);
      return;
    }

    const formData = new FormData();
    formData.append('image', file);
    formData.append('category', imageType);
    formData.append('title', `${imageType} - ${file.name}`); 
    formData.append('description', `Изображение для секции ${imageType}`);

    try {
      const result = await galleryService.uploadImage(formData);
      toast.success(`Изображение "${file.name}" для секции "${imageType}" успешно загружено!`);
      if (fileInputRef.current) {
         fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error(`Ошибка загрузки изображения для ${imageType}:`, err);
      let message = `Не удалось загрузить изображение "${file.name}".`;
      if (err instanceof Error) {
        message += ` (${err.message})`;
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [imageType]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (isLoading) return;

    const { files } = e.dataTransfer;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  }, [isLoading, uploadFile]);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files.length > 0) {
      uploadFile(files[0]);
    }
  };

  return (
    <UploadContainer>
      <TypeSelector>
        <label htmlFor="image-type">1. Выберите секцию для изображения:</label>
        <select
          id="image-type"
          value={imageType}
          onChange={(e) => setImageType(e.target.value as HomePageSectionType)}
          disabled={isLoading}
        >
          <option value="banner">Баннер (слайдер)</option>
          <option value="about">Секция "О нас"</option>
          <option value="background">Общий фон (если используется)</option>
        </select>
      </TypeSelector>
      
      <UploadArea
        isDragActive={isDragActive}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
      >
        <UploadIcon className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'}`} />
        <h3>{isLoading ? 'Идет загрузка...' : '2. Загрузите изображение'}</h3>
        <UploadText>{isLoading ? 'Пожалуйста, подождите.' : 'Перетащите файл сюда или нажмите для выбора'}</UploadText>
        
        <div style={{ fontSize: '0.85rem', color: '#666', marginTop: '1rem' }}>
            (Рекомендуются форматы JPG, PNG, WEBP, размер до 5MB)
         </div>
        
        <UploadButton as="div" aria-disabled={isLoading} style={{ marginTop: '1rem' }}>
          {isLoading ? 'Загрузка...' : 'Выбрать файл'}
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={handleFileSelect}
            disabled={isLoading}
          />
        </UploadButton>
      </UploadArea>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
    </UploadContainer>
  );
};

export default HomeImageUploader; 
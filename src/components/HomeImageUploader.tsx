import React, { useState, useRef, useCallback } from 'react';
import styled, { StyleSheetManager } from 'styled-components';
import isPropValid from '@emotion/is-prop-valid';
// import { motion, AnimatePresence } from 'framer-motion'; // Не используется
import { homePageService } from '../utils/api';
import { toast } from 'react-toastify';
import ActionButton from './ui/ActionButton';

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

const PreviewContainer = styled.div`
    margin-top: 1.5rem;
    text-align: center;
`;

const PreviewImage = styled.img`
    max-width: 100%;
    max-height: 200px;
    margin-bottom: 1rem;
    border: 1px solid #eee;
    border-radius: var(--radius-sm);
`;

const UploadActionButton = styled(ActionButton)`
    margin-top: 1rem;
`;

const HomeImageUploader: React.FC<HomeImageUploaderProps> = () => {
  const [imageType, setImageType] = useState<HomePageSectionType>('banner');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
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
  
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    setError(null);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setError('Пожалуйста, выберите файл изображения.');
      }
    }
  };
  
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError(null);
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.type.startsWith('image/')) {
        setSelectedFile(file);
        setPreviewUrl(URL.createObjectURL(file));
      } else {
        setError('Пожалуйста, выберите файл изображения.');
        setSelectedFile(null);
        setPreviewUrl(null);
      }
    }
  };

  const handleUpload = useCallback(async () => {
    if (!selectedFile) {
      setError('Пожалуйста, выберите файл для загрузки.');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    const formData = new FormData();
    formData.append('image', selectedFile);
    formData.append('type', imageType); 

    try {
      await homePageService.uploadHomePageImage(selectedFile, imageType);
      toast.success(`Изображение для секции "${imageType}" успешно загружено!`);
      setSelectedFile(null);
      setPreviewUrl(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (err) {
      console.error("Ошибка загрузки изображения:", err);
      const message = err instanceof Error ? err.message : 'Не удалось загрузить изображение.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, [selectedFile, imageType]);

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
      
      <StyleSheetManager shouldForwardProp={prop => isPropValid(prop)}>
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
              onChange={handleFileChange}
              disabled={isLoading}
            />
          </UploadButton>
        </UploadArea>
      </StyleSheetManager>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {selectedFile && previewUrl && (
          <PreviewContainer>
              <h4>Превью выбранного изображения:</h4>
              <PreviewImage src={previewUrl} alt="Превью загружаемого изображения" />
              <UploadActionButton 
                className="primary" 
                onClick={handleUpload} 
                disabled={isLoading}
              >
                {isLoading ? 'Загрузка...' : 'Загрузить это изображение'}
              </UploadActionButton>
          </PreviewContainer>
      )}
      
    </UploadContainer>
  );
};

export default HomeImageUploader; 
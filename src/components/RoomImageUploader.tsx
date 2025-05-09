import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

// Импортируем функцию для изменения размера изображений из нового места
import { resizeImage } from '../utils/imageUtils';

interface RoomImageUploaderProps {
  initialImage?: string;
  onImageChange: (file: File | null) => void;
}

const UploaderContainer = styled.div`
  width: 100%;
  margin-bottom: 1.5rem;
`;

const DropZone = styled.div<{ isDragging: boolean, hasImage: boolean }>`
  border: 2px dashed ${props => props.isDragging ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--radius-sm);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease;
  background-color: ${props => props.isDragging ? 'rgba(33, 113, 72, 0.05)' : 'transparent'};
  position: relative;
  min-height: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: var(--primary-color);
    background-color: rgba(33, 113, 72, 0.05);
  }
  
  p {
    margin: 0;
    font-size: 1rem;
    color: #666;
  }
  
  i {
    font-size: 2rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
`;

const ImagePreview = styled.div`
  margin-top: 1.5rem;
  position: relative;
  width: 100%;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  img {
    width: 100%;
    display: block;
    max-height: 300px;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(var(--danger-color-rgb, 220, 53, 69), 0.8);
  color: white;
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.8);
  }
  
  i {
    font-size: 1rem;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileFormatMessage = styled.p`
  font-size: 0.85rem;
  color: #666;
  margin-top: 0.5rem;
  background-color: rgba(33, 113, 72, 0.05);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  text-align: center;
  
  ul {
    list-style-type: none;
    padding: 0;
    margin: 0.5rem 0 0;
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
  }
  
  li {
    display: inline-flex;
    align-items: center;
    white-space: nowrap;
    
    i {
      margin-right: 0.3rem;
      color: var(--primary-color);
    }
  }
`;

const ErrorMessage = styled.div`
  color: #dc3545;
  font-size: 0.85rem;
  margin-top: 0.5rem;
`;

const ErrorText = styled.p`
  color: var(--danger-color, #dc3545);
  font-size: 0.8rem;
  margin-top: 4px;
`;

const RoomImageUploader: React.FC<RoomImageUploaderProps> = ({ initialImage, onImageChange }) => {
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(initialImage || null);
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  useEffect(() => {
    if (initialImage) {
      setImagePreviewUrl(initialImage);
    }
  }, [initialImage]);
  
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragging) {
      setIsDragging(true);
    }
  };
  
  const validateFile = (file: File): boolean => {
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setError('Пожалуйста, загрузите изображение в формате JPG, PNG, GIF или WEBP');
      return false;
    }
    
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      setError('Размер изображения должен быть не более 10MB');
      return false;
    }
    
    setError(null);
    return true;
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      await processFile(file);
    }
  };
  
  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      await processFile(file);
    }
  };
  
  const processFile = async (file: File) => {
    if (validateFile(file)) {
      try {
        const resizedFile = await resizeImage(file, 800);
        
        const reader = new FileReader();
        
        reader.onload = (event) => {
          if (event.target && typeof event.target.result === 'string') {
            setImagePreviewUrl(event.target.result);
          }
        };
        
        reader.readAsDataURL(resizedFile);
        
        onImageChange(resizedFile);
      } catch (error) {
        console.error('Ошибка при обработке изображения:', error);
        setError('Не удалось обработать изображение. Пожалуйста, попробуйте другой файл.');
        onImageChange(null);
      }
    }
  };
  
  const handleClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
  
  const removeImage = () => {
    setImagePreviewUrl(null);
    onImageChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  return (
    <UploaderContainer>
      <DropZone 
        isDragging={isDragging}
        hasImage={!!imagePreviewUrl}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {!imagePreviewUrl && (
          <>
            <i className="fas fa-cloud-upload-alt"></i>
            <p>Перетащите изображение номера сюда или нажмите для выбора</p>
          </>
        )}
        {imagePreviewUrl && (
          <p>Изображение выбрано. Нажмите, чтобы заменить, или перетащите новое.</p>
        )}
        <HiddenInput 
          type="file" 
          ref={fileInputRef}
          onChange={handleInputChange}
          accept="image/jpeg,image/png,image/gif,image/webp"
        />
      </DropZone>
      
      <FileFormatMessage>
        <strong>Рекомендации для изображений номеров:</strong>
        <ul>
          <li><i className="fas fa-check-circle"></i> Форматы: JPG, PNG, WEBP</li>
          <li><i className="fas fa-check-circle"></i> Разрешение: 800×600px (горизонтальное)</li>
          <li><i className="fas fa-check-circle"></i> Макс. размер: 10MB</li>
        </ul>
      </FileFormatMessage>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      {imagePreviewUrl && (
        <ImagePreview>
          <img src={imagePreviewUrl} alt="Превью номера" />
          <RemoveButton onClick={(e) => { e.stopPropagation(); removeImage(); }}>
            <i className="fas fa-times"></i>
          </RemoveButton>
        </ImagePreview>
      )}
    </UploaderContainer>
  );
};

export default RoomImageUploader; 
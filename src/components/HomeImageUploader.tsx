import React, { useState, useRef, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  HomePageImage, 
  addHomePageImage, 
  loadHomePageContent, 
  updateHomePageSection 
} from '../utils/homePageUtils';

interface HomeImageUploaderProps {
  onImageUploaded?: (image: HomePageImage) => void;
}

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

const FormatInfoBox = styled.div`
  font-size: 0.85rem;
  color: #666;
  background-color: rgba(33, 113, 72, 0.05);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  margin: 0 auto 1.2rem;
  max-width: 90%;
  
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
    
    i {
      margin-right: 0.3rem;
      color: var(--primary-color);
    }
  }
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
  }
`;

const RoomIdSelector = styled.div`
  margin-bottom: 1.5rem;
  display: ${props => props.hidden ? 'none' : 'block'};
  
  select {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: var(--radius-sm);
    background-color: white;
    font-size: 1rem;
  }
`;

const PreviewContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
  margin-top: 1.5rem;
`;

const PreviewItem = styled(motion.div)`
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  img {
    width: 100%;
    height: 150px;
    object-fit: cover;
  }
  
  &:hover button {
    opacity: 1;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background-color: rgba(0, 0, 0, 0.7);
  color: white;
  border: none;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: all 0.3s;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.9);
  }
`;

const ErrorMessage = styled.div`
  color: #e53935;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const SuccessMessage = styled.div`
  color: var(--primary-color);
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const ApplyButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--accent-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 1rem;
  
  &:hover {
    background-color: #d17a0f;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const HomeImageUploader: React.FC<HomeImageUploaderProps> = ({ onImageUploaded }) => {
  const [imageType, setImageType] = useState<'banner' | 'about' | 'room' | 'background'>('banner');
  const [roomId, setRoomId] = useState<string>('economy');
  const [isDragActive, setIsDragActive] = useState(false);
  const [previewImages, setPreviewImages] = useState<HomePageImage[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const handleDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };
  
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDragActive) {
      setIsDragActive(true);
    }
  };
  
  const processFiles = useCallback((files: FileList | null) => {
    if (!files || files.length === 0) return;
    setError(null);
    
    const newImages: HomePageImage[] = [];
    
    // Обрабатываем только первый файл для упрощения
    const file = files[0];
    
    // Проверяем, что файл является изображением
    if (!file.type.startsWith('image/')) {
      setError(`Файл "${file.name}" не является изображением`);
      return;
    }
    
    // Создаем объект URL для предпросмотра
    const imageUrl = URL.createObjectURL(file);
    
    // Создаем новое изображение
    const newImage: HomePageImage = {
      id: Date.now().toString() + Math.random().toString(36).substring(2, 9),
      type: imageType,
      roomId: imageType === 'room' ? roomId : undefined,
      url: imageUrl,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      uploadedAt: new Date().toISOString()
    };
    
    newImages.push(newImage);
    setPreviewImages(prev => [...prev, ...newImages]);
    
    // Сообщаем об успешной загрузке
    setSuccess(`Изображение "${file.name}" успешно добавлено. Нажмите "Применить", чтобы сохранить изменения.`);
    
    // Вызываем callback, если он передан
    if (onImageUploaded) {
      onImageUploaded(newImage);
    }
  }, [imageType, roomId, onImageUploaded]);
  
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const { files } = e.dataTransfer;
    processFiles(files);
  }, [processFiles]);
  
  const handleDeletePreview = (id: string) => {
    setPreviewImages(prev => prev.filter(img => img.id !== id));
    URL.revokeObjectURL(previewImages.find(img => img.id === id)?.url || '');
  };
  
  const handleApplyImages = () => {
    try {
      // Сохраняем все изображения
      previewImages.forEach(image => {
        addHomePageImage(image);
        
        // Обновляем соответствующий раздел главной страницы
        const content = loadHomePageContent();
        
        if (image.type === 'banner') {
          updateHomePageSection('banner', {
            ...content.banner,
            backgroundImage: image.url
          });
        } else if (image.type === 'about') {
          updateHomePageSection('about', {
            ...content.about,
            image: image.url
          });
        } else if (image.type === 'room' && image.roomId) {
          const updatedRooms = content.rooms.roomsData.map(room => 
            room.id === image.roomId 
              ? { ...room, image: image.url } 
              : room
          );
          
          updateHomePageSection('rooms', {
            ...content.rooms,
            roomsData: updatedRooms
          });
        }
      });
      
      setSuccess('Изображения успешно применены! Обновите страницу, чтобы увидеть изменения.');
      setPreviewImages([]);
    } catch (error) {
      setError('Произошла ошибка при сохранении изображений.');
      console.error('Ошибка при сохранении изображений:', error);
    }
  };
  
  return (
    <UploadContainer>
      <TypeSelector>
        <label htmlFor="image-type">Выберите тип изображения:</label>
        <select
          id="image-type"
          value={imageType}
          onChange={(e) => setImageType(e.target.value as any)}
        >
          <option value="banner">Баннер для слайдера</option>
          <option value="about">Секция "О нас"</option>
          <option value="room">Фото номера</option>
          <option value="background">Фоновое изображение</option>
        </select>
      </TypeSelector>
      
      {imageType === 'room' && (
        <RoomIdSelector>
          <label htmlFor="room-id">Выберите тип номера:</label>
          <select
            id="room-id"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
          >
            <option value="economy">Эконом</option>
            <option value="standard">Стандарт</option>
            <option value="comfort">Комфорт</option>
            <option value="lux">Люкс</option>
          </select>
        </RoomIdSelector>
      )}
      
      <UploadArea
        isDragActive={isDragActive}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <UploadIcon className="fas fa-cloud-upload-alt" />
        <h3>Загрузите изображение</h3>
        <UploadText>Перетащите файл сюда или нажмите для выбора</UploadText>
        
        <FormatInfoBox>
          <strong>Требования к изображениям:</strong>
          <ul>
            <li><i className="fas fa-check-circle"></i> Форматы: JPG, PNG, WEBP</li>
            {imageType === 'banner' && (
              <li><i className="fas fa-check-circle"></i> Размер: 1920×800px</li>
            )}
            {imageType === 'about' && (
              <li><i className="fas fa-check-circle"></i> Размер: 600×400px</li>
            )}
            {imageType === 'room' && (
              <li><i className="fas fa-check-circle"></i> Размер: 800×600px</li>
            )}
            {imageType === 'background' && (
              <li><i className="fas fa-check-circle"></i> Размер: 1920×1080px</li>
            )}
            <li><i className="fas fa-check-circle"></i> Макс. размер файла: 5MB</li>
          </ul>
        </FormatInfoBox>
        
        <UploadButton>
          Выбрать файл
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg,image/png,image/webp"
            onChange={(e) => {
              if (e.target.files && e.target.files.length > 0) {
                processFiles(e.target.files);
              }
            }}
          />
        </UploadButton>
      </UploadArea>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      {previewImages.length > 0 && (
        <>
          <h3>Предпросмотр загруженных изображений</h3>
          <PreviewContainer>
            {/* @ts-ignore: AnimatePresence typing issue */}
            <AnimatePresence mode="wait">
              {previewImages.map(image => (
                <PreviewItem
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <img src={image.url} alt={image.fileName} />
                  <DeleteButton onClick={() => handleDeletePreview(image.id)}>
                    <i className="fas fa-times"></i>
                  </DeleteButton>
                </PreviewItem>
              ))}
            </AnimatePresence>
          </PreviewContainer>
          
          <ApplyButton 
            onClick={handleApplyImages} 
            disabled={previewImages.length === 0}
          >
            Применить изображения
          </ApplyButton>
        </>
      )}
    </UploadContainer>
  );
};

export default HomeImageUploader; 
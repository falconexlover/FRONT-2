import React, { useState, useRef } from 'react';
import styled /* , { css } */ from 'styled-components'; // Убираем css
import { useDropzone } from 'react-dropzone';
// import { motion } from 'framer-motion'; // Убираем, если не используется

// ... существующие импорты и пропсы ...
interface ImageUploaderProps {
  onUpload: (files: File[]) => void; // Callback при выборе файлов
  isLoading?: boolean; // Флаг загрузки
  existingImageUrl?: string | null; // URL существующего изображения для предпросмотра
}

// ... существующие стили ...

const DropZoneContainer = styled.div<{ $isDragging: boolean }>`
  width: 100%;
  height: 150px; /* Задаем высоту */
  display: flex;
  flex-direction: column; /* Вертикальное расположение */
  align-items: center; /* Центрируем по горизонтали */
  justify-content: center; /* Центрируем по вертикали */
  padding: 1rem;
  border: 2px dashed ${props => props.$isDragging ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--radius-md);
  background-color: ${props => props.$isDragging ? 'var(--primary-light-bg)' : 'var(--bg-secondary)'};
  color: ${props => props.$isDragging ? 'var(--primary-color)' : 'var(--text-secondary)'};
  cursor: pointer;
  text-align: center;
  transition: var(--transition);
  position: relative; /* Для позиционирования превью */
  overflow: hidden; /* Чтобы превью не вылезало */

  &:hover {
    border-color: var(--primary-color); 
  }
`;

const PreviewImage = styled.img`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover; /* Масштабирование с сохранением пропорций */
  z-index: 1; /* Поверх текста */
`;

const UploadIcon = styled.i`
  font-size: 2rem; 
  margin-bottom: 0.5rem;
  z-index: 2; /* Поверх превью */
  color: rgba(255, 255, 255, 0.8); /* Делаем иконку видной на фоне превью */
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
`;

const UploadText = styled.p`
  margin: 0;
  font-size: 0.9rem;
  z-index: 2; /* Поверх превью */
  color: rgba(255, 255, 255, 0.9);
  text-shadow: 0 1px 3px rgba(0,0,0,0.5);
`;


const ImageUploader: React.FC<ImageUploaderProps> = ({ onUpload, isLoading, existingImageUrl }) => {
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: { 'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp'] },
    multiple: true, // Разрешаем несколько файлов
    onDrop: (acceptedFiles: File[]) => {
      if (acceptedFiles.length > 0) {
        // Показываем превью первого файла
        const reader = new FileReader();
        reader.onloadend = () => {
          setPreview(reader.result as string);
        };
        reader.readAsDataURL(acceptedFiles[0]);
        onUpload(acceptedFiles); // Передаем все файлы
      } 
    },
    noClick: true, // Отключаем стандартный клик, будем использовать свою кнопку
    noKeyboard: true,
  });

  // Обработчик клика по контейнеру (если нужно открыть диалог выбора)
  const handleClick = () => {
     if (fileInputRef.current) {
       fileInputRef.current.click();
     }
  };

  // Обработчик изменения в input type="file"
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files.length > 0) {
      const fileArray = Array.from(files);
      // Показываем превью первого файла
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      };
      reader.readAsDataURL(fileArray[0]);
      onUpload(fileArray); // Передаем все файлы
    }
  };

  return (
    <DropZoneContainer {...getRootProps()} $isDragging={isDragActive} onClick={handleClick}>
      {/* Скрытый input для выбора файлов по клику */} 
      <input 
        {...getInputProps({ 
          ref: fileInputRef, 
          style: { display: 'none' },
          onChange: handleFileChange
        })} 
      />
      {preview && <PreviewImage src={preview} alt="Предпросмотр" />} 
      <UploadIcon className={`fas ${isLoading ? 'fa-spinner fa-spin' : 'fa-cloud-upload-alt'}`}></UploadIcon>
      <UploadText>
        {isLoading ? 'Загрузка...' : (isDragActive ? 'Отпустите файлы...' : 'Перетащите или выберите файлы')}
      </UploadText>
    </DropZoneContainer>
  );
};

export default ImageUploader; 
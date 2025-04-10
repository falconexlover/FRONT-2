import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';

interface ImageUploaderProps {
  onFileSelect: (file: File | null) => void;
  label?: string;
  existingImageUrl?: string | null; // Для предпросмотра существующего изображения
}

const DropzoneContainer = styled.div<{ $isDragging: boolean }>` 
  border: 2px dashed ${props => props.$isDragging ? 'var(--primary-color)' : 'var(--border-color)'};
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s, background-color 0.2s;
  background-color: ${props => props.$isDragging ? 'var(--primary-light-bg)' : 'transparent'};
  position: relative; // Для позиционирования превью
  min-height: 150px; // Минимальная высота
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  overflow: hidden; // Обрезаем выходящее за рамки

  &:hover {
    border-color: var(--primary-color);
  }
`;

const PreviewImage = styled.img`
  max-width: 100%;
  max-height: 120px; // Ограничиваем высоту превью
  margin-top: 1rem;
  border-radius: var(--radius-sm);
  object-fit: contain; // Показываем всё изображение
`;

const UploadText = styled.p`
  color: var(--text-secondary);
  margin-top: 0.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const ImageUploader: React.FC<ImageUploaderProps> = ({ onFileSelect, label, existingImageUrl }) => {
  const [preview, setPreview] = useState<string | null>(existingImageUrl || null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      onFileSelect(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
      }
      reader.readAsDataURL(file);
    } else {
      onFileSelect(null);
      setPreview(null);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
      onDrop, 
      accept: { 'image/*': [] }, // Принимаем любые изображения
      multiple: false // Только один файл
  });

  useEffect(() => {
      // Обновляем превью, если existingImageUrl изменился извне
      setPreview(existingImageUrl || null);
  }, [existingImageUrl]);

  return (
    <div>
      {label && <Label>{label}</Label>} {/* Используем Label из RoomForm? Или свой? */} 
      <DropzoneContainer {...getRootProps()} $isDragging={isDragActive}>
        <input {...getInputProps()} />
        {preview ? (
          <PreviewImage src={preview} alt="Предпросмотр" />
        ) : (
          <UploadText>
            {isDragActive ? 
              'Отпустите файл для загрузки' : 
              'Перетащите изображение сюда или нажмите для выбора'}
          </UploadText>
        )}
      </DropzoneContainer>
    </div>
  );
};

export default ImageUploader;
import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { optimizeCloudinaryImage } from '../../utils/cloudinaryUtils';

interface ImageUploadListProps {
  imageUrls: string[];
  cloudinaryPublicIds: string[];
  onUpload: (file: File) => Promise<void>;
  onDelete: (publicId: string) => Promise<void>;
  disabled?: boolean;
  folderHint?: string; // Для отображения папки
}

const ListContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1rem;
  background-color: var(--bg-primary);
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ImageItem = styled.div`
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-color-light);
  aspect-ratio: 4 / 3; // Соотношение сторон миниатюры
  background-color: var(--border-color-light); // Фон для загрузки

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(217, 83, 79, 0.8); // Полупрозрачный красный
  color: white;
  border: none;
  border-radius: 50%;
  width: 28px;
  height: 28px;
  font-size: 1rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--danger-color);
  }
  
  &:disabled {
    background-color: grey;
    cursor: not-allowed;
  }
`;

const UploadArea = styled.div`
  border: 2px dashed var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  text-align: center;
  background-color: var(--bg-secondary);
  transition: background-color 0.2s;
  
  &:hover {
    background-color: var(--border-color-light);
  }
`;

const FileInput = styled.input`
  display: none; // Скрываем стандартный input
`;

const UploadLabel = styled.label`
  cursor: pointer;
  color: var(--primary-color);
  font-weight: 500;
  display: inline-block;
  padding: 0.6rem 1rem;
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  transition: background-color 0.2s, color 0.2s;

  &:hover {
    background-color: var(--primary-color);
    color: white;
  }
  
  &.disabled {
      cursor: not-allowed;
      background-color: var(--border-color);
      color: var(--text-secondary);
      border-color: var(--border-color);
  }
`;

const LoadingOverlay = styled.div`
    position: absolute;
    top: 0; left: 0; right: 0; bottom: 0;
    background-color: rgba(255, 255, 255, 0.7);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2;
    font-size: 0.8rem;
    color: var(--dark-color);
`;

const ImageUploadList: React.FC<ImageUploadListProps> = ({ 
  imageUrls, 
  cloudinaryPublicIds, 
  onUpload, 
  onDelete, 
  disabled = false,
  folderHint
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [isDeleting, setIsDeleting] = useState<string | null>(null); // Храним publicId удаляемого фото
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Проверка типа файла (опционально)
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        toast.error('Недопустимый тип файла. Пожалуйста, выберите изображение (JPEG, PNG, GIF, WebP).');
        return;
      }
      
      // Проверка размера файла (опционально, например, 5MB)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
         toast.error('Файл слишком большой. Максимальный размер 5MB.');
         return;
      }

      setIsUploading(true);
      try {
        await onUpload(file);
        // Сбрасываем input, чтобы можно было выбрать тот же файл снова
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      } catch (error) {
        // Ошибки обрабатываются в вызывающем компоненте
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDeleteClick = async (publicId: string) => {
    if (window.confirm('Вы уверены, что хотите удалить это изображение?')) {
      setIsDeleting(publicId);
      try {
        await onDelete(publicId);
      } catch (error) {
        // Ошибки обрабатываются в вызывающем компоненте
      } finally {
        setIsDeleting(null);
      }
    }
  };

  return (
    <ListContainer>
      {imageUrls && imageUrls.length > 0 && (
        <ImageGrid>
          {imageUrls.map((url, index) => {
            const publicId = cloudinaryPublicIds?.[index];
            const isCurrentlyDeleting = isDeleting === publicId;
            return publicId ? (
              <ImageItem key={publicId}>
                <img src={optimizeCloudinaryImage(url, 'w_200,h_150,c_fill,q_auto,f_auto')} alt={`Фото ${index + 1}`} loading="lazy" />
                {(isUploading || disabled || isCurrentlyDeleting) && (
                    <LoadingOverlay>
                        {isCurrentlyDeleting ? 'Удаление...' : <i className="fas fa-spinner fa-spin"></i>}
                    </LoadingOverlay>
                )}
                {!isUploading && !disabled && !isCurrentlyDeleting && (
                  <DeleteButton 
                    onClick={() => handleDeleteClick(publicId)}
                    disabled={disabled || isUploading || !!isDeleting}
                    title="Удалить изображение"
                  >
                    &times;
                  </DeleteButton>
                )}
              </ImageItem>
            ) : null; // Если нет publicId, не рендерим (ошибка данных)
          })}
        </ImageGrid>
      )}
      
      <UploadArea>
        <FileInput
          type="file"
          id={`image-upload-${folderHint || 'default'}`}
          accept="image/jpeg, image/png, image/gif, image/webp"
          onChange={handleFileChange}
          ref={fileInputRef}
          disabled={disabled || isUploading || !!isDeleting}
        />
        <UploadLabel htmlFor={`image-upload-${folderHint || 'default'}`} className={disabled || isUploading || !!isDeleting ? 'disabled' : ''}>
          {isUploading ? 'Загрузка...' : 'Выбрать изображение'}
        </UploadLabel>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.8rem' }}>
          Макс. размер: 5MB. Форматы: JPG, PNG, GIF, WebP.
        </p>
        {folderHint && (
             <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.3rem' }}>
                 Загрузка в папку: {folderHint}
            </p>
        )}
      </UploadArea>
    </ListContainer>
  );
};

export default ImageUploadList; 
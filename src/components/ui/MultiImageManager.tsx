import React, { useState, useRef, ChangeEvent } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { optimizeCloudinaryImage } from '../../utils/cloudinaryUtils';
import ActionButton from './ActionButton'; // Используем ту же кнопку

interface MultiImageManagerProps {
  imageUrls: string[];
  publicIds: string[]; // Corresponding public IDs for deletion
  onAdd: (file: File) => Promise<void>;
  onDelete: (publicId: string) => Promise<void>;
  disabled?: boolean;
  label?: string;
}

const ManagerContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  padding: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-primary);
  min-height: 100px; // Minimum height when empty
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-color-light);
  aspect-ratio: 4 / 3; // Maintain aspect ratio

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
  background-color: rgba(211, 47, 47, 0.8); // Semi-transparent danger color
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 1rem;
  line-height: 22px; // Adjust for vertical centering
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0;

  &:hover {
    background-color: var(--danger-color);
  }

  &:disabled {
      cursor: not-allowed;
      opacity: 0.5;
  }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 0.9rem;
  color: var(--text-secondary);
  border-radius: var(--radius-sm);
`;

const AddButtonContainer = styled.div`
  /* Styles for the add button area */
`;

const HiddenInput = styled.input`
  display: none;
`;

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: var(--text-primary);
`;

const MultiImageManager: React.FC<MultiImageManagerProps> = ({
  imageUrls = [],
  publicIds = [],
  onAdd,
  onDelete,
  disabled = false,
  label,
}) => {
  const [isUploading, setIsUploading] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Basic validation (optional)
      if (!file.type.startsWith('image/')) {
        toast.error('Пожалуйста, выберите файл изображения.');
        return;
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
          toast.error('Файл слишком большой (макс. 5MB).');
          return;
      }

      setIsUploading(true);
      try {
        await onAdd(file);
        // Optional: Clear input after successful upload if needed
        if (fileInputRef.current) fileInputRef.current.value = '';
      } catch (err) {
        // Error toast is likely shown by the parent handler
        console.error('MultiImageManager upload error:', err);
      } finally {
        setIsUploading(false);
      }
    }
  };

  const handleDelete = async (publicId: string) => {
    if (disabled || isUploading || deletingId) return;
    if (window.confirm('Вы уверены, что хотите удалить это изображение?')) {
      setDeletingId(publicId);
      try {
        await onDelete(publicId);
      } catch (err) {
        // Error toast is likely shown by the parent handler
        console.error('MultiImageManager delete error:', err);
      } finally {
        setDeletingId(null);
      }
    }
  };

  const handleTriggerClick = () => {
    if (disabled || isUploading) return;
    fileInputRef.current?.click();
  };

  return (
    <ManagerContainer>
      {label && <Label style={{ marginBottom: '0.5rem' }}>{label}</Label>}
      <ImageGrid>
        {imageUrls.map((url, index) => {
          const publicId = publicIds[index];
          if (!publicId) return null; // Should not happen if data is consistent
          const isCurrentlyDeleting = deletingId === publicId;
          return (
            <ImagePreviewContainer key={publicId}>
              <img src={optimizeCloudinaryImage(url, 'w_200,h_150,c_fill,q_auto')} alt={`Изображение ${index + 1}`} />
              {(isUploading || isCurrentlyDeleting) && (
                <LoadingOverlay>
                  {isCurrentlyDeleting ? 'Удаление...' : <i className="fas fa-spinner fa-spin"></i>}
                </LoadingOverlay>
              )}
              {!isUploading && !isCurrentlyDeleting && (
                <DeleteButton
                  onClick={() => handleDelete(publicId)}
                  disabled={disabled || isUploading || !!deletingId}
                  title="Удалить"
                >
                  &times;
                </DeleteButton>
              )}
            </ImagePreviewContainer>
          );
        })}
        {imageUrls.length === 0 && !isUploading && (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', color: 'var(--text-muted)', padding: '1rem' }}>Нет изображений</div>
        )}
      </ImageGrid>

      <AddButtonContainer>
        <HiddenInput
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled || isUploading || !!deletingId}
        />
        <ActionButton
          className="secondary"
          onClick={handleTriggerClick}
          disabled={disabled || isUploading || !!deletingId}
        >
          {isUploading ? 'Загрузка...' : 'Добавить изображение'}
        </ActionButton>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
            Добавляйте или удаляйте изображения для галереи "{label || 'текущей секции'}".
        </p>
      </AddButtonContainer>
    </ManagerContainer>
  );
};

export default MultiImageManager; 
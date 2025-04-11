import React, { useState, useRef, ChangeEvent, useEffect } from 'react';
import styled from 'styled-components';
import { optimizeCloudinaryImage } from '../../utils/cloudinaryUtils'; // Для оптимизации превью

interface ImageUploadProps {
  currentImageUrl?: string | null;
  onFileSelect: (file: File | null) => void;
  uploadTriggerText?: string;
  label?: string;
  disabled?: boolean;
}

const UploadContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 1rem;
`;

const PreviewContainer = styled.div`
  max-width: 300px; // Ограничим размер превью
  max-height: 200px;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;

  img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .no-image {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 150px;
    height: 100px;
    background-color: var(--bg-secondary);
    color: var(--text-muted);
    font-size: 0.9rem;
  }
`;

const ActionsContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  margin-top: 0.5rem;
`;

const HiddenInput = styled.input`
  display: none;
`;

// Стилизуем кнопку как ссылку или обычную кнопку
const UploadButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  text-decoration: underline;
  padding: 0.5rem 0;

  &:hover {
    color: var(--primary-color-dark);
  }
`;

const RemoveButton = styled(UploadButton)`
  color: var(--danger-color);
  &:hover {
    color: var(--danger-color-dark);
  }
`;


const ImageUpload: React.FC<ImageUploadProps> = ({
  currentImageUrl,
  onFileSelect,
  uploadTriggerText = "Загрузить/заменить",
  label,
  disabled = false,
}) => {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      onFileSelect(file);
      // Генерируем превью для нового файла
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
     // Сбрасываем значение инпута, чтобы можно было выбрать тот же файл снова
     if(fileInputRef.current) {
         fileInputRef.current.value = '';
     }
  };

  const handleRemoveImage = () => {
    setPreviewUrl(null);
    onFileSelect(null); // Сообщаем родителю, что изображение нужно убрать/сбросить
     if(fileInputRef.current) {
         fileInputRef.current.value = '';
     }
  };

  const handleTriggerClick = () => {
    fileInputRef.current?.click();
  };

  // Обновляем превью, если currentImageUrl изменился извне
  useEffect(() => {
    setPreviewUrl(currentImageUrl ? optimizeCloudinaryImage(currentImageUrl, 'w_300') : null);
  }, [currentImageUrl]);

  return (
    <UploadContainer>
      {label && <Label style={{ marginBottom: '0.5rem' }}>{label}</Label>}
      <PreviewContainer>
        {previewUrl ? (
          <img src={previewUrl} alt={label || "Превью"} />
        ) : (
          <div className="no-image">Нет изображения</div>
        )}
      </PreviewContainer>
      <ActionsContainer>
        <HiddenInput
          type="file"
          accept="image/*"
          ref={fileInputRef}
          onChange={handleFileChange}
          disabled={disabled}
        />
        <UploadButton type="button" onClick={handleTriggerClick} disabled={disabled}>
          {previewUrl ? 'Заменить' : 'Загрузить'}
        </UploadButton>
        {previewUrl && (
           <RemoveButton type="button" onClick={handleRemoveImage} disabled={disabled}>
             Удалить
           </RemoveButton>
        )}
      </ActionsContainer>
    </UploadContainer>
  );
};

const Label = styled.label`
  display: block;
  font-weight: 500;
  color: var(--text-primary);
`;

export default ImageUpload;
import React, { useCallback } from 'react';
import styled from 'styled-components';

// Интерфейс для существующих изображений (url и publicId для удаления)
interface ExistingImage {
  url: string;
  publicId: string | null;
}

// Пропсы компонента
interface SectionImageManagerProps {
  existingImages: ExistingImage[];
  newFiles: File[];
  onFilesChange: (files: File[]) => void;
  onExistingDelete: (image: ExistingImage) => void;
  isLoading?: boolean;
  label?: string; // Необязательный заголовок
}

// --- Стили --- 
const ManagerContainer = styled.div`
  margin-top: 1rem;
  border: 1px solid var(--border-color-light, #e0e0e0);
  border-radius: var(--radius-sm, 4px);
  padding: 1rem;
  background-color: var(--bg-secondary, #f8f9fa);
`;

const Label = styled.p`
  font-weight: 600;
  margin-bottom: 0.8rem;
  color: var(--text-primary);
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
  margin-bottom: 1.5rem;
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  border: 1px solid var(--border-color-light, #e0e0e0);
  border-radius: var(--radius-xs, 2px);
  overflow: hidden;

  img {
    display: block;
    width: 100%;
    height: 100px;
    object-fit: cover;
  }

  button {
    position: absolute;
    top: 5px;
    right: 5px;
    background-color: rgba(255, 0, 0, 0.7);
    color: white;
    border: none;
    border-radius: 50%;
    width: 20px;
    height: 20px;
    font-size: 12px;
    line-height: 20px;
    text-align: center;
    cursor: pointer;
    padding: 0;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(255, 0, 0, 0.9);
    }
     &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
     }
  }
`;

const NewFilePreview = styled.div`
    font-size: 0.8rem;
    padding: 0.5rem;
    background-color: #e9ecef;
    border-radius: 3px;
    margin-bottom: 0.5rem;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
`;

const FileInputLabel = styled.label`
  display: inline-block;
  padding: 0.6rem 1.2rem;
  background-color: var(--primary-color, #007bff);
  color: white;
  border-radius: var(--radius-sm, 4px);
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.9rem;

  &:hover {
    background-color: var(--primary-color-dark, #0056b3);
  }

  input[type="file"] {
    display: none;
  }
`;

// --- Компонент --- 
export const SectionImageManager = (props: SectionImageManagerProps) => {
  // Деструктурируем props внутри компонента
  const { 
    existingImages,
    newFiles,
    onFilesChange,
    onExistingDelete,
    isLoading = false,
    label = "Управление изображениями"
  } = props;

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      onFilesChange(Array.from(event.target.files));
    }
     // Сбрасываем значение input, чтобы можно было выбрать тот же файл снова
     event.target.value = '';
  }, [onFilesChange]);

  return (
    <ManagerContainer>
      <Label>{label}</Label>

      {/* Существующие изображения */}
      {existingImages.length > 0 && (
        <>
          <p style={{fontSize: '0.9em', color: 'grey', marginTop: '-0.5rem', marginBottom: '0.8rem'}}>Существующие:</p>
          <ImageGrid>
            {existingImages.map((image) => (
              <ImagePreviewContainer key={image.url}> 
                <img src={image.url} alt="Превью" />
                <button 
                  onClick={() => onExistingDelete(image)}
                  disabled={isLoading}
                  title="Удалить это изображение"
                >
                  &times;
                </button>
              </ImagePreviewContainer>
            ))}
          </ImageGrid>
        </>
      )}

       {/* Новые выбранные файлы */}
      {newFiles.length > 0 && (
        <>
           <p style={{fontSize: '0.9em', color: 'grey', marginTop: '1rem', marginBottom: '0.8rem'}}>Новые (будут загружены при сохранении):</p>
          <div>
            {newFiles.map((file, index) => (
              <NewFilePreview key={index}>{file.name}</NewFilePreview>
            ))}
          </div>
        </>
      )}

      {/* Кнопка выбора файлов */}
      <div style={{ marginTop: '1rem' }}>
        <FileInputLabel>
          <input 
            type="file" 
            multiple 
            accept="image/*" 
            onChange={handleFileChange}
            disabled={isLoading}
          />
          {newFiles.length > 0 ? 'Выбрать другие файлы' : 'Выбрать файлы'}
        </FileInputLabel>
         {newFiles.length > 0 && (
              <button 
                  onClick={() => onFilesChange([])} // Очистить выбор
                  disabled={isLoading}
                  style={{marginLeft: '10px', background: 'none', border: '1px solid grey', padding: '0.5rem', borderRadius: '4px', cursor: 'pointer'}}
              >
                  Очистить выбор
              </button>
          )}
      </div>

    </ManagerContainer>
  );
}; 
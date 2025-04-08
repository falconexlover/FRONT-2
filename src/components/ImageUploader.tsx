import React, { useState, useCallback, useRef, useEffect } from 'react';
import styled, { css } from 'styled-components';

interface ImageUploaderProps {
  category: string;
  onUpload: (files: File[], category: string) => Promise<void>;
  isUploading: boolean;
  error?: string | null;
}

const UploaderContainer = styled.div`
  /* Добавляем стили, если нужно */
`;

const DropZone = styled.div<{ isDragging: boolean }>`
  border: 2px dashed var(--border-color); /* Темная граница */
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  cursor: pointer;
  transition: border-color 0.2s ease, background-color 0.2s ease;
  background-color: var(--bg-secondary); /* Фон зоны */
  color: var(--text-secondary); /* Цвет текста */

  ${props => props.isDragging && css`
    border-color: var(--primary-color);
    background-color: rgba(42, 167, 110, 0.05); /* Легкий зеленый фон при перетаскивании */
  `}
  
  &:hover {
     border-color: var(--primary-color);
  }
  
  p {
    margin: 0.5rem 0;
    font-size: 0.95rem;
  }
  
  span {
    font-weight: 600;
    color: var(--primary-color);
  }
  
  i {
    font-size: 2.5rem;
    color: var(--primary-color);
    margin-bottom: 1rem;
    display: block;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  margin-top: 1.5rem;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
  gap: 1rem;
`;

const PreviewItem = styled.div`
  position: relative;
  width: 100%;
  padding-top: 100%; /* Соотношение сторон 1:1 */
  border-radius: var(--radius-sm);
  overflow: hidden;
  border: 1px solid var(--border-color);
  background-color: var(--bg-primary); /* Фон для превью */

  img {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 5px;
  right: 5px;
  background-color: rgba(0, 0, 0, 0.6); /* Полупрозрачный фон */
  color: white;
  border: none;
  border-radius: 50%;
  width: 22px;
  height: 22px;
  font-size: 0.8rem;
  line-height: 22px;
  text-align: center;
  cursor: pointer;
  transition: background-color 0.2s ease;
  padding: 0;

  &:hover {
    background-color: var(--danger-color);
  }
`;

const UploadButton = styled.button`
  display: block; /* Делаем блочным */
  width: 100%; /* Растягиваем на всю ширину */
  margin-top: 1.5rem;
  padding: 0.9rem 1.5rem;
  background-color: var(--primary-color);
  color: var(--text-on-primary-bg);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-size: 1rem;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:hover:not(:disabled) {
    background-color: var(--secondary-color);
  }
  
  i {
    margin-right: 0.5rem;
  }
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin-top: 1rem;
  font-size: 0.9rem;
  text-align: center;
`;

const ImageUploader: React.FC<ImageUploaderProps> = ({ category, onUpload, isUploading, error }) => {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFiles = useCallback((files: FileList | null) => {
    if (files) {
      const newFiles = Array.from(files);
      const newPreviews = newFiles.map(file => URL.createObjectURL(file));
      setSelectedFiles(prev => [...prev, ...newFiles]);
      setPreviews(prev => [...prev, ...newPreviews]);
    }
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation(); // Необходимо для срабатывания onDrop
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }, [handleFiles]);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleFiles(e.target.files);
    // Очищаем инпут, чтобы можно было выбрать тот же файл повторно
    if (fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleRemovePreview = (index: number) => {
    URL.revokeObjectURL(previews[index]); // Освобождаем память
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    setPreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadClick = () => {
    if (selectedFiles.length > 0) {
      onUpload(selectedFiles, category).finally(() => {
        // Очищаем превью и файлы после попытки загрузки (успешной или нет)
        previews.forEach(url => URL.revokeObjectURL(url));
        setSelectedFiles([]);
        setPreviews([]);
      });
    }
  };

  // Очистка Object URLs при размонтировании
  useEffect(() => {
    return () => {
      previews.forEach(url => URL.revokeObjectURL(url));
    };
  }, [previews]);

  return (
    <UploaderContainer>
      <DropZone 
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        isDragging={isDragging}
      >
        <FileInput 
          ref={fileInputRef}
          type="file" 
          multiple 
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <i className="fas fa-cloud-upload-alt"></i>
        {isDragging ? (
          <p>Отпустите файлы здесь...</p>
        ) : (
          <p>Перетащите файлы сюда или <span>нажмите для выбора</span></p>
        )}
        <p style={{fontSize: '0.8rem'}}>Поддерживаются PNG, JPG, WEBP</p>
      </DropZone>

      {previews.length > 0 && (
        <PreviewContainer>
          {previews.map((src, index) => (
            <PreviewItem key={index}>
              <img src={src} alt={`Превью ${index + 1}`} />
              <RemoveButton onClick={(e) => { e.stopPropagation(); handleRemovePreview(index); }} disabled={isUploading}>
                ×
              </RemoveButton>
            </PreviewItem>
          ))}
        </PreviewContainer>
      )}

      {selectedFiles.length > 0 && (
        <UploadButton onClick={handleUploadClick} disabled={isUploading || selectedFiles.length === 0}>
          {isUploading ? 'Загрузка...' : `Загрузить ${selectedFiles.length} фото`}
        </UploadButton>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

    </UploaderContainer>
  );
};

export default ImageUploader; 
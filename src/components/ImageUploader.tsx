import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { UploadedImage } from '../utils/imageUpload';

interface ImageUploaderProps {
  category: string;
  onUpload: (files: File[], category: string, title?: string, description?: string) => Promise<UploadedImage[]>;
  isUploading: boolean;
  error: string | null;
}

const UploaderContainer = styled.div`
  border: 2px dashed var(--primary-color);
  border-radius: var(--radius-md);
  padding: 2rem;
  text-align: center;
  background-color: rgba(33, 113, 72, 0.05);
  transition: var(--transition);
  margin-bottom: 2rem;
  
  &:hover {
    background-color: rgba(33, 113, 72, 0.1);
  }
`;

const UploadZone = styled.div`
  cursor: pointer;
  padding: 2rem;
  
  svg {
    color: var(--primary-color);
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  
  h3 {
    margin-bottom: 0.5rem;
    color: var(--dark-color);
  }
  
  p {
    color: var(--text-color);
    margin-bottom: 1rem;
  }
`;

const FormatInfo = styled.div`
  font-size: 0.85rem;
  color: #666;
  background-color: rgba(33, 113, 72, 0.05);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  margin: 1rem auto;
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

const UploadButton = styled.button`
  background-color: var(--primary-color);
  color: white;
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  transition: var(--transition);
  cursor: pointer;
  
  &:hover {
    background-color: var(--dark-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm);
  }
  
  &:disabled {
    background-color: var(--gray-color);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const FileInput = styled.input`
  display: none;
`;

const ErrorMessage = styled.div`
  color: red;
  margin-top: 1rem;
  font-size: 0.9rem;
`;

const ImageUploader: React.FC<ImageUploaderProps> = ({ 
  category, 
  onUpload, 
  isUploading, 
  error 
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null);
  const [dragActive, setDragActive] = useState(false);
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setSelectedFiles(e.target.files);
    }
  };
  
  const handleUploadClick = async () => {
    if (selectedFiles && selectedFiles.length > 0) {
      await onUpload(Array.from(selectedFiles), category);
      // Сбрасываем выбранные файлы после загрузки
      setSelectedFiles(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };
  
  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };
  
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      setSelectedFiles(e.dataTransfer.files);
    }
  };
  
  return (
    <UploaderContainer 
      style={{ borderColor: dragActive ? 'var(--accent-color)' : 'var(--primary-color)' }}
    >
      <UploadZone
        onClick={() => fileInputRef.current?.click()}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="50" height="50" fill="currentColor" viewBox="0 0 16 16">
          <path d="M4.406 1.342A5.53 5.53 0 0 1 8 0c2.69 0 4.923 2 5.166 4.579C14.758 4.804 16 6.137 16 7.773 16 9.569 14.502 11 12.687 11H10a.5.5 0 0 1 0-1h2.688C13.979 10 15 8.988 15 7.773c0-1.216-1.02-2.228-2.313-2.228h-.5v-.5C12.188 2.825 10.328 1 8 1a4.53 4.53 0 0 0-2.941 1.1c-.757.652-1.153 1.438-1.153 2.055v.448l-.445.049C2.064 4.805 1 5.952 1 7.318 1 8.785 2.23 10 3.781 10H6a.5.5 0 0 1 0 1H3.781C1.708 11 0 9.366 0 7.318c0-1.763 1.266-3.223 2.942-3.593.143-.863.698-1.723 1.464-2.383z"/>
          <path d="M7.646 4.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1-.708.708L8.5 5.707V14.5a.5.5 0 0 1-1 0V5.707L5.354 7.854a.5.5 0 1 1-.708-.708l3-3z"/>
        </svg>
        <h3>Загрузите изображения для галереи</h3>
        <p>Перетащите файлы или нажмите для выбора</p>
        
        <FormatInfo>
          <strong>Рекомендуемые параметры изображений:</strong>
          <ul>
            <li><i className="fas fa-check-circle"></i> Форматы: JPG, PNG, WEBP</li>
            <li><i className="fas fa-check-circle"></i> Разрешение: от 1000×600px</li>
            <li><i className="fas fa-check-circle"></i> Максимальный размер: 10MB</li>
          </ul>
        </FormatInfo>
        
        {selectedFiles && (
          <p>Выбрано файлов: {selectedFiles.length}</p>
        )}
        
        <FileInput 
          type="file" 
          ref={fileInputRef}
          multiple
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
        />
        
        {selectedFiles && selectedFiles.length > 0 && (
          <UploadButton 
            onClick={handleUploadClick}
            disabled={isUploading}
          >
            {isUploading ? 'Загрузка...' : 'Загрузить'}
          </UploadButton>
        )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      </UploadZone>
    </UploaderContainer>
  );
};

export default ImageUploader; 
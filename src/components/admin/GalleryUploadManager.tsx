import React, { useState } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';

const DropZoneWrapper = styled.div`
  width: 100%;
`;

const DropZoneButton = styled.button<{ $active: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  border: 2px dashed ${props => props.$active ? 'var(--primary-color)' : 'var(--border-color)'}; 
  border-radius: var(--radius-md);
  background-color: ${props => props.$active ? 'var(--primary-light-bg)' : 'var(--bg-secondary)'}; 
  color: ${props => props.$active ? 'var(--primary-color)' : 'var(--text-secondary)'};
  cursor: pointer;
  text-align: center;
`;

const GalleryUploadManager: React.FC = () => {
  const [active, setActive] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFiles = (files: any) => {
    console.log('Обработка файлов:', files);
    // TODO: Добавьте здесь логику обработки файлов (например, загрузку)
  };

  const { getRootProps, getInputProps } = useDropzone({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    onDrop: (acceptedFiles: any) => {
      handleFiles(acceptedFiles);
      setActive(false); // Деактивировать зону после дропа
    },
    onDragEnter: () => setActive(true),
    onDragLeave: () => setActive(false),
  });

  return (
    <DropZoneWrapper>
      <DropZoneButton {...getRootProps()} $active={active}>
        <input {...getInputProps()} />
        <i className={`fas fa-upload fa-2x mb-2 ${active ? 'animate-bounce' : ''}`}></i>
        {active && (
          <p>Drop the files here ...</p>
        )}
      </DropZoneButton>
    </DropZoneWrapper>
  );
};

export default GalleryUploadManager; 
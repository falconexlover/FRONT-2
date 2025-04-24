import React, { useState, useCallback } from 'react';
import styled from 'styled-components';
import { useDropzone } from 'react-dropzone';
import { galleryService, roomsService } from '../../utils/api';
import { toast } from 'react-toastify';
import { LoadingSpinner } from './GalleryAdminPanel'; // Импортируем спиннер

interface Category {
  id: string;
  label: string;
}

interface GalleryUploadManagerProps {
  categories: Category[];
  onImageUpload: () => void; // Callback после успешной загрузки
}

const DropZoneWrapper = styled.div`
  width: 100%;
`;

const DropZoneButton = styled.div<{ $active: boolean }>`
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
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out;
`;

const UploadSection = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
`;

const SectionTitle = styled.h3`
  font-size: 1.4rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
  font-family: 'Playfair Display', serif;
`;

const CategorySelector = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  margin-bottom: 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  font-size: 1rem;
  cursor: pointer;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(33, 113, 72, 0.1);
  }
`;

const UploadStatus = styled.div`
  margin-top: 1rem;
  text-align: center;
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin-top: 0.5rem;
`;

const GalleryUploadManager: React.FC<GalleryUploadManagerProps> = ({ categories, onImageUpload }) => {
  const [active, setActive] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedRoomId, setSelectedRoomId] = useState<string>('');
  const [rooms, setRooms] = useState<{ _id: string; title: string }[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewFiles, setPreviewFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);

  // Загружаем список номеров при выборе категории 'rooms'
  React.useEffect(() => {
    if (selectedCategory === 'rooms') {
      roomsService.getAllRooms().then(data => {
        setRooms(Array.isArray(data) ? data : []);
      });
    }
  }, [selectedCategory]);

  const handleFiles = useCallback(async (files: File[]) => {
    if (!selectedCategory) {
      toast.warn('Пожалуйста, выберите категорию перед загрузкой.');
      return;
    }
    if (selectedCategory === 'rooms' && !selectedRoomId) {
      toast.warn('Пожалуйста, выберите номер для загрузки фото.');
      return;
    }
    if (files.length === 0) {
      return;
    }

    // Сохраняем превью
    setPreviewFiles(files);
    setPreviewUrls(files.map(file => URL.createObjectURL(file)));

    setIsUploading(true);
    setUploadError(null);
    let uploadSuccess = false;

    // Используем Promise.allSettled для обработки всех загрузок
    const uploadPromises = files.map(file => {
      const formData = new FormData();
      formData.append('image', file); // Ключ 'image' ожидается на бэкенде (проверить!)
      formData.append('category', selectedCategory);
      if (selectedCategory === 'rooms') {
        formData.append('roomId', selectedRoomId);
      }
      // formData.append('description', ''); // Можно добавить, если нужно

      return galleryService.uploadImage(formData)
        .then(uploadedImage => {
          console.log(`Файл ${file.name} успешно загружен:`, uploadedImage);
          toast.success(`Файл ${file.name} загружен в категорию "${categories.find(c => c.id === selectedCategory)?.label}"${selectedCategory === 'rooms' ? ` (номер: ${rooms.find(r => r._id === selectedRoomId)?.title || ''})` : ''}.`);
          return { status: 'fulfilled', value: uploadedImage };
        })
        .catch(err => {
          console.error(`Ошибка загрузки файла ${file.name}:`, err);
          const errorMsg = err instanceof Error ? err.message : 'Неизвестная ошибка';
          toast.error(`Ошибка загрузки файла ${file.name}: ${errorMsg}`);
          setUploadError(prev => prev ? `${prev}\nОшибка: ${file.name}` : `Ошибка загрузки: ${file.name}`);
          return { status: 'rejected', reason: err };
        });
    });

    const results = await Promise.allSettled(uploadPromises);
    setIsUploading(false);
    setPreviewFiles([]);
    setPreviewUrls([]);

    // Проверяем, был ли хотя бы один успешный результат
    if (results.some(result => result.status === 'fulfilled')) {
      uploadSuccess = true;
    }

    if (uploadSuccess) {
      onImageUpload(); // Вызываем callback для обновления списка
    }
  }, [selectedCategory, selectedRoomId, onImageUpload, categories, rooms]);

  // Dropzone и кнопка загрузки должны быть неактивны, если категория не выбрана
  const isUploadDisabled = !selectedCategory || isUploading;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: acceptedFiles => {
      handleFiles(acceptedFiles);
      setActive(false);
    },
    onDragEnter: () => setActive(true),
    onDragLeave: () => setActive(false),
    accept: {
      'image/jpeg': [],
      'image/png': [],
      'image/webp': [],
      'image/gif': []
    },
    disabled: isUploadDisabled // Блокируем dropzone если не выбрана категория или идёт загрузка
  });

  return (
    <UploadSection>
      <SectionTitle>Загрузить новые изображения</SectionTitle>
      <div style={{marginBottom: '1.5rem'}}>
        <label htmlFor="category-select" style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: 8, display: 'block'}}>1. Выберите категорию для загрузки</label>
        <CategorySelector
          id="category-select"
          value={selectedCategory}
          onChange={(e) => { setSelectedCategory(e.target.value); setSelectedRoomId(''); }}
          disabled={isUploading}
        >
          <option value="" disabled>-- Выберите категорию --</option>
          {categories.map(category => (
            <option key={category.id} value={category.id}>{category.label}</option>
          ))}
        </CategorySelector>
        {/* Если выбрана категория 'rooms', показываем выбор номера */}
        {selectedCategory === 'rooms' && (
          <div style={{marginTop: 12}}>
            <label htmlFor="room-select" style={{fontWeight: 500, fontSize: '1rem', marginBottom: 6, display: 'block'}}>Выберите номер</label>
            <select
              id="room-select"
              value={selectedRoomId}
              onChange={e => setSelectedRoomId(e.target.value)}
              disabled={isUploading || rooms.length === 0}
            >
              <option value="" disabled>-- Выберите номер --</option>
              {rooms.map(room => (
                <option key={room._id} value={room._id}>{room.title}</option>
              ))}
            </select>
          </div>
        )}
      </div>
      <div style={{marginBottom: '1rem'}}>
        <label style={{fontWeight: 600, fontSize: '1.1rem', marginBottom: 8, display: 'block'}}>2. Выберите файлы для загрузки</label>
        <DropZoneWrapper>
          <DropZoneButton {...getRootProps()} $active={isDragActive || active} style={{ opacity: isUploadDisabled ? 0.5 : 1, pointerEvents: isUploadDisabled ? 'none' : 'auto' }}>
            <input {...getInputProps()} disabled={isUploadDisabled} multiple accept="image/*" />
            <i className={`fas fa-cloud-upload-alt fa-3x mb-3 ${isDragActive ? 'animate-pulse' : ''}`}></i>
            {isDragActive ? (
              <p>Отпустите файлы здесь ...</p>
            ) : (
              <p>Перетащите файлы сюда или нажмите для выбора (можно несколько)</p>
            )}
          </DropZoneButton>
        </DropZoneWrapper>
        {!selectedCategory && !isUploading && (
          <ErrorMessage>Сначала выберите категорию для загрузки фото</ErrorMessage>
        )}
        {/* Превью выбранных файлов */}
        {previewUrls.length > 0 && (
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginTop: 16 }}>
            {previewUrls.map((url, idx) => (
              <div key={idx} style={{ border: '1px solid #eee', borderRadius: 8, padding: 4, background: '#fafafa' }}>
                <img src={url} alt={`preview-${idx}`} style={{ width: 100, height: 80, objectFit: 'cover', borderRadius: 6 }} />
                <div style={{ fontSize: 12, color: '#888', marginTop: 4, textAlign: 'center' }}>{previewFiles[idx]?.name}</div>
              </div>
            ))}
          </div>
        )}
      </div>
      {isUploading && (
        <UploadStatus>
          <LoadingSpinner>
             <i className="fas fa-spinner"></i> Загрузка...
          </LoadingSpinner>
        </UploadStatus>
      )}
      {uploadError && <ErrorMessage>{uploadError}</ErrorMessage>}
    </UploadSection>
  );
};

export default GalleryUploadManager; 
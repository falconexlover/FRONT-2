import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import ImageUploader from './ImageUploader';
import { useImageUpload, UploadedImage } from '../utils/imageUpload';

const UploadManagerContainer = styled.div`
  padding: 2rem;
  background-color: var(--light-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  margin-bottom: 3rem;
`;

const CategorySelector = styled.div`
  margin-bottom: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: var(--dark-color);
  }
  
  .category-buttons {
    display: flex;
    flex-wrap: wrap;
    gap: 1rem;
  }
`;

const CategoryButton = styled.button<{ active: boolean }>`
  padding: 0.7rem 1.5rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'white'};
  color: ${props => props.active ? 'white' : 'var(--dark-color)'};
  border: 2px solid ${props => props.active ? 'var(--primary-color)' : '#eee'};
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : 'var(--gray-bg)'};
    transform: translateY(-3px);
    box-shadow: var(--shadow-sm);
  }
`;

const UploadedImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;
`;

const ImageCard = styled(motion.div)`
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
  
  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
  }
  
  .card-content {
    padding: 1rem;
    background-color: white;
  }
  
  h4 {
    margin-bottom: 0.5rem;
    font-size: 1rem;
    color: var(--dark-color);
  }
  
  p {
    font-size: 0.9rem;
    color: var(--text-color);
    margin-bottom: 1rem;
  }
  
  .card-actions {
    display: flex;
    justify-content: space-between;
  }
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: var(--primary-color);
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  
  &:hover {
    color: var(--accent-color);
    text-decoration: underline;
  }
  
  &.delete {
    color: #d9534f;
    
    &:hover {
      color: #c9302c;
    }
  }
`;

const DeleteButton = styled.button`
  position: absolute;
  top: 10px;
  right: 10px;
  background-color: rgba(255, 255, 255, 0.8);
  border: none;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: var(--transition);
  color: #d9534f;
  
  &:hover {
    background-color: rgba(255, 255, 255, 1);
    transform: scale(1.1);
  }
`;

const ImageDetails = styled.div`
  margin-top: 1rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    font-size: 0.9rem;
    color: var(--dark-color);
  }
  
  input, textarea {
    width: 100%;
    padding: 0.7rem;
    border: 1px solid #eee;
    border-radius: var(--radius-sm);
    margin-bottom: 1rem;
    font-family: inherit;
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' }
];

interface GalleryUploadManagerProps {
  onImageUpload?: (images: UploadedImage[]) => void;
}

const GalleryUploadManager: React.FC<GalleryUploadManagerProps> = ({ onImageUpload }) => {
  const [selectedCategory, setSelectedCategory] = useState('rooms');
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [imageDetails, setImageDetails] = useState<{
    title: string;
    description: string;
  }>({ title: '', description: '' });
  
  const { 
    uploadedImages, 
    isUploading, 
    uploadError, 
    uploadImages, 
    removeImage,
    updateImageDetails 
  } = useImageUpload();
  
  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
  };
  
  const handleImageUpload = async (files: File[], category: string) => {
    const newImages = await uploadImages(files, category);
    if (onImageUpload && newImages.length > 0) {
      onImageUpload(newImages);
    }
    return newImages;
  };
  
  const handleDeleteImage = (id: string) => {
    removeImage(id);
    if (editingImage === id) {
      setEditingImage(null);
    }
  };
  
  const handleEditClick = (image: UploadedImage) => {
    setEditingImage(image.id);
    setImageDetails({
      title: image.title,
      description: image.description
    });
  };
  
  const handleDetailChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setImageDetails({
      ...imageDetails,
      [e.target.name]: e.target.value
    });
  };
  
  const handleSaveDetails = (id: string) => {
    updateImageDetails(id, {
      title: imageDetails.title,
      description: imageDetails.description
    });
    setEditingImage(null);
  };
  
  // Фильтрация изображений по выбранной категории
  const filteredImages = uploadedImages.filter(img => img.category === selectedCategory);
  
  return (
    <UploadManagerContainer>
      <CategorySelector>
        <h3>Выберите категорию для загрузки</h3>
        <div className="category-buttons">
          {CATEGORIES.map(category => (
            <CategoryButton
              key={category.id}
              active={selectedCategory === category.id}
              onClick={() => handleCategorySelect(category.id)}
            >
              {category.label}
            </CategoryButton>
          ))}
        </div>
      </CategorySelector>
      
      <ImageUploader
        category={selectedCategory}
        onUpload={handleImageUpload}
        isUploading={isUploading}
        error={uploadError}
      />
      
      {filteredImages.length > 0 && (
        <>
          <h3>Загруженные изображения ({filteredImages.length})</h3>
          <UploadedImagesGrid>
            {filteredImages.map(image => (
              <ImageCard 
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img src={image.url} alt={image.title} />
                <DeleteButton onClick={() => handleDeleteImage(image.id)}>
                  ×
                </DeleteButton>
                <div className="card-content">
                  {editingImage === image.id ? (
                    <ImageDetails>
                      <label htmlFor={`title-${image.id}`}>Название:</label>
                      <input 
                        id={`title-${image.id}`}
                        name="title"
                        value={imageDetails.title}
                        onChange={handleDetailChange}
                      />
                      
                      <label htmlFor={`description-${image.id}`}>Описание:</label>
                      <textarea 
                        id={`description-${image.id}`}
                        name="description"
                        value={imageDetails.description}
                        onChange={handleDetailChange}
                      />
                      
                      <ActionButton onClick={() => handleSaveDetails(image.id)}>
                        Сохранить
                      </ActionButton>
                      <ActionButton onClick={() => setEditingImage(null)}>
                        Отмена
                      </ActionButton>
                    </ImageDetails>
                  ) : (
                    <>
                      <h4>{image.title}</h4>
                      <p>{image.description || 'Нет описания'}</p>
                      <div className="card-actions">
                        <ActionButton onClick={() => handleEditClick(image)}>
                          Редактировать
                        </ActionButton>
                      </div>
                    </>
                  )}
                </div>
              </ImageCard>
            ))}
          </UploadedImagesGrid>
        </>
      )}
    </UploadManagerContainer>
  );
};

export default GalleryUploadManager; 
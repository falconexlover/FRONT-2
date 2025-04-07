import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import GalleryUploadManager from './GalleryUploadManager';
import { galleryService } from '../utils/api';
import { toast } from 'react-toastify';

interface GalleryImageItem {
  _id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string;
  cloudinaryPublicId?: string;
}

interface AdminPanelProps {
  onLogout: () => void;
}

const PanelContainer = styled.div`
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 2rem;
  margin-bottom: 3rem;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  
  h2 {
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
    margin: 0;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
`;

const Tab = styled.button<{ active: boolean }>`
  padding: 0.8rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--dark-color)' : 'var(--text-color)'};
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    color: var(--dark-color);
  }
`;

const ActionButton = styled.button`
  padding: 0.7rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--dark-color);
    }
  }
  
  &.danger {
    background-color: #e53935;
    color: white;
    
    &:hover {
      background-color: #c62828;
    }
  }
  
  &.outline {
    background: none;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
    
    &:hover {
      background-color: rgba(33, 113, 72, 0.1);
    }
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const Panel = styled(motion.div)`
  padding: 1rem 0;
`;

const ExistingImagesPanel = styled.div`
  h3 {
    margin-bottom: 1.5rem;
    color: var(--dark-color);
  }
`;

const ImagesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 1.5rem;
  margin-top: 1.5rem;
`;

const ImageCard = styled.div`
  position: relative;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  .image-container {
    height: 200px;
    position: relative;
    
    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
    
    .image-overlay {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0,0,0,0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0;
      transition: var(--transition);
      
      button {
        margin: 0 0.3rem;
        width: 36px;
        height: 36px;
        border-radius: 50%;
        background: white;
        border: none;
        color: var(--dark-color);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        
        &:hover {
          background: var(--primary-color);
          color: white;
        }
        
        &.delete {
          background: #f44336;
          color: white;
          
          &:hover {
            background: #d32f2f;
          }
        }
      }
    }
    
    &:hover .image-overlay {
      opacity: 1;
    }
  }
  
  .card-content {
    padding: 1rem;
    background-color: white;
    
    h4 {
      margin-bottom: 0.5rem;
      font-size: 1rem;
      color: var(--dark-color);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    
    p {
      font-size: 0.9rem;
      color: var(--text-color);
      margin-bottom: 0.5rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    
    .card-category {
      font-size: 0.8rem;
      color: var(--primary-color);
      font-weight: 600;
    }
  }
`;

const EditForm = styled.div`
  background: white;
  padding: 1.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  margin-bottom: 2rem;
  
  h3 {
    margin-bottom: 1.5rem;
    color: var(--dark-color);
  }
  
  .form-group {
    margin-bottom: 1rem;
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-weight: 600;
      color: var(--dark-color);
    }
    
    input, select, textarea {
      width: 100%;
      padding: 0.8rem;
      border: 1px solid #e0e0e0;
      border-radius: var(--radius-sm);
      font-size: 1rem;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
      }
    }
    
    textarea {
      min-height: 100px;
      resize: vertical;
    }
  }
  
  .form-buttons {
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
  }
`;

const ConfirmDialog = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.7);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: 1rem;
  
  .dialog-content {
    background: white;
    padding: 2rem;
    border-radius: var(--radius-md);
    max-width: 500px;
    width: 100%;
    
    h3 {
      margin-bottom: 1rem;
      color: var(--dark-color);
    }
    
    p {
      margin-bottom: 2rem;
      color: var(--text-color);
    }
    
    .dialog-buttons {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
    }
  }
`;

const LoadingIndicator = styled.div`
  text-align: center;
  padding: 2rem;
  font-style: italic;
  color: var(--text-color);
`;

const ErrorMessage = styled.div`
  text-align: center;
  padding: 2rem;
  color: #e53935;
  background-color: #ffebee;
  border: 1px solid #e53935;
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
`;

const NoImagesMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color);
  
  p {
    margin-bottom: 1.5rem;
  }
`;

const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ onLogout }) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [editingImage, setEditingImage] = useState<GalleryImageItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const loadImages = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await galleryService.getAllImages();
      setImages(data || []); 
    } catch (err: any) {
      console.error("Ошибка при загрузке изображений галереи:", err);
      const message = err.message || 'Не удалось загрузить изображения галереи.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    if (activeTab === 'manage') {
      loadImages();
    }
  }, [activeTab, loadImages]);
  
  const handleUploadSuccess = useCallback(() => {
    toast.success('Изображения успешно загружены!');
    if (activeTab === 'manage') {
      loadImages();
    } else {
      setActiveTab('manage');
    }
  }, [activeTab, loadImages]);
  
  const handleEditClick = (image: GalleryImageItem) => {
    setEditingImage(image);
  };
  
  const handleDeleteClick = (imageId: string) => {
    setImageToDelete(imageId);
    setShowConfirmDialog(true);
  };
  
  const confirmDelete = async () => {
    if (!imageToDelete) return;

    setIsLoading(true);
    setError(null);
    
    try {
      await galleryService.deleteImage(imageToDelete);
      toast.success('Изображение успешно удалено!');
      await loadImages(); 
      setShowConfirmDialog(false);
      setImageToDelete(null);
    } catch (err: any) {
      console.error("Ошибка при удалении изображения:", err);
      const message = err.message || 'Не удалось удалить изображение.';
      setError(message);
      toast.error(message);
      setShowConfirmDialog(false);
      setImageToDelete(null);
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (editingImage) {
      setEditingImage({
        ...editingImage,
        [name]: value
      });
    }
  };
  
  const saveImageChanges = async () => {
    if (!editingImage) return;

    setIsLoading(true);
    setError(null);
    
    const updates = {
      category: editingImage.category,
      title: editingImage.title,
      description: editingImage.description
    };

    try {
      await galleryService.updateImage(editingImage._id, updates);
      toast.success('Изменения успешно сохранены!');
      await loadImages();
      setEditingImage(null);
    } catch (err: any) {
      console.error("Ошибка при обновлении изображения:", err);
      const message = err.message || 'Не удалось сохранить изменения.';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };
  
  const clearAllImages = () => {
    setShowClearConfirm(false);
    toast.info('Функция очистки галереи временно отключена. Требуется реализация на бэкенде.');
  };
  
  const handleLogout = () => {
    onLogout();
  };
  
  const imageToDeleteDetails = imageToDelete ? images.find(img => img._id === imageToDelete) : null;
  const imageToDeleteTitle = imageToDeleteDetails ? imageToDeleteDetails.title : 'это изображение';

  return (
    <PanelContainer>
      <PanelHeader>
        <h2>Панель администратора галереи</h2>
        <ActionButton className="outline" onClick={handleLogout} disabled={isLoading}>
          Выйти из режима администратора
        </ActionButton>
      </PanelHeader>
      
      <TabsContainer>
        <Tab 
          active={activeTab === 'upload'} 
          onClick={() => setActiveTab('upload')}
        >
          Загрузка изображений
        </Tab>
        <Tab 
          active={activeTab === 'manage'} 
          onClick={() => setActiveTab('manage')}
        >
          Управление галереей
        </Tab>
      </TabsContainer>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}

      {activeTab === 'upload' && (
        <Panel
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GalleryUploadManager onImageUpload={handleUploadSuccess} />
        </Panel>
      )}
      
      {activeTab === 'manage' && (
        <Panel
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <ExistingImagesPanel>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3>Управление изображениями</h3>
              <ActionButton 
                className="danger" 
                onClick={() => setShowClearConfirm(true)}
                disabled={true}
                title="Функция временно отключена (требуется бэкенд)"
              >
                Очистить галерею
              </ActionButton>
            </div>
            
            {editingImage && (
              <EditForm>
                <h3>Редактирование изображения</h3>
                
                <div className="form-group">
                  <label htmlFor="title">Название:</label>
                  <input 
                    type="text" 
                    id="title" 
                    name="title"
                    value={editingImage.title}
                    onChange={handleEditFormChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Категория:</label>
                  <select 
                    id="category" 
                    name="category"
                    value={editingImage.category}
                    onChange={handleEditFormChange}
                    disabled={isLoading}
                  >
                    {CATEGORIES.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label htmlFor="description">Описание:</label>
                  <textarea 
                    id="description" 
                    name="description"
                    value={editingImage.description}
                    onChange={handleEditFormChange}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="form-buttons">
                  <ActionButton 
                    className="outline" 
                    onClick={() => setEditingImage(null)}
                    disabled={isLoading}
                  >
                    Отмена
                  </ActionButton>
                  <ActionButton 
                    className="primary" 
                    onClick={saveImageChanges}
                    disabled={isLoading}
                  >
                    {isLoading ? 'Сохранение...' : 'Сохранить'}
                  </ActionButton>
                </div>
              </EditForm>
            )}
            
            {isLoading && <LoadingIndicator>Загрузка данных...</LoadingIndicator>}

            {!isLoading && !error && images.length === 0 && (
              <NoImagesMessage>
                <p>У вас пока нет загруженных изображений.</p>
                <ActionButton 
                  className="primary" 
                  onClick={() => setActiveTab('upload')}
                >
                  Загрузить изображения
                </ActionButton>
              </NoImagesMessage>
            )}
            
            {!isLoading && images.length > 0 && (
              <ImagesGrid>
                {images.map(image => (
                  <ImageCard key={image._id}>
                    <div className="image-container">
                      <img src={image.imageUrl} alt={image.title} />
                      <div className="image-overlay">
                        <button 
                          onClick={() => handleEditClick(image)} 
                          disabled={isLoading}
                          title="Редактировать"
                        >
                          ✎
                        </button>
                        <button 
                          className="delete"
                          onClick={() => handleDeleteClick(image._id)}
                          disabled={isLoading}
                          title="Удалить"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                    <div className="card-content">
                      <h4>{image.title}</h4>
                      <p>{image.description}</p>
                      <div className="card-category">
                        {CATEGORIES.find(cat => cat.id === image.category)?.label || image.category}
                      </div>
                    </div>
                  </ImageCard>
                ))}
              </ImagesGrid>
            )}
          </ExistingImagesPanel>
        </Panel>
      )}
      
      {showConfirmDialog && (
        <ConfirmDialog>
          <div className="dialog-content">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить изображение "{imageToDeleteTitle}"? Это действие нельзя будет отменить.</p>
            <div className="dialog-buttons">
              <ActionButton 
                className="outline" 
                onClick={() => setShowConfirmDialog(false)}
                disabled={isLoading}
              >
                Отмена
              </ActionButton>
              <ActionButton 
                className="danger" 
                onClick={confirmDelete}
                disabled={isLoading}
              >
                {isLoading ? 'Удаление...' : 'Удалить'}
              </ActionButton>
            </div>
          </div>
        </ConfirmDialog>
      )}
      
      {showClearConfirm && (
        <ConfirmDialog>
          <div className="dialog-content">
            <h3>Очистить галерею?</h3>
            <p>Вы собираетесь удалить все загруженные вами изображения из галереи. Это действие нельзя будет отменить.</p>
             <p style={{color: 'red', marginTop: '-1rem', marginBottom: '1rem'}}><strong>Внимание:</strong> Эта функция временно отключена.</p>
            <div className="dialog-buttons">
              <ActionButton 
                className="outline" 
                onClick={() => setShowClearConfirm(false)}
              >
                Отмена
              </ActionButton>
              <ActionButton 
                className="danger" 
                onClick={clearAllImages}
                disabled={true}
              >
                Очистить галерею
              </ActionButton>
            </div>
          </div>
        </ConfirmDialog>
      )}
    </PanelContainer>
  );
};

export default AdminPanel; 
import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { logoutAdmin } from '../utils/auth';
import GalleryUploadManager from './GalleryUploadManager';
import { UploadedImage } from '../utils/imageUpload';
import { 
  loadGalleryFromStorage, 
  removeImageFromStorage, 
  updateImageInStorage,
  clearGalleryStorage
} from '../utils/localStorageUtils';

interface AdminPanelProps {
  onLogout: () => void;
  onImageUpload: (images: UploadedImage[]) => void;
  onImageDelete: (imageId: string) => void;
  onImageUpdate: (imageId: string, updates: any) => void;
  staticImagesCount: number;
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

const NoImagesMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-color);
  
  p {
    margin-bottom: 1.5rem;
  }
`;

// Интерфейс для изображения в галерее
interface GalleryImageItem {
  id: string;
  url: string;
  category: string;
  title: string;
  description: string;
  createdAt: Date;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
}

// Перечисление категорий
const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' }
];

const AdminPanel: React.FC<AdminPanelProps> = ({ 
  onLogout, 
  onImageUpload, 
  onImageDelete,
  onImageUpdate,
  staticImagesCount
}) => {
  const [activeTab, setActiveTab] = useState('upload');
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [editingImage, setEditingImage] = useState<GalleryImageItem | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [showClearConfirm, setShowClearConfirm] = useState(false);
  
  // Загрузка изображений из localStorage при активации вкладки
  React.useEffect(() => {
    if (activeTab === 'manage') {
      loadImages();
    }
  }, [activeTab]);
  
  // Функция загрузки изображений из localStorage
  const loadImages = () => {
    const savedImages = loadGalleryFromStorage();
    setImages(savedImages as GalleryImageItem[]);
  };
  
  // Обработчик для загрузки новых изображений
  const handleImageUpload = (newImages: UploadedImage[]) => {
    onImageUpload(newImages);
    
    // Если мы на вкладке управления, обновляем список
    if (activeTab === 'manage') {
      loadImages();
    }
  };
  
  // Обработчик для кнопки редактирования
  const handleEditClick = (image: GalleryImageItem) => {
    setEditingImage(image);
  };
  
  // Обработчик для кнопки удаления
  const handleDeleteClick = (imageId: string) => {
    setImageToDelete(imageId);
    setShowConfirmDialog(true);
  };
  
  // Подтверждение удаления
  const confirmDelete = () => {
    if (imageToDelete) {
      // Удаляем из localStorage
      removeImageFromStorage(imageToDelete);
      // Удаляем из локального состояния
      setImages(prev => prev.filter(img => img.id !== imageToDelete));
      // Оповещаем родительский компонент
      onImageDelete(imageToDelete);
    }
    
    setShowConfirmDialog(false);
    setImageToDelete(null);
  };
  
  // Обработчик изменения полей в форме редактирования
  const handleEditFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (editingImage) {
      setEditingImage({
        ...editingImage,
        [name]: value
      });
    }
  };
  
  // Сохранение изменений в изображении
  const saveImageChanges = () => {
    if (editingImage) {
      // Обновляем в localStorage
      updateImageInStorage(editingImage.id, {
        category: editingImage.category,
        title: editingImage.title,
        description: editingImage.description
      });
      
      // Обновляем в локальном состоянии
      setImages(prev => 
        prev.map(img => 
          img.id === editingImage.id ? editingImage : img
        )
      );
      
      // Оповещаем родительский компонент
      onImageUpdate(editingImage.id, {
        category: editingImage.category,
        title: editingImage.title,
        description: editingImage.description
      });
      
      // Закрываем форму редактирования
      setEditingImage(null);
    }
  };
  
  // Очистка всех пользовательских изображений
  const clearAllImages = () => {
    clearGalleryStorage();
    setImages([]);
    setShowClearConfirm(false);
    // Перезагрузка страницы для обновления галереи
    window.location.reload();
  };
  
  // Выход из администратора
  const handleLogout = () => {
    logoutAdmin();
    onLogout();
  };
  
  return (
    <PanelContainer>
      <PanelHeader>
        <h2>Панель администратора галереи</h2>
        <ActionButton className="outline" onClick={handleLogout}>
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
      
      {activeTab === 'upload' && (
        <Panel
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <GalleryUploadManager onImageUpload={handleImageUpload} />
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
                  />
                </div>
                
                <div className="form-group">
                  <label htmlFor="category">Категория:</label>
                  <select 
                    id="category" 
                    name="category"
                    value={editingImage.category}
                    onChange={handleEditFormChange}
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
                  />
                </div>
                
                <div className="form-buttons">
                  <ActionButton 
                    className="outline" 
                    onClick={() => setEditingImage(null)}
                  >
                    Отмена
                  </ActionButton>
                  <ActionButton 
                    className="primary" 
                    onClick={saveImageChanges}
                  >
                    Сохранить
                  </ActionButton>
                </div>
              </EditForm>
            )}
            
            {images.length === 0 ? (
              <NoImagesMessage>
                <p>У вас пока нет загруженных изображений.</p>
                <ActionButton 
                  className="primary" 
                  onClick={() => setActiveTab('upload')}
                >
                  Загрузить изображения
                </ActionButton>
              </NoImagesMessage>
            ) : (
              <ImagesGrid>
                {images.map(image => (
                  <ImageCard key={image.id}>
                    <div className="image-container">
                      <img src={image.url} alt={image.title} />
                      <div className="image-overlay">
                        <button onClick={() => handleEditClick(image)}>
                          ✎
                        </button>
                        <button 
                          className="delete"
                          onClick={() => handleDeleteClick(image.id)}
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
            
            <div style={{ marginTop: '2rem' }}>
              <p style={{ color: 'var(--text-color)', marginBottom: '1rem' }}>
                Примечание: Стандартные {staticImagesCount} изображений не могут быть изменены или удалены через этот интерфейс.
              </p>
            </div>
          </ExistingImagesPanel>
        </Panel>
      )}
      
      {showConfirmDialog && (
        <ConfirmDialog>
          <div className="dialog-content">
            <h3>Подтверждение удаления</h3>
            <p>Вы уверены, что хотите удалить это изображение? Это действие нельзя будет отменить.</p>
            <div className="dialog-buttons">
              <ActionButton 
                className="outline" 
                onClick={() => setShowConfirmDialog(false)}
              >
                Отмена
              </ActionButton>
              <ActionButton 
                className="danger" 
                onClick={confirmDelete}
              >
                Удалить
              </ActionButton>
            </div>
          </div>
        </ConfirmDialog>
      )}
      
      {showClearConfirm && (
        <ConfirmDialog>
          <div className="dialog-content">
            <h3>Очистить галерею?</h3>
            <p>Вы собираетесь удалить все загруженные вами изображения из галереи. Это действие нельзя будет отменить. Стандартные изображения останутся без изменений.</p>
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
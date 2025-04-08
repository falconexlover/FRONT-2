import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// import { ActionButton } from '../AdminPanel'; // Убираем старый коммент
import ActionButton from '../ui/ActionButton'; // Правильный импорт
// Импортируем общий тип GalleryImageItem
import { GalleryImageItem } from '../../types/GalleryImage'; 

// --- Копируем ActionButton из AdminPanel.tsx --- 
// Удаляем локальное определение
/*
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
*/

// Удаляем локальное определение GalleryImageItem
/*
interface GalleryImageItem {
  _id: string;
  imageUrl: string;
  category: string;
  title: string;
  description: string;
  cloudinaryPublicId?: string;
}
*/

// Тип Category остается, так как он используется локально
interface Category {
  id: string;
  label: string;
}

// --- Styled Component (перенесен из AdminPanel) ---

const EditFormContainer = styled(motion.div)`
  background: var(--bg-secondary);
  padding: 1.5rem 2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;

  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-size: 1.3rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.8rem;
  }
  
  .form-group {
    margin-bottom: 1.2rem;
    
    label {
      display: block;
      margin-bottom: 0.6rem;
      font-weight: 500;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    
    input, select, textarea {
      width: 100%;
      padding: 0.9rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);
      font-size: 1rem;
      background-color: var(--bg-primary);
      color: var(--text-primary);
      transition: border-color 0.2s ease, box-shadow 0.2s ease;
      
      &:focus {
        outline: none;
        border-color: var(--primary-color);
        box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
      }
      
      &[as="select"] {
          /* Могут потребоваться дополнительные стили для стрелки */
      }
    }
    
    textarea {
        min-height: 100px;
        resize: vertical;
    }
  }
  
  .form-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
  }
`;

// --- Component Props ---

interface ImageEditFormProps {
  image: GalleryImageItem;
  editedData: Partial<GalleryImageItem>;
  onFormChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  onSave: () => void;
  onCancel: () => void;
  categories: Category[];
  isSaving: boolean;
  variants?: any;
  initial?: string;
  animate?: string;
  exit?: string;
  transition?: any;
}

// --- Component ---

const ImageEditForm: React.FC<ImageEditFormProps> = ({
    image,
    editedData,
    onFormChange,
    onSave,
    onCancel,
    categories,
    isSaving,
    ...motionProps
}) => {
  return (
    <EditFormContainer {...motionProps}>
      <h3>Редактировать информацию</h3>
      
      <div className="form-group">
        <label htmlFor="title">Заголовок:</label>
        <input 
          type="text" 
          id="title"
          name="title"
          value={editedData.title || ''}
          onChange={onFormChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="description">Описание:</label>
        <textarea 
          id="description"
          name="description"
          value={editedData.description || ''}
          onChange={onFormChange}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="category">Категория:</label>
        <select 
          id="category"
          name="category"
          value={editedData.category || ''}
          onChange={onFormChange}
        >
            <option value="">-- Выберите категорию --</option>
            {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.label}</option>
            ))}
        </select>
      </div>
      
      <div className="form-actions">
         <ActionButton 
            type="button" 
            className="secondary" 
            onClick={onCancel}
            disabled={isSaving}
          >
            Отмена
          </ActionButton>
          <ActionButton 
            type="button" 
            className="primary"
            onClick={onSave}
            disabled={isSaving}
          >
            {isSaving ? 'Сохранение...' : 'Сохранить'}
          </ActionButton>
      </div>
      
    </EditFormContainer>
  );
};

export default ImageEditForm;
// Экспортируем ActionButton, если он определен здесь или импортирован и используется только тут
// export { ActionButton }; 
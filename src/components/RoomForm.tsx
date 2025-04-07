import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import RoomImageUploader from './RoomImageUploader';
// Импортируем ОБЩИЙ тип
import { RoomType } from '../types/Room'; 

// Удаляем локальное определение интерфейса RoomType
/*
interface RoomType { ... } 
*/

interface RoomFormProps {
  initialData?: RoomType | null; 
  // Обновляем тип onSave, чтобы он принимал Promise
  onSave: (roomData: RoomType, imageFile: File | null) => Promise<void>; 
  onCancel: () => void;
  isLoading: boolean;
}

const FormContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  max-width: 800px;
  margin-bottom: 2rem;
`;

const FormTitle = styled.h3`
  color: var(--dark-color);
  margin-bottom: 1.5rem;
  font-family: 'Playfair Display', serif;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-bottom: 1.5rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
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
  
  .checkbox-group {
    display: flex;
    align-items: center;
    
    input[type="checkbox"] {
      width: auto;
      margin-right: 10px;
    }
  }
`;

const FormFeatures = styled.div`
  margin-bottom: 1.5rem;
  
  .features-list {
    display: flex;
    flex-wrap: wrap;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }
  
  .feature-tag {
    display: inline-flex;
    align-items: center;
    background-color: #f0f0f0;
    padding: 0.4rem 0.8rem;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    
    button {
      background: none;
      border: none;
      color: var(--text-color);
      margin-left: 0.5rem;
      cursor: pointer;
      
      &:hover {
        color: var(--accent-color);
      }
    }
  }
  
  .feature-input {
    display: flex;
    margin-top: 1rem;
    
    input {
      flex: 1;
      border-top-right-radius: 0;
      border-bottom-right-radius: 0;
    }
    
    button {
      padding: 0 1rem;
      background-color: var(--primary-color);
      color: white;
      border: none;
      border-top-right-radius: var(--radius-sm);
      border-bottom-right-radius: var(--radius-sm);
      cursor: pointer;
      
      &:hover {
        background-color: var(--dark-color);
      }
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
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
  
  &.secondary {
    background-color: #e0e0e0;
    color: var(--dark-color);
    
    &:hover {
      background-color: #d0d0d0;
    }
  }
`;

// Обновляем DEFAULT_ROOM под новый интерфейс
const DEFAULT_ROOM: Omit<RoomType, '_id'> = {
  title: "",
  imageUrl: "", 
  price: "", // Пользователь введет строку
  priceValue: 0, // И число
  capacity: 2,
  features: [],
};

const RoomForm: React.FC<RoomFormProps> = ({ initialData, onSave, onCancel, isLoading }) => {
  // Инициализируем состояние с учетом возможного отсутствия _id
  const [formData, setFormData] = useState<RoomType>(() => {
    const data = initialData || DEFAULT_ROOM;
    // Убедимся, что все поля нового типа присутствуют
    return {
      _id: initialData?._id,
      title: data.title || '',
      imageUrl: data.imageUrl || '',
      price: data.price || '',
      priceValue: data.priceValue || 0,
      capacity: data.capacity || 2,
      features: data.features || [],
    };
  });
  
  const [newFeature, setNewFeature] = useState("");
  // Добавляем состояние для файла изображения
  const [selectedImageFile, setSelectedImageFile] = useState<File | null>(null);

  useEffect(() => {
    // Обновляем форму при изменении initialData (например, при выборе другого номера для редактирования)
    const data = initialData || DEFAULT_ROOM;
     setFormData({
      _id: initialData?._id,
      title: data.title || '',
      imageUrl: data.imageUrl || '',
      price: data.price || '',
      priceValue: data.priceValue || 0,
      capacity: data.capacity || 2,
      features: data.features || [],
    });
    setSelectedImageFile(null); // Сбрасываем выбранный файл при смене редактируемого номера
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number = value;

    // Преобразуем числовые поля
    if (type === 'number') {
      processedValue = parseFloat(value) || 0; // Используем 0, если парсинг не удался
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  // Обработчик для загрузчика изображений
  const handleImageChange = useCallback((file: File | null) => {
    setSelectedImageFile(file);
    // Обновляем imageUrl для превью, если файл выбран, иначе оставляем старый
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({ ...prev, imageUrl: reader.result as string }));
      }
      reader.readAsDataURL(file);
    } else {
       // Если файл сброшен, возвращаем исходный imageUrl (если был)
       setFormData(prev => ({ ...prev, imageUrl: initialData?.imageUrl || DEFAULT_ROOM.imageUrl }));
    }
  }, [initialData]);
  
  // Добавление фичи
  const handleAddFeature = () => {
    if (newFeature.trim() === "") return;
    setFormData(prev => ({
      ...prev,
      features: [...prev.features, newFeature.trim()]
    }));
    setNewFeature("");
  };
  
  // Удаление фичи
  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };
  
  // Отправка формы (теперь может быть асинхронной)
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      // Вызываем onSave и ждем завершения
      await onSave(formData, selectedImageFile); 
    } catch (error) {
      // Ошибки должны обрабатываться в родительском компоненте (RoomsAdminPanel),
      // но можно добавить логирование здесь при необходимости
      console.error("Ошибка при вызове onSave в RoomForm:", error);
      // Возможно, показать локальное сообщение об ошибке в форме?
    }
  };

  return (
    <FormContainer>
      <FormTitle>{initialData?._id ? 'Редактировать номер' : 'Добавить новый номер'}</FormTitle>
      <form onSubmit={handleSubmit}>
        
        {/* Загрузчик изображений */}
        <FormGroup>
          <label>Изображение</label>
          <RoomImageUploader 
            initialImage={formData.imageUrl}
            onImageChange={handleImageChange} 
          />
        </FormGroup>

        <FormRow>
          <FormGroup>
            <label htmlFor="title">Название номера</label>
            <input 
              type="text" 
              id="title" 
              name="title" 
              value={formData.title} 
              onChange={handleChange} 
              required 
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="capacity">Вместимость (чел.)</label>
            <input 
              type="number" 
              id="capacity" 
              name="capacity" 
              value={formData.capacity} 
              onChange={handleChange} 
              min="1" 
              required 
            />
          </FormGroup>
        </FormRow>

        <FormRow>
           <FormGroup>
            <label htmlFor="price">Цена (строка для отображения)</label>
            <input 
              type="text" 
              id="price" 
              name="price" 
              value={formData.price} 
              onChange={handleChange} 
              placeholder="например, 3 500 ₽ / сутки" 
              required 
            />
          </FormGroup>
          <FormGroup>
            <label htmlFor="priceValue">Цена (число, только цифры)</label>
            <input 
              type="number" 
              id="priceValue" 
              name="priceValue" 
              value={formData.priceValue} 
              onChange={handleChange} 
              min="0" 
              required 
            />
          </FormGroup>
        </FormRow>

        {/* Убраны старые поля: description, size, bedType, roomCount, hasPrivateBathroom */}

        {/* Редактирование фич */}
        <FormFeatures>
          <label>Удобства номера</label>
          <div className="features-list">
            {formData.features.map((feature, index) => (
              <div key={index} className="feature-tag">
                {feature}
                <button type="button" onClick={() => handleRemoveFeature(index)}>&times;</button>
              </div>
            ))}
          </div>
          <div className="feature-input">
            <input 
              type="text" 
              value={newFeature} 
              onChange={(e) => setNewFeature(e.target.value)} 
              placeholder="Добавить удобство..." 
            />
            <button type="button" onClick={handleAddFeature}>Добавить</button>
          </div>
        </FormFeatures>
        
        <ButtonGroup>
          <Button 
             type="button" 
             className="secondary" 
             onClick={onCancel} 
             disabled={isLoading}
          >
             Отмена
          </Button>
          <Button 
             type="submit" 
             className="primary" 
             disabled={isLoading}
          >
             {isLoading 
               ? (initialData?._id ? 'Сохранение...' : 'Добавление...') 
               : (initialData?._id ? 'Сохранить изменения' : 'Добавить номер')
             }
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default RoomForm; 
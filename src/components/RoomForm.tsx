import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { RoomType } from '../utils/roomsData';
import RoomImageUploader from './RoomImageUploader';

interface RoomFormProps {
  initialData?: RoomType;
  onSubmit: (roomData: RoomType) => void;
  onCancel: () => void;
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

// Базовый шаблон для создания нового номера
const DEFAULT_ROOM: RoomType = {
  id: "",
  title: "",
  description: "",
  image: "",
  features: [],
  price: "",
  priceNote: "/сутки",
  capacity: 2,
  hasPrivateBathroom: true,
  size: 20,
  bedType: "Двуспальная кровать",
  roomCount: 1
};

const RoomForm: React.FC<RoomFormProps> = ({ initialData, onSubmit, onCancel }) => {
  // Состояние для данных формы
  const [formData, setFormData] = useState<RoomType>(initialData || DEFAULT_ROOM);
  
  // Состояние для нового удобства, которое добавляется через инпут
  const [newFeature, setNewFeature] = useState("");
  
  // При изменении initialData обновляем состояние формы
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  
  // Обработчик изменения полей формы
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Для числовых полей конвертируем строку в число
    if (type === 'number') {
      setFormData({
        ...formData,
        [name]: parseFloat(value)
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Обработчик изменения чекбокса
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    
    setFormData({
      ...formData,
      [name]: checked
    });
  };
  
  // Добавление нового удобства
  const handleAddFeature = () => {
    if (newFeature.trim() === "") return;
    
    setFormData({
      ...formData,
      features: [...formData.features, newFeature.trim()]
    });
    
    setNewFeature("");
  };
  
  // Удаление удобства
  const handleRemoveFeature = (index: number) => {
    const updatedFeatures = [...formData.features];
    updatedFeatures.splice(index, 1);
    
    setFormData({
      ...formData,
      features: updatedFeatures
    });
  };
  
  // Отправка формы
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Генерируем уникальный ID для нового номера, если он не задан
    if (!formData.id) {
      const roomId = `room-${Date.now()}`;
      onSubmit({ ...formData, id: roomId });
    } else {
      onSubmit(formData);
    }
  };
  
  return (
    <FormContainer>
      <FormTitle>{initialData ? 'Редактирование номера' : 'Добавление нового номера'}</FormTitle>
      
      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="title">Название номера *</label>
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
          <label htmlFor="description">Описание *</label>
          <textarea 
            id="description" 
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
          />
        </FormGroup>
        
        <FormRow>
          <FormGroup>
            <label>Изображение номера *</label>
            <RoomImageUploader 
              initialImage={formData.image}
              onImageChange={(imageData) => setFormData({...formData, image: imageData})}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="tag">Тег (необязательно)</label>
            <input 
              type="text" 
              id="tag" 
              name="tag"
              value={formData.tag || ""}
              onChange={handleChange}
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <label htmlFor="price">Цена *</label>
            <input 
              type="text" 
              id="price" 
              name="price"
              value={formData.price}
              onChange={handleChange}
              required
              placeholder="например, 2 500 ₽"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="priceNote">Примечание к цене</label>
            <input 
              type="text" 
              id="priceNote" 
              name="priceNote"
              value={formData.priceNote || ""}
              onChange={handleChange}
              placeholder="например, /сутки (1 чел)"
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <label htmlFor="additionalPrice">Дополнительная цена (необязательно)</label>
            <input 
              type="text" 
              id="additionalPrice" 
              name="additionalPrice"
              value={formData.additionalPrice || ""}
              onChange={handleChange}
              placeholder="например, 3 000 ₽"
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="additionalPriceNote">Примечание к доп. цене</label>
            <input 
              type="text" 
              id="additionalPriceNote" 
              name="additionalPriceNote"
              value={formData.additionalPriceNote || ""}
              onChange={handleChange}
              placeholder="например, /сутки (2 чел)"
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <label htmlFor="capacity">Вместимость (чел.) *</label>
            <input 
              type="number" 
              id="capacity" 
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              max="10"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="size">Площадь (кв.м) *</label>
            <input 
              type="number" 
              id="size" 
              name="size"
              value={formData.size}
              onChange={handleChange}
              min="5"
              max="100"
              required
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="roomCount">Количество номеров</label>
            <input 
              type="number" 
              id="roomCount" 
              name="roomCount"
              value={formData.roomCount || 1}
              onChange={handleChange}
              min="1"
              max="50"
            />
          </FormGroup>
        </FormRow>
        
        <FormRow>
          <FormGroup>
            <label htmlFor="bedType">Тип кровати *</label>
            <select 
              id="bedType" 
              name="bedType"
              value={formData.bedType}
              onChange={handleChange}
              required
            >
              <option value="Односпальная кровать">Односпальная кровать</option>
              <option value="Две односпальные кровати">Две односпальные кровати</option>
              <option value="Двуспальная кровать">Двуспальная кровать</option>
              <option value="Три односпальные кровати">Три односпальные кровати</option>
              <option value="Четыре односпальные кровати">Четыре односпальные кровати</option>
              <option value="Двуспальная и односпальная">Двуспальная и односпальная</option>
            </select>
          </FormGroup>
          
          <FormGroup>
            <div className="checkbox-group">
              <input 
                type="checkbox" 
                id="hasPrivateBathroom" 
                name="hasPrivateBathroom"
                checked={formData.hasPrivateBathroom}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="hasPrivateBathroom">Собственная ванная комната</label>
            </div>
          </FormGroup>
        </FormRow>
        
        <FormFeatures>
          <label>Удобства и особенности номера *</label>
          
          <div className="features-list">
            {formData.features.map((feature, index) => (
              <div key={index} className="feature-tag">
                {feature}
                <button 
                  type="button" 
                  onClick={() => handleRemoveFeature(index)}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
          
          <div className="feature-input">
            <input 
              type="text" 
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              placeholder="Добавить удобство, например: Телевизор"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddFeature())}
            />
            <button type="button" onClick={handleAddFeature}>
              Добавить
            </button>
          </div>
        </FormFeatures>
        
        <ButtonGroup>
          <Button 
            type="button" 
            className="secondary"
            onClick={onCancel}
          >
            Отмена
          </Button>
          <Button 
            type="submit" 
            className="primary"
          >
            {initialData ? 'Сохранить изменения' : 'Добавить номер'}
          </Button>
        </ButtonGroup>
      </form>
    </FormContainer>
  );
};

export default RoomForm; 
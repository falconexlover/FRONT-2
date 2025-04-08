import React from 'react';
import styled from 'styled-components';
import { HomePageContent } from '../../types/HomePage'; // Предполагаемый путь

// --- Styled Components (скопировано из HomePageEditor) ---
// (В идеале вынести FormGroup в общий UI компонент)
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 600;
    font-size: 0.9rem; // Сделаем чуть меньше для вложенных форм
  }
  
  input, textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid var(--border-color, #e0e0e0);
    border-radius: var(--radius-sm);
    font-size: 1rem;
    transition: var(--transition);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(33, 113, 72, 0.2);
    }
  }
  
  textarea {
    min-height: 80px;
    resize: vertical;
  }
`;

// --- Component Props ---

// Тип для секции banner из HomePageContent
type BannerContent = HomePageContent['banner'];

interface BannerSectionEditorProps {
  // Используем NonNullable чтобы указать, что content не будет null/undefined здесь
  content: NonNullable<BannerContent>; 
  onChange: (field: keyof NonNullable<BannerContent>, value: string) => void;
}

// --- Component ---

const BannerSectionEditor: React.FC<BannerSectionEditorProps> = ({ content, onChange }) => {

  // Обертка для обработчика изменений, чтобы передавать правильный field
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Убедимся, что name соответствует ключам BannerContent
    if (name === 'title' || name === 'subtitle' || name === 'buttonText' || name === 'buttonLink') {
      onChange(name as keyof NonNullable<BannerContent>, value);
    }
  };

  return (
    <div>
      <h4>Редактирование секции "Баннер"</h4>
      <FormGroup>
        <label htmlFor="banner-title">Заголовок:</label>
        <input 
          type="text" 
          id="banner-title"
          name="title" 
          value={content.title || ''} 
          onChange={handleChange} 
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="banner-subtitle">Подзаголовок:</label>
        <textarea 
          id="banner-subtitle" 
          name="subtitle"
          value={content.subtitle || ''} 
          onChange={handleChange} 
          rows={3}
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="banner-buttonText">Текст кнопки:</label>
        <input 
          type="text" 
          id="banner-buttonText"
          name="buttonText" 
          value={content.buttonText || ''} 
          onChange={handleChange} 
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="banner-buttonLink">Ссылка кнопки (URL):</label>
        <input 
          type="text" 
          id="banner-buttonLink"
          name="buttonLink" 
          value={content.buttonLink || ''} 
          onChange={handleChange} 
        />
      </FormGroup>
    </div>
  );
};

export default BannerSectionEditor; 
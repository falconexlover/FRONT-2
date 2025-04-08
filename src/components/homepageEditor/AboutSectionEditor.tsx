import React from 'react';
import styled from 'styled-components';
import { HomePageContent } from '../../types/HomePage';

// --- Styled Components (скопировано) ---
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 600;
    font-size: 0.9rem;
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
    min-height: 120px; // Сделаем повыше для описания
    resize: vertical;
  }
`;

// --- Component Props ---
type AboutContent = HomePageContent['about'];

interface AboutSectionEditorProps {
  content: NonNullable<AboutContent>;
  onChange: (field: keyof NonNullable<AboutContent>, value: string) => void;
}

// --- Component ---
const AboutSectionEditor: React.FC<AboutSectionEditorProps> = ({ content, onChange }) => {

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    // Убедимся, что name соответствует ключам AboutContent
    if (name === 'title' || name === 'content' || name === 'image') {
      onChange(name as keyof NonNullable<AboutContent>, value);
    }
  };

  return (
    <div>
      <h4>Редактирование секции "О нас"</h4>
      <FormGroup>
        <label htmlFor="about-title">Заголовок:</label>
        <input 
          type="text" 
          id="about-title"
          name="title" 
          value={content.title || ''} 
          onChange={handleChange} 
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="about-content">Описание:</label>
        <textarea 
          id="about-content" 
          name="content"
          value={content.content || ''} 
          onChange={handleChange} 
          rows={5} // Увеличим количество строк по умолчанию
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="about-image">URL изображения (необязательно):</label>
        <input 
          type="text" 
          id="about-image"
          name="image" 
          value={content.image || ''} 
          onChange={handleChange} 
          placeholder="Вставьте URL или загрузите на вкладке 'Изображения'"
        />
      </FormGroup>
    </div>
  );
};

export default AboutSectionEditor; 
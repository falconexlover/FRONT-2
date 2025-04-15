import React, { useRef, useEffect } from 'react';
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

const AutoResizeTextarea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color, #e0e0e0);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  transition: var(--transition);
  resize: none; /* Отключаем ручное изменение размера */
  overflow-y: hidden; /* Скрываем скроллбар, пока не нужен */
  line-height: 1.5; /* Важно для расчета высоты */
  font-family: inherit; /* Наследуем шрифт */

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(33, 113, 72, 0.2);
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

  const titleTextareaRef = useRef<HTMLTextAreaElement>(null);
  const subtitleTextareaRef = useRef<HTMLTextAreaElement>(null);

  // Функция для авто-ресайза (УЛУЧШЕННАЯ ВЕРСИЯ)
  const autoResizeTextarea = (element: HTMLTextAreaElement | null) => {
    if (element) {
      // 1. Временно сбрасываем высоту, чтобы scrollHeight рассчитался корректно
      element.style.height = '1px'; 
      // 2. Устанавливаем новую высоту на основе scrollHeight
      element.style.height = `${element.scrollHeight}px`; 
    }
  };

  // Ресайз при монтировании и изменении контента
  useEffect(() => {
    autoResizeTextarea(titleTextareaRef.current);
  }, [content.title]); // Зависимость от content.title

  useEffect(() => {
    autoResizeTextarea(subtitleTextareaRef.current);
  }, [content.subtitle]); // Зависимость от content.subtitle

  // Обертка для обработчика изменений
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'subtitle' || name === 'buttonText' || name === 'buttonLink') {
      onChange(name as keyof NonNullable<BannerContent>, value);
      // Вызов ресайза при изменении
      if (name === 'title' && titleTextareaRef.current) {
        autoResizeTextarea(titleTextareaRef.current);
      }
      if (name === 'subtitle' && subtitleTextareaRef.current) {
        autoResizeTextarea(subtitleTextareaRef.current);
      }
    }
  };

  return (
    <div>
      <h4>Редактирование секции "Баннер"</h4>
      <FormGroup>
        <label htmlFor="banner-title">Заголовок:</label>
        <AutoResizeTextarea 
          ref={titleTextareaRef}
          id="banner-title"
          name="title" 
          value={content.title || ''} 
          onChange={handleChange} 
          rows={1}
          style={{ minHeight: '45px' }}
        />
      </FormGroup>
      <FormGroup>
        <label htmlFor="banner-subtitle">Подзаголовок:</label>
        <AutoResizeTextarea 
          ref={subtitleTextareaRef}
          id="banner-subtitle" 
          name="subtitle"
          value={content.subtitle || ''} 
          onChange={handleChange} 
          rows={2}
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
import React from 'react';
import styled from 'styled-components';
import { HomePageContent, ServicePreview } from '../../types/HomePage';

// --- Styled Components (адаптировано из HomePageEditor) ---
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
    min-height: 80px; /* Сделаем чуть меньше для описания услуги */
    resize: vertical;
  }
`;

const ServiceCard = styled.div`
  border: 1px solid #eee;
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  background-color: #fdfdfd;
  
  h4 {
    margin-top: 0;
    margin-bottom: 1rem;
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
    font-size: 1.1rem;
  }
`;

// --- Component Props --- 
type ServicesContent = HomePageContent['services'];

interface ServicesSectionEditorProps {
  content: NonNullable<ServicesContent>;
  onSectionChange: (field: 'title' | 'subtitle', value: string) => void;
  onServiceChange: (index: number, field: keyof ServicePreview, value: string) => void;
  // Возможно, понадобится функция для добавления/удаления услуг
}

// --- Component ---
const ServicesSectionEditor: React.FC<ServicesSectionEditorProps> = ({ 
  content,
  onSectionChange,
  onServiceChange
}) => {

  const handleSectionInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'subtitle') {
      onSectionChange(name, value);
    }
  };

  const handleServiceInputChange = (
    index: number,
    field: keyof ServicePreview,
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    onServiceChange(index, field, e.target.value);
  };

  return (
    <div>
      <h4>Редактирование секции "Услуги"</h4>
      <FormGroup>
        <label htmlFor="services-title">Заголовок раздела:</label>
        <input 
          type="text" 
          id="services-title"
          name="title" 
          value={content.title || ''} 
          onChange={handleSectionInputChange} 
        />
      </FormGroup>

      <FormGroup>
        <label htmlFor="services-subtitle">Подзаголовок:</label>
        <input 
          type="text" 
          id="services-subtitle"
          name="subtitle" 
          value={content.subtitle || ''} 
          onChange={handleSectionInputChange} 
        />
      </FormGroup>

      <h3>Список услуг (превью для главной)</h3>
      <p style={{fontSize: '0.9rem', color: '#555', marginBottom: '1.5rem'}}>
        Примечание: здесь редактируются только данные, которые показываются на главной странице (название, описание, иконка). Полное управление услугами должно быть в отдельном разделе админ-панели.
      </p>

      {(content.servicesData || []).map((service, index) => (
        <ServiceCard key={service._id || index}>
          <h4>{service.title || 'Услуга без названия'}</h4>
          
          <FormGroup>
            <label htmlFor={`service-${index}-title`}>Название:</label>
            <input 
              id={`service-${index}-title`}
              type="text"
              value={service.title || ''}
              onChange={(e) => handleServiceInputChange(index, 'title', e)}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor={`service-${index}-description`}>Описание:</label>
            <textarea 
              id={`service-${index}-description`}
              value={service.description || ''}
              onChange={(e) => handleServiceInputChange(index, 'description', e)}
            />
          </FormGroup>
          
          <FormGroup style={{marginBottom: 0}}>
            <label htmlFor={`service-${index}-icon`}>URL иконки:</label>
            <input 
              id={`service-${index}-icon`}
              type="text"
              value={service.icon || ''}
              onChange={(e) => handleServiceInputChange(index, 'icon', e)}
              placeholder="Вставьте URL или загрузите на вкладке 'Изображения'"
            />
          </FormGroup>
        </ServiceCard>
      ))}
       {/* Здесь можно добавить кнопку для добавления новой услуги, если это требуется */}
    </div>
  );
};

export default ServicesSectionEditor; 
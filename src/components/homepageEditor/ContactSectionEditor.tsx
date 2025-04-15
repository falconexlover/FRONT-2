import React from 'react';
import styled from 'styled-components';
import { HomePageContent } from '../../types/HomePage';

// --- Styled Components --- 
const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 600;
    font-size: 0.9rem;
  }
  
  input {
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
`;

const PhoneInputWrapper = styled(FormGroup)`
  display: flex;
  align-items: center;
  gap: 1rem;
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--danger-color, #dc3545); 
  cursor: pointer;
  font-size: 1.5rem; /* Увеличим для лучшей кликабельности */
  padding: 0.2rem 0.5rem; /* Небольшие паддинги */
  line-height: 1;
  border-radius: 50%;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(220, 53, 69, 0.1);
  }

  &:disabled {
    color: #ccc;
    cursor: not-allowed;
    background-color: transparent;
  }
`;

// --- Component Props --- 
type ContactContent = HomePageContent['contact'];

interface ContactSectionEditorProps {
  content: NonNullable<ContactContent>;
  onSectionChange: (field: 'title' | 'address' | 'email' | 'vk', value: string) => void;
  onPhoneChange: (index: number, value: string) => void;
  // addPhone: () => void; // Добавление происходит через onPhoneChange, когда меняется последнее пустое поле
  removePhone: (index: number) => void;
  isSaving?: boolean;
}

// --- Component ---
const ContactSectionEditor: React.FC<ContactSectionEditorProps> = ({
  content,
  onSectionChange,
  onPhoneChange,
  removePhone,
  isSaving
}) => {

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === 'title' || name === 'address' || name === 'email' || name === 'vk') {
      onSectionChange(name, value);
    }
  };

  // Гарантируем, что всегда есть хотя бы одно поле для телефона, и последнее поле пустое для добавления нового
  const phones = content.phone && content.phone.length > 0 ? [...content.phone] : [''];
  if (phones.length === 0 || phones[phones.length - 1] !== '') {
      phones.push(''); 
  }

  return (
    <div>
      <h4>Редактирование секции "Контакты"</h4>
      <FormGroup>
        <label htmlFor="contact-title">Заголовок раздела:</label>
        <input 
          id="contact-title"
          name="title"
          type="text"
          value={content.title || ''}
          onChange={handleInputChange}
          disabled={isSaving}
        />
      </FormGroup>
      
      <FormGroup>
        <label htmlFor="contact-address">Адрес:</label>
        <input 
          id="contact-address"
          name="address"
          type="text"
          value={content.address || ''}
          onChange={handleInputChange}
          disabled={isSaving}
        />
      </FormGroup>
      
      <label style={{fontWeight: 600, marginBottom: '0.5rem', display: 'block', fontSize: '0.9rem'}}>Телефоны:</label>
      {phones.map((phone, index) => (
         <PhoneInputWrapper key={`phone-${index}`}>
          <div style={{ flexGrow: 1 }}>
           <input
             id={`contact-phone-${index}`}
             type="tel"
             value={phone || ''} // Убедимся что value не null/undefined
             onChange={(e) => onPhoneChange(index, e.target.value)}
             placeholder={index === phones.length -1 ? "+7 (XXX) XXX-XX-XX (добавить)" : "+7 (XXX) XXX-XX-XX"}
             disabled={isSaving}
             style={{ marginBottom: 0 }} // Убираем нижний отступ у инпута внутри flex
           />
          </div>
          {/* Показываем кнопку удаления для всех, кроме последнего пустого поля */} 
          {index < phones.length - 1 && (
              <RemoveButton 
                 type="button" 
                 onClick={() => removePhone(index)} 
                 disabled={isSaving}
                 title="Удалить телефон"
              >
                 &times;
            </RemoveButton>
         )}
       </PhoneInputWrapper>
      ))}
      
      <FormGroup style={{marginTop: '1.5rem'}}> {/* Добавим отступ сверху */} 
        <label htmlFor="contact-vk">ВКонтакте (ссылка):</label>
        <input 
          id="contact-vk"
          name="vk"
          type="url"
          value={content.vk || ''}
          onChange={handleInputChange}
          disabled={isSaving}
          placeholder="https://vk.com/lesnoy_dvorik"
        />
      </FormGroup>
      
      <FormGroup style={{marginTop: '1.5rem'}}> {/* Оставляем email для внутренних целей */} 
        <label htmlFor="contact-email">Email (для системы):</label>
        <input 
          id="contact-email"
          name="email"
          type="email"
          value={content.email || ''}
          onChange={handleInputChange}
          disabled={isSaving}
        />
      </FormGroup>
    </div>
  );
};

export default ContactSectionEditor; 
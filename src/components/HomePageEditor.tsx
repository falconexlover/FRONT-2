import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import HomeImageUploader from './HomeImageUploader';
import { 
  HomePageContent, 
  loadHomePageContent, 
  saveHomePageContent 
} from '../utils/homePageUtils';

interface HomePageEditorProps {
  onClose: () => void;
}

const EditorContainer = styled(motion.div)`
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  max-width: 900px;
  width: 100%;
  max-height: 85vh;
  overflow-y: auto;
`;

const EditorHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid #eee;
  padding-bottom: 1rem;
  
  h2 {
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
  }
`;

const TabsContainer = styled.div`
  display: flex;
  gap: 1rem;
  border-bottom: 1px solid #eee;
  margin-bottom: 2rem;
`;

const TabButton = styled.button<{ active: boolean }>`
  padding: 0.8rem 1.2rem;
  background-color: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--dark-color)'};
  border: none;
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  
  &:hover {
    background-color: ${props => props.active ? 'var(--primary-color)' : '#f0f0f0'};
  }
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  color: #777;
  font-size: 1.5rem;
  cursor: pointer;
  transition: color 0.3s;
  
  &:hover {
    color: var(--dark-color);
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 600;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
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
    min-height: 100px;
    resize: vertical;
  }
`;

const SaveButton = styled.button`
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
  margin-top: 1rem;
  
  &:hover {
    background-color: var(--dark-color);
  }
`;

const RoomCard = styled.div`
  border: 1px solid #eee;
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  
  h4 {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const ServiceCard = styled.div`
  border: 1px solid #eee;
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  
  h4 {
    margin-bottom: 1rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;

const SuccessMessage = styled.div`
  color: var(--primary-color);
  background-color: rgba(33, 113, 72, 0.1);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  background-color: rgba(255, 0, 0, 0.1);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
`;

const LoadingIndicator = styled.div`
  color: var(--primary-color);
  padding: 0.8rem;
  border-radius: var(--radius-sm);
  margin-bottom: 1.5rem;
`;

const HomePageEditor: React.FC<HomePageEditorProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'banner' | 'about' | 'rooms' | 'services' | 'contact' | 'images'>('banner');
  const [content, setContent] = useState<HomePageContent>(loadHomePageContent());
  const [success, setSuccess] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  
  const loadContent = async () => {
    try {
      const data = await loadHomePageContent();
      setContent(data);
      setIsLoading(false);
    } catch (err) {
      setError('Ошибка загрузки данных');
      setIsLoading(false);
    }
  };
  
  useEffect(() => {
    loadContent();
  }, [loadContent]);
  
  const handleInputChange = (section: keyof HomePageContent, field: string, value: string) => {
    setContent((prev: HomePageContent) => ({
      ...prev,
      [section]: {
        // @ts-ignore - Оставляем игнор, т.к. структура разная, но для простых полей сработает
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const handleRoomChange = (index: number, field: keyof HomePageContent['rooms']['roomsData'][0], value: string) => {
    setContent((prev: HomePageContent) => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        roomsData: prev.rooms.roomsData.map((room, i) =>
          i === index ? { ...room, [field]: value } : room
        )
      }
    }));
  };
  
  const handleServiceChange = (index: number, field: keyof HomePageContent['services']['servicesData'][0], value: string) => {
    setContent((prev: HomePageContent) => ({
      ...prev,
      services: {
        ...prev.services,
        servicesData: prev.services.servicesData.map((service, i) =>
          i === index ? { ...service, [field]: value } : service
        )
      }
    }));
  };
  
  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveHomePageContent(content);
      setSuccess('Контент главной страницы успешно сохранен! Обновите страницу, чтобы увидеть изменения.');
      setTimeout(() => {
        setSuccess(null);
      }, 5000);
    } catch (err) {
      setError('Ошибка сохранения данных');
    }
    setIsSaving(false);
  };
  
  const handlePhoneChange = (index: number, value: string) => {
    setContent((prev: HomePageContent) => { // Указываем тип HomePageContent
      const newPhones = [...(prev.contact.phone || [])];
      newPhones[index] = value;
      while (newPhones.length > 0 && !newPhones[newPhones.length - 1]) {
         newPhones.pop();
      }
      return {
        ...prev,
        contact: { ...prev.contact, phone: newPhones },
      };
    });
  };
  
  if (isLoading) {
    return (
      <EditorContainer>
        <LoadingIndicator>Загрузка редактора...</LoadingIndicator>
      </EditorContainer>
    );
  }
  
  return (
    <EditorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <EditorHeader>
        <h2>Редактирование главной страницы</h2>
        <CloseButton onClick={onClose} disabled={isSaving}>×</CloseButton>
      </EditorHeader>
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      
      <TabsContainer>
        <TabButton active={activeTab === 'banner'} onClick={() => setActiveTab('banner')} disabled={isSaving}>Баннер</TabButton>
        <TabButton active={activeTab === 'about'} onClick={() => setActiveTab('about')} disabled={isSaving}>О нас</TabButton>
        <TabButton active={activeTab === 'rooms'} onClick={() => setActiveTab('rooms')} disabled={isSaving}>Номера</TabButton>
        <TabButton active={activeTab === 'services'} onClick={() => setActiveTab('services')} disabled={isSaving}>Услуги</TabButton>
        <TabButton active={activeTab === 'contact'} onClick={() => setActiveTab('contact')} disabled={isSaving}>Контакты</TabButton>
        <TabButton active={activeTab === 'images'} onClick={() => setActiveTab('images')} disabled={isSaving}>Изображения</TabButton>
      </TabsContainer>
      
      {activeTab === 'banner' && (
        <div>
          <FormGroup>
            <label htmlFor="banner-title">Заголовок баннера</label>
            <input 
              id="banner-title"
              type="text"
              value={content.banner.title}
              onChange={(e) => handleInputChange('banner', 'title', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="banner-subtitle">Подзаголовок баннера</label>
            <input 
              id="banner-subtitle"
              type="text"
              value={content.banner.subtitle}
              onChange={(e) => handleInputChange('banner', 'subtitle', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="banner-button">Текст кнопки</label>
            <input 
              id="banner-button"
              type="text"
              value={content.banner.buttonText}
              onChange={(e) => handleInputChange('banner', 'buttonText', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <SaveButton onClick={handleSave} disabled={isSaving}>
             {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </SaveButton>
        </div>
      )}
      
      {activeTab === 'about' && (
        <div>
          <FormGroup>
            <label htmlFor="about-title">Заголовок раздела "О нас"</label>
            <input 
              id="about-title"
              type="text"
              value={content.about.title}
              onChange={(e) => handleInputChange('about', 'title', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="about-content">Содержание</label>
            <textarea 
              id="about-content"
              value={content.about.content}
              onChange={(e) => handleInputChange('about', 'content', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <SaveButton onClick={handleSave} disabled={isSaving}>
             {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </SaveButton>
        </div>
      )}
      
      {activeTab === 'rooms' && (
        <div>
          <FormGroup>
            <label htmlFor="rooms-title">Заголовок раздела "Номера"</label>
            <input 
              id="rooms-title"
              type="text"
              value={content.rooms?.title || ''}
              onChange={(e) => handleInputChange('rooms', 'title', e.target.value)} 
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="rooms-subtitle">Подзаголовок</label>
            <input 
              id="rooms-subtitle"
              type="text"
              value={content.rooms?.subtitle || ''}
              onChange={(e) => handleInputChange('rooms', 'subtitle', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <h3>Список номеров (редактирование данных для отображения на главной)</h3>
          {(content.rooms?.roomsData || []).map((room, index) => (
            <RoomCard key={room.id || index}>
              <h4><span>{room.title}</span></h4>
              
              <FormGroup>
                <label htmlFor={`room-${index}-title`}>Название</label>
                <input 
                  id={`room-${index}-title`}
                  type="text"
                  value={room.title}
                  onChange={(e) => handleRoomChange(index, 'title', e.target.value)}
                  disabled={isSaving}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`room-${index}-description`}>Описание</label>
                <textarea 
                  id={`room-${index}-description`}
                  value={room.description}
                  onChange={(e) => handleRoomChange(index, 'description', e.target.value)}
                  disabled={isSaving}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`room-${index}-price`}>Цена</label>
                <input 
                  id={`room-${index}-price`}
                  type="text"
                  value={room.price}
                  onChange={(e) => handleRoomChange(index, 'price', e.target.value)}
                  disabled={isSaving}
                />
              </FormGroup>
            </RoomCard>
          ))}
          
          <SaveButton onClick={handleSave} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </SaveButton>
        </div>
      )}
      
      {activeTab === 'services' && (
        <div>
          <FormGroup>
            <label htmlFor="services-title">Заголовок раздела "Услуги"</label>
            <input 
              id="services-title"
              type="text"
              value={content.services?.title || ''}
              onChange={(e) => handleInputChange('services', 'title', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="services-subtitle">Подзаголовок</label>
            <input 
              id="services-subtitle"
              type="text"
              value={content.services?.subtitle || ''}
              onChange={(e) => handleInputChange('services', 'subtitle', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <h3>Список услуг</h3>
          {(content.services?.servicesData || []).map((service, index) => (
            <ServiceCard key={service.id || index}>
              <h4><span>{service.title}</span></h4>
              
              <FormGroup>
                <label htmlFor={`service-${index}-title`}>Название</label>
                <input 
                  id={`service-${index}-title`}
                  type="text"
                  value={service.title}
                  onChange={(e) => handleServiceChange(index, 'title', e.target.value)}
                  disabled={isSaving}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`service-${index}-description`}>Описание</label>
                <textarea 
                  id={`service-${index}-description`}
                  value={service.description}
                  onChange={(e) => handleServiceChange(index, 'description', e.target.value)}
                  disabled={isSaving}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`service-${index}-icon`}>Иконка (Font Awesome)</label>
                <input 
                  id={`service-${index}-icon`}
                  type="text"
                  value={service.icon}
                  onChange={(e) => handleServiceChange(index, 'icon', e.target.value)}
                   placeholder="например, fas fa-concierge-bell"
                  disabled={isSaving}
                />
              </FormGroup>
            </ServiceCard>
          ))}
          
          <SaveButton onClick={handleSave} disabled={isSaving}>
             {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </SaveButton>
        </div>
      )}
      
      {activeTab === 'contact' && (
        <div>
          <FormGroup>
            <label htmlFor="contact-title">Заголовок "Контакты"</label>
            <input 
              id="contact-title"
              type="text"
              value={content.contact?.title || ''}
              onChange={(e) => handleInputChange('contact', 'title', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-address">Адрес</label>
            <input 
              id="contact-address"
              type="text"
              value={content.contact?.address || ''}
              onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-phone1">Телефон 1</label>
            <input 
              id="contact-phone1"
              type="text"
              value={content.contact?.phone?.[0] || ''}
              onChange={(e) => handlePhoneChange(0, e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-phone2">Телефон 2</label>
            <input 
              id="contact-phone2"
              type="text"
              value={content.contact?.phone?.[1] || ''}
              onChange={(e) => handlePhoneChange(1, e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-email">Email</label>
            <input 
              id="contact-email"
              type="email"
              value={content.contact?.email || ''}
              onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
              disabled={isSaving}
            />
          </FormGroup>
          
          <SaveButton onClick={handleSave} disabled={isSaving}>
             {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </SaveButton>
        </div>
      )}
      
      {activeTab === 'images' && (
        <div>
          <h3>Загрузка изображений главной страницы</h3>
          <p>Здесь вы можете управлять изображениями, используемыми в разных секциях главной страницы (например, фон баннера, изображения "О нас" и т.д.).</p>
          <HomeImageUploader />
          <p style={{marginTop: '1rem', color: 'orange'}}>Примечание: Загрузка изображений для главной страницы пока не подключена к API.</p>
        </div>
      )}
    </EditorContainer>
  );
};

export default HomePageEditor; 
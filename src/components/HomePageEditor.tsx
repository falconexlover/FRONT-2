import React, { useState } from 'react';
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

const HomePageEditor: React.FC<HomePageEditorProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'banner' | 'about' | 'rooms' | 'services' | 'contact' | 'images'>('banner');
  const [content, setContent] = useState<HomePageContent>(loadHomePageContent());
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleInputChange = (section: keyof HomePageContent, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };
  
  const handleRoomChange = (roomId: string, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      rooms: {
        ...prev.rooms,
        roomsData: prev.rooms.roomsData.map(room => 
          room.id === roomId ? { ...room, [field]: value } : room
        )
      }
    }));
  };
  
  const handleServiceChange = (serviceId: string, field: string, value: string) => {
    setContent(prev => ({
      ...prev,
      services: {
        ...prev.services,
        servicesData: prev.services.servicesData.map(service => 
          service.id === serviceId ? { ...service, [field]: value } : service
        )
      }
    }));
  };
  
  const handleSave = () => {
    saveHomePageContent(content);
    setSuccess('Контент главной страницы успешно сохранен! Обновите страницу, чтобы увидеть изменения.');
    setTimeout(() => {
      setSuccess(null);
    }, 5000);
  };
  
  return (
    <EditorContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      transition={{ duration: 0.3 }}
    >
      <EditorHeader>
        <h2>Редактирование главной страницы</h2>
        <CloseButton onClick={onClose}>×</CloseButton>
      </EditorHeader>
      
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      <TabsContainer>
        <TabButton 
          active={activeTab === 'banner'} 
          onClick={() => setActiveTab('banner')}
        >
          Баннер
        </TabButton>
        <TabButton 
          active={activeTab === 'about'} 
          onClick={() => setActiveTab('about')}
        >
          О нас
        </TabButton>
        <TabButton 
          active={activeTab === 'rooms'} 
          onClick={() => setActiveTab('rooms')}
        >
          Номера
        </TabButton>
        <TabButton 
          active={activeTab === 'services'} 
          onClick={() => setActiveTab('services')}
        >
          Услуги
        </TabButton>
        <TabButton 
          active={activeTab === 'contact'} 
          onClick={() => setActiveTab('contact')}
        >
          Контакты
        </TabButton>
        <TabButton 
          active={activeTab === 'images'} 
          onClick={() => setActiveTab('images')}
        >
          Изображения
        </TabButton>
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
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="banner-subtitle">Подзаголовок баннера</label>
            <input 
              id="banner-subtitle"
              type="text"
              value={content.banner.subtitle}
              onChange={(e) => handleInputChange('banner', 'subtitle', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="banner-button">Текст кнопки</label>
            <input 
              id="banner-button"
              type="text"
              value={content.banner.buttonText}
              onChange={(e) => handleInputChange('banner', 'buttonText', e.target.value)}
            />
          </FormGroup>
          
          <SaveButton onClick={handleSave}>Сохранить изменения</SaveButton>
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
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="about-content">Содержание</label>
            <textarea 
              id="about-content"
              value={content.about.content}
              onChange={(e) => handleInputChange('about', 'content', e.target.value)}
            />
          </FormGroup>
          
          <SaveButton onClick={handleSave}>Сохранить изменения</SaveButton>
        </div>
      )}
      
      {activeTab === 'rooms' && (
        <div>
          <FormGroup>
            <label htmlFor="rooms-title">Заголовок раздела "Номера"</label>
            <input 
              id="rooms-title"
              type="text"
              value={content.rooms.title}
              onChange={(e) => handleInputChange('rooms', 'title', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="rooms-subtitle">Подзаголовок</label>
            <input 
              id="rooms-subtitle"
              type="text"
              value={content.rooms.subtitle}
              onChange={(e) => handleInputChange('rooms', 'subtitle', e.target.value)}
            />
          </FormGroup>
          
          <h3>Список номеров</h3>
          
          {content.rooms.roomsData.map(room => (
            <RoomCard key={room.id}>
              <h4>
                <span>{room.title}</span>
              </h4>
              
              <FormGroup>
                <label htmlFor={`room-${room.id}-title`}>Название номера</label>
                <input 
                  id={`room-${room.id}-title`}
                  type="text"
                  value={room.title}
                  onChange={(e) => handleRoomChange(room.id, 'title', e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`room-${room.id}-description`}>Описание</label>
                <textarea 
                  id={`room-${room.id}-description`}
                  value={room.description}
                  onChange={(e) => handleRoomChange(room.id, 'description', e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`room-${room.id}-price`}>Цена</label>
                <input 
                  id={`room-${room.id}-price`}
                  type="text"
                  value={room.price}
                  onChange={(e) => handleRoomChange(room.id, 'price', e.target.value)}
                />
              </FormGroup>
            </RoomCard>
          ))}
          
          <SaveButton onClick={handleSave}>Сохранить изменения</SaveButton>
        </div>
      )}
      
      {activeTab === 'services' && (
        <div>
          <FormGroup>
            <label htmlFor="services-title">Заголовок раздела "Услуги"</label>
            <input 
              id="services-title"
              type="text"
              value={content.services.title}
              onChange={(e) => handleInputChange('services', 'title', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="services-subtitle">Подзаголовок</label>
            <input 
              id="services-subtitle"
              type="text"
              value={content.services.subtitle}
              onChange={(e) => handleInputChange('services', 'subtitle', e.target.value)}
            />
          </FormGroup>
          
          <h3>Список услуг</h3>
          
          {content.services.servicesData.map(service => (
            <ServiceCard key={service.id}>
              <h4>
                <span>{service.title}</span>
              </h4>
              
              <FormGroup>
                <label htmlFor={`service-${service.id}-title`}>Название услуги</label>
                <input 
                  id={`service-${service.id}-title`}
                  type="text"
                  value={service.title}
                  onChange={(e) => handleServiceChange(service.id, 'title', e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`service-${service.id}-description`}>Описание</label>
                <textarea 
                  id={`service-${service.id}-description`}
                  value={service.description}
                  onChange={(e) => handleServiceChange(service.id, 'description', e.target.value)}
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor={`service-${service.id}-icon`}>Иконка (класс Font Awesome)</label>
                <input 
                  id={`service-${service.id}-icon`}
                  type="text"
                  value={service.icon}
                  onChange={(e) => handleServiceChange(service.id, 'icon', e.target.value)}
                />
              </FormGroup>
            </ServiceCard>
          ))}
          
          <SaveButton onClick={handleSave}>Сохранить изменения</SaveButton>
        </div>
      )}
      
      {activeTab === 'contact' && (
        <div>
          <FormGroup>
            <label htmlFor="contact-title">Заголовок раздела "Контакты"</label>
            <input 
              id="contact-title"
              type="text"
              value={content.contact.title}
              onChange={(e) => handleInputChange('contact', 'title', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-address">Адрес</label>
            <input 
              id="contact-address"
              type="text"
              value={content.contact.address}
              onChange={(e) => handleInputChange('contact', 'address', e.target.value)}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-phone1">Телефон 1</label>
            <input 
              id="contact-phone1"
              type="text"
              value={content.contact.phone[0] || ''}
              onChange={(e) => {
                const newPhones = [...content.contact.phone];
                newPhones[0] = e.target.value;
                setContent(prev => ({
                  ...prev,
                  contact: {
                    ...prev.contact,
                    phone: newPhones
                  }
                }));
              }}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-phone2">Телефон 2</label>
            <input 
              id="contact-phone2"
              type="text"
              value={content.contact.phone[1] || ''}
              onChange={(e) => {
                const newPhones = [...content.contact.phone];
                newPhones[1] = e.target.value;
                setContent(prev => ({
                  ...prev,
                  contact: {
                    ...prev.contact,
                    phone: newPhones
                  }
                }));
              }}
            />
          </FormGroup>
          
          <FormGroup>
            <label htmlFor="contact-email">Email</label>
            <input 
              id="contact-email"
              type="email"
              value={content.contact.email}
              onChange={(e) => handleInputChange('contact', 'email', e.target.value)}
            />
          </FormGroup>
          
          <SaveButton onClick={handleSave}>Сохранить изменения</SaveButton>
        </div>
      )}
      
      {activeTab === 'images' && (
        <div>
          <h3>Загрузка изображений</h3>
          <p>Здесь вы можете загрузить новые изображения для разных разделов главной страницы.</p>
          
          <HomeImageUploader />
        </div>
      )}
    </EditorContainer>
  );
};

export default HomePageEditor; 
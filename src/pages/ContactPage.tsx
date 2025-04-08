import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import YandexMap from '../components/YandexMap';
import { homePageService } from '../utils/api';
import { HomePageContent } from '../types/HomePage';

const ContactSection = styled.section`
  padding: 6rem 2rem;
  background-color: var(--light-color);
`;

const ContactContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  
  @media screen and (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 3rem;
  }
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  
  h1 {
    font-size: 2.8rem;
    color: var(--dark-color);
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    position: relative;
    
    &::before {
      content: '';
      position: absolute;
      width: 60px;
      height: 3px;
      background-color: var(--accent-color);
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 3px;
      background-color: var(--primary-color);
      bottom: -15px;
      left: calc(50% + 35px);
      transform: translateX(-50%);
    }
  }
`;

const ContactInfo = styled.div`
  h3 {
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    font-family: 'Playfair Display', serif;
  }
  
  p {
    margin-bottom: 1rem;
    color: #666;
    line-height: 1.7;
  }
`;

const ContactItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 1.5rem;
  
  i {
    width: 40px;
    height: 40px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 1.2rem;
    margin-right: 1rem;
  }
  
  .contact-info {
    h4 {
      font-size: 1.1rem;
      margin-bottom: 0.3rem;
      color: var(--dark-color);
    }
    
    p {
      color: #666;
      margin-bottom: 0;
    }
  }
`;

const MapContainer = styled.div`
  margin-top: 2rem;
  min-height: 400px;
  background-color: #f0f0f0;
  border-radius: var(--radius-md);
  overflow: hidden;
`;

const ContactForm = styled(motion.form)`
  padding: 2.5rem;
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  
  h3 {
    margin-bottom: 1.5rem;
    color: var(--primary-color);
    font-family: 'Playfair Display', serif;
  }
  
  .form-group {
    margin-bottom: 1.5rem;
  }
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 500;
  }
  
  input, textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 1rem;
    transition: var(--transition);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(33, 113, 72, 0.1);
    }
  }
  
  textarea {
    min-height: 150px;
    resize: vertical;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 0;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--accent-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SuccessMessage = styled(motion.div)`
  padding: 1rem;
  background-color: rgba(33, 113, 72, 0.1);
  border-left: 3px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  margin-top: 1rem;
`;

const ContactPage: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: ''
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const [contactInfo, setContactInfo] = useState<HomePageContent['contact'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const data = await homePageService.getHomePage();
        if (data && data.contact) {
          setContactInfo(data.contact);
        } else {
          setContactInfo({ 
            title: 'Контакты', 
            address: 'Московская область, г. Жуковский, ул. Нижегородская, д. 4', 
            phone: ['8 (498) 483 19 41', '8 (915) 120 17 44'], 
            email: '' 
          });
        }
      } catch (err) {
        console.error("Ошибка загрузки контактов для страницы Контакты:", err);
        setContactInfo({ 
          title: 'Контакты', 
          address: 'Московская область, г. Жуковский, ул. Нижегородская, д. 4', 
          phone: ['8 (498) 483 19 41', '8 (915) 120 17 44'], 
          email: '' 
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      setFormData({
        name: '',
        email: '',
        phone: '',
        message: ''
      });
      
      setTimeout(() => {
        setIsSubmitted(false);
      }, 5000);
    }, 1500);
  };
  
  const hotelCoordinates: [number, number] = [55.591259, 38.141982];
  
  return (
    <ContactSection id="contact">
      <SectionTitle>
        <h1>{contactInfo?.title || 'Контакты'}</h1>
      </SectionTitle>
      
      <ContactContainer>
        <ContactInfo>
          <h3>Как с нами связаться</h3>
          <p>Мы всегда рады ответить на ваши вопросы и помочь с бронированием. Свяжитесь с нами любым удобным способом.</p>
          
          {isLoading ? (
            <p>Загрузка контактов...</p>
          ) : contactInfo ? (
            <>
              <ContactItem>
                <i className="fas fa-map-marker-alt"></i>
                <div className="contact-info">
                  <h4>Адрес</h4>
                  <p>{contactInfo.address}</p>
                </div>
              </ContactItem>
              
              <ContactItem>
                <i className="fas fa-phone"></i>
                <div className="contact-info">
                  <h4>Телефон</h4>
                  {contactInfo.phone.map((phone, index) => (
                     <p key={index}><a href={`tel:+${phone.replace(/\D/g, '')}`}>{phone}</a></p>
                  ))}
                </div>
              </ContactItem>
              
              <ContactItem>
                <i className="fas fa-envelope"></i>
                <div className="contact-info">
                  <h4>Email</h4>
                  <p>{contactInfo.email}</p>
                </div>
              </ContactItem>
            </>
          ) : (
            <p>Не удалось загрузить контактную информацию.</p>
          )}
          
          <MapContainer>
            {!isLoading && contactInfo && (
               <YandexMap 
                address={contactInfo.address}
                coordinates={hotelCoordinates}
                zoom={16}
                height="400px"
              />
            )}
            {isLoading && <p>Загрузка карты...</p>}
          </MapContainer>
        </ContactInfo>
        
        <ContactForm
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
          onSubmit={handleSubmit}
        >
          <h3>Отправить сообщение</h3>
          
          <div className="form-group">
            <label htmlFor="name">Имя</label>
            <input 
              type="text" 
              id="name" 
              name="name" 
              value={formData.name}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input 
              type="email" 
              id="email" 
              name="email" 
              value={formData.email}
              onChange={handleChange}
              required 
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="phone">Телефон (необязательно)</label>
            <input 
              type="tel" 
              id="phone" 
              name="phone" 
              value={formData.phone}
              onChange={handleChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="message">Сообщение</label>
            <textarea 
              id="message" 
              name="message" 
              value={formData.message}
              onChange={handleChange}
              required
            ></textarea>
          </div>
          
          <SubmitButton type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Отправка...' : 'Отправить'}
          </SubmitButton>
          
          {isSubmitted && (
            <SuccessMessage
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              Сообщение успешно отправлено!
            </SuccessMessage>
          )}
        </ContactForm>
      </ContactContainer>
    </ContactSection>
  );
};

export default ContactPage; 
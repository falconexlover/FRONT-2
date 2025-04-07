// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Banner from '../components/Banner';
import About from '../components/About';
import Services from '../components/Services';
import Rooms from '../components/Rooms';
import YandexMap from '../components/YandexMap';
import { homepageService } from '../utils/api';
import { HomePageContent } from '../types/HomePage';
import { toast } from 'react-toastify';

// Начальное состояние (может быть null до загрузки)
const initialContent: HomePageContent | null = null;

const HomePage: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(initialContent);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка контента с API
  const loadContent = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await homepageService.getHomePage();
      setContent(data);
    } catch (err) {
      console.error("Ошибка загрузки контента главной страницы:", err);
      let message = 'Не удалось загрузить данные страницы.';
      if (err instanceof Error) {
        message = err.message;
      }
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);
  
  // Координаты отеля
  const hotelCoordinates: [number, number] = [55.591259, 38.141982]; 
  
  // Отображение загрузки
  if (isLoading) {
    return <LoadingPlaceholder>Загрузка страницы...</LoadingPlaceholder>;
  }

  // Отображение ошибки
  if (error) {
    return <ErrorPlaceholder>Ошибка загрузки: {error}</ErrorPlaceholder>;
  }

  // Если контент не загрузился (null)
  if (!content) {
    return <ErrorPlaceholder>Не удалось загрузить контент страницы.</ErrorPlaceholder>;
  }
  
  // Извлекаем нужные части контента для передачи
  const { banner, about, rooms, services, contact } = content;
  
  return (
    <>
      <Banner content={banner} />
      <About content={about} />
      <Rooms title={rooms?.title} subtitle={rooms?.subtitle} />
      <Services title={services?.title} subtitle={services?.subtitle} />
      <section id="contact" className="section" style={{ padding: '6rem 2rem', backgroundColor: 'white' }}>
        <div className="container">
          <SectionTitle>
            <h2>{contact.title}</h2>
          </SectionTitle>
          
          <InfoContainer>
            <InfoColumn>
              <h3>Контактная информация</h3>
              <ContactInfo>
                <ContactDetail>
                  <Icon className="fas fa-map-marker-alt" />
                  <div>
                    <h4>Адрес</h4>
                    <p>{contact.address}</p>
                  </div>
                </ContactDetail>
                
                <ContactDetail>
                  <Icon className="fas fa-phone" />
                  <div>
                    <h4>Телефон</h4>
                    {contact.phone.map((phone, index) => (
                      <p key={index}>
                        <a href={`tel:+${phone.replace(/\D/g, '')}`}>{phone}</a>
                      </p>
                    ))}
                  </div>
                </ContactDetail>
                
                <ContactDetail>
                  <Icon className="fas fa-envelope" />
                  <div>
                    <h4>Email</h4>
                    <p>{contact.email}</p>
                  </div>
                </ContactDetail>
              </ContactInfo>
            </InfoColumn>
            
            <MapColumn>
              <YandexMap 
                address={contact.address}
                coordinates={hotelCoordinates}
                zoom={16}
                height="450px"
              />
            </MapColumn>
          </InfoContainer>
        </div>
      </section>
    </>
  );
};

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  h2 {
    font-size: 2.5rem;
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

const InfoContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 3rem;
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const InfoColumn = styled.div`
  h3 {
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    margin-bottom: 2rem;
    color: var(--dark-color);
  }
`;

const MapColumn = styled.div`
  overflow: hidden;
  border-radius: var(--radius-md);
`;

const ContactInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ContactDetail = styled.div`
  display: flex;
  align-items: flex-start;
  
  div {
    h4 {
      font-size: 1.1rem;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }
    
    p {
      color: #666;
      margin-bottom: 0.3rem;
      line-height: 1.5;
    }
  }
`;

const Icon = styled.i`
  color: white;
  background-color: var(--primary-color);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 1rem;
  flex-shrink: 0;
`;

const LoadingPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 1.5rem;
  color: var(--text-color);
`;

const ErrorPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 80vh;
  font-size: 1.2rem;
  color: #e53935;
  padding: 2rem;
  text-align: center;
`;

export default HomePage; 
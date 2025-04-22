import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import YandexMap from '../components/YandexMap';
import ContactForm from '../components/ContactForm';
import { homePageService } from '../utils/api';
import { HomePageContent } from '../types/HomePage';
import PageContainer from '../components/ui/PageContainer';

// Добавляем стили для главного заголовка страницы
const PageTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  text-align: center;
  font-size: 2.8rem;
  margin-bottom: var(--space-xxl); /* 48px */
  font-weight: 600;

  @media (max-width: 768px) {
      font-size: 2.2rem;
      margin-bottom: var(--space-xl); /* 32px */
  }
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-xl); /* 32px - Уменьшил gap */

  @media (min-width: 992px) { /* Изменил брейкпоинт для 2 колонок */
    grid-template-columns: 1fr 1.2fr; /* Карта чуть шире */
  }
  @media (min-width: 768px) and (max-width: 991px) {
      grid-template-columns: 1fr; /* Планшет - одна колонка */
      gap: var(--space-xxl); /* На планшете увеличим отступ между блоками */
  }
`;

// Стилизуем заголовки h3 на странице
const SectionHeading = styled.h3`
  font-family: 'Playfair Display', serif;
  font-size: 2rem;
  color: var(--dark-color);
  margin-bottom: var(--space-xl); /* 32px */
  padding-bottom: var(--space-md); /* 16px */
  border-bottom: 2px solid var(--primary-color);
  position: relative;

  &::after { /* Добавляем декоративный элемент */
      content: '';
      position: absolute;
      left: 0;
      bottom: -7px; /* Позиционируем под основной линией */
      height: 5px;
      width: 60px;
      background-color: var(--accent-color);
      transition: width 0.3s ease;
  }

  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: var(--space-lg); /* 24px */
    padding-bottom: var(--space-sm); /* 8px */
    &::after {
        width: 45px; /* Уменьшаем ширину на мобильных */
    }
  }
`;

const ContactInfo = styled.div`
  /* Убираем стили для h3 и p отсюда, так как они теперь в SectionHeading и ContactItem */
`;

// Новый компонент для элемента контактной информации
const ContactItem = styled.div`
  display: flex;
  align-items: center; /* Выравниваем по центру */
  gap: var(--space-lg); /* 24px */
  margin-bottom: var(--space-xl); /* 32px */
  padding: var(--space-md); /* Добавляем внутренний отступ */
  border-radius: var(--radius-sm);
  transition: background-color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
      background-color: var(--bg-secondary);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm); /* Раскомментируем тень */
  }
  
  i { /* Стили для иконки */
    font-size: 1.8rem; /* Увеличиваем иконку */
    color: var(--primary-color);
    width: 25px; /* Фиксированная ширина для выравнивания */
    text-align: center;
    flex-shrink: 0;
  }

  div { /* Контейнер для текста справа от иконки */
    flex: 1;
  }

  strong { /* Стиль для заголовка (Адрес, Телефон...) */
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-sm); /* 8px */
    font-size: 1.1rem;
  }

  p, a { /* Стили для самого текста контакта */
    font-size: 1rem;
    color: var(--text-secondary);
    line-height: 1.6;
    margin: 0 0 var(--space-xs) 0; /* Уменьшаем нижний отступ для строк телефона */
  }
  
  a {
    display: block; /* Делаем ссылки блочными */
    color: var(--primary-color);
    text-decoration: none;
    word-break: break-word; /* Перенос длинных email */
    &:hover {
      text-decoration: underline;
    }
  }

  /* Адаптивность для ContactItem */
  @media (max-width: 576px) {
    gap: var(--space-md); /* 16px */
    margin-bottom: var(--space-lg); /* 24px */
    
    i { font-size: 1.5rem; width: 20px;}
    strong { font-size: 1rem; margin-bottom: var(--space-xs); /* 4px */}
    p, a { font-size: 0.9rem; }
  }
`;

// Обертка для формы
const ContactFormWrapper = styled.div`
  /* background-color: var(--bg-secondary); - Заменяем на градиент */
  background: linear-gradient(135deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  padding: var(--space-xl); /* 32px */
  border-radius: var(--radius-md);
  margin-top: var(--space-xxl); /* 48px */
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-md); /* Усиливаем тень */

  @media (max-width: 768px) {
      padding: var(--space-lg); /* 24px */
      margin-top: var(--space-xl); /* 32px */
  }
`;

// Стили для обертки карты
const MapWrapper = styled.div`
  iframe { /* Применяем стили непосредственно к iframe карты */
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-md);
  }
`;

// Спиннер загрузки
const LoadingSpinner = styled.div`
  margin: var(--space-xxl) auto; /* 48px */
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

// Улучшенное сообщение об ошибке
const ErrorMessage = styled.div` /* Меняем p на div */
  margin: var(--space-xxl) auto; /* 48px */
  padding: var(--space-lg) var(--space-xl); /* 24px 32px */
  background-color: rgba(var(--danger-color-rgb, 229, 57, 53), 0.1); /* Используем RGB для прозрачности */
  border: 1px solid var(--danger-color, #e53935);
  border-radius: var(--radius-md);
  color: var(--danger-color, #b71c1c); /* Более темный красный для текста */
  text-align: center;
  max-width: 600px;
  font-weight: 500;

  &::before { /* Добавляем иконку */
    content: '\f071'; /* Font Awesome восклицательный знак в треугольнике */
    font-family: 'Font Awesome 6 Free'; 
    font-weight: 900;
    margin-right: var(--space-sm); /* 8px */
    font-size: 1.2em;
  }
`;

// Координаты и адрес для Жуковского (можно использовать как фоллбэк или убрать, если уверены в API)
const ZHUKOVSKY_COORDINATES: [number, number] = [55.591259, 38.141982]; 

const ContactsPage: React.FC = () => {
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [mapHeight, setMapHeight] = useState(window.innerWidth <= 768 ? "300px" : "450px");

  useEffect(() => {
    const loadContent = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetchedContent = await homePageService.getHomePage();
        setContent(fetchedContent);
      } catch (err) {
        console.error("Failed to load home page content for contacts:", err);
        setError("Не удалось загрузить контактные данные. Попробуйте обновить страницу.");
      } finally {
        setLoading(false);
      }
    };

    loadContent();
  }, []);

  // Обновляем высоту карты при изменении размера окна
  useEffect(() => {
    const handleResize = () => {
      setMapHeight(window.innerWidth <= 768 ? "300px" : "450px");
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  if (loading) {
    return <PageContainer><LoadingSpinner /></PageContainer>;
  }

  if (error) {
    return <PageContainer><ErrorMessage>{error}</ErrorMessage></PageContainer>;
  }

  if (!content || !content.contact) {
     return <PageContainer><ErrorMessage>Контактная информация недоступна.</ErrorMessage></PageContainer>;
  }
  
  const { address, phone } = content.contact;
  const coordinates = content.contact.coordinates?.length === 2 ? content.contact.coordinates : ZHUKOVSKY_COORDINATES; // Используем координаты из API или фоллбэк

  return (
    <PageContainer>
      <PageTitle>Контакты</PageTitle>
      <ContentWrapper>
        {/* Колонка с контактной информацией */} 
        <ContactInfo>
          <SectionHeading>Наши контакты</SectionHeading>
          {address && (
            <ContactItem>
              <i className="fas fa-map-marker-alt"></i> 
              <div> 
                <strong>Адрес:</strong>
                <p>{address}</p>
              </div>
            </ContactItem>
          )}
          {phone && phone.length > 0 && (
            <ContactItem>
              <i className="fas fa-phone-alt"></i> 
              <div> 
                <strong>Телефон:</strong>
                {phone.map(p => (
                  <a key={p} href={`tel:${p.replace(/\D/g, '')}`}>{p}</a>
                ))}
              </div>
            </ContactItem>
          )}
          {content.contact.vk && (
            <ContactItem>
              <i className="fab fa-vk"></i>
              <div>
                <strong>ВКонтакте:</strong>
                <a href={content.contact.vk} target="_blank" rel="noopener noreferrer">{content.contact.vk}</a>
              </div>
            </ContactItem>
          )}
          {content.contact.openingHours && (
             <ContactItem>
              <i className="fas fa-clock"></i>
              <div>
                <strong>Часы работы:</strong>
                <p>{content.contact.openingHours}</p>
              </div>
            </ContactItem>
          )}
           {!content.contact.openingHours && ( 
            <ContactItem>
              <i className="fas fa-clock"></i>
              <div>
                <strong>Часы работы:</strong>
                <p>Круглосуточно (ресепшн)</p>
              </div>
            </ContactItem>
          )}
        </ContactInfo>

        {/* Колонка с картой */}
        <MapWrapper> 
          <SectionHeading>Как нас найти</SectionHeading>
          {address && ( 
            <YandexMap 
              address={address} 
              coordinates={coordinates as [number, number]} 
              height={mapHeight} 
              zoom={16} 
            />
          )}
        </MapWrapper>
      </ContentWrapper>

      {/* Секция с формой обратной связи в обертке */} 
      <ContactFormWrapper> 
        <SectionHeading>Напишите нам</SectionHeading>
        <ContactForm />
      </ContactFormWrapper>

    </PageContainer>
  );
};

export default ContactsPage; 
import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import ActionButton from '../components/ui/ActionButton';
import YandexMap from '../components/YandexMap';
import ContactForm from '../components/ContactForm';
// import PageContainer from '../components/ui/PageContainer'; // Закомментировано, пока компонент не создан
// import PageTitle from '../components/ui/PageTitle'; // Закомментировано, пока компонент не создан

// Временная обертка и заголовок
const TempPageContainer = styled.div`
  padding: 2rem 1rem; 
  max-width: 1200px;
  margin: 0 auto;
`;

const TempPageTitle = styled.h1`
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-size: 1.8rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
`;

const ContentWrapper = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
  margin-top: 2rem;

  @media (min-width: 768px) {
    grid-template-columns: 1fr 1fr; 
  }
`;

const ContactInfo = styled.div`
  h3 {
    color: var(--text-primary);
    margin-bottom: 1.5rem;
    font-size: 1.3rem;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.5rem;
  }

  p {
    color: var(--text-secondary);
    line-height: 1.7;
    margin-bottom: 1.2rem;
    font-size: 1rem;
    display: flex;
    align-items: baseline;
    gap: 0.8rem;

    strong {
        color: var(--text-primary);
        font-weight: 500;
        display: block;
        margin-bottom: 0.3rem;
        width: 100%;
    }
    
    span {
        line-height: 1.6;
    }
    
    a {
        display: block;
        margin-bottom: 0.2rem;
    }
    
    i {
        color: var(--primary-color);
        font-size: 1.2em;
        width: 1.3em;
        text-align: center;
        margin-top: 0.1em;
    }
  }
`;

// Координаты и адрес для Жуковского
const ZHUKOVSKY_COORDINATES: [number, number] = [55.591259, 38.141982]; 
const ZHUKOVSKY_ADDRESS = "Московская область, г. Жуковский, ул. Нижегородская, д. 4";
const PHONE_1 = "8 (498) 483 19 41";
const PHONE_2 = "8 (915) 120 17 44";
const EMAIL = "info@lesnoydvorik.ru"; // Используем email из футера

const ContactsPage: React.FC = () => {
  return (
    <TempPageContainer> {/* Заменить на PageContainer? */}
      <TempPageTitle>Контакты</TempPageTitle> {/* Заменить на PageTitle? */}

      <ContentWrapper>
        {/* Колонка с контактной информацией */} 
        <ContactInfo>
          <h3>Наши контакты</h3>
          <p>
            <i className="fas fa-map-marker-alt"></i> 
            <span> {/* Обертка для текста */} 
              <strong>Адрес:</strong>
              {ZHUKOVSKY_ADDRESS}
            </span>
          </p>
          <p>
            <i className="fas fa-phone-alt"></i> 
            <span> {/* Обертка для текста */} 
              <strong>Телефон:</strong>
              <a href={`tel:${PHONE_1.replace(/\D/g, '')}`}>{PHONE_1}</a>
              <a href={`tel:${PHONE_2.replace(/\D/g, '')}`}>{PHONE_2}</a>
            </span>
          </p>
          <p>
            <i className="fas fa-envelope"></i> 
            <span> {/* Обертка для текста */} 
              <strong>Email:</strong>
              <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
            </span>
          </p>
          {/* Можно добавить часы работы с иконкой */}
          <p>
            <i className="fas fa-clock"></i>
            <span>
              <strong>Часы работы:</strong>
              Круглосуточно (ресепшн)
            </span>
          </p>
        </ContactInfo>

        {/* Колонка с картой */}
        <div> {/* Добавим обертку для заголовка и карты */} 
          <h3>Как нас найти</h3>
          <YandexMap 
            address={ZHUKOVSKY_ADDRESS} 
            coordinates={ZHUKOVSKY_COORDINATES} 
            height="450px" // Увеличим высоту карты
          />
        </div>
      </ContentWrapper>

      {/* Секция с формой обратной связи */} 
      <div style={{marginTop: '3rem'}}> {/* Добавим отступ */} 
        <h3>Напишите нам</h3>
        <ContactForm />
      </div>

    </TempPageContainer>
  );
};

export default ContactsPage; 
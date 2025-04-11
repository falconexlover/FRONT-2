import React from 'react';
import styled from 'styled-components';
import ContactForm from '../components/ContactForm';
// import PageContainer from '../components/ui/PageContainer'; // Закомментировано, пока компонент не создан
// import PageTitle from '../components/ui/PageTitle'; // Закомментировано, пока компонент не создан
import YandexMap from '../components/YandexMap';

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
    margin-bottom: 1rem;
    font-size: 1rem;

    strong {
        color: var(--text-primary);
        font-weight: 500;
    }
  }

  a {
    color: var(--primary-color);
    text-decoration: none;
    &:hover {
        text-decoration: underline;
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
    <TempPageContainer> {/* Используем временный контейнер */}
      <TempPageTitle>Контакты</TempPageTitle> {/* Используем временный заголовок */}
      <ContentWrapper>
        <ContactInfo>
          <h3>Наши контакты</h3>
          <p>
            <strong>Адрес:</strong> <br />
            {ZHUKOVSKY_ADDRESS}
          </p>
          <p>
            <strong>Телефоны:</strong> <br />
            <a href={`tel:+${PHONE_1.replace(/\D/g, '')}`}>{PHONE_1}</a><br/>
            <a href={`tel:+${PHONE_2.replace(/\D/g, '')}`}>{PHONE_2}</a>
          </p>
          <p>
            <strong>Email:</strong> <br />
            <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
          </p>
          {/* Можно добавить актуальные часы работы, если они известны */}
          <p>
            <strong>Часы работы:</strong><br/>
            Круглосуточно (уточните по телефону)
          </p>
          
          <div style={{ marginTop: '2rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', overflow: 'hidden' }}> 
             <YandexMap 
                address={ZHUKOVSKY_ADDRESS} // Адрес Жуковского
                coordinates={ZHUKOVSKY_COORDINATES} // Координаты Жуковского
                zoom={16} // Можно настроить масштаб
                height="350px"
              />
          </div>

        </ContactInfo>

        <div>
          <h3>Отправьте нам сообщение</h3>
          <ContactForm /> 
        </div>
      </ContentWrapper>
    </TempPageContainer>
  );
};

export default ContactsPage; 
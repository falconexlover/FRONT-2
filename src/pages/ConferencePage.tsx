import React from 'react';
import styled from 'styled-components';

// --- Стили (похожие на PartyPage) ---
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: var(--text-primary);
`;

const PageTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 2.5rem;
  font-size: 2.5rem;
`;

const ContentSection = styled.section`
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const FeaturesList = styled.ul`
  list-style: disc;
  margin-left: 1.5rem;
  margin-bottom: 1.5rem;
  li {
    margin-bottom: 0.8rem;
    font-size: 1rem;
    line-height: 1.6;
  }
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); // Чуть шире для конференц-зала
  gap: 1rem;
  margin-top: 2rem;

  img {
    width: 100%;
    height: 220px; // Немного выше
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color-light);
  }
`;

const ImageGridContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
  background-color: var(--bg-primary); // Слегка отличный фон
`;

const Skeleton = styled.div`
  width: 100%;
  height: 220px; // Соответствует img
  background-color: var(--border-color-light);
  border-radius: var(--radius-sm);
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% { background-color: var(--border-color-light); }
    50% { background-color: var(--bg-secondary); }
    100% { background-color: var(--border-color-light); }
  }
`;

const ContactInfo = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-primary);
  border: 1px dashed var(--primary-color);
  border-radius: var(--radius-sm);
  text-align: center;

  p {
    margin-bottom: 0.5rem;
    font-size: 1.1rem;
  }

  a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

// --- Компонент страницы ---

const ConferencePage: React.FC = () => {
  return (
    <PageWrapper>
      <PageTitle>Конференц-зал в "Лесном дворике"</PageTitle>

      <ContentSection>
        <Description>
          Ищете удобное и современное пространство для проведения деловых встреч, 
          семинаров, тренингов или презентаций в Жуковском? Наш конференц-зал 
          в санатории-профилактории «Лесной дворик» идеально подойдет для ваших мероприятий.
        </Description>

        <h3>Наши преимущества:</h3>
        <FeaturesList>
          <li>Просторный зал с гибкой рассадкой (до XX человек - **уточнить вместимость**).</li>
          <li>Современное оборудование: проектор, экран, флипчарт, звуковая система (**уточнить наличие**).</li>
          <li>Стабильный Wi-Fi доступ для всех участников.</li>
          <li>Возможность организации кофе-брейков и комплексных обедов.</li>
          <li>Комфортная атмосфера и живописная территория для перерывов.</li>
          <li>Удобное расположение и собственная парковка.</li>
        </FeaturesList>

        {/* Секция для фотографий */}
        <h3>Фотогалерея зала:</h3>
        <ImageGridContainer>
          <ImageGrid>
            {/* Отображаем 4 скелетона как плейсхолдеры */}
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} />
            ))}
            {/* Можно заменить на реальные фото из IMAGES.GALLERY.CONFERENCE, если они есть */}
            {/* {IMAGES.GALLERY.CONFERENCE.map((imgSrc, index) => (
              <img key={index} src={imgSrc} alt={`Конференц-зал фото ${index + 1}`} />
            ))} */}
          </ImageGrid>
        </ImageGridContainer>

        <ContactInfo>
          <p>Планируете мероприятие?</p>
          <p>
            Свяжитесь с нами для уточнения деталей, доступности и бронирования зала:
            <br />
            {/* Используем тот же телефон, что и для праздников? */}
            <a href="tel:+79169266514">8 (916) 926-65-14</a> 
          </p>
        </ContactInfo>
      </ContentSection>

    </PageWrapper>
  );
};

export default ConferencePage; 
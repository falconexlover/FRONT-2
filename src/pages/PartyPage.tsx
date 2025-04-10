import React from 'react';
import styled from 'styled-components';
import { IMAGES } from '../assets/placeholders'; // Импортируем плейсхолдеры

// --- Стили ---
// Используем стили, похожие на другие страницы, например, SaunaPage или ConferencePage
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
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-top: 2rem;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color-light);
  }
`;

// --- Добавляем компонент Skeleton ---
const Skeleton = styled.div`
  width: 100%;
  height: 200px; // Та же высота, что и у img
  background-color: var(--border-color-light); // Цвет фона скелетона
  border-radius: var(--radius-sm);
  animation: pulse 1.5s infinite ease-in-out;

  @keyframes pulse {
    0% {
      background-color: var(--border-color-light);
    }
    50% {
      background-color: var(--bg-secondary); // Более светлый оттенок для пульсации
    }
    100% {
      background-color: var(--border-color-light);
    }
  }
`;
// --- Конец добавления Skeleton ---

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
    &:hover {
      text-decoration: underline;
    }
  }
`;

const VKLink = styled.a`
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// --- Компонент страницы ---

const PartyPage: React.FC = () => {
  return (
    <PageWrapper>
      <PageTitle>Детские праздники в "Лесном дворике"</PageTitle>

      <ContentSection>
        <Description>
          Друзья, рады сообщить вам, что санаторий-профилакторий «Лесной дворик» в г. Жуковский 
          предлагает проведение детских мероприятий и не только... Хотите устроить ребенку 
          настоящий праздник? Давайте вместе сделаем его незабываемым!
        </Description>

        <h3>Что мы предлагаем:</h3>
        <FeaturesList>
          <li>Собственная кухня с детским и взрослым меню - вкусно будет всем!</li>
          <li>Праздничное оформление мероприятия.</li>
          <li>Прекрасная лесопарковая зона с транспортной доступностью.</li>
          <li>Собственная парковка.</li>
          <li>Музыкальная колонка и ТВ с W-Fi.</li>
          <li>Возможность разместиться на ночь.</li>
          <li>Подбор аниматоров.</li>
        </FeaturesList>

         <ImageGrid>
          {/* Заменяем рендеринг img на Skeleton */}
          {IMAGES.GALLERY.PARTY.map((_, index) => (
            <Skeleton key={index} />
          ))}
        </ImageGrid>

        <ContactInfo>
          <p>Скорее звоните и узнавайте подробности!</p>
          <p>
            Телефон: <a href="tel:+79169266514">8 (916) 926-65-14</a> 
          </p>
          <p style={{ marginTop: '1rem', fontSize: '1rem' }}>
            Наш адрес: г. Жуковский, ул. Нижегородская, д. 4, санаторий-профилакторий «Лесной дворик».
          </p>
          <p style={{ marginTop: '1.5rem', fontSize: '1rem' }}>
            А в нашем сообществе ВК много интересного и полезного для отдыха и работы: 
            <VKLink href="https://vk.com/lesnoy_dvorik" target="_blank" rel="noopener noreferrer">@lesnoy_dvorik</VKLink> - подписывайтесь!
          </p>
        </ContactInfo>

      </ContentSection>

      {/* Можно добавить другие секции: отзывы, варианты программ и т.д. */}

    </PageWrapper>
  );
};

export default PartyPage; 
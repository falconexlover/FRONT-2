import React from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';

// --- ОПРЕДЕЛЕНИЯ СТИЛЕЙ --- 
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
  margin-bottom: 3rem; 
  font-size: 2.5rem;
  font-weight: 600; /* Задаем жирность */
  letter-spacing: 0.5px; /* Добавляем межбуквенное расстояние */
  position: relative;
  padding-bottom: 0.75rem; /* Добавляем отступ снизу для линии */

  &:after {
    content: '';
    position: absolute;
    bottom: 0; /* Линия теперь под текстом */
    left: 50%;
    transform: translateX(-50%);
    width: 80px; /* Делаем линию шире */
    height: 3px; /* Делаем линию чуть толще */
    background-color: var(--accent-color);
    border-radius: 1.5px; /* Слегка скругляем */
  }
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

const FeatureItem = styled.li`
  margin-bottom: 0.8rem;
  font-size: 1rem;
  line-height: 1.6;
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  
  i {
    font-size: 1.2rem;
    color: var(--primary-color);
    width: 1.5em;
    text-align: center;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  margin-left: 0;
  padding-left: 0; // Убираем отступ по умолчанию
  margin-bottom: 1.5rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;

  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color-light);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: scale(1.03);
      box-shadow: var(--shadow-md);
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    img {
      height: 180px;
    }
  }
`;

const ImageGridContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
  background-color: var(--bg-primary);
`;

const Skeleton = styled.div`
  width: 100%;
  height: 220px;
  background-color: var(--bg-secondary, #f0f0f0); /* Базовый цвет фона */
  background-image: linear-gradient(
    90deg,
    var(--bg-secondary, #f0f0f0) 0px,
    var(--border-color-light, #e0e0e0) 40px,
    var(--bg-secondary, #f0f0f0) 80px
  ); /* Градиент для мерцания */
  background-size: 600px; /* Ширина градиента */
  border-radius: var(--radius-sm);
  animation: shimmer 1.8s infinite linear; /* Новая анимация */
  position: relative; /* Для overflow */
  overflow: hidden; /* Скрываем градиент за пределами */
  transition: background-color 0.2s ease; /* Для ховера */

  @keyframes shimmer {
    0% {
      background-position: -600px 0; /* Начало градиента слева */
    }
    100% {
      background-position: 600px 0; /* Конец градиента справа */
    }
  }
  
  &:hover {
      background-color: var(--border-color-light, #e0e0e0); /* Слегка темнее при наведении */
  }
`;

const ContactInfo = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background-color: var(--bg-secondary); /* Слегка другой фон */
  border: 1px solid var(--border-color);
  border-top: 3px solid var(--primary-color); /* Акцентная верхняя граница */
  border-radius: 0 0 var(--radius-md) var(--radius-md); /* Скругление только снизу */
  text-align: center;
  box-shadow: var(--shadow-md);

  .call-to-action { /* Класс для стилизации призыва */
    font-size: 1.3rem; /* Крупнее */
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.5rem; /* Больше отступ снизу */
  }

  p {
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
    color: var(--text-secondary);

    &:last-of-type {
        margin-bottom: 0; /* Убираем нижний отступ у последнего параграфа перед кнопкой */
    }
  }

  a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const BookButton = styled.button`
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.9rem 2rem;
  background-color: var(--primary-color);
  color: var(--text-on-primary-bg);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition), transform 0.2s ease, box-shadow 0.2s ease;
  text-align: center;
  box-shadow: var(--shadow-sm);

  &:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
  }
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
`;
// --- КОНЕЦ ОПРЕДЕЛЕНИЙ СТИЛЕЙ ---

// --- Варианты анимации --- 
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
  })
};

// --- Константы --- 
const CONTACT_PHONE_NUMBER = '+79169266514';
const CONTACT_PHONE_NUMBER_DISPLAY = '8 (916) 926-65-14';
const SKELETON_COUNT = 4;

// --- Основной компонент страницы --- 
const ConferencePage: React.FC = () => {

  const handleBookClick = () => {
    console.log('Клик по кнопке "Забронировать зал". Логика не реализована.');
    // TODO: Реализовать логику бронирования (модальное окно, переход и т.д.)
  };

  return (
    <PageWrapper>
      <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={0}>
        <PageTitle>Конференц-зал в "Лесном дворике"</PageTitle>
      </motion.div>

      <ContentSection>
        {/* Разметка описания и преимуществ в две колонки */}
        <TwoColumnLayout>
          <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={1}>
            <Description>
              Ищете удобное и современное пространство для проведения деловых встреч,
              семинаров, тренингов или презентаций в Жуковском? Наш конференц-зал
              в санатории-профилактории «Лесной дворик» идеально подойдет для ваших мероприятий.
            </Description>
          </motion.div>

          <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={1.2}>
            <h3>Наши преимущества:</h3>
            <FeaturesList>
              <FeatureItem><i className="fas fa-users"></i>Просторный зал с гибкой рассадкой (до 50 человек).</FeatureItem>
              <FeatureItem><i className="fas fa-tv"></i>Современное оборудование: проектор, экран, флипчарт, звуковая система.</FeatureItem>
              <FeatureItem><i className="fas fa-wifi"></i>Стабильный Wi-Fi доступ для всех участников.</FeatureItem>
              <FeatureItem><i className="fas fa-coffee"></i>Возможность организации кофе-брейков и комплексных обедов.</FeatureItem>
              <FeatureItem><i className="fas fa-tree"></i>Комфортная атмосфера и живописная территория для перерывов.</FeatureItem>
              <FeatureItem><i className="fas fa-parking"></i>Удобное расположение и собственная парковка.</FeatureItem>
            </FeaturesList>
          </motion.div>
        </TwoColumnLayout>

        {/* Разметка галереи */}
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={2}>
          <h3>Фотогалерея зала:</h3>
          <ImageGridContainer>
            <ImageGrid>
              {Array.from({ length: SKELETON_COUNT }).map((_, index) => (
                <Skeleton key={index} />
              ))}
            </ImageGrid>
          </ImageGridContainer>
        </motion.div>

        {/* Разметка контактов */}
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={3}>
          <ContactInfo>
            <p className="call-to-action">Планируете мероприятие?</p>
            <p>
              Свяжитесь с нами для уточнения деталей, доступности и бронирования зала:
              <br />
              <i className="fas fa-phone-alt" style={{ marginRight: '0.5rem', color: 'var(--primary-color)' }}></i>
              <a href={`tel:${CONTACT_PHONE_NUMBER}`}>{CONTACT_PHONE_NUMBER_DISPLAY}</a>
            </p>
            <BookButton onClick={handleBookClick}>Забронировать зал</BookButton>
          </ContactInfo>
        </motion.div>
      </ContentSection>

    </PageWrapper>
  );
};

export default ConferencePage; 
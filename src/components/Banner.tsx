import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// Удаляем homePageUtils
// import { loadHomePageContent } from '../utils/homePageUtils';
// Импортируем тип из HomePage.ts
import { HomePageContent } from '../types/HomePage';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils'; // Импортируем утилиту

// Определяем тип для пропсов
interface BannerProps {
  content: HomePageContent['banner']; // Ожидаем получить секцию banner из HomePageContent
  // Добавляем backgroundImage, если он не входит в content.banner
  // backgroundImage?: string; 
}

// Удаляем неиспользуемый интерфейс
/*
interface BannerSectionProps {
  backgroundImage?: string; // Оставляем проп как есть
}
*/

// Используем transient prop `$backgroundImage` для стилизации
const BannerSection = styled.section<{
  $backgroundImage?: string; // transient prop
}>`
  min-height: 70vh;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 4rem 2rem;
  background: ${props => props.$backgroundImage ? `url(${props.$backgroundImage})` : 'var(--primary-color)'} center center/cover no-repeat;
  color: white;

  // Overlay для затемнения фона
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: 1;
  }
`;

const BannerContent = styled(motion.div)`
  position: relative;
  z-index: 2;
  max-width: 900px;
`;

const BannerTitle = styled.h1`
  font-size: 4rem;
  margin-bottom: 1.5rem;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.5);
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  line-height: 1.2;
  color: white;
  
  @media screen and (max-width: 992px) {
    font-size: 3rem;
  }
  
  @media screen and (max-width: 768px) {
    font-size: 2.5rem;
  }
  
  @media screen and (max-width: 576px) {
    font-size: 2rem;
  }
`;

const BannerText = styled.p`
  font-size: 1.3rem;
  max-width: 800px;
  margin-bottom: 2.5rem;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  color: white;
  opacity: 0.9;
  
  @media screen and (max-width: 992px) {
    font-size: 1.1rem;
  }
  
  @media screen and (max-width: 768px) {
    font-size: 1rem;
  }
`;

const BookButton = styled(motion.a)`
  padding: 1rem 2.5rem;
  font-size: 1.1rem;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
  background-color: var(--accent-color);
  border: 2px solid var(--accent-color);
  color: white;
  text-transform: uppercase;
  letter-spacing: 1px;
  position: relative;
  overflow: hidden;
  z-index: 1;
  text-decoration: none;
  display: inline-block;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 0;
    height: 100%;
    background-color: white;
    transition: 0.5s ease;
    z-index: -1;
  }

  &:hover {
    color: var(--primary-color);
    transform: translateY(-5px);
  }
  
  &:hover::before {
    width: 100%;
  }
`;

// Принимаем props
const Banner: React.FC<BannerProps> = ({ content }) => {
  // Удаляем загрузку из localStorage
  // const content = loadHomePageContent();
  
  // Используем данные из props. Если content не пришел, используем пустые строки
  const title = content?.title || 'Добро пожаловать!';
  const subtitle = content?.subtitle || 'Лучшее место для отдыха и оздоровления.';
  const buttonText = content?.buttonText || 'Забронировать';
  const buttonLink = content?.buttonLink || '/rooms'; // Изменяем fallback на /rooms

  // Предполагаем, что backgroundImage будет частью content.banner или передаваться отдельно
  // const backgroundImage = content?.backgroundImage || '/default-banner.jpg';
  // Если backgroundImage нет в content.banner, нужно будет передать его отдельно или изменить HomePageContent
  const backgroundUrl = content?.image || '/images/banner-bg.jpg'; // Временная заглушка, если нет в content

  // Применяем оптимизацию к URL фона
  const optimizedBackgroundUrl = optimizeCloudinaryImage(backgroundUrl, 'f_auto,q_auto,w_1920'); // Задаем большую ширину для баннера

  return (
    // Передаем оптимизированный URL в стилизованный компонент
    <BannerSection $backgroundImage={optimizedBackgroundUrl}>
      <BannerContent 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <BannerTitle>{title}</BannerTitle>
        <BannerText>{subtitle}</BannerText>
        {/* Используем buttonLink для href */} 
        <BookButton 
          href={buttonLink} 
          whileHover={{ y: -5 }}
          whileTap={{ scale: 0.95 }}
        >
          {buttonText}
        </BookButton>
      </BannerContent>
    </BannerSection>
  );
}

export default Banner; 
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
// Удаляем homePageUtils
// import { loadHomePageContent } from '../utils/homePageUtils';
// Импортируем тип из HomePage.ts
import { HomePageContent } from '../types/HomePage';

// Определяем тип для пропсов
interface BannerProps {
  content: HomePageContent['banner']; // Ожидаем получить секцию banner из HomePageContent
  // Добавляем backgroundImage, если он не входит в content.banner
  // backgroundImage?: string; 
}

const BannerSection = styled.section<{ backgroundImage?: string }>` // Делаем backgroundImage необязательным
  height: 85vh;
  // Используем дефолтное изображение, если backgroundImage не передан или отсутствует
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), 
              url('${props => props.backgroundImage || '/default-banner.jpg'}') center/cover no-repeat;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  color: white;
  text-align: center;
  padding: 0 1rem;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: linear-gradient(45deg, rgba(33, 113, 72, 0.7), rgba(44, 142, 94, 0.4));
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
  // Предполагаем, что backgroundImage будет частью content.banner или передаваться отдельно
  // const backgroundImage = content?.backgroundImage || '/default-banner.jpg';
  // Если backgroundImage нет в content.banner, нужно будет передать его отдельно или изменить HomePageContent
  const backgroundImage = '/images/banner-bg.jpg'; // Временная заглушка, если нет в content

  return (
    // Передаем backgroundImage в BannerSection
    <BannerSection backgroundImage={backgroundImage}> 
      <BannerContent
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 1 }}
      >
        <BannerTitle>{title}</BannerTitle>
        <BannerText>{subtitle}</BannerText>
        <BookButton 
          href="#booking"
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
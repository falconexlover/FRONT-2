import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { loadHomePageContent } from '../utils/homePageUtils';

const BannerSection = styled.section<{ backgroundImage: string }>`
  height: 85vh;
  background: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.5)), url('${props => props.backgroundImage}') center/cover no-repeat;
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

const Banner: React.FC = () => {
  // Загружаем контент из localStorage или используем дефолтный
  const content = loadHomePageContent();
  const { title, subtitle, buttonText, backgroundImage } = content.banner;
  
  return (
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
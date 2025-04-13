import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { HomePageContent } from '../types/HomePage';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { Link } from 'react-router-dom';

interface AboutProps {
  content: HomePageContent['about'];
}

const AboutSection = styled.section`
  padding: var(--space-xxxl) var(--space-xl); /* 64px 32px */
  background-color: var(--light-color);
  position: relative;
  overflow: hidden;
  
  @media screen and (max-width: 768px) {
    padding: var(--space-xxxl) var(--space-lg); /* 64px 24px */
  }
  
  @media screen and (max-width: 576px) {
    padding: var(--space-xxl) var(--space-md); /* 48px 16px */
  }
`;

const AboutContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-xxxl); /* 64px */
  align-items: center;
  
  @media screen and (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: var(--space-xl); /* 32px */
  }
`;

const AboutText = styled.div`
  p {
    margin-bottom: var(--space-lg); /* 24px */
    font-size: 1.05rem;
    color: var(--text-color);
    line-height: 1.8;
    overflow-wrap: break-word;

    @media screen and (max-width: 768px) {
        font-size: 1rem;
        line-height: 1.7;
    }
    @media screen and (max-width: 576px) {
        font-size: 0.95rem;
        line-height: 1.6;
    }
  }
  
  p:first-of-type {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--dark-color);
    overflow-wrap: break-word;

    @media screen and (max-width: 768px) {
        font-size: 1.1rem;
    }
    @media screen and (max-width: 576px) {
        font-size: 1.05rem;
    }
  }
`;

const AboutImage = styled(motion.div)`
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  position: relative;
  z-index: 1;
  
  &::before {
    content: '';
    position: absolute;
    top: 20px;
    left: 20px;
    right: 20px;
    bottom: 20px;
    border: 2px solid var(--accent-color);
    border-radius: var(--radius-md);
    z-index: -1;
    opacity: 0.3;
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
    transition: var(--transition);
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

const AboutButton = styled.a`
  display: inline-block;
  padding: var(--space-sm) var(--space-lg); /* 8px 24px */
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  text-align: center;
  margin-top: var(--space-md); /* 16px */
  
  &:hover {
    background-color: var(--accent-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  @media screen and (max-width: 768px) {
      padding: calc(var(--space-sm) + var(--space-xs)) var(--space-lg); /* ~12px 24px */
      font-size: 0.9rem;
  }

  @media screen and (max-width: 576px) {
      padding: var(--space-sm) calc(var(--space-md) + var(--space-xs)); /* 8px ~20px */
      font-size: 0.85rem;
  }
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: var(--space-xxxl); /* 64px */
  position: relative;
  
  h2 {
    font-size: 2.8rem;
    color: var(--dark-color);
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    position: relative;
    
    @media screen and (max-width: 768px) {
      font-size: 2.2rem;
    }
    
    @media screen and (max-width: 576px) {
      font-size: 1.8rem;
    }
    
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

const About: React.FC<AboutProps> = ({ content }) => {
  const title = content?.title || 'О Лесном Дворике';
  const textContent = content?.content || 'Информация о нашем санатории скоро появится здесь.';
  const imageUrl = content?.image || '/images/about-placeholder.jpg';

  return (
    <AboutSection id="about">
      <SectionTitle>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {title}
        </motion.h2>
      </SectionTitle>
      
      <AboutContent>
        <AboutText
          as={motion.div}
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {textContent && textContent.split('\n\n')[0] && (
            <p>{textContent.split('\n\n')[0]}</p>
          )}
          <AboutButton as={Link} to="/rooms">Посмотреть номера</AboutButton>
        </AboutText>
        
        <AboutImage
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <img src={optimizeCloudinaryImage(imageUrl, 'f_auto,q_auto,w_600')} alt="О гостинице Лесной дворик" loading="lazy" />
        </AboutImage>
      </AboutContent>
    </AboutSection>
  );
}

export default About; 
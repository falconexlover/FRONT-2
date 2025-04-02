import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { loadHomePageContent } from '../utils/homePageUtils';

const AboutSection = styled.section`
  padding: 6rem 2rem;
  background-color: var(--light-color);
  position: relative;
  overflow: hidden;
  
  @media screen and (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
  
  @media screen and (max-width: 576px) {
    padding: 3rem 1rem;
  }
`;

const AboutContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 4rem;
  align-items: center;
  
  @media screen and (max-width: 992px) {
    grid-template-columns: 1fr;
    gap: 2rem;
  }
`;

const AboutText = styled.div`
  p {
    margin-bottom: 1.5rem;
    font-size: 1.05rem;
    color: #555;
    line-height: 1.8;
  }
  
  p:first-of-type {
    font-size: 1.2rem;
    font-weight: 500;
    color: var(--dark-color);
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
  padding: 0.8rem 1.8rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  text-align: center;
  margin-top: 1rem;
  
  &:hover {
    background-color: var(--accent-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 4rem;
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

const About: React.FC = () => {
  // Загружаем контент из localStorage
  const { about } = loadHomePageContent();
  
  return (
    <AboutSection id="about">
      <SectionTitle>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {about.title}
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
          {about.content.split('\n\n').map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
          <AboutButton href="#rooms">Посмотреть номера</AboutButton>
        </AboutText>
        
        <AboutImage
          initial={{ opacity: 0, scale: 0.9 }}
          whileInView={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          <img src={about.image} alt="О гостинице Лесной дворик" />
        </AboutImage>
      </AboutContent>
    </AboutSection>
  );
}

export default About; 
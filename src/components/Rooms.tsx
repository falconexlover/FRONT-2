import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { loadHomePageContent } from '../utils/homePageUtils';
import { IMAGES } from '../assets/placeholders';

const RoomsSection = styled.section`
  padding: 6rem 2rem;
  background-color: white;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(${IMAGES.PATTERN}) center/300px repeat;
    opacity: 0.03;
    z-index: 0;
  }
  
  @media screen and (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
  
  @media screen and (max-width: 576px) {
    padding: 3rem 1rem;
  }
`;

const RoomsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: 2.5rem;
  position: relative;
  z-index: 1;
  
  @media screen and (max-width: 992px) {
    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  }
  
  @media screen and (max-width: 576px) {
    grid-template-columns: 1fr;
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

const RoomCard = styled(motion.div)`
  background-color: white;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  position: relative;
  
  &:hover {
    transform: translateY(-15px);
    box-shadow: var(--shadow-lg);
  }
`;

const RoomImage = styled.div`
  height: 200px;
  overflow: hidden;
  position: relative;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: all 0.7s;
  }
  
  ${RoomCard}:hover & img {
    transform: scale(1.1);
  }
`;

const RoomPrice = styled.div`
  position: absolute;
  bottom: 15px;
  right: 15px;
  background-color: var(--primary-color);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: var(--radius-sm);
  font-weight: 600;
  z-index: 2;
`;

const RoomDetails = styled.div`
  padding: 2rem;
  
  h3 {
    margin-bottom: 1rem;
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
  }
  
  p {
    color: #666;
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
`;

const RoomButtons = styled.div`
  display: flex;
  gap: 1rem;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const BookButton = styled(Link)`
  flex: 1;
  padding: 0.8rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border-radius: var(--radius-sm);
  text-align: center;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--dark-color);
  }
`;

const DetailsButton = styled(Link)`
  flex: 1;
  padding: 0.8rem 1rem;
  background-color: transparent;
  color: var(--dark-color);
  border: 1px solid var(--dark-color);
  border-radius: var(--radius-sm);
  text-align: center;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--dark-color);
    color: white;
  }
`;

const ViewAllButton = styled(Link)`
  display: block;
  width: 250px;
  margin: 3rem auto 0;
  padding: 1rem 2rem;
  background-color: var(--accent-color);
  color: white;
  text-align: center;
  border-radius: var(--radius-sm);
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--dark-color);
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
  }
`;

const Rooms: React.FC = () => {
  // Загружаем контент из localStorage
  const { rooms } = loadHomePageContent();
  
  return (
    <RoomsSection id="rooms">
      <SectionTitle>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {rooms.title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {rooms.subtitle}
        </motion.p>
      </SectionTitle>
      
      <RoomsGrid>
        {rooms.roomsData.map((room, index) => (
          <RoomCard 
            key={room.id}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            viewport={{ once: true, amount: 0.3 }}
          >
            <RoomImage>
              <img src={room.image} alt={room.title} />
              <RoomPrice>{room.price}</RoomPrice>
            </RoomImage>
            <RoomDetails>
              <h3>{room.title}</h3>
              <p>{room.description}</p>
              <RoomButtons>
                <BookButton to="/booking">
                  Забронировать
                </BookButton>
                <DetailsButton to="/rooms">
                  Подробнее
                </DetailsButton>
              </RoomButtons>
            </RoomDetails>
          </RoomCard>
        ))}
      </RoomsGrid>
      
      <ViewAllButton to="/rooms">
        Посмотреть все номера
      </ViewAllButton>
    </RoomsSection>
  );
};

export default Rooms; 
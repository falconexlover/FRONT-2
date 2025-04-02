import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RoomType, loadRoomsFromStorage } from '../utils/roomsData';

/**
 * Стили для секции номеров
 */
const RoomsSection = styled.section`
  padding: 5rem 0;
  background-color: var(--bg-color);
`;

const RoomsContainer = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--dark-color);
    margin-bottom: 1rem;
  }
`;

const RoomsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
`;

const RoomCard = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 2fr;
  background-color: white;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
  }
`;

const RoomImage = styled.div`
  position: relative;
  height: 100%;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: 992px) {
    height: 300px;
  }
`;

const RoomTag = styled.div`
  position: absolute;
  top: 1rem;
  left: 1rem;
  background-color: var(--primary-color);
  color: white;
  padding: 0.3rem 0.8rem;
  border-radius: var(--radius-full);
  font-size: 0.9rem;
  font-weight: 600;
`;

const RoomContent = styled.div`
  padding: 2rem;
  
  h3 {
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
    margin-bottom: 1rem;
    font-size: 1.5rem;
  }
  
  p {
    color: var(--text-color);
    margin-bottom: 1.5rem;
    line-height: 1.6;
  }
`;

const RoomFeatures = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.8rem;
  margin-bottom: 1.5rem;
`;

const RoomFeature = styled.div`
  display: flex;
  align-items: center;
  color: var(--text-color);
  font-size: 0.95rem;
  
  i {
    color: var(--primary-color);
    margin-right: 0.5rem;
  }
`;

const RoomPrice = styled.div`
  font-size: 1.5rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.5rem;
  
  small {
    font-size: 0.9rem;
    opacity: 0.8;
    margin-left: 0.5rem;
    font-weight: 400;
  }
`;

const RoomButton = styled.a`
  display: inline-block;
  padding: 0.8rem 2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  margin-top: 1rem;
  
  &:hover {
    background-color: var(--dark-color);
    transform: translateY(-3px);
  }
`;

/**
 * Компонент страницы с номерами
 */
const RoomsPage: React.FC = () => {
  // Состояния для управления данными
  const [rooms, setRooms] = useState<RoomType[]>([]);
  
  // Загрузка номеров при монтировании
  useEffect(() => {
    loadRooms();
  }, []);
  
  /**
   * Функция для загрузки номеров из хранилища
   */
  const loadRooms = () => {
    const loadedRooms = loadRoomsFromStorage();
    setRooms(loadedRooms);
  };
  
  return (
    <RoomsSection id="rooms">
      <RoomsContainer>
        <SectionTitle>
          <h1>Номера и цены</h1>
        </SectionTitle>
        
        <RoomsList>
          {rooms.map((room) => (
            <RoomCard
              key={room.id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.5 }}
            >
              <RoomImage>
                <img src={room.image} alt={room.title} />
                {room.tag && <RoomTag>{room.tag}</RoomTag>}
              </RoomImage>
              <RoomContent>
                <h3>{room.title}</h3>
                <p>{room.description}</p>
                <RoomFeatures>
                  {room.features.map((feature, index) => (
                    <RoomFeature key={index}>
                      <i className="fas fa-check"></i>
                      {feature}
                    </RoomFeature>
                  ))}
                </RoomFeatures>
                <RoomPrice>
                  {room.price}<small>{room.priceNote}</small>
                </RoomPrice>
                {room.additionalPrice && (
                  <RoomPrice>
                    {room.additionalPrice}<small>{room.additionalPriceNote}</small>
                  </RoomPrice>
                )}
                <RoomButton href="#booking" data-room={room.id}>Забронировать</RoomButton>
              </RoomContent>
            </RoomCard>
          ))}
        </RoomsList>
      </RoomsContainer>
    </RoomsSection>
  );
};

export default RoomsPage; 
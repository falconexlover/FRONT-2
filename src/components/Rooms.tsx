import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { roomsService } from '../utils/api';
import { RoomType } from '../types/Room';
import { toast } from 'react-toastify';

interface RoomsProps {
  title?: string;
  subtitle?: string;
}

const RoomsSection = styled.section`
  padding: var(--space-xxxl) var(--space-xl); /* 64px 32px */
  background-color: #f8f9fa;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url('') center/300px repeat;
    opacity: 0.03;
    z-index: 0;
  }
  
  @media screen and (max-width: 768px) {
    padding: var(--space-xxxl) var(--space-lg); /* 64px 24px */
  }
  
  @media screen and (max-width: 576px) {
    padding: var(--space-xxl) var(--space-md); /* 48px 16px */
  }
`;

const RoomsGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-xl); /* 32px */
  position: relative;
  z-index: 1;
  
  @media screen and (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: var(--space-xxl); /* 48px */
  position: relative;
  
  h2 {
    font-size: 2.8rem;
    color: var(--dark-color);
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    position: relative;
    margin-bottom: var(--space-xl); /* 32px */
    
    @media screen and (max-width: 768px) {
      font-size: 2.2rem;
      margin-bottom: calc(var(--space-xl) - var(--space-xs)); /* ~28px */
    }
    
    @media screen and (max-width: 576px) {
      font-size: 1.8rem;
      margin-bottom: var(--space-lg); /* 24px */
    }
    
    &::before {
      content: '';
      position: absolute;
      width: 60px;
      height: 3px;
      background-color: var(--accent-color);
      bottom: -10px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 3px;
      background-color: var(--primary-color);
      bottom: -10px;
      left: calc(50% + 35px);
      transform: translateX(-50%);
    }
  }

  p {
    color: var(--text-secondary);
    margin-bottom: 0;
    line-height: 1.6;
    font-size: 1rem;

    @media screen and (max-width: 768px) {
      font-size: 0.95rem;
    }

    @media screen and (max-width: 576px) {
      font-size: 0.9rem;
      max-width: 90%;
      margin-left: auto;
      margin-right: auto;
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
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &:hover {
    transform: translateY(-15px);
    box-shadow: var(--shadow-lg);
  }
`;

const RoomImage = styled.div`
  height: 250px;
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

  @media screen and (max-width: 576px) {
    height: 60vw;
    max-height: 300px;
  }
`;

const RoomPrice = styled.div`
  position: absolute;
  bottom: var(--space-lg); /* 24px */
  right: var(--space-lg); /* 24px */
  background-color: var(--primary-color);
  color: white;
  padding: var(--space-sm) var(--space-md); /* 8px 16px */
  border-radius: var(--radius-sm);
  font-weight: 600;
  z-index: 2;
`;

const RoomDetails = styled.div`
  padding: var(--space-xl); /* 32px */
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  
  h3 {
    margin-bottom: var(--space-md); /* 16px */
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
    font-size: 1.5rem;

    @media screen and (max-width: 768px) {
      font-size: 1.3rem;
    }
    @media screen and (max-width: 576px) {
      font-size: 1.2rem;
    }
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: var(--space-lg); /* 24px */
    line-height: 1.6;
    display: -webkit-box;
    -webkit-line-clamp: 3;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  @media screen and (max-width: 576px) {
    padding: var(--space-lg); /* 24px */
  }
`;

const RoomButtons = styled.div`
  display: flex;
  gap: var(--space-md); /* 16px */
  margin-top: auto;
  
  @media (max-width: 576px) {
    flex-direction: column;
  }
`;

const BookButton = styled(Link)`
  flex: 1;
  padding: var(--space-sm) var(--space-md); /* 8px 16px */
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

const ViewAllButton = styled(Link)`
  display: block;
  width: 250px;
  margin: var(--space-xxl) auto 0; /* 48px auto 0 */
  padding: var(--space-md) var(--space-xl); /* 16px 32px */
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

const LoadingPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.2rem;
  color: var(--text-color);
`;

const ErrorPlaceholder = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  font-size: 1.1rem;
  color: var(--danger-color);
  padding: var(--space-xl); /* 32px */
  text-align: center;
  background-color: var(--danger-bg-light);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-sm);
  max-width: 800px;
  margin: 0 auto;
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin: var(--space-md) 0; /* 16px 0 */
  padding: var(--space-sm) var(--space-md); /* 8px 16px */
  background-color: var(--danger-bg-light);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
`;

const Rooms: React.FC<RoomsProps> = ({ 
  title = 'Наши номера',
  subtitle = 'Выберите идеальный номер для вашего отдыха' 
}) => {
  const [roomsData, setRoomsData] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await roomsService.getAllRooms();
        setRoomsData(data || []);
      } catch (err) {
        console.error("Ошибка загрузки номеров:", err);
        let message = 'Не удалось загрузить информацию о номерах.';
        if (err instanceof Error) {
          message = err.message;
        }
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  return (
    <RoomsSection id="rooms-section">
      <SectionTitle>
        <h2>{title}</h2>
        {subtitle && <p>{subtitle}</p>}
      </SectionTitle>
      
      {isLoading ? (
        <LoadingPlaceholder>Загрузка номеров...</LoadingPlaceholder>
      ) : error ? (
        <ErrorPlaceholder>
          <ErrorMessage>{error}</ErrorMessage>
        </ErrorPlaceholder>
      ) : roomsData.length === 0 ? (
        <LoadingPlaceholder>Нет доступных номеров для отображения.</LoadingPlaceholder>
      ) : (
        <RoomsGrid>
          {roomsData.map((room: RoomType, index: number) => (
            <RoomCard 
              key={room._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <RoomImage>
                <img src={optimizeCloudinaryImage(room.imageUrls?.[0] || '/placeholder-room.jpg', 'f_auto,q_auto,w_500')} alt={room.title} loading="lazy" />
                <RoomPrice>{room.price}</RoomPrice>
              </RoomImage>
              <RoomDetails>
                <h3>{room.title}</h3>
                <p>{room.description || 'Описание номера скоро появится...'}</p>
                <RoomButtons>
                  <BookButton to="/booking">
                    Забронировать
                  </BookButton>
                </RoomButtons>
              </RoomDetails>
            </RoomCard>
          ))}
        </RoomsGrid>
      )}
      
      {!isLoading && !error && roomsData.length > 0 && (
        <ViewAllButton to="/rooms">
          Посмотреть все номера
        </ViewAllButton>
      )}
    </RoomsSection>
  );
};

export default Rooms;
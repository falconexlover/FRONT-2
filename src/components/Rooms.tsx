import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
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

const DetailsButton = styled(Link)`
  flex: 1;
  padding: var(--space-sm) var(--space-md); /* 8px 16px */
  background-color: transparent;
  color: var(--primary-color);
  border: 1px solid var(--primary-color);
  border-radius: var(--radius-sm);
  text-align: center;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.3s;
  
  &:hover {
    background-color: var(--primary-color-light);
    color: white;
    border-color: var(--primary-color-light);
  }
`;

const BookButtonAsButton = styled.button` 
  padding: 0.6rem 1.2rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 500;
  cursor: pointer;
  transition: var(--transition);
  text-decoration: none;
  font-size: 0.9rem;

  &:hover {
    background-color: var(--secondary-color);
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
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRooms = await roomsService.getAllRooms();
        setRooms(fetchedRooms.slice(0, 2));
      } catch (err: any) {
        setError('Не удалось загрузить номера.');
        console.error('Ошибка загрузки номеров для главной:', err);
        toast.error('Ошибка загрузки номеров.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = '/placeholder-image.jpg';
  };

  const handleBookClick = (room: RoomType) => {
    navigate('/booking', {
      state: {
        roomId: room._id,
        roomPrice: room.pricePerNight,
        roomTitle: room.title
      }
    });
  };

  return (
    <RoomsSection>
      <SectionTitle>
        <h2>{title}</h2>
        <p>{subtitle}</p>
      </SectionTitle>

      {isLoading && <p>Загрузка номеров...</p>}
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {!isLoading && !error && rooms.length > 0 && (
        <RoomsGrid>
          {rooms.map((room, index) => (
            <RoomCard
              key={room._id}
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <RoomImage>
                <RoomPrice>{room.price}</RoomPrice>
                <img 
                  src={optimizeCloudinaryImage(room.imageUrls[0], 'f_auto,q_auto,w_600')}
                  alt={room.title}
                  loading="lazy"
                  onError={handleImageError}
                />
              </RoomImage>
              <RoomDetails>
                <h3>{room.title}</h3>
                <RoomButtons>
                  <DetailsButton to={`/rooms/${room._id}`}>
                    Подробнее
                  </DetailsButton>
                  <BookButtonAsButton type="button" onClick={() => handleBookClick(room)}>
                    Забронировать
                  </BookButtonAsButton>
                </RoomButtons>
              </RoomDetails>
            </RoomCard>
          ))}
        </RoomsGrid>
      )}
      
      {!isLoading && !error && (
        <ViewAllButton to="/rooms">
           Посмотреть все номера
        </ViewAllButton>
      )}
    </RoomsSection>
  );
};

export default Rooms;
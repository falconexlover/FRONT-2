import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { roomsService } from '../utils/api';
import { RoomType } from '../types/Room';
import { toast } from 'react-toastify';

interface RoomsProps {
  title?: string;
  subtitle?: string;
  showAllRoomsLink?: boolean;
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

const ExpandButton = styled.button`
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
  cursor: pointer;
  
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

const ExpandedCardLayout = styled(motion.div)`
  display: flex;
  gap: 2rem;
  background: #fff;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  margin-top: var(--space-md);
  padding: var(--space-xl);
  position: relative;
  @media (max-width: 900px) {
    flex-direction: column;
    padding: var(--space-lg);
  }
`;

const ExpandedLeft = styled.div`
  flex: 1 1 350px;
  min-width: 280px;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const ExpandedMainImage = styled.img`
  width: 100%;
  max-width: 420px;
  aspect-ratio: 4 / 3;
  height: auto;
  object-fit: cover;
  border-radius: var(--radius-sm);
  box-shadow: var(--shadow-sm);
  margin-bottom: var(--space-md);
`;

const ExpandedRight = styled.div`
  flex: 2 1 400px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
`;

const ExpandedTitle = styled.h3`
  font-size: 1.5rem;
  font-family: 'Playfair Display', serif;
  margin-bottom: var(--space-md);
  color: var(--dark-color);
`;

const ExpandedFeatures = styled.ul`
  margin: 0 0 var(--space-md) 0;
  padding-left: 1.2rem;
  color: var(--primary-color);
  font-size: 1rem;
  li {
    margin-bottom: 0.3rem;
    list-style: disc;
  }
`;

const ExpandedDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1.05rem;
  margin-bottom: var(--space-lg);
  white-space: pre-line;
`;

const GalleryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: var(--space-lg);
`;

const GalleryImage = styled.img`
  width: 100%;
  height: 90px;
  object-fit: cover;
  border-radius: var(--radius-xs);
  box-shadow: var(--shadow-xs);
`;

const Rooms: React.FC<RoomsProps> = ({ 
  title = 'Номера',
  subtitle = 'Выберите идеальный вариант для вашего комфортного отдыха',
  showAllRoomsLink = false
}) => {
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedRoomId, setExpandedRoomId] = useState<string | null>(null);
  const [sliderIndex, setSliderIndex] = useState<number>(0);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const fetchedRooms = await roomsService.getAllRooms();
        setRooms(fetchedRooms);
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

  const handleExpand = (roomId: string) => {
    setExpandedRoomId(roomId);
    setSliderIndex(0);
  };

  const handleCollapse = () => {
    setExpandedRoomId(null);
  };

  const handlePrevImage = (images: string[]) => {
    setSliderIndex((prev) => (prev - 1 + images.length) % images.length);
  };

  const handleNextImage = (images: string[]) => {
    setSliderIndex((prev) => (prev + 1) % images.length);
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
          {rooms.map((room, index) => {
            const isExpanded = expandedRoomId === room._id;
            return (
              <RoomCard
                key={room._id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                {!isExpanded ? (
                  <>
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
                        <ExpandButton type="button" onClick={() => handleExpand(room._id)}>
                          Подробнее
                        </ExpandButton>
                        <BookButtonAsButton type="button" onClick={() => handleBookClick(room)}>
                          Забронировать
                        </BookButtonAsButton>
                      </RoomButtons>
                    </RoomDetails>
                  </>
                ) : (
                  <ExpandedCardLayout
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 30 }}
                  >
                    <ExpandedLeft>
                      {room.imageUrls && room.imageUrls.length > 0 && (
                        <div style={{ position: 'relative', width: '100%', maxWidth: 420 }}>
                          <ExpandedMainImage
                            src={optimizeCloudinaryImage(room.imageUrls[sliderIndex], 'f_auto,q_auto,w_600')}
                            alt={room.title}
                            onError={handleImageError}
                          />
                          {room.imageUrls.length > 1 && (
                            <>
                              <button
                                style={{
                                  position: 'absolute',
                                  left: 0,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0,0,0,0.3)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: 36,
                                  height: 36,
                                  cursor: 'pointer',
                                  fontSize: 22
                                }}
                                onClick={() => handlePrevImage(room.imageUrls)}
                                aria-label="Предыдущее фото"
                              >&#8592;</button>
                              <button
                                style={{
                                  position: 'absolute',
                                  right: 0,
                                  top: '50%',
                                  transform: 'translateY(-50%)',
                                  background: 'rgba(0,0,0,0.3)',
                                  color: '#fff',
                                  border: 'none',
                                  borderRadius: '50%',
                                  width: 36,
                                  height: 36,
                                  cursor: 'pointer',
                                  fontSize: 22
                                }}
                                onClick={() => handleNextImage(room.imageUrls)}
                                aria-label="Следующее фото"
                              >&#8594;</button>
                            </>
                          )}
                          {room.imageUrls.length > 1 && (
                            <div style={{ textAlign: 'center', marginTop: 8 }}>
                              {room.imageUrls.map((_, idx) => (
                                <span
                                  key={idx}
                                  style={{
                                    display: 'inline-block',
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    background: idx === sliderIndex ? '#2aa76e' : '#ccc',
                                    margin: '0 3px'
                                  }}
                                />
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </ExpandedLeft>
                    <ExpandedRight>
                      <ExpandedTitle>{room.title}</ExpandedTitle>
                      <ExpandedDescription>{room.description}</ExpandedDescription>
                      <ExpandedFeatures>
                        {room.features && room.features.length > 0 && room.features.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ExpandedFeatures>
                      <div style={{ fontWeight: 600, fontSize: '1.2rem', marginBottom: 16 }}>
                        {room.price} <span style={{ color: '#2aa76e', fontWeight: 400, fontSize: '1rem' }}>/ ночь</span>
                      </div>
                      <RoomButtons>
                        <BookButtonAsButton type="button" onClick={() => handleBookClick(room)}>
                          Забронировать
                        </BookButtonAsButton>
                        <ExpandButton type="button" onClick={handleCollapse}>
                          Скрыть
                        </ExpandButton>
                      </RoomButtons>
                    </ExpandedRight>
                  </ExpandedCardLayout>
                )}
              </RoomCard>
            );
          })}
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
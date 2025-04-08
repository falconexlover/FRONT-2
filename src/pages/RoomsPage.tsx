import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/autoplay';
// import { RoomType, loadRoomsFromStorage } from '../utils/roomsData'; // Комментируем или удаляем эту строку
import { RoomType } from '../types/Room'; // Убедимся, что эта строка есть
import { roomsService } from '../utils/api'; // Новый импорт
import { toast } from 'react-toastify'; // Убедимся, что эта строка есть
import { Link } from 'react-router-dom';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils'; // Импортируем утилиту

/**
 * Стили для секции номеров
 */
const RoomsSection = styled.section`
  padding: 5rem 0;
  background-color: var(--bg-color);
`;

const RoomsContainer = styled.div`
  max-width: 1100px;
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

const SliderWrapper = styled.div`
  position: relative;
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  .swiper-pagination-bullet {
    background-color: white;
    opacity: 0.7;
  }
  .swiper-pagination-bullet-active {
    background-color: white;
    opacity: 1;
  }

  @media (max-width: 992px) {
    height: 300px;
    .swiper-slide img {
      height: 300px;
    }
  }
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

const RoomTitle = styled.h3`
  color: var(--dark-color);
  font-family: 'Playfair Display', serif;
  margin-bottom: 1rem;
  font-size: 1.5rem;
`;

const RoomDescription = styled.p`
  color: var(--text-color);
  margin-bottom: 1.5rem;
  line-height: 1.6;
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

const RoomActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
`;

const BookingButton = styled(Link)`
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
  
  &:hover {
    background-color: var(--dark-color);
    transform: translateY(-3px);
  }
`;

/**
 * Стили для плейсхолдеров загрузки и ошибок
 */
/* Удаляем неиспользуемый PlaceholderContainer
const PlaceholderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px; 
  padding: 2rem;
  text-align: center;
  color: var(--text-muted);
`;
*/

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 300px;
  padding: 2rem;
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const ErrorMessage = styled.div`
  color: var(--error-color);
  text-align: center;
  margin-top: 1rem;
`;

/**
 * Компонент страницы с номерами
 */
const RoomsPage: React.FC = () => {
  // Состояния для управления данными, загрузкой и ошибками
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // Загрузка номеров при монтировании
  useEffect(() => {
    const fetchRooms = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Используем импортированный roomsService из api.ts
        const data = await roomsService.getAllRooms();
        // Уточнение: roomsService.getAllRooms из api.ts возвращает Promise<any>
        // Нужно будет типизировать его позже, пока используем Array.isArray
        setRooms(Array.isArray(data) ? data : []); 
      } catch (err: any) {
        console.error("Ошибка загрузки номеров:", err);
        const message = err.message || 'Не удалось загрузить информацию о номерах.';
        setError(message);
        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRooms();
  }, []);
  
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    const target = e.target as HTMLImageElement;
    target.onerror = null;
    target.src = './placeholder-image.jpg';
  };

  return (
    <RoomsSection id="rooms">
      <RoomsContainer>
        <SectionTitle>
          <h1>Наши Номера</h1>
          <p>Выберите идеальный вариант для вашего комфортного отдыха</p>
        </SectionTitle>
        
        {isLoading && (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        )}
        
        {error && (
          <ErrorMessage>Ошибка загрузки: {error}</ErrorMessage>
        )}
        
        {!isLoading && !error && (
          <RoomsList>
            {rooms.map((room) => (
              <RoomCard
                key={room._id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-100px" }}
                transition={{ duration: 0.5 }}
              >
                <SliderWrapper>
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay, A11y]}
                    spaceBetween={0}
                    slidesPerView={1}
                    pagination={{ clickable: true }}
                    loop={true}
                    autoplay={{
                      delay: 3000,
                      disableOnInteraction: false,
                      pauseOnMouseEnter: true,
                    }}
                    a11y={{
                      prevSlideMessage: 'Предыдущий слайд',
                      nextSlideMessage: 'Следующий слайд',
                      paginationBulletMessage: 'Перейти к слайду {{index}}',
                    }}
                  >
                    {room.imageUrls && room.imageUrls.length > 0 ? (
                      room.imageUrls.map((url, index) => (
                        <SwiperSlide key={index}>
                          <img 
                            src={optimizeCloudinaryImage(url, 'f_auto,q_auto,w_600')}
                            alt={`${room.title} - изображение ${index + 1}`}
                            onError={handleImageError}
                            loading="lazy"
                          />
                        </SwiperSlide>
                      ))
                    ) : (
                      <SwiperSlide>
                         <img 
                           src={optimizeCloudinaryImage('/placeholder-room.jpg', 'f_auto,q_auto,w_600')}
                           alt={`${room.title} - плейсхолдер`}
                           style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                           loading="lazy"
                         />
                      </SwiperSlide>
                    )}
                  </Swiper>
                </SliderWrapper>
                <RoomContent>
                  <RoomTitle>{room.title}</RoomTitle>
                  <RoomDescription>{room.description || 'Описание номера скоро появится.'}</RoomDescription>
                  <RoomPrice>
                    {room.price}
                  </RoomPrice>
                  <RoomActions>
                    <BookingButton to={`/booking?roomid=${room._id}`}>Забронировать</BookingButton>
                  </RoomActions>
                </RoomContent>
              </RoomCard>
            ))}
          </RoomsList>
        )}
      </RoomsContainer>
    </RoomsSection>
  );
};

export default RoomsPage; 
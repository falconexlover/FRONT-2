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
  padding: var(--space-xxl) 0 var(--space-xxxl); /* 48px 0 64px */
  background-color: var(--bg-color); /* Оставляем как fallback */
  /* Добавляем градиент */
  background: linear-gradient(to bottom, var(--bg-color), var(--bg-secondary, var(--bg-color))); 
  /* Пояснение: переход от --bg-color к --bg-secondary. 
     Если --bg-secondary не определен, используется --bg-color (нет градиента). 
     Можно заменить var(--bg-secondary, ...) на конкретный цвет, 
     например, #f8f9fa, если хотите гарантированный градиент */
`;

const RoomsContainer = styled.div`
  max-width: 1100px;
  margin: 0 auto;
  padding: var(--space-xl) var(--space-md); /* 32px 16px */

  @media (max-width: 576px) {
    padding: var(--space-md) var(--space-sm); /* 16px 8px */
  }
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: var(--space-xxxl); /* 64px */
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--primary-color); /* Меняем цвет на основной */
    margin-bottom: var(--space-md); /* 16px */
    font-size: 2.5rem; /* Увеличиваем размер */
    font-weight: 600;
    letter-spacing: 0.5px;
    position: relative;
    display: inline-block; /* Нужно для позиционирования ::after */
    padding-bottom: var(--space-sm); /* 8px */

    &:after { /* Добавляем подчеркивание */
      content: '';
      position: absolute;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 80px;
      height: 3px;
      background-color: var(--accent-color);
      border-radius: 1.5px;
    }
  }
  
  p { /* Стили для подзаголовка */
      color: var(--text-secondary);
      font-size: 1.1rem;
      margin-top: var(--space-lg); /* 24px */
  }

  @media (max-width: 768px) {
    margin-bottom: var(--space-xxl); /* 48px */
  }
  @media (max-width: 576px) {
    margin-bottom: var(--space-xl); /* 32px */
    h1 { font-size: 2rem; }
    p { font-size: 1rem; margin-top: var(--space-md); /* 16px */}
  }
`;

const RoomsList = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: var(--space-xl); /* 32px */
`;

const RoomCard = styled(motion.div)`
  display: grid;
  grid-template-columns: 1fr 2fr;
  background-color: white;
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-md); /* Улучшенная тень */
  border: 1px solid var(--border-color-light, #e0e0e0); /* Добавляем тонкую рамку с fallback */
  transition: transform 0.3s ease, box-shadow 0.3s ease; /* Добавляем transition */
  
  /* Убираем разделительную линию */
  /* border-right: 1px solid var(--border-color-light, #e0e0e0); */
  
  &:hover {
      transform: translateY(-5px); /* Подъем при наведении */
      box-shadow: var(--shadow-lg); /* Усиленная тень при наведении */
  }
  
  @media (max-width: 992px) {
    grid-template-columns: 1fr;
    /* Убираем разделительную линию */
    /* border-right: none; */
    /* border-bottom: 1px solid var(--border-color-light, #e0e0e0); */
  }
`;

const SliderWrapper = styled.div`
  position: relative;
  overflow: hidden;
  height: 100%; /* Заставляем занимать всю высоту ячейки грида */
  /* Убираем фиксированное соотношение сторон, чтобы слайдер занимал всю высоту */
  /* aspect-ratio: 4 / 3; */ 
  /* Убираем специфичное скругление, полагаемся на RoomCard */
  /* @media (max-width: 992px) {
    border-radius: var(--radius-sm) var(--radius-sm) 0 0; 
  } */
  
  /* Добавляем стили для Swiper и Slide, чтобы они занимали всю высоту */
  .swiper,
  .swiper-slide {
    height: 100%;
  }
  
  .swiper-slide img {
    display: block;
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease; /* Плавный переход для zoom */
  }
  
  &:hover .swiper-slide img { /* Применяем scale при наведении на весь слайдер */
    transform: scale(1.05); 
  }
  
  .swiper-pagination-bullet {
    background-color: white;
    opacity: 0.7;
  }
  .swiper-pagination-bullet-active {
    background-color: white;
    opacity: 1;
  }

  /* Убираем медиа-запрос для высоты отсюда, т.к. высота определяется соотношением сторон */
  /* @media (max-width: 992px) { ... } */
`;

const RoomContent = styled.div`
  padding: var(--space-xl); /* 32px */
  display: flex;
  flex-direction: column;
  position: relative;
  
  h3 {
    color: var(--dark-color);
    font-family: 'Playfair Display', serif;
    margin-bottom: 0.8rem;
    font-size: 1.6rem;
    font-weight: 600;
    line-height: 1.4;
    @media (max-width: 768px) {
      font-size: 1.4rem;
    }
    @media (max-width: 576px) {
      font-size: 1.3rem;
    }
  }
  
  p {
    color: var(--text-secondary);
    margin-bottom: var(--space-lg); /* 24px */
    line-height: 1.6;
    flex-grow: 1;
    font-size: 0.95rem;
    @media (max-width: 768px) {
      font-size: 0.9rem;
    }
    @media (max-width: 576px) {
      font-size: 0.85rem;
      line-height: 1.5;
    }
  }

  @media (max-width: 768px) {
      padding: var(--space-lg); /* 24px */
  }
  @media (max-width: 576px) {
      padding: calc(var(--space-md) + var(--space-xs)); /* ~20px */
  }
`;

const RoomTitle = styled.h3`
  color: var(--dark-color);
  font-family: 'Playfair Display', serif;
  margin-bottom: var(--space-sm); /* 8px */
  font-size: 1.6rem; /* Немного уменьшаем размер */
  font-weight: 600; /* Немного уменьшаем жирность */
  line-height: 1.4; /* Уменьшаем высоту строки для компактности */
`;

const RoomDescription = styled.p`
  color: var(--text-secondary); /* Делаем текст описания светлее */
  margin-bottom: var(--space-lg); /* 24px */
  line-height: 1.6; /* Слегка увеличиваем интервал */
  flex-grow: 1; /* Позволяем описанию занимать доступное пространство */
  font-size: 0.95rem; /* Делаем чуть меньше основного */
`;

const RoomPrice = styled.div`
  font-size: 1.6rem;
  font-weight: 700;
  color: var(--primary-color);
  margin-bottom: var(--space-sm); /* 8px */
  white-space: nowrap;
  
  small {
    font-size: 0.9rem;
    opacity: 0.9;
    margin-left: var(--space-sm); /* 8px */
    font-weight: 500;
  }

  @media (max-width: 768px) {
    font-size: 1.4rem;
    small { font-size: 0.85rem; }
  }
  @media (max-width: 576px) {
    font-size: 1.3rem;
    small { font-size: 0.8rem; }
  }
`;

const RoomActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: auto;
  padding-top: var(--space-md); /* 16px */
  gap: var(--space-md); /* 16px */

  @media (max-width: 576px) {
    flex-direction: column;
    align-items: stretch;
    gap: var(--space-sm); /* 8px */
  }
`;

// --- НОВЫЙ СТИЛЬ ДЛЯ ССЫЛКИ "ПОДРОБНЕЕ" ---
const DetailsLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 500;
  text-decoration: none;
  font-size: 0.9rem;
  transition: color 0.2s ease;

  &:hover {
    color: var(--secondary-color); 
    text-decoration: underline;
  }

  @media (max-width: 576px) {
    font-size: 0.85rem;
    text-align: center;
    margin-bottom: var(--space-sm); /* 8px */
  }
`;
// --- КОНЕЦ НОВОГО СТИЛЯ ---

const BookingButton = styled(Link)`
  display: inline-block;
  padding: var(--space-sm) var(--space-xl); /* 8px 32px */
  background-color: var(--primary-color);
  color: var(--text-on-primary-bg);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition), transform 0.2s ease, box-shadow 0.2s ease;
  text-align: center;
  box-shadow: var(--shadow-sm);
  font-size: 0.95rem;

  &:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
  }

  @media (max-width: 768px) {
    padding: var(--space-sm) var(--space-lg); /* 8px 24px */
    font-size: 0.9rem;
  }
  @media (max-width: 576px) {
    padding: var(--space-sm) var(--space-md); /* 8px 16px */
    font-size: 0.85rem;
    width: 100%;
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
  padding: var(--space-xl); /* 32px */
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
  text-align: center;
  color: var(--danger-color);
  padding: var(--space-xl); /* 32px */
  font-size: 1.1rem;
`;

// --- НОВЫЙ КОМПОНЕНТ ДЛЯ УДОБСТВ ---
const RoomFeatures = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: var(--space-sm); /* 8px */
  margin-bottom: var(--space-lg); /* 24px */
  padding-top: var(--space-md); /* 16px */
  border-top: 1px solid var(--border-color-light);
  align-items: center;

  span {
    display: inline-flex;
    align-items: center;
    gap: var(--space-xs); /* 4px */
    font-size: 0.85rem; /* Делаем текст удобств мельче */
    color: var(--text-secondary);
    /* Возвращаем легкий фон и рамку */
    background-color: var(--bg-tertiary, #f8f9fa);
    padding: var(--space-xs) var(--space-sm); /* 4px 8px */
    border-radius: var(--radius-lg); /* Делаем более скругленными */
    border: 1px solid var(--border-color-light, #eee);
  }

  i {
    color: var(--primary-color);
    font-size: 0.9rem; /* Уменьшаем иконки */
  }
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
        const fetchedRooms = Array.isArray(data) ? data : [];
        setRooms(fetchedRooms);
        // Убираем лог отсюда
        // console.log("Загруженные номера (rooms state):", fetchedRooms);
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

  // --- Варианты анимации --- 
  const titleVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: { 
        opacity: 1, 
        y: 0, 
        transition: { duration: 0.5, ease: "easeOut" } 
    }
  };

  const cardVariants = {
      hidden: { opacity: 0, y: 30 },
      visible: (i: number = 1) => ({
        opacity: 1,
        y: 0,
        transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" } 
      })
  };

  // --- ФУНКЦИЯ ДЛЯ ПОЛУЧЕНИЯ ИКОНОК --- 
  const getFeatureIcon = (feature: string): string | null => {
    const lowerFeature = feature.toLowerCase().trim(); 
    
    if (lowerFeature.includes('wi-fi') || lowerFeature.includes('wifi') || lowerFeature.includes('вай фай') || lowerFeature.includes('интернет')) return 'fas fa-wifi';
    if (lowerFeature.includes('кондиционер')) return 'fas fa-snowflake';
    if (lowerFeature.includes('телевизор') || lowerFeature.includes('tv')) return 'fas fa-tv';
    if (lowerFeature.includes('холодильник')) return 'fas fa-temperature-low';
    if (lowerFeature.includes('бутилированная вода')) return 'fas fa-wine-bottle'; // Возвращаем иконку бутылки
    if (lowerFeature.includes('душ')) return 'fas fa-shower';
    if (lowerFeature.includes('ванна')) return 'fas fa-bath';
    if (lowerFeature.includes('балкон') || lowerFeature.includes('лоджия')) return 'fas fa-archway';
    if (lowerFeature.includes('чайник')) return 'fas fa-mug-hot';
    if (lowerFeature.includes('фен')) return 'fas fa-wind';
    if (lowerFeature.includes('сейф')) return 'fas fa-lock';
    return null;
  };

  return (
    <RoomsSection id="rooms">
      <RoomsContainer>
        {/* Анимация для заголовка */}
        <motion.div initial="hidden" animate="visible" variants={titleVariants}>
            <SectionTitle>
                <h1>Наши Номера</h1>
                <p>Выберите идеальный вариант для вашего комфортного отдыха</p>
            </SectionTitle>
        </motion.div>
        
        {isLoading && (
          <LoadingContainer>
            <LoadingSpinner />
          </LoadingContainer>
        )}
        
        {error && (
          <ErrorMessage>{error}</ErrorMessage>
        )}
        
        {!isLoading && !error && rooms.length > 0 && (
          <RoomsList>
            {rooms.map((room, index) => (
              <RoomCard 
                key={room._id}
                variants={cardVariants} // Анимация для карточки
                initial="hidden"
                animate="visible"
                custom={index} // Задержка на основе индекса
              >
                <SliderWrapper>
                  <Swiper
                    modules={[Navigation, Pagination, Autoplay, A11y]}
                    spaceBetween={0}
                    slidesPerView={1}
                    navigation
                    pagination={{ clickable: true }}
                    autoplay={{ delay: 5000, disableOnInteraction: true }}
                    loop={room.imageUrls.length > 1}
                  >
                    {room.imageUrls.map((url, imgIndex) => (
                      <SwiperSlide key={imgIndex}>
                        <img 
                          src={optimizeCloudinaryImage(url, 'f_auto,q_auto,w_600,h_450,c_fill')}
                          alt={`${room.title} - изображение ${imgIndex + 1}`}
                          onError={handleImageError}
                          loading="lazy"
                        />
                      </SwiperSlide>
                    ))}
                    {room.imageUrls.length === 0 && (
                      <SwiperSlide> {/* Слайд-заглушка */} 
                        <img src="./placeholder-image.jpg" alt={`${room.title} - нет изображения`} />
                      </SwiperSlide>
                    )}
                  </Swiper>
                </SliderWrapper>
                <RoomContent>
                  <RoomTitle>{room.title}</RoomTitle>
                  <RoomDescription>
                    {room.description || 'Комфортный номер для вашего отдыха в Лесном дворике.'}
                  </RoomDescription>
                  
                  {/* --- БЛОК С УДОБСТВАМИ --- */}
                  {(room.features || typeof room.features === 'string') && (
                    <RoomFeatures>
                      {/* Вместимость */}
                      <span>
                        <i className="fas fa-users"></i> {room.capacity} {room.capacity > 1 ? 'гостя' : 'гость'}
                      </span>
                      {/* Парсим и мапим */}
                      {(() => {
                        let featuresArray: string[] = [];
                        const featuresRaw = room.features;

                        if (Array.isArray(featuresRaw)) {
                          featuresArray = featuresRaw.map(String);
                        } else if (typeof featuresRaw === 'string' && (featuresRaw as string).trim().startsWith('[')) {
                          try {
                            const parsed = JSON.parse(featuresRaw as string);
                            if (Array.isArray(parsed)) {
                              featuresArray = parsed.map(String);
                            }
                          } catch (e) {
                            console.error('Ошибка парсинга features JSON:', featuresRaw, e);
                          }
                        } else if (typeof featuresRaw === 'string') {
                          console.warn('Features не является JSON-массивом, пытаемся разбить строку:', featuresRaw);
                          featuresArray = (featuresRaw as string).split(',').map((f: string) => f.trim()).filter(Boolean);
                        }

                        return featuresArray.map((feature: string, fIndex: number) => {
                          const iconClass = getFeatureIcon(feature);
                          return iconClass ? (
                            <span key={fIndex}>
                              <i className={iconClass}></i> {feature}
                            </span>
                          ) : null;
                        });
                      })()}
                    </RoomFeatures>
                  )}
                  
                  {/* --- БЛОК С ЦЕНОЙ И КНОПКОЙ --- */}
                  <RoomActions>
                    <RoomPrice>
                      {room.pricePerNight} ₽ <small>за ночь</small>
                    </RoomPrice>
                    {/* Группируем ссылку и кнопку справа */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}> 
                      <DetailsLink to={`/room/${room._id}`}> 
                        Подробнее
                      </DetailsLink>
                      <BookingButton to={`/booking?roomId=${room._id}`}>
                        Забронировать
                      </BookingButton>
                    </div>
                  </RoomActions>
                </RoomContent>
              </RoomCard>
            ))}
          </RoomsList>
        )}
        
        {!isLoading && !error && rooms.length === 0 && (
          <p style={{ textAlign: 'center', marginTop: 'var(--space-xl)', color: 'var(--text-secondary)' }}> {/* 32px */}
            Доступных номеров для отображения нет.
          </p>
        )}
        
      </RoomsContainer>
    </RoomsSection>
  );
};

export default RoomsPage;
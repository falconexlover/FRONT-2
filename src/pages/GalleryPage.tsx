import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService } from '../utils/api';
import { GalleryImageItem } from '../types/GalleryImage';
import { toast } from 'react-toastify';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import '../assets/css/gallery.css';
// Импорты для Swiper
import { Swiper, SwiperSlide } from 'swiper/react';
import { Pagination, A11y } from 'swiper/modules'; // Используем только Pagination и A11y для галереи
import 'swiper/css';
import 'swiper/css/pagination';

// Неиспользуемый компонент
// const GallerySection = styled.section`
//   padding: 5rem 0;
//   background-color: var(--bg-color);
// `;

const GalleryContainer = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: var(--space-xxxl) var(--space-md); /* 64px 16px */

  @media (max-width: 768px) {
    padding: var(--space-xxl) var(--space-md); /* 48px 16px */
  }
  @media (max-width: 576px) {
    padding: var(--space-xl) var(--space-sm); /* 32px 8px */
  }
`;

const GalleryHeader = styled.div`
  text-align: center;
  margin-bottom: var(--space-xxxl); /* 64px */
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--dark-color);
    margin-bottom: var(--space-md); /* 16px */
    font-size: 2.5rem;
    @media (max-width: 768px) {
      font-size: 2.2rem;
    }
    @media (max-width: 576px) {
      font-size: 1.8rem;
    }
  }
  
  p {
    color: var(--text-color);
    max-width: 600px;
    margin: 0 auto var(--space-lg); /* 0 auto 24px */
    font-size: 1.1rem;
    @media (max-width: 768px) {
      font-size: 1rem;
    }
    @media (max-width: 576px) {
      font-size: 0.9rem;
      margin-bottom: var(--space-md); /* 16px */
    }
  }

  @media (max-width: 768px) {
    margin-bottom: var(--space-xxl); /* 48px */
  }
`;

// Новый контейнер для секции категории
const CategorySection = styled.div`
  margin-bottom: var(--space-xxxl); /* 64px */
`;

// Новый заголовок для секции категории
const CategoryTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  color: var(--dark-color);
  margin-bottom: var(--space-xl); /* 32px */
  padding-bottom: var(--space-sm); /* 8px */
  border-bottom: 2px solid var(--primary-color);
  display: inline-block; // Чтобы подчеркивание было по ширине текста
  font-size: 1.8rem;
  @media (max-width: 768px) {
    font-size: 1.6rem;
    margin-bottom: var(--space-lg); /* 24px */
  }
  @media (max-width: 576px) {
    font-size: 1.4rem;
    margin-bottom: var(--space-md); /* 16px */
  }
`;

// --- НОВЫЙ КОМПОНЕНТ ДЛЯ ОБЕРТКИ SWIPER НА МОБИЛЬНЫХ ---
const MobileSwiperWrapper = styled.div`
  display: none; // Скрыт по умолчанию
  margin-bottom: var(--space-xl); /* 32px */
  
  .swiper-slide {
    width: 65%; // Показываем неполные соседние слайды
    margin-right: calc(var(--space-md) - var(--space-xs)); /* ~12px */ 
  }

  .swiper-pagination {
    position: static; // Статическое позиционирование под слайдером
    margin-top: var(--space-md); /* 16px */
  }
  .swiper-pagination-bullet {
    background-color: var(--primary-color);
    opacity: 0.5;
  }
  .swiper-pagination-bullet-active {
    opacity: 1;
  }

  @media (max-width: 768px) {
    display: block; // Показываем на мобильных
  }
  @media (max-width: 576px) {
    .swiper-slide {
        width: 75%; // Немного шире на совсем маленьких экранах
    }
  }
`;

// --- АДАПТИРУЕМ GALLERYGRID --- 
const GalleryGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); 
  gap: var(--space-md); /* 16px */ 

  @media (max-width: 768px) {
    display: none; // Скрываем сетку на мобильных
  }
`;

const GalleryItem = styled(motion.div)`
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  // Убираем фиксированную высоту, делаем квадратными
  aspect-ratio: 1 / 1; 
  /* height: 220px; */ 
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    
    img {
      transform: scale(1.05);
    }
    
    .image-overlay {
      opacity: 1;
    }
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  // Заменяем .image-caption на .image-overlay
  .image-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(to top, rgba(0,0,0,0.7), rgba(0,0,0,0.1));
    display: flex;
    align-items: center;
    justify-content: center;
    opacity: 0;
    transition: opacity 0.3s ease;
    
    i { // Иконка лупы
      font-size: 2rem;
      color: white;
    }
  }
`;

const Lightbox = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0,0,0,0.9);
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--space-xl); /* 32px */
`;

const LightboxContent = styled(motion.div)`
  position: relative;
  max-width: 90%;
  max-height: 90%;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const LightboxImage = styled.img`
  max-width: 100%;
    max-height: 90vh;
    border-radius: var(--radius-sm);
    box-shadow: var(--shadow-lg);
`;

const LightboxControls = styled.div`
  position: absolute;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  top: 50%;
  transform: translateY(-50%);
  padding: 0 var(--space-md); /* 0 16px */
`;

const LightboxButton = styled.button`
  background-color: rgba(255,255,255,0.2);
  color: white;
  width: 35px; // Уменьшаем кнопки навигации
  height: 35px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;

  @media (max-width: 576px) {
    width: 30px;
    height: 30px;
  }
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const LightboxClose = styled.button`
  position: absolute;
  top: -35px; // Ближе к картинке
  right: -35px;
  background: none;
  border: none;
  color: white;
  font-size: 1.8rem; // Уменьшаем крестик
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    color: var(--accent-color);
    transform: rotate(90deg);
  }
  
  @media screen and (max-width: 768px) {
    top: var(--space-md); /* 16px */
    right: var(--space-md); /* 16px */
    background-color: rgba(0,0,0,0.3); // Добавляем фон для видимости
    border-radius: 50%;
    width: 30px;
    height: 30px;
    font-size: 1.2rem;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 400px; // Занимаем место пока грузится
`;

const LoadingSpinner = styled.div`
  border: 4px solid rgba(0, 0, 0, 0.1);
  border-top: 4px solid var(--primary-color);
  border-radius: 50%;
    width: 40px;
    height: 40px;
  animation: spin 1s linear infinite;
  margin-bottom: var(--space-md); /* 16px */

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }
    100% {
      transform: rotate(360deg);
    }
  }
`;

const ErrorMessage = styled.div`
  color: var(--danger-color);
  background-color: var(--danger-bg-light);
  border: 1px solid var(--danger-color);
  padding: var(--space-md); /* 16px */
  border-radius: var(--radius-sm);
  text-align: center;
  margin: var(--space-xl) auto; /* 32px auto */
  max-width: 600px;
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  padding: var(--space-xl); /* 32px */
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  
  i {
    font-size: 3rem;
    color: var(--text-secondary);
    margin-bottom: var(--space-md); /* 16px */
  }
  
  h3 {
    font-size: 1.3rem;
    color: var(--text-primary);
    margin-bottom: var(--space-sm); /* 8px */
  }
  
  p {
    font-size: 1rem;
    color: var(--text-secondary);
  }
`;

// Задаем порядок категорий и их названия
const CATEGORY_ORDER: { [key: string]: { name: string; order: number } } = {
  rooms: { name: 'Номера', order: 1 },
  territory: { name: 'Территория', order: 2 },
  sauna: { name: 'Сауна', order: 3 },
  conference: { name: 'Конференц-зал', order: 4 },
  party: { name: 'Детские праздники', order: 5 },
  food: { name: 'Питание', order: 6 }, // Добавляем питание
  // Добавляем 'Другое' как запасной вариант
  other: { name: 'Другое', order: 99 }
};

const GalleryPage: React.FC = () => {
  // Убираем состояния для фильтров и поиска
  const [allImages, setAllImages] = useState<GalleryImageItem[]>([]);
  const [groupedImages, setGroupedImages] = useState<{ [category: string]: GalleryImageItem[] }>({});
  const [orderedCategories, setOrderedCategories] = useState<string[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryImageItem | null>(null); // Храним сам объект картинки
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadGallery = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Загружаем все изображения
      const galleryData = await galleryService.getAllImages();
      
      // Сортируем ВСЕ изображения по displayOrder СРАЗУ
      const sortedAllImages = galleryData.sort((a, b) => (a.displayOrder ?? 0) - (b.displayOrder ?? 0));

      if (sortedAllImages && sortedAllImages.length > 0) {
        setAllImages(sortedAllImages); // Сохраняем отсортированный общий список для лайтбокса
        
        // Группируем отсортированные изображения по категориям
        const grouped: { [category: string]: GalleryImageItem[] } = {};
        sortedAllImages.forEach((image) => { // Итерируем по УЖЕ отсортированному списку
          const categoryKey = image.category || 'other'; 
          if (!grouped[categoryKey]) {
            grouped[categoryKey] = [];
          }
          grouped[categoryKey].push(image); // Добавляем в группу, порядок внутри группы сохраняется
        });
        setGroupedImages(grouped);
        
        // Сортируем ключи категорий для отображения секций
        const sortedCategories = Object.keys(grouped).sort((a, b) => {
            const orderA = CATEGORY_ORDER[a]?.order ?? CATEGORY_ORDER.other.order;
            const orderB = CATEGORY_ORDER[b]?.order ?? CATEGORY_ORDER.other.order;
            return orderA - orderB;
        });
        setOrderedCategories(sortedCategories);

      } else {
        setAllImages([]);
        setGroupedImages({});
        setOrderedCategories([]);
      }
    } catch (err) {
      console.error("Ошибка при загрузке галереи:", err);
      let message = 'Не удалось загрузить галерею.';
      if (err instanceof Error) {
          message = err.message;
      }
      setError(message);
      toast.error(message);
      setAllImages([]);
      setGroupedImages({});
      setOrderedCategories([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGallery();
  }, [loadGallery]);

  // Функции для лайтбокса
  const openLightbox = (image: GalleryImageItem) => { // Принимаем объект картинки
    setCurrentImage(image);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
    document.body.style.overflow = 'auto';
  };

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage) return;
    const currentIndex = allImages.findIndex(img => img._id === currentImage._id);
    if (currentIndex === -1) return;
    const newIndex = (currentIndex - 1 + allImages.length) % allImages.length;
    setCurrentImage(allImages[newIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage) return;
    const currentIndex = allImages.findIndex(img => img._id === currentImage._id);
    if (currentIndex === -1) return;
    const newIndex = (currentIndex + 1) % allImages.length;
    setCurrentImage(allImages[newIndex]);
  };

  // Определяем variants для анимации
  const imageVariants = {
    hidden: { opacity: 0, scale: 0.8 },
    visible: (i: number) => ({
      opacity: 1,
      scale: 1,
      transition: {
        delay: i * 0.05, // Небольшая задержка для каскадного эффекта
        duration: 0.3
      }
    }),
    exit: { opacity: 0, scale: 0.8, transition: { duration: 0.2 } }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <GalleryContainer>
        <GalleryHeader>
          <h1>Фотогалерея</h1>
          <p>Ознакомьтесь с фотографиями нашего отеля</p>
        </GalleryHeader>
        
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <p>Загрузка галереи...</p>
          </LoadingContainer>
        ) : error ? (
           <ErrorMessage>{error}</ErrorMessage>
        ) : orderedCategories.length > 0 ? (
          orderedCategories.map(categoryKey => (
            <CategorySection key={categoryKey}>
              <CategoryTitle>
                {CATEGORY_ORDER[categoryKey]?.name ?? CATEGORY_ORDER.other.name}
              </CategoryTitle>
              
              {/* --- ДЕСКТОПНАЯ СЕТКА --- */}
              <GalleryGrid>
                {groupedImages[categoryKey].map((image, index) => (
                  <GalleryItem
                    key={image._id}
                    variants={imageVariants}
                    initial="hidden"
                    animate="visible"
                    exit="hidden"
                    custom={index} 
                    layout
                    onClick={() => openLightbox(image)}
                  >
                    <img
                      src={optimizeCloudinaryImage(image.imageUrl, 'f_auto,q_auto,w_400')} // Оптимизация с шириной
                      alt={image.title || image.category}
                      loading="lazy"
                    />
                    <div className="image-overlay">
                      <i className="fas fa-search-plus"></i>
                    </div>
                  </GalleryItem>
                ))}
              </GalleryGrid>

              {/* --- МОБИЛЬНЫЙ СВАЙПЕР --- */}
              <MobileSwiperWrapper>
                <Swiper
                  modules={[Pagination, A11y]}
                  spaceBetween={10} // Отступ между слайдами
                  slidesPerView={'auto'} // Автоматическое определение кол-ва видимых слайдов на основе их ширины
                  pagination={{ clickable: true }}
                  grabCursor={true}
                >
                  {groupedImages[categoryKey].map((image, index) => (
                    <SwiperSlide key={image._id}>
                      <GalleryItem
                        // Убираем анимацию для слайдов, она может конфликтовать со свайпером
                        // variants={imageVariants}
                        // initial="hidden"
                        // animate="visible"
                        // exit="hidden"
                        // custom={index} 
                        // layout // layout может быть полезен, но проверим
                        onClick={() => openLightbox(image)}
                      >
                        <img
                          src={optimizeCloudinaryImage(image.imageUrl, 'f_auto,q_auto,w_400')} 
                          alt={image.title || image.category}
                          loading="lazy"
                        />
                        <div className="image-overlay">
                          <i className="fas fa-search-plus"></i>
                        </div>
                      </GalleryItem>
                    </SwiperSlide>
                  ))}
                </Swiper>
              </MobileSwiperWrapper>

            </CategorySection>
          ))
        ) : (
          <EmptyState>
            <i className="fas fa-images"></i>
            <h3>Галерея пуста</h3>
            <p>Администратор скоро добавит сюда фотографии.</p>
          </EmptyState>
        )}
      </GalleryContainer>
      
      {/* Лайтбокс */} 
      <AnimatePresence>
        {lightboxOpen && currentImage && (
          <Lightbox
            key="lightbox"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeLightbox}
          >
            <LightboxContent 
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.8 }}
              onClick={(e) => e.stopPropagation()} // Предотвращаем закрытие при клике на контент
            >
                <LightboxClose onClick={closeLightbox} aria-label="Закрыть">
                    &times;
                </LightboxClose>
                <LightboxImage 
                    src={optimizeCloudinaryImage(currentImage.imageUrl, 'f_auto,q_auto,w_1200')} // Оптимизация для лайтбокса
                    alt={currentImage.title || currentImage.category} 
                />
                {/* Убрали подпись из лайтбокса */}
            </LightboxContent>
            {/* Добавляем кнопки навигации только если картинок больше одной */} 
            {allImages.length > 1 && (
                <LightboxControls>
                    <LightboxButton onClick={handlePrevImage} aria-label="Предыдущее изображение">
                        <i className="fas fa-chevron-left"></i>
                    </LightboxButton>
                    <LightboxButton onClick={handleNextImage} aria-label="Следующее изображение">
                        <i className="fas fa-chevron-right"></i>
                    </LightboxButton>
                </LightboxControls>
            )}
          </Lightbox>
        )}
      </AnimatePresence>

    </motion.div>
  );
};

export default GalleryPage; 
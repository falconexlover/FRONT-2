import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService } from '../utils/api';
import { GalleryImageItem } from '../types/GalleryImage';
import { toast } from 'react-toastify';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import '../assets/css/gallery.css';

// Неиспользуемый компонент
// const GallerySection = styled.section`
//   padding: 5rem 0;
//   background-color: var(--bg-color);
// `;

const GalleryContainer = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 4rem 1rem; // Увеличим верхний отступ
`;

const GalleryHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--dark-color);
    margin-bottom: 1rem;
    font-size: 2.5rem; // Крупнее
  }
  
  p {
    color: var(--text-color);
    max-width: 600px;
    margin: 0 auto 1.5rem;
    font-size: 1.1rem; // Крупнее
  }
`;

// Новый контейнер для секции категории
const CategorySection = styled.div`
  margin-bottom: 4rem;
`;

// Новый заголовок для секции категории
const CategoryTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  color: var(--dark-color);
  margin-bottom: 2rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid var(--primary-color);
  display: inline-block; // Чтобы подчеркивание было по ширине текста
  font-size: 1.8rem;
`;

const GalleryGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr); // Строго 4 колонки
  gap: 1.5rem;
`;

const GalleryItem = styled(motion.div)`
  border-radius: var(--radius-sm); // Меньше радиус
  overflow: hidden;
  position: relative;
  cursor: pointer;
  height: 220px; // Меньше высота
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
  padding: 2rem;
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
  padding: 0 1rem;
`;

const LightboxButton = styled.button`
  background-color: rgba(255,255,255,0.2);
  color: white;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--primary-color);
  }
`;

const LightboxClose = styled.button`
  position: absolute;
  top: -40px;
  right: -40px;
  background: none;
  border: none;
  color: white;
  font-size: 2rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    color: var(--accent-color);
    transform: rotate(90deg);
  }
  
  @media screen and (max-width: 768px) {
    top: -40px;
    right: 0;
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
  margin-bottom: 1rem;

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
  text-align: center;
  padding: 2rem;
  color: #e53935;
  background-color: #ffebee;
  border: 1px solid #e53935;
  border-radius: var(--radius-sm);
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  text-align: center;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  
  i {
    font-size: 3rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.3rem;
    color: var(--text-primary);
    margin-bottom: 0.5rem;
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
          // Итерируем по отсортированным категориям
          orderedCategories.map(categoryKey => (
            <CategorySection key={categoryKey}>
              <CategoryTitle>
                {CATEGORY_ORDER[categoryKey]?.name ?? CATEGORY_ORDER.other.name}
              </CategoryTitle>
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
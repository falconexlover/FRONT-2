import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { galleryService } from '../utils/api';
import { GalleryImageItem } from '../types/GalleryImage';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { toast } from 'react-toastify';

// Используем стили, похожие на GalleryPage, но адаптируем
const PageContainer = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 4rem 1rem;
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--dark-color);
    margin-bottom: 1rem;
    font-size: 2.8rem; // Крупнее
  }
`;

// Стили для сетки фото, как в GalleryPage
const PhotoGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 1rem; // Уменьшим gap
  margin-bottom: 3rem;

  @media (max-width: 992px) {
    grid-template-columns: repeat(2, 1fr); // 2 колонки на планшетах
  }
  @media (max-width: 576px) {
    grid-template-columns: repeat(1, 1fr); // 1 колонка на мобильных
  }
`;

const PhotoItem = styled(motion.div)`
  border-radius: var(--radius-sm);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  height: 250px; // Выше
  background-color: var(--bg-secondary); // Фон-заглушка
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`;

// --- Новый контейнер для всего текстового контента ---
const TextContentWrapper = styled.div`
  max-width: 900px; // Ограничим ширину для читаемости
  margin: 3rem auto 0; // Отступ сверху и авто-центровка
  padding: 0 1rem; // Небольшие боковые отступы
`;

const DescriptionSection = styled.section`
  // Убираем фон и рамку
  // background-color: var(--bg-secondary);
  // padding: 2rem;
  // border-radius: var(--radius-md);
  margin-bottom: 2rem;
  line-height: 1.7; // Чуть меньше межстрочный интервал
  font-size: 1.05rem; // Чуть меньше шрифт
  color: var(--text-color); // Используем основной цвет текста страницы

  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 0.8rem; // Уменьшим отступ
    padding-left: 1.5rem;
    position: relative;
    &::before {
      content: '-'; // Используем тире вместо галочки
      position: absolute;
      left: 0;
      color: var(--text-color); // Основной цвет текста
      font-weight: bold;
    }
  }
`;

const WorkingHours = styled.p`
  font-size: 1rem; // Стандартный размер
  text-align: center;
  color: var(--text-color);
  margin-bottom: 2rem; // Увеличим отступ снизу
`;

const BookingInfo = styled.div`
  text-align: center;
  font-size: 1.1rem; // Чуть меньше
  font-weight: 500; // Не такой жирный
  color: var(--dark-color);
  margin-top: 2rem;
  padding: 1.5rem;
  background-color: var(--bg-light-accent, #f8f9fa); // Очень светлый фон для выделения
  border-radius: var(--radius-md);
  // Убираем тень
  // box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color-light, #eee);

  strong {
      display: block; // Номер телефона на новой строке
      margin-top: 0.5rem; // Отступ для номера
      font-size: 1.5rem; // Крупнее номер
      font-weight: 600;
      color: var(--primary-color);
  }
  
  a {
    color: var(--primary-color);
    text-decoration: none;
    // font-size: 1.4rem; // Удаляем, т.к. задано в strong
    // margin-left: 0.5rem; // Удаляем, т.к. номер на новой строке
    transition: var(--transition);

    &:hover {
        color: var(--secondary-color);
        text-decoration: underline;
    }
  }
`;

// Стили для лайтбокса (можно вынести в отдельный компонент позже)
// ... (Копируем стили Lightbox, LightboxContent, LightboxImage, LightboxControls, LightboxButton, LightboxClose из GalleryPage) ...
const Lightbox = styled(motion.div)`
  position: fixed; top: 0; left: 0; right: 0; bottom: 0;
  background-color: rgba(0,0,0,0.9); z-index: 1000; display: flex;
  align-items: center; justify-content: center; padding: 2rem;
`;
const LightboxContent = styled(motion.div)`
  position: relative; max-width: 90%; max-height: 90%; display: flex;
  flex-direction: column; align-items: center;
`;
const LightboxImage = styled.img`
  max-width: 100%; max-height: 90vh; border-radius: var(--radius-sm);
  box-shadow: var(--shadow-lg);
`;
const LightboxControls = styled.div`
  position: absolute; width: 100%; display: flex; justify-content: space-between;
  align-items: center; top: 50%; transform: translateY(-50%); padding: 0 1rem;
`;
const LightboxButton = styled.button`
  background-color: rgba(255,255,255,0.2); color: white; width: 40px; height: 40px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  border: none; cursor: pointer; transition: var(--transition);
  &:hover { background-color: var(--primary-color); }
`;
const LightboxClose = styled.button`
  position: absolute; top: -40px; right: -40px; background: none; border: none;
  color: white; font-size: 2rem; cursor: pointer; transition: var(--transition);
  &:hover { color: var(--accent-color); transform: rotate(90deg); }
  @media screen and (max-width: 768px) { top: -40px; right: 0; }
`;

// Стили для загрузки/ошибки
const LoadingContainer = styled.div` /* ... как в GalleryPage ... */ `;
const LoadingSpinner = styled.div` /* ... как в GalleryPage ... */ `;
const ErrorMessage = styled.div` /* ... как в GalleryPage ... */ `;

const SaunaPage: React.FC = () => {
  const [images, setImages] = useState<GalleryImageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImage, setCurrentImage] = useState<GalleryImageItem | null>(null);

  const loadSaunaImages = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Загружаем изображения ТОЛЬКО для категории 'sauna'
      const saunaImages = await galleryService.getAllImages('sauna');
      setImages(saunaImages);
    } catch (err) {
      console.error("Ошибка загрузки изображений сауны:", err);
      setError("Не удалось загрузить фотографии сауны.");
      toast.error("Не удалось загрузить фотографии сауны.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSaunaImages();
  }, [loadSaunaImages]);

  // Функции для лайтбокса (похожи на GalleryPage)
  const openLightbox = (image: GalleryImageItem) => {
    setCurrentImage(image);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  const closeLightbox = () => {
    setLightboxOpen(false);
    setCurrentImage(null);
    document.body.style.overflow = 'auto';
  };
  
  // Навигация в лайтбоксе по загруженным картинкам сауны
  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage) return;
    const currentIndex = images.findIndex(img => img._id === currentImage._id);
    if (currentIndex === -1) return;
    const newIndex = (currentIndex - 1 + images.length) % images.length;
    setCurrentImage(images[newIndex]);
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!currentImage) return;
    const currentIndex = images.findIndex(img => img._id === currentImage._id);
    if (currentIndex === -1) return;
    const newIndex = (currentIndex + 1) % images.length;
    setCurrentImage(images[newIndex]);
  };

  return (
    <PageContainer>
      <PageHeader>
        <h1>Сауна</h1>
      </PageHeader>

      {/* Фотографии */} 
      {loading ? (
        <LoadingContainer>
          <LoadingSpinner />
          <p>Загрузка фотографий...</p>
        </LoadingContainer>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : images.length > 0 ? (
        <PhotoGrid
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          {images.map((image) => (
            <PhotoItem
              key={image._id}
              layout
              onClick={() => openLightbox(image)}
              whileHover={{ scale: 1.03 }}
            >
              <img
                src={optimizeCloudinaryImage(image.imageUrl, 'f_auto,q_auto,w_600')} 
                alt={image.title || 'Сауна'}
                loading="lazy"
              />
            </PhotoItem>
          ))}
        </PhotoGrid>
      ) : (
        <p style={{textAlign: 'center', marginBottom: '3rem'}}>Фотографии сауны скоро появятся.</p>
      )}

      {/* --- Обертка для текстового контента --- */} 
      <TextContentWrapper>
        <DescriptionSection>
          <ul>
            {/* Список преимуществ */}
            <li>2 парилки - сухая и мокрая, под венички - выбирайте, что хочется;</li>
            <li>Купель с температурой воды 18 - 20 градусов;</li>
            <li>Комната отдыха с телевизором, Wi-Fi, удобным диваном и местом для застолья;</li>
            <li>Возможность заказать вкусную еду;</li>
            <li>Если пар утомил и ехать домой не хочется, можно снять номер и остаться на ночь;</li>
            <li>Парковка на территории - удобно, быстро, безопасно;</li>
            <li>Парковая территория создаст настроение и возможность подышать свежим лесным воздухом;</li>
            <li>Администратор предложит по очень приемлемой цене правильные веники, ароматические масла, прекрасный травяной чай.</li>
          </ul>
        </DescriptionSection>

        <WorkingHours>
          Сауна работает ежедневно, во все выходные и праздничные дни, с 9:00 до 23:00.
        </WorkingHours>

        <BookingInfo>
          Для бронирования сауны звоните:
          <a href="tel:+79151201744"><strong>8 (915) 120 17 44</strong></a>
        </BookingInfo>
      </TextContentWrapper>

      {/* Лайтбокс */}
      <AnimatePresence>
        {lightboxOpen && currentImage && (
          <Lightbox key="lightbox" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={closeLightbox}>
            <LightboxContent initial={{ scale: 0.8 }} animate={{ scale: 1 }} exit={{ scale: 0.8 }} onClick={(e) => e.stopPropagation()}>
              <LightboxClose onClick={closeLightbox} aria-label="Закрыть">&times;</LightboxClose>
              <LightboxImage 
                src={optimizeCloudinaryImage(currentImage.imageUrl, 'f_auto,q_auto,w_1200')} 
                alt={currentImage.title || 'Сауна'} 
              />
              {images.length > 1 && (
                <LightboxControls>
                  <LightboxButton onClick={handlePrevImage} aria-label="Предыдущее изображение">
                    <i className="fas fa-chevron-left"></i>
                  </LightboxButton>
                  <LightboxButton onClick={handleNextImage} aria-label="Следующее изображение">
                    <i className="fas fa-chevron-right"></i>
                  </LightboxButton>
                </LightboxControls>
              )}
            </LightboxContent>
          </Lightbox>
        )}
      </AnimatePresence>

    </PageContainer>
  );
};

export default SaunaPage; 
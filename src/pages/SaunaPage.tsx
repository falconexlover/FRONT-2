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
  padding: var(--space-xxxl) 0; /* 64px 0 */
  /* Добавляем фон и рамки */
  background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-secondary) 100%);
  border-top: 1px solid var(--border-color);
  border-bottom: 1px solid var(--border-color);
  
  /* Добавим боковой padding для контента внутри */
  > * {
      padding-left: var(--space-md);
      padding-right: var(--space-md);
      
      @media (min-width: 576px) {
          padding-left: var(--space-lg);
          padding-right: var(--space-lg);
      }
      @media (min-width: 992px) {
          padding-left: var(--space-xl);
          padding-right: var(--space-xl);
      }
  }
`;

const PageHeader = styled.div`
  text-align: center;
  margin-bottom: var(--space-xxl); /* 48px - Увеличим отступ */
  padding-bottom: var(--space-lg); /* Добавим отступ снизу */
  border-bottom: 1px solid var(--border-color); /* Добавим линию */
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--primary-color); /* Сделаем зеленым */
    margin-bottom: 0.5rem; /* Уменьшим отступ под заголовком */
    font-size: 3rem; /* Еще крупнее */
    font-weight: 700;
  }

  p { /* Стили для подзаголовка */
      color: var(--text-secondary);
      font-size: 1.1rem;
      max-width: 700px; /* Ограничим ширину */
      margin: 0 auto; /* Центрируем */
  }
  
  @media (max-width: 768px) {
      h1 { font-size: 2.5rem; }
      p { font-size: 1rem; }
      margin-bottom: var(--space-xl); /* 32px */
  }
`;

// Заголовок для секций внутри страницы
const SectionTitle = styled.h2`
    font-family: 'Playfair Display', serif;
    font-size: 1.8rem;
    color: var(--dark-color);
    margin-bottom: var(--space-lg); /* 24px */
    text-align: center;

    @media (max-width: 768px) {
        font-size: 1.5rem;
        margin-bottom: var(--space-md); /* 16px */
    }
`;

// Стили для сетки фото, как в GalleryPage
const PhotoGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: var(--space-lg); /* 24px - Увеличим gap */
  margin-bottom: var(--space-xxxl); /* 64px - Увеличим отступ снизу */

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
  box-shadow: var(--shadow-sm); /* Добавляем тень */
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
    transform: scale(1.05);
  }
  &:hover {
      box-shadow: var(--shadow-md); /* Усиливаем тень при наведении */
  }
`;

// --- Новый контейнер для всего текстового контента ---
const TextContentWrapper = styled.div`
  max-width: 900px; // Ограничим ширину для читаемости
  margin: 3rem auto 0; // Отступ сверху и авто-центровка
  padding: var(--space-xl) var(--space-lg); /* Увеличим padding */
  background-color: var(--bg-primary); /* Добавляем фон */
  border-radius: var(--radius-md); /* Добавляем скругление */
  box-shadow: var(--shadow-md); /* Добавляем тень */

  @media (max-width: 576px) {
      padding: var(--space-lg) var(--space-md);
  }
`;

// Обертка для смысловых секций внутри TextContentWrapper
const Section = styled.div`
  margin-bottom: var(--space-xxl); /* 48px - Отступ между секциями */
  &:last-child {
      margin-bottom: 0;
  }
`;

const DescriptionSection = styled.section`
  margin-bottom: 2rem;
  line-height: 1.7; 
  font-size: 1.05rem; 
  color: var(--text-color);

  h3 { /* Стили для подзаголовков внутри описания */
      font-family: 'Montserrat', sans-serif; /* Обычный шрифт */
      font-size: 1.3rem;
      font-weight: 600;
      color: var(--dark-color);
      margin-top: var(--space-xl); /* 32px */
      margin-bottom: var(--space-md); /* 16px */
  }

  p {
      margin-bottom: var(--space-md); /* Уменьшим отступ между параграфами */
  }

  ul {
    list-style: none;
    padding: 0;
  }
  
  li {
    margin-bottom: 0.8rem; 
    padding-left: 0; 
    position: relative; 
    display: flex; 
    align-items: center; 
    gap: 0.8rem; 
    
    /* Удаляем псевдоэлемент с тире */
    /* &::before {
      content: '-'; 
      position: absolute;
      left: 0;
      color: var(--text-color); 
      font-weight: bold;
    } */

    /* Стили для иконки (добавим в JSX) */
    i {
      color: var(--primary-color); 
      font-size: 1.1em; 
      width: 1.2em; 
      text-align: center; 
      /* margin-top: 0.1em; */ /* Убираем или комментируем старую коррекцию */
    }
  }
`;

const WorkingHours = styled.div` /* Меняем p на div */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--space-sm); /* 8px */
  font-size: 1rem; 
  text-align: center;
  color: var(--text-color);
  margin-bottom: var(--space-xxl); /* 48px - Увеличим еще отступ */
  padding: var(--space-md) 0; /* Добавим вертикальный отступ */
  border-top: 1px solid var(--border-color); /* Линия сверху */
  border-bottom: 1px solid var(--border-color); /* Линия снизу */
  
  i { /* Иконка часов */
      font-size: 1.5rem;
      color: var(--primary-color);
  }
`;

const BookingInfo = styled.div`
  text-align: center;
  padding: 2rem;
  /* background-color: var(--bg-primary); - Убираем фон */
  border-radius: var(--radius-lg); 
  border: 1px solid transparent; /* Убираем видимую рамку */
  /* box-shadow: var(--shadow-md); - Убираем тень */

  h3 { /* Заменяем на SectionTitle, этот стиль больше не нужен */
    display: none; /* Скрываем старый h3, используем SectionTitle */
  }

  p {
    font-size: 1rem;
    color: var(--text-secondary);
    margin-bottom: 1rem;
    line-height: 1.6; /* Добавим для читаемости */
  }

  a.phone-link { /* Отдельный стиль для телефонной ссылки */
    display: block; 
    margin-top: 0.5rem; 
    font-size: 1.8rem; 
    font-weight: 700;
    color: var(--primary-color);
    margin-bottom: 1.5rem; 
    text-decoration: none;
    transition: color 0.2s ease;

    &:hover {
        color: var(--secondary-color);
    }
  }
  
  strong {
      /* Убираем стили отсюда, теперь они в a.phone-link */
      display: none; 
  }
`;

// --- Стили для кнопки бронирования --- 
const BookingButton = styled.a`
  display: inline-block;
  background-color: var(--primary-color);
  color: var(--white-color, #fff); /* Добавим fallback */
  padding: 1rem 2.5rem; /* Увеличим кнопку */
  border-radius: var(--radius-sm);
  text-decoration: none;
  font-weight: 600;
  font-size: 1rem;
  text-align: center;
  cursor: pointer;
  border: 2px solid transparent;
  box-shadow: var(--shadow-xs); /* Легкая тень в обычном состоянии */
  /* Уточняем transition */
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease, box-shadow 0.2s ease;
  
  i {
    margin-right: 0.6rem; /* Чуть больше отступ справа */
    font-size: 0.9em; /* Иконка чуть меньше текста */
    vertical-align: middle; /* Выравниваем иконку по центру текста */
  }

  &:hover {
    background-color: var(--secondary-color);
    color: var(--white-color); 
    transform: translateY(-2px);
    box-shadow: var(--shadow-sm); /* Тень побольше при наведении */
  }
  
  &:active {
    transform: translateY(0);
    box-shadow: none;
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

// Декоративный разделитель
const Divider = styled.hr`
  border: none;
  border-top: 1px solid var(--border-color);
  margin: var(--space-xxl) auto; /* 48px */
  max-width: 300px;
  position: relative;

  &::after { /* Центральный элемент */
    content: '\f1bb'; /* Иконка листа Font Awesome (или другая) */
    font-family: 'Font Awesome 6 Free';
    font-weight: 900;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background-color: var(--bg-secondary); /* Цвет фона под иконкой (должен совпадать с фоном секции) */
    padding: 0 var(--space-sm);
    color: var(--primary-color);
    font-size: 1.2rem;
  }
`;

// Стили для загрузки/ошибки (аналогично другим страницам)
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column; /* Чтобы текст был под спиннером */
  justify-content: center;
  align-items: center;
  min-height: 300px; 
  padding: 2rem;
  text-align: center;
  color: var(--text-secondary);
`;

const LoadingSpinner = styled.div`
  margin-bottom: var(--space-md); /* Отступ под спиннером */
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
  margin: var(--space-xxl) auto; 
  padding: var(--space-lg) var(--space-xl); 
  background-color: rgba(var(--danger-color-rgb, 229, 57, 53), 0.1); 
  border: 1px solid var(--danger-color, #e53935);
  border-radius: var(--radius-md);
  color: var(--danger-color, #b71c1c); 
  text-align: center;
  max-width: 600px;
  font-weight: 500;

  &::before { 
    content: '\f071'; 
    font-family: 'Font Awesome 6 Free'; 
    font-weight: 900;
    margin-right: var(--space-sm); 
    font-size: 1.2em;
  }
`;

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
        <h1>Наша Сауна</h1>
        <p>Идеальное место для отдыха и восстановления сил. Насладитесь паром, бассейном и уютной атмосферой.</p>
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
        <>
          <SectionTitle>Фотогалерея</SectionTitle>
          <PhotoGrid
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            {images.map((image) => (
              <PhotoItem
                key={image._id}
                layoutId={image._id} // Для анимации лайтбокса
                onClick={() => openLightbox(image)}
                whileHover={{ scale: 1.03 }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <img src={optimizeCloudinaryImage(image.imageUrl, 'f_auto,q_auto,w_400,h_300,c_fill')} alt={image.description || 'Сауна'} loading="lazy" />
              </PhotoItem>
            ))}
          </PhotoGrid>
        </>
      ) : (
        <p style={{textAlign: 'center', marginBottom: '3rem'}}>Фотографии сауны скоро появятся.</p>
      )}

      {/* --- Обертка для текстового контента --- */} 
      <Divider /> {/* Добавляем разделитель */} 
      <TextContentWrapper>
        <Section> {/* Оборачиваем описание */} 
          <SectionTitle>Описание</SectionTitle> 
          <DescriptionSection>
            {/* Пример улучшенного текста, замени на реальный */} 
            <p>
              Наша просторная сауна - идеальное место для расслабления после насыщенного дня или для проведения времени в компании друзей. К вашим услугам жаркая парная, освежающий бассейн и уютная зона отдыха.
            </p>
            <h3>Что включено:</h3>
            <ul>
              <li><i className="fas fa-check"></i> Пользование парной (до 6 человек)</li>
              <li><i className="fas fa-check"></i> Бассейн с подогревом</li>
              <li><i className="fas fa-check"></i> Зона отдыха с удобными диванами и столом</li>
              <li><i className="fas fa-check"></i> Простыни и полотенца</li>
              <li><i className="fas fa-check"></i> Чайник и чайный набор</li>
            </ul>
            {/* Добавь другие параграфы или секции по необходимости */} 
          </DescriptionSection>
        </Section>

        <Section> {/* Оборачиваем часы работы */} 
          {/* <SectionTitle>Часы работы</SectionTitle> - Можно добавить, если нужно */} 
          <WorkingHours>
            <i className="fas fa-clock"></i> 
            <span>Часы работы: Ежедневно с 10:00 до 23:00 (по предварительной записи)</span>
          </WorkingHours>
        </Section>

        <Section> {/* Оборачиваем блок бронирования */} 
          <BookingInfo>
            <SectionTitle>Забронировать сауну</SectionTitle> {/* Используем SectionTitle */} 
            <p>Чтобы забронировать сауну или узнать подробности, пожалуйста, свяжитесь с нами по телефону:</p>
            <a href="tel:+79151201744" className="phone-link">+7 (915) 120-17-44</a> 
            <BookingButton href="tel:+79151201744">
              <i className="fas fa-phone-alt"></i>Позвонить для бронирования
            </BookingButton>
          </BookingInfo>
        </Section>
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
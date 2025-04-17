import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { pageService } from '../utils/api';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../components/AdminPanel';

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

// --- Интерфейс контента (согласуем с редактором) --- 
interface SaunaPageContentData {
  title: string;
  subtitle: string;
  description: string;
  features: string[];
  workingHours: string;
  contactPhone: string;
  bookingButtonText: string;
  imageUrls?: string[];
  cloudinaryPublicIds?: string[];
}

const PAGE_ID = 'sauna';

// --- Компонент страницы --- 
const SaunaPage: React.FC = () => {
  // Состояния для контента страницы
  const [content, setContent] = useState<SaunaPageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Загрузка данных страницы
  useEffect(() => {
    const loadPageContent = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const pageData = await pageService.getPageContent(PAGE_ID);
        if (pageData && pageData.content && typeof pageData.content === 'object') {
          // Валидируем и устанавливаем контент
          setContent({
            title: pageData.content.title || 'Наша Сауна', // Дефолтные значения
            subtitle: pageData.content.subtitle || 'Идеальное место для отдыха...',
            description: pageData.content.description || '',
            features: Array.isArray(pageData.content.features) ? pageData.content.features : [],
            workingHours: pageData.content.workingHours || 'Ежедневно с 10:00 до 23:00',
            contactPhone: pageData.content.contactPhone || '+7 (XXX) XXX-XX-XX',
            bookingButtonText: pageData.content.bookingButtonText || 'Позвонить для бронирования',
            imageUrls: Array.isArray(pageData.content.imageUrls) ? pageData.content.imageUrls : [],
            cloudinaryPublicIds: Array.isArray(pageData.content.cloudinaryPublicIds) ? pageData.content.cloudinaryPublicIds : []
          });
        } else {
          console.warn(`Контент для страницы '${PAGE_ID}' не найден.`);
          setError('Не удалось загрузить содержимое страницы.');
        }
      } catch (err) {
        console.error(`Ошибка загрузки страницы ${PAGE_ID}:`, err);
        setError("Не удалось загрузить информацию о сауне.");
        toast.error("Не удалось загрузить информацию о сауне.");
      } finally {
        setIsLoading(false);
      }
    };
    loadPageContent();
  }, []);

  // Рендеринг состояний загрузки/ошибки
  if (isLoading) {
    return (
      <PageContainer style={{ textAlign: 'center', minHeight: '70vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка информации о сауне...</LoadingSpinner>
      </PageContainer>
    );
  }

  if (error || !content) {
    return (
      <PageContainer style={{ textAlign: 'center' }}>
        <PageHeader>
          <h1>Сауна</h1>
          <p style={{ color: 'var(--danger-color)' }}>{error || 'Не удалось загрузить информацию о странице.'}</p>
        </PageHeader>
      </PageContainer>
    );
  }

  // --- Основной рендеринг компонента ---
  return (
    <PageContainer>
      <PageHeader>
        {/* Используем title и subtitle из content */}
        <h1>{content.title}</h1>
        <p>{content.subtitle}</p>
      </PageHeader>

      {/* Отображаем галерею из content.imageUrls */}
      {content.imageUrls && content.imageUrls.length > 0 && (
        <PhotoGrid layout>
          {content.imageUrls.map((url, index) => (
            <PhotoItem
              key={content.cloudinaryPublicIds?.[index] || url}
              layoutId={content.cloudinaryPublicIds?.[index] || url}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{ cursor: 'default' }}
            >
              <img 
                src={optimizeCloudinaryImage(url, 'w_400,h_300,c_fill,q_auto')} 
                alt={`${content.title} - Фото ${index + 1}`}
                loading="lazy"
              />
            </PhotoItem>
          ))}
        </PhotoGrid>
      )}

      {/* Секция с описанием, часами работы и бронированием */}
      <TextContentWrapper>
        <Section>
           <SectionTitle>Описание</SectionTitle>
           {/* Используем description из content */}
           <DescriptionSection>
              {content.description ? (
                  content.description.split('\n').map((paragraph, index) => (
                      <p key={index}>{paragraph || '\u00A0'}</p>
                  ))
              ) : (
                  <p>Подробное описание сауны скоро появится...</p>
              )}

              {/* Отображаем features из content */} 
              {content.features && content.features.length > 0 && (
                  <>
                      <h3>К вашим услугам:</h3>
                      <ul>
                          {content.features.map((feature, index) => (
                              <li key={index}><i className="fas fa-check"></i>{feature}</li>
                          ))}
                      </ul>
                  </>
              )}
           </DescriptionSection>
        </Section>
        
        <Section>
           {/* Используем workingHours из content */}
           <WorkingHours>
                <i className="fas fa-clock"></i>
                <span>{content.workingHours}</span>
           </WorkingHours>
        </Section>
        
        <Section>
            <BookingInfo>
               <SectionTitle>Бронирование</SectionTitle>
               <p>Для бронирования сауны и уточнения деталей, пожалуйста, свяжитесь с нами по телефону:</p>
                {/* Используем contactPhone из content */}
               <a href={`tel:${content.contactPhone.replace(/\s|\(|\)|-/g, '')}`} className="phone-link">
                  {content.contactPhone}
               </a>
               {/* Используем bookingButtonText из content */}
               <BookingButton href={`tel:${content.contactPhone.replace(/\s|\(|\)|-/g, '')}`}>
                 {content.bookingButtonText}
               </BookingButton>
            </BookingInfo>
        </Section>
      </TextContentWrapper>
    </PageContainer>
  );
};

export default SaunaPage; 
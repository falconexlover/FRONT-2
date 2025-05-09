import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion'; // <-- Импортируем motion
import { homePageService } from '../utils/api'; // Импортируем сервис API
import { HomePageContent } from '../types/HomePage'; // Импортируем тип
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils'; // Импортируем оптимизатор
import { toast } from 'react-toastify'; // Для сообщений об ошибках
import { LoadingSpinner } from '../components/AdminPanel'; // Импортируем спиннер загрузки
import { galleryService } from '../utils/api';
import { GalleryImageItem } from '../types/GalleryImage';

// --- Стили ---
// Используем стили, похожие на другие страницы, например, SaunaPage или ConferencePage
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: var(--text-primary);
`;

// Улучшенные стили заголовка (как в ConferencePage)
const PageTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 3rem; 
  font-size: 2.5rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  position: relative;
  padding-bottom: 0.75rem;

  &:after {
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
`;

const ContentSection = styled.section`
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
`;

// Стили для списка с иконками (как в ConferencePage)
const FeatureItem = styled.li`
  margin-bottom: 0.8rem;
  font-size: 1rem;
  line-height: 1.6;
  display: flex;
  align-items: flex-start;
  gap: 0.8rem;
  
  i {
    font-size: 1.2rem;
    color: var(--primary-color);
    line-height: 1.6;
    width: 1.5em;
    text-align: center;
    margin-top: 0.1em;
  }
`;

const FeaturesList = styled.ul`
  list-style: none; /* Убираем стандартные маркеры */
  margin-left: 0;
  padding-left: 0; 
  margin-bottom: 1.5rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;

  img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color-light);
  }
`;

// Улучшенный ContactInfo (как в ConferencePage)
const ContactInfo = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-top: 3px solid var(--primary-color);
  border-radius: 0 0 var(--radius-md) var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-md);

  .call-to-action { 
    font-size: 1.3rem;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.5rem;
  }

  p {
    margin-bottom: 1rem; // Увеличиваем стандартный отступ
    font-size: 1.1rem;
    color: var(--text-secondary);
    line-height: 1.6;

    &:last-of-type { 
        margin-bottom: 0; 
    }
  }

  a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const VKLink = styled.a` /* Оставляем стили для VK */
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

// <<< Новый контейнер для рамки вокруг сетки изображений
const ImageGridContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
  background-color: var(--bg-primary); // Слегка отличный фон
`;

// --- Варианты анимации (как в ConferencePage) ---
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
  })
};

// --- Константы для страницы (если нужны) --- 
const PARTY_PHONE_NUMBER = '+79169266514';
const PARTY_PHONE_NUMBER_DISPLAY = '8 (916) 926-65-14';
const VK_LINK = "https://vk.com/lesnoy_dvorik";

// --- Компонент страницы ---

const PartyPage: React.FC = () => {
  const [content, setContent] = useState<HomePageContent['party'] | null>(null);
  const [galleryImages, setGalleryImages] = useState<GalleryImageItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const homeData = await homePageService.getHomePage();
        if (homeData && homeData.party) {
          setContent(homeData.party);
        } else {
          setContent({ title: 'Детские праздники', content: 'Информация скоро появится...' });
        }
        const images = await galleryService.getAllImages('party');
        setGalleryImages(Array.isArray(images) ? images : []);
      } catch (err) {
        setError("Не удалось загрузить информацию о странице.");
        toast.error("Не удалось загрузить информацию о странице.");
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, []);

  // Обработка состояний загрузки и ошибки
  if (isLoading) {
    return (
      <PageWrapper style={{ textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка страницы...</LoadingSpinner>
      </PageWrapper>
    );
  }

  if (error || !content) {
    return (
      <PageWrapper style={{ textAlign: 'center' }}>
        <PageTitle>Детские праздники</PageTitle>
        <p style={{ color: 'var(--danger-color)'}}>{error || 'Не удалось загрузить контент страницы.'}</p>
      </PageWrapper>
    );
  }

  // Рендеринг компонента с загруженными данными
  return (
    <PageWrapper>
      <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={0}>
         {/* Используем title из контента */}
        <PageTitle>{content.title || 'Детские праздники в "Лесном дворике"'}</PageTitle>
      </motion.div>

      <ContentSection>
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={1.5}> 
          {/* Этот список можно оставить статическим или перенести в админку */}
          <FeaturesList>
            <FeatureItem><i className="fas fa-utensils"></i>Собственная кухня с детским и взрослым меню - вкусно будет всем!</FeatureItem>
            <FeatureItem><i className="fas fa-gifts"></i>Праздничное оформление мероприятия.</FeatureItem>
            <FeatureItem><i className="fas fa-tree"></i>Прекрасная лесопарковая зона с транспортной доступностью.</FeatureItem>
            <FeatureItem><i className="fas fa-parking"></i>Собственная парковка.</FeatureItem>
            <FeatureItem><i className="fas fa-music"></i>Музыкальная колонка и ТВ с W-Fi.</FeatureItem>
            <FeatureItem><i className="fas fa-bed"></i>Возможность разместиться на ночь.</FeatureItem>
            <FeatureItem><i className="fas fa-child"></i>Подбор аниматоров.</FeatureItem>
          </FeaturesList>
        </motion.div>

        {/* Отображаем изображения из galleryImages */}
        {galleryImages.length > 0 && (
           <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={2}>
             <ImageGridContainer>
               <ImageGrid>
                 {galleryImages.map((img, index) => (
                   <motion.img 
                     key={img._id}
                     src={optimizeCloudinaryImage(img.imageUrl, 'w_400,h_300,c_fill,q_auto')} 
                     alt={`${content?.title || 'Детский праздник'} - Фото ${index + 1}`}
                     loading="lazy"
                     whileHover={{ scale: 1.03 }}
                     transition={{ duration: 0.2 }}
                   />
                 ))}
               </ImageGrid>
             </ImageGridContainer>
           </motion.div>
        )}

        <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={3}>
          <ContactInfo>
            {/* Контактная информация остается статической */}
            <p>
              <i className="fas fa-phone-alt" style={{ marginRight: '0.5rem' }}></i>
              Телефон: <a href={`tel:${PARTY_PHONE_NUMBER}`}>{PARTY_PHONE_NUMBER_DISPLAY}</a> 
            </p>
            <p style={{ fontSize: '1rem' }}> 
              Наш адрес: г. Жуковский, ул. Нижегородская, д. 4, санаторий-профилакторий «Лесной дворик».
            </p>
            <p style={{ fontSize: '1rem' }}> 
              А в нашем сообществе ВК много интересного и полезного для отдыха и работы: 
              <VKLink href={VK_LINK} target="_blank" rel="noopener noreferrer">@lesnoy_dvorik</VKLink> - подписывайтесь!
            </p>
          </ContactInfo>
        </motion.div>
      </ContentSection>
    </PageWrapper>
  );
};

export default PartyPage; 
import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import styled from 'styled-components';
import { pageService } from '../utils/api';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { toast } from 'react-toastify';
import { LoadingSpinner } from '../components/AdminPanel';
import { useNavigate } from 'react-router-dom';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';
import Zoom from 'yet-another-react-lightbox/plugins/zoom';

// --- ОПРЕДЕЛЕНИЯ СТИЛЕЙ --- 
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 0 1rem;
  color: var(--text-primary);
`;

const PageTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 3rem; 
  font-size: 2.5rem;
  font-weight: 600; /* Задаем жирность */
  letter-spacing: 0.5px; /* Добавляем межбуквенное расстояние */
  position: relative;
  padding-bottom: 0.75rem; /* Добавляем отступ снизу для линии */

  &:after {
    content: '';
    position: absolute;
    bottom: 0; /* Линия теперь под текстом */
    left: 50%;
    transform: translateX(-50%);
    width: 80px; /* Делаем линию шире */
    height: 3px; /* Делаем линию чуть толще */
    background-color: var(--accent-color);
    border-radius: 1.5px; /* Слегка скругляем */
  }
`;

const ContentSection = styled.section`
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
`;

const Description = styled.p`
  font-size: 1.1rem;
  line-height: 1.7;
  margin-bottom: 1.5rem;
`;

const FeatureItem = styled.li`
  margin-bottom: 0.8rem;
  font-size: 1rem;
  line-height: 1.6;
  display: flex;
  align-items: baseline;
  gap: 0.8rem;
  
  i {
    font-size: 1.2rem;
    color: var(--primary-color);
    width: 1.5em;
    text-align: center;
  }
`;

const FeaturesList = styled.ul`
  list-style: none;
  margin-left: 0;
  padding-left: 0; // Убираем отступ по умолчанию
  margin-bottom: 1.5rem;
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 1rem;

  img {
    width: 100%;
    height: 220px;
    object-fit: cover;
    border-radius: var(--radius-sm);
    border: 1px solid var(--border-color-light);
    transition: transform 0.3s ease, box-shadow 0.3s ease;

    &:hover {
      transform: scale(1.03);
      box-shadow: var(--shadow-md);
    }
  }

  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    img {
      height: 180px;
    }
  }
`;

const ImageGridContainer = styled.div`
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  padding: 1rem;
  margin-top: 1rem;
  background-color: var(--bg-primary);
`;

const ContactInfo = styled.div`
  margin-top: 3rem;
  padding: 2rem;
  background-color: var(--bg-secondary); /* Слегка другой фон */
  border: 1px solid var(--border-color);
  border-top: 3px solid var(--primary-color); /* Акцентная верхняя граница */
  border-radius: 0 0 var(--radius-md) var(--radius-md); /* Скругление только снизу */
  text-align: center;
  box-shadow: var(--shadow-md);

  .call-to-action { /* Класс для стилизации призыва */
    font-size: 1.3rem; /* Крупнее */
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: 1.5rem; /* Больше отступ снизу */
  }

  p {
    margin-bottom: 0.8rem;
    font-size: 1.1rem;
    color: var(--text-secondary);

    &:last-of-type {
        margin-bottom: 0; /* Убираем нижний отступ у последнего параграфа перед кнопкой */
    }
  }

  a {
    color: var(--primary-color);
    font-weight: 600;
    text-decoration: none;
    &:hover { text-decoration: underline; }
  }
`;

const BookButton = styled.button`
  display: inline-block;
  margin-top: 1.5rem;
  padding: 0.9rem 2rem;
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

  &:hover {
    background-color: var(--secondary-color);
    transform: translateY(-2px);
    box-shadow: var(--shadow-lg);
  }
  
  &:active {
      transform: translateY(0);
      box-shadow: var(--shadow-sm);
  }
`;

const TwoColumnLayout = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  margin-bottom: 2.5rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 1fr;
    gap: 3rem;
  }
`;
// --- КОНЕЦ ОПРЕДЕЛЕНИЙ СТИЛЕЙ ---

// --- Варианты анимации --- 
const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (i: number = 1) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.5, ease: "easeOut" }
  })
};

// --- Константы --- 
const CONTACT_PHONE_NUMBER = '+79169266514';
const CONTACT_PHONE_NUMBER_DISPLAY = '8 (916) 926-65-14';
const PAGE_ID = 'conference';

// --- Интерфейс для контента (согласуем с редактором) --- 
interface PageContentData {
  description: string;
  features: string[];
  imageUrls?: string[];
  cloudinaryPublicIds?: string[];
}

// --- Основной компонент страницы --- 
const ConferencePage: React.FC = () => {
  const [content, setContent] = useState<PageContentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const pageData = await pageService.getPageContent(PAGE_ID);
        if (pageData && pageData.content && typeof pageData.content === 'object') {
           // Добавляем проверку типов для полей
           const loadedContent: PageContentData = {
              description: typeof pageData.content.description === 'string' ? pageData.content.description : '',
              features: Array.isArray(pageData.content.features) ? pageData.content.features : [],
              imageUrls: Array.isArray(pageData.content.imageUrls) ? pageData.content.imageUrls : [],
              cloudinaryPublicIds: Array.isArray(pageData.content.cloudinaryPublicIds) ? pageData.content.cloudinaryPublicIds : [],
           };
           setContent(loadedContent);
        } else {
          console.warn(`Контент для страницы '${PAGE_ID}' не найден или имеет неверный формат.`);
          setContent({ description: 'Информация о конференц-зале скоро появится...', features: [], imageUrls: [] });
        }
      } catch (err) {
        console.error(`Ошибка загрузки данных страницы ${PAGE_ID}:`, err);
        setError("Не удалось загрузить информацию о конференц-зале.");
        toast.error("Не удалось загрузить информацию о конференц-зале.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleBookClick = () => {
    navigate('/booking');
  };

  // Состояния загрузки и ошибки
  if (isLoading) {
    return (
      <PageWrapper style={{ textAlign: 'center', minHeight: '50vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка информации...</LoadingSpinner>
      </PageWrapper>
    );
  }

  if (error || !content) {
    return (
      <PageWrapper style={{ textAlign: 'center' }}>
        <PageTitle>Конференц-зал</PageTitle>
        <p style={{ color: 'var(--danger-color)' }}>{error || 'Не удалось загрузить контент страницы.'}</p>
      </PageWrapper>
    );
  }

  // Рендеринг с данными
  return (
    <PageWrapper>
      <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={0}>
        <PageTitle>Конференц-зал в "Лесном дворике"</PageTitle>
      </motion.div>

      <ContentSection>
        {/* Разметка описания и преимуществ в две колонки */}
        <TwoColumnLayout>
          <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={1}>
             {/* Отображаем описание из content */}
             {content.description ? (
                content.description.split('\n').map((paragraph, index) => (
                    <Description key={index}>{paragraph || '\u00A0'}</Description>
                ))
             ) : (
                 <Description>Описание конференц-зала скоро появится...</Description>
             )}
          </motion.div>
          
          <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={1.5}>
             {/* Отображаем список преимуществ из content */}
             {content.features && content.features.length > 0 ? (
                <FeaturesList>
                  <h3>Наши преимущества:</h3>
                  {content.features.map((feature, index) => (
                    <FeatureItem key={index}><i className="fas fa-check-circle"></i>{feature}</FeatureItem>
                  ))}
                </FeaturesList>
             ) : (
                 <p>Информация о преимуществах зала скоро появится...</p>
             )}
          </motion.div>
        </TwoColumnLayout>

        {/* Отображаем изображения из content.imageUrls */}
        {content.imageUrls && content.imageUrls.length > 0 && (
            <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={2}>
              <ImageGridContainer>
                <h3>Галерея</h3>
                 <ImageGrid>
                  {content.imageUrls.map((url, index) => (
                    <motion.img 
                      key={content.cloudinaryPublicIds?.[index] || url}
                      src={optimizeCloudinaryImage(url, 'w_400,h_300,c_fill,q_auto')}
                      alt={`Конференц-зал - Фото ${index + 1}`}
                      loading="lazy"
                      whileHover={{ scale: 1.03 }}
                      transition={{ duration: 0.2 }}
                    />
                  ))}
                </ImageGrid>
              </ImageGridContainer>
            </motion.div>
        )}

        {/* Контактная информация и кнопка бронирования остаются статическими */}
        <motion.div initial="hidden" animate="visible" variants={sectionVariants} custom={3}>
          <ContactInfo>
            <p className="call-to-action">Готовы провести мероприятие?</p>
            <p>Свяжитесь с нами для уточнения деталей и бронирования:</p>
            <p>
                <i className="fas fa-phone-alt" style={{ marginRight: '0.5rem' }}></i>
                Телефон: <a href={`tel:${CONTACT_PHONE_NUMBER}`}>{CONTACT_PHONE_NUMBER_DISPLAY}</a>
            </p>
            {/* Можно добавить Email, если он релевантен */}
            <BookButton onClick={handleBookClick}>
               Забронировать зал
            </BookButton>
          </ContactInfo>
        </motion.div>
      </ContentSection>
    </PageWrapper>
  );
};

export default ConferencePage; 
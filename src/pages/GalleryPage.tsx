import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { loadGalleryFromStorage } from '../utils/localStorageUtils';
import '../assets/css/gallery.css';

// Фейковый импорт анимаций, если модуль не существует
const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 }
};

// Неиспользуемый компонент
// const GallerySection = styled.section`
//   padding: 5rem 0;
//   background-color: var(--bg-color);
// `;

const GalleryContainer = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 2rem 1rem;
`;

const GalleryHeader = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  
  h1 {
    font-family: 'Playfair Display', serif;
    color: var(--dark-color);
    margin-bottom: 1rem;
  }
  
  p {
    color: var(--text-color);
    max-width: 600px;
    margin: 0 auto 1.5rem;
  }
`;

const FiltersContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  flex-wrap: wrap;
  margin-bottom: 2rem;
`;

const CategoriesContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
`;

const CategoryButton = styled.button<{ active: boolean }>`
  padding: 0.7rem 1.5rem;
  margin: 0 0.5rem 1rem;
  background: ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'white' : 'var(--text-color)'};
  border: 2px solid ${props => props.active ? 'var(--primary-color)' : '#eee'};
  border-radius: var(--radius-full);
  font-weight: ${props => props.active ? '600' : '400'};
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    border-color: var(--primary-color);
    color: ${props => props.active ? 'white' : 'var(--primary-color)'};
  }
`;

const SearchContainer = styled.div<{ active: boolean }>`
  position: relative;
  display: ${props => props.active ? 'flex' : 'none'};
  align-items: center;
  margin-left: 1rem;
`;

const SearchIconButton = styled.button<{ active: boolean }>`
  background: none;
  border: none;
  color: ${props => props.active ? 'var(--primary-color)' : 'var(--dark-color)'};
  font-size: 1.5rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    color: var(--accent-color);
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-size: 1rem;
  width: 200px;
  transition: var(--transition);
  
  &:focus {
    outline: none;
    box-shadow: var(--shadow-sm);
  }
`;

const GalleryGrid = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 2rem;
  margin-bottom: 3rem;
`;

const GalleryItem = styled(motion.div)`
  border-radius: var(--radius-md);
  overflow: hidden;
  position: relative;
  cursor: pointer;
  height: 250px;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    
    img {
      transform: scale(1.05);
    }
    
    .image-caption {
    opacity: 1;
      transform: translateY(0);
  }
  }
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  .image-caption {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    padding: 1rem;
    background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
    color: white;
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.3s ease;
    
    h3 {
      margin-bottom: 0.3rem;
      font-size: 1.2rem;
    }
    
    p {
      font-size: 0.9rem;
      opacity: 0.8;
    }
  }
`;

const GalleryItemOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  padding: 1.5rem;
  color: white;
  z-index: 2;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.3s ease;
  background: linear-gradient(to top, rgba(0,0,0,0.8), transparent);
  
  h3 {
    font-size: 1.2rem;
    margin-bottom: 0.3rem;
  }
  
  p {
    font-size: 0.9rem;
    opacity: 0.9;
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

const LightboxCaption = styled.div`
  text-align: center;
  color: white;
  width: 100%;
  padding: 1rem 0;
  max-width: 800px;
  
  h3 {
    margin-bottom: 0.5rem;
    font-size: 1.2rem;
  }
  
  p {
    font-size: 1rem;
  }
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 300px;
  text-align: center;
  
  i {
    font-size: 4rem;
    color: var(--dark-color);
    margin-bottom: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    color: var(--dark-color);
    margin-bottom: 0.5rem;
  }
  
  p {
    font-size: 1rem;
    color: var(--dark-color);
    opacity: 0.7;
  }
`;

const GalleryPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [images, setImages] = useState<any[]>([]);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearchActive, setIsSearchActive] = useState(false);

  useEffect(() => {
    loadGalleryImages();
  }, []);

  // Загрузка изображений из localStorage
  const loadGalleryImages = () => {
    const galleryData = loadGalleryFromStorage();
    if (galleryData && galleryData.length > 0) {
      setImages(galleryData);
      const uniqueCategories = Array.from(new Set(galleryData.map((image: any) => image.category)));
      setCategories(['all', ...uniqueCategories]);
    } else {
      setImages([]);
      setCategories(['all']);
    }
    setLoading(false);
  };

  // Получение всех изображений для лайтбокса
  const getAllImages = () => {
    return filteredImages;
  };

  // Открытие лайтбокса
  const openLightbox = (index: number) => {
    setCurrentImageIndex(index);
    setLightboxOpen(true);
    document.body.style.overflow = 'hidden';
  };
  
  // Закрытие лайтбокса
  const closeLightbox = () => {
    setLightboxOpen(false);
    document.body.style.overflow = 'auto';
  };

  // Фильтрация изображений
  const filteredImages = activeCategory === 'all' 
    ? images 
    : images.filter(img => img.category === activeCategory);

  // Дополнительная фильтрация по поисковому запросу
  const searchFilteredImages = searchTerm.trim() === '' 
    ? filteredImages 
    : filteredImages.filter(img => 
        (img.title && img.title.toLowerCase().includes(searchTerm.toLowerCase())) || 
        (img.description && img.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
  
  return (
    <motion.div
      initial="initial"
      animate="animate"
      variants={fadeIn}
    >
      <GalleryContainer>
        <GalleryHeader>
          <h1>Фотогалерея</h1>
          <p>Ознакомьтесь с фотографиями нашего санатория-профилактория</p>
          
          <FiltersContainer>
            <CategoriesContainer>
              {categories.map((category) => (
                <CategoryButton 
                  key={category} 
                  active={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                >
                  {category === 'all' ? 'Все' : category}
                </CategoryButton>
              ))}
            </CategoriesContainer>
            
            <SearchContainer active={isSearchActive}>
              <SearchIconButton 
                onClick={() => setIsSearchActive(!isSearchActive)}
                active={isSearchActive}
              >
                <i className="fas fa-search"></i>
              </SearchIconButton>
              {isSearchActive && (
                <SearchInput
                  type="text"
                  placeholder="Поиск по галерее..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  autoFocus
                />
              )}
            </SearchContainer>
          </FiltersContainer>
        </GalleryHeader>
        
        {loading ? (
          <LoadingContainer>
            <LoadingSpinner />
            <p>Загрузка галереи...</p>
          </LoadingContainer>
        ) : searchFilteredImages.length > 0 ? (
          <GalleryGrid>
            {searchFilteredImages.map((image, index) => (
              <GalleryItem
                key={image.id || index} 
                onClick={() => openLightbox(getAllImages().findIndex(img => 
                  (img.id && image.id) ? img.id === image.id : img.url === image.url
                ))}
              >
                <img 
                  src={image.url || image} 
                  alt={image.title || `Изображение ${index + 1}`} 
                  loading="lazy"
                />
                {image.title && (
                  <GalleryItemOverlay>
                  <h3>{image.title}</h3>
                    {image.description && <p>{image.description}</p>}
                  </GalleryItemOverlay>
                )}
              </GalleryItem>
            ))}
          </GalleryGrid>
        ) : (
          <EmptyState>
            <i className="fas fa-image"></i>
            <h3>Изображения не найдены</h3>
            <p>
              {searchTerm 
                ? 'По вашему запросу ничего не найдено. Попробуйте изменить поисковый запрос.'
                : 'В этой категории пока нет изображений.'}
            </p>
          </EmptyState>
        )}
        
        {/* @ts-ignore - Игнорируем ошибку типа для AnimatePresence */}
        <AnimatePresence mode="wait">
          {lightboxOpen && (
            <Lightbox
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={closeLightbox}
            >
              <LightboxContent onClick={(e: React.MouseEvent) => e.stopPropagation()}>
                <LightboxImage 
                  src={getAllImages()[currentImageIndex].url || getAllImages()[currentImageIndex]} 
                  alt={getAllImages()[currentImageIndex].title || `Изображение ${currentImageIndex + 1}`}
                />
                
                <LightboxControls>
                  <LightboxButton 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      const newIndex = (currentImageIndex - 1 + getAllImages().length) % getAllImages().length;
                      setCurrentImageIndex(newIndex);
                    }}
                  >
                    <i className="fas fa-chevron-left"></i>
                  </LightboxButton>
                  
                <LightboxClose onClick={closeLightbox}>
                  <i className="fas fa-times"></i>
                </LightboxClose>
                  
                  <LightboxButton 
                    onClick={(e: React.MouseEvent) => {
                      e.stopPropagation();
                      const newIndex = (currentImageIndex + 1) % getAllImages().length;
                      setCurrentImageIndex(newIndex);
                    }}
                  >
                    <i className="fas fa-chevron-right"></i>
                  </LightboxButton>
                </LightboxControls>
                
                {getAllImages()[currentImageIndex].title && (
                <LightboxCaption>
                    <h3>{getAllImages()[currentImageIndex].title}</h3>
                    {getAllImages()[currentImageIndex].description && (
                      <p>{getAllImages()[currentImageIndex].description}</p>
                    )}
                </LightboxCaption>
                )}
              </LightboxContent>
            </Lightbox>
          )}
        </AnimatePresence>
      </GalleryContainer>
    </motion.div>
  );
};

export default GalleryPage; 
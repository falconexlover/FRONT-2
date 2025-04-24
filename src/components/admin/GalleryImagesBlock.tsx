import React, { useMemo } from 'react';
import ExistingImagesList from './ExistingImagesList';
import styled from 'styled-components';
import { GalleryImageItem } from '../../types/GalleryImage';

const CATEGORIES = [
  { id: 'rooms', label: 'Номера' },
  { id: 'sauna', label: 'Сауна' },
  { id: 'conference', label: 'Конференц-зал' },
  { id: 'territory', label: 'Территория' },
  { id: 'party', label: 'Детские праздники' },
  { id: 'food', label: 'Питание' },
];

const BlockWrapper = styled.div`
  margin-top: 2rem;
  background: var(--bg-primary);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-sm);
  padding: 2rem 1.5rem;
`;

const EmptyState = styled.div`
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 0;
  font-size: 1.1rem;
`;

const SearchFilterContainer = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1.5rem;
  flex-wrap: wrap;
`;

const SearchInput = styled.input`
  flex: 1;
  min-width: 200px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  &::placeholder {
    color: var(--text-secondary);
    opacity: 0.6;
  }
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.2);
  }
`;

const CategoryFilter = styled.select`
  flex: 0;
  min-width: 150px;
  padding: 0.5rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.9rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  cursor: pointer;
  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.2);
  }
`;

interface GalleryImagesBlockProps {
  images: GalleryImageItem[];
  onEdit: (image: GalleryImageItem) => void;
  onDelete: (id: string) => void;
  onDragEnd: (event: any) => void;
  onRefresh?: () => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  isLoading: boolean;
  error: string | null;
  onCategoryChange?: (id: string, category: string) => void;
}

const GalleryImagesBlock: React.FC<GalleryImagesBlockProps> = ({
  images,
  onEdit,
  onDelete,
  onDragEnd,
  onRefresh,
  selectedCategory,
  setSelectedCategory,
  searchTerm,
  setSearchTerm,
  isLoading,
  error,
  onCategoryChange
}) => {
  // Фильтрация и поиск на уровне блока
  const filteredImages = useMemo(() => {
    let arr = images;
    if (selectedCategory) {
      arr = arr.filter(img => img.category === selectedCategory);
    }
    if (searchTerm) {
      arr = arr.filter(img =>
        (img.title && img.title.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (img.description && img.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }
    return arr;
  }, [images, selectedCategory, searchTerm]);

  // Фото без категории только при фильтре 'Все категории'
  const uncategorizedImages = useMemo(() => {
    return !selectedCategory ? images.filter(img => !img.category) : [];
  }, [images, selectedCategory]);

  return (
    <BlockWrapper>
      <SearchFilterContainer>
        <SearchInput 
          type="text" 
          placeholder="Поиск по названию или описанию..." 
          value={searchTerm} 
          onChange={(e) => setSearchTerm(e.target.value)} 
        />
        <CategoryFilter 
          value={selectedCategory} 
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">Все категории</option>
          {CATEGORIES.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.label}</option>
          ))}
        </CategoryFilter>
        {onRefresh && (
          <button type="button" onClick={onRefresh} style={{padding: '0.5rem 1rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-primary)', cursor: 'pointer'}}>Обновить список</button>
        )}
      </SearchFilterContainer>
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}><i className="fas fa-spinner fa-spin"></i> Загрузка...</div>
      ) : error ? (
        <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>
      ) : (
        <>
          {filteredImages.length === 0 && uncategorizedImages.length === 0 ? (
            <EmptyState>Нет загруженных изображений в этой категории.</EmptyState>
          ) : (
            <>
              {!selectedCategory && uncategorizedImages.length > 0 && (
                <div style={{marginBottom: 16}}>
                  <strong style={{color: 'var(--danger-color)'}}>Без категории:</strong>
                  <ExistingImagesList
                    images={uncategorizedImages}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onDragEnd={onDragEnd}
                    onRefresh={onRefresh}
                    selectedCategory={selectedCategory}
                    setSelectedCategory={setSelectedCategory}
                    searchTerm={searchTerm}
                    setSearchTerm={setSearchTerm}
                    onCategoryChange={onCategoryChange}
                  />
                </div>
              )}
              <ExistingImagesList
                images={filteredImages}
                onEdit={onEdit}
                onDelete={onDelete}
                onDragEnd={onDragEnd}
                onRefresh={onRefresh}
                selectedCategory={selectedCategory}
                setSelectedCategory={setSelectedCategory}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                onCategoryChange={onCategoryChange}
              />
            </>
          )}
        </>
      )}
    </BlockWrapper>
  );
};

export default GalleryImagesBlock; 
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { roomsService, promotionsService, galleryService, servicesService } from '../../utils/api'; // Импортируем сервисы
import { LoadingSpinner } from '../AdminPanel'; // Импортируем спиннер

// --- Интерфейс пропсов ---
interface DashboardProps {
  setActiveTab?: (tabId: string) => void; // Делаем опциональным
}

// --- Стили ---
const DashboardContainer = styled.div`
  padding: 1.5rem;
  /* Стили для контейнера дашборда */
`;

const DashboardTitle = styled.h2`
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-family: 'Playfair Display', serif;
  font-size: 1.8rem;
`;

const WidgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); // Уменьшим минимальную ширину для 4+ виджетов
  gap: 1.5rem;
  margin-bottom: 2.5rem; /* Добавляем отступ снизу */
  /* Стили для сетки виджетов */
`;

// Пример виджета (пока пустой)
const WidgetCard = styled.div`
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  display: flex;
  flex-direction: column;
  align-items: center; // Центрируем контент
  justify-content: center; // Центрируем контент
  text-align: center;
  min-height: 120px; // Задаем минимальную высоту
  transition: var(--transition);

  &:hover {
    border-color: var(--primary-color-light);
    box-shadow: var(--shadow-sm);
  }
`;

const WidgetValue = styled.div`
  font-size: 2.5rem; // Крупный шрифт для числа
  font-weight: 600;
  color: var(--primary-color); // Акцентный цвет
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const WidgetLabel = styled.div`
  font-size: 1rem;
  color: var(--text-secondary);
  font-weight: 500;
`;

// Стили для виджета шорткатов
const SectionTitle = styled.h3`
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    font-size: 1.3rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.8rem;
`;

const ShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); // По 2-3 кнопки в ряд
  gap: 1rem;
`;

const ShortcutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center; // Центрируем текст и иконку
  gap: 0.8rem; // Отступ между иконкой и текстом
  padding: 1rem 1.5rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  font-weight: 500;
  text-align: center;
  cursor: pointer;
  transition: var(--transition);
  width: 100%; // Растягиваем на всю ширину ячейки грида

  i {
    font-size: 1.1rem;
    color: var(--primary-color); // Иконка акцентным цветом
    transition: transform 0.2s ease-out;
  }

  &:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--primary-color-light);
    color: var(--primary-color); // Текст тоже акцентным при наведении

    i {
        transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(1px);
    box-shadow: inset 0 1px 2px rgba(0,0,0,0.1);
  }
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  text-align: center;
`;

// --- Компонент ---
const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState<{
    rooms: number | null;
    promotions: number | null;
    gallery: number | null;
    services: number | null;
  }>({
    rooms: null,
    promotions: null,
    gallery: null,
    services: null,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      setError(null);
      try {
        // Параллельно загружаем все данные
        const [roomsData, promotionsData, galleryData, servicesData] = await Promise.all([
          roomsService.getAllRooms(),
          promotionsService.getAllPromotions(),
          galleryService.getAllImages(),
          servicesService.getAllServices(),
        ]);

        setStats({
          rooms: roomsData?.length ?? 0,
          // Считаем только активные акции (если есть поле isActive, иначе все)
          promotions: promotionsData?.filter(p => p.isActive).length ?? promotionsData?.length ?? 0,
          gallery: galleryData?.length ?? 0,
          services: servicesData?.length ?? 0,
        });
      } catch (err) {
        console.error("Ошибка загрузки статистики дашборда:", err);
        const message = err instanceof Error ? err.message : 'Не удалось загрузить данные';
        setError(message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []); // Пустой массив зависимостей, чтобы запустить один раз при монтировании

  return (
    <DashboardContainer>
      <DashboardTitle>Панель управления</DashboardTitle>

      {/* Виджеты статистики */}
      <SectionTitle>Общая статистика</SectionTitle>
      {isLoading ? (
        <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка...</LoadingSpinner>
      ) : error ? (
        <ErrorMessage>{error}</ErrorMessage>
      ) : (
        <WidgetGrid>
          <WidgetCard>
            <WidgetValue>{stats.rooms ?? '-'}</WidgetValue>
            <WidgetLabel>Номера</WidgetLabel>
          </WidgetCard>
          <WidgetCard>
            <WidgetValue>{stats.promotions ?? '-'}</WidgetValue>
            <WidgetLabel>Активные акции</WidgetLabel>
          </WidgetCard>
          <WidgetCard>
            <WidgetValue>{stats.gallery ?? '-'}</WidgetValue>
            <WidgetLabel>Фото в галерее</WidgetLabel>
          </WidgetCard>
          <WidgetCard>
            <WidgetValue>{stats.services ?? '-'}</WidgetValue>
            <WidgetLabel>Услуги</WidgetLabel>
          </WidgetCard>
          {/* Здесь можно добавить другие виджеты */}
        </WidgetGrid>
      )}

      {/* Виджет быстрого доступа */}
      <SectionTitle>Быстрый доступ</SectionTitle>
      <ShortcutsGrid>
        <ShortcutButton onClick={() => setActiveTab?.('rooms')}>
          <i className="fas fa-bed"></i>
          Управление номерами
        </ShortcutButton>
        <ShortcutButton onClick={() => setActiveTab?.('homepage')}>
           <i className="fas fa-home"></i>
          Редактор главной
        </ShortcutButton>
         <ShortcutButton onClick={() => setActiveTab?.('upload')}>
          <i className="fas fa-upload"></i>
          Загрузить фото
        </ShortcutButton>
         <ShortcutButton onClick={() => setActiveTab?.('promotions')}>
          <i className="fas fa-tags"></i>
          Управление акциями
        </ShortcutButton>
         <ShortcutButton onClick={() => setActiveTab?.('services')}>
          <i className="fas fa-concierge-bell"></i>
          Управление услугами
        </ShortcutButton>
        {/* Добавить ссылку на предпросмотр сайта, если нужно */}
        <ShortcutButton as="a" href="/" target="_blank" rel="noopener noreferrer">
             <i className="fas fa-eye"></i>
            Предпросмотр сайта
        </ShortcutButton>
      </ShortcutsGrid>

    </DashboardContainer>
  );
};

export default Dashboard; 
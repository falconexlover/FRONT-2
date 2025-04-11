import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { roomsService, promotionsService, galleryService, servicesService, bookingService } from '../../utils/api'; // Импортируем сервисы
import { BookingConfirmation } from '../../types/Booking';
import { LoadingSpinner } from '../AdminPanel'; // Импортируем спиннер

// --- Интерфейс пропсов ---
interface DashboardProps {
  setActiveTab: (tabId: string) => void; // Возвращаем пропс
}

interface StatsData {
  rooms: number | null;
  promotions: number | null;
  gallery: number | null;
  services: number | null;
}

// --- Стили ---
const DashboardWrapper = styled.div`
  padding: 0 1.5rem 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 2.5rem; // Space between sections
`;

const Section = styled.section`
  /* Common styles for sections if needed */
`;

const SectionTitle = styled.h2`
  font-family: 'Playfair Display', serif;
  font-size: 1.6rem; // Slightly smaller title
  color: var(--text-primary);
  margin: 0 0 1.5rem 0; // Reset margin and add bottom margin
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
`;

// Stats Grid
const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); // Responsive grid
  gap: 1.5rem;
`;

const StatCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  border: 1px solid var(--border-color);
  transition: box-shadow 0.2s ease-in-out, border-color 0.2s ease-in-out;

  &:hover {
    box-shadow: var(--shadow-sm);
    border-color: var(--primary-color-light);
  }
`;

const StatContent = styled.div`
  line-height: 1.3;
`;

const StatValue = styled.div`
  font-size: 2.2rem;
  font-weight: 600;
  color: var(--primary-color);
  margin-bottom: 0.25rem;
`;

const StatLabel = styled.div`
  font-size: 0.95rem;
  color: var(--text-secondary);
`;

const StatIcon = styled.div`
  font-size: 2.8rem;
  color: var(--primary-color);
  opacity: 0.6;
`;

// Bookings List
const BookingsListContainer = styled.div`
  max-height: 500px; // Limit height
  overflow-y: auto; // Enable scroll
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  background-color: var(--bg-secondary);
`;

const BookingsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const BookingItem = styled.li`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem 1.5rem;
  border-bottom: 1px solid var(--border-color-light);
  font-size: 0.9rem;
  flex-wrap: wrap; // Allow wrapping on small screens
  gap: 0.5rem;

  &:last-child {
    border-bottom: none;
  }

  .guest-info {
    font-weight: 500;
    color: var(--text-primary);
    flex-basis: 60%; // Take more space
    min-width: 150px; // Prevent excessive shrinking
  }

  .room-name {
    display: block; // Put room name on new line
    font-style: italic;
    font-weight: 400;
    font-size: 0.85rem;
    color: var(--text-muted);
    margin-top: 0.2rem;
  }

  .dates {
    color: var(--text-secondary);
    flex-basis: 35%; // Take remaining space
    text-align: right;
    min-width: 100px; // Prevent excessive shrinking
  }
`;

// Shortcuts Grid
const ShortcutsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
`;

const ShortcutButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: flex-start; // Align items to start
  gap: 0.8rem;
  padding: 1rem 1.25rem;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 0.95rem;
  font-weight: 500;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.2s ease-in-out, border-color 0.2s ease-in-out, color 0.2s ease-in-out;
  width: 100%;

  i {
    font-size: 1.1rem;
    color: var(--primary-color);
    width: 20px; // Fixed width for icon
    text-align: center;
    transition: transform 0.2s ease-out;
  }

  &:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--primary-color-light);
    color: var(--primary-color);

    i {
        transform: scale(1.1);
    }
  }

  &:active {
    transform: translateY(1px);
  }
`;

// Loading and Error Messages
const CenteredMessage = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 1.5rem;
  font-size: 1.1rem;
  color: var(--text-secondary);
`;

const ErrorMessage = styled(CenteredMessage)`
  color: var(--danger-color);
  background-color: rgba(229, 57, 53, 0.05);
  border: 1px solid rgba(229, 57, 53, 0.2);
  border-radius: var(--radius-sm);
`;

// --- Компонент ---
const Dashboard: React.FC<DashboardProps> = ({ setActiveTab }) => {
  const [stats, setStats] = useState<StatsData>({
    rooms: null, promotions: null, gallery: null, services: null,
  });
  const [latestBookings, setLatestBookings] = useState<BookingConfirmation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const [roomsData, promotionsData, galleryData, servicesData, bookingsData] = await Promise.all([
          roomsService.getAllRooms().catch(e => { console.error('Rooms fetch failed:', e); return null; }),
          promotionsService.getAllPromotions().catch(e => { console.error('Promos fetch failed:', e); return null; }),
          galleryService.getAllImages().catch(e => { console.error('Gallery fetch failed:', e); return null; }),
          servicesService.getAllServices().catch(e => { console.error('Services fetch failed:', e); return null; }),
          bookingService.getAllBookings().catch(e => { console.error('Bookings fetch failed:', e); return null; })
        ]);

        setStats({
          rooms: roomsData?.length ?? 0,
          promotions: promotionsData?.filter(p => p.isActive).length ?? promotionsData?.length ?? 0,
          gallery: galleryData?.length ?? 0,
          services: servicesData?.length ?? 0,
        });

        if (bookingsData) {
          const sortedBookings = [...bookingsData].sort((a, b) =>
              (b._id || '').localeCompare(a._id || '') // Sort by ID descending (proxy for time)
          );
          setLatestBookings(sortedBookings.slice(0, 5));
        } else {
          setLatestBookings([]);
        }

      } catch (err) {
        console.error("Critical dashboard loading error:", err);
        setError('Не удалось загрузить данные для дашборда.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  // Хелпер для форматирования дат
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    try {
      // Short format dd.mm
      return new Date(dateString).toLocaleDateString('ru-RU', { day: '2-digit', month: '2-digit' });
    } catch {
      return '-';
    }
  };

  // --- Render Logic ---
  if (isLoading) {
    return (
      <DashboardWrapper>
        <CenteredMessage>
          <LoadingSpinner>
            <i className="fas fa-spinner"></i> Загрузка данных...
          </LoadingSpinner>
        </CenteredMessage>
      </DashboardWrapper>
    );
  }

  if (error) {
    return (
      <DashboardWrapper>
        <ErrorMessage>{error}</ErrorMessage>
      </DashboardWrapper>
    );
  }

  return (
    <DashboardWrapper>
      {/* Statistics Section */}
      <Section>
        <SectionTitle>Общая статистика</SectionTitle>
        <StatsGrid>
          <StatCard>
            <StatContent>
              <StatValue>{stats.rooms ?? '-'}</StatValue>
              <StatLabel>Номера</StatLabel>
            </StatContent>
            <StatIcon><i className="fas fa-bed"></i></StatIcon>
          </StatCard>
          <StatCard>
            <StatContent>
              <StatValue>{stats.promotions ?? '-'}</StatValue>
              <StatLabel>Активные акции</StatLabel>
            </StatContent>
            <StatIcon><i className="fas fa-tags"></i></StatIcon>
          </StatCard>
          <StatCard>
            <StatContent>
              <StatValue>{stats.gallery ?? '-'}</StatValue>
              <StatLabel>Фото в галерее</StatLabel>
            </StatContent>
            <StatIcon><i className="fas fa-images"></i></StatIcon>
          </StatCard>
          <StatCard>
            <StatContent>
              <StatValue>{stats.services ?? '-'}</StatValue>
              <StatLabel>Услуги</StatLabel>
            </StatContent>
            <StatIcon><i className="fas fa-concierge-bell"></i></StatIcon>
          </StatCard>
        </StatsGrid>
      </Section>

      {/* Latest Bookings Section */}
      <Section>
        <SectionTitle>Последние бронирования</SectionTitle>
        {latestBookings.length > 0 ? (
          <BookingsListContainer>
            <BookingsList>
              {latestBookings.map(booking => (
                <BookingItem key={booking._id || booking.bookingNumber}>
                  <div className="guest-info">
                    {booking.guestName || 'Имя не указано'}
                    <span className="room-name">{booking.room?.name || 'Номер не указан'}</span>
                  </div>
                  <div className="dates">
                    {/* Use optional chaining and correct fields */}
                    {formatDate(booking.checkIn)} - {formatDate(booking.checkOut)}
                  </div>
                </BookingItem>
              ))}
            </BookingsList>
          </BookingsListContainer>
        ) : (
          <CenteredMessage>Нет недавних бронирований.</CenteredMessage>
        )}
      </Section>

      {/* Quick Actions Section */}
      <Section>
        <SectionTitle>Быстрые действия</SectionTitle>
        <ShortcutsGrid>
          <ShortcutButton onClick={() => setActiveTab('rooms')}>
            <i className="fas fa-bed"></i> Управление номерами
          </ShortcutButton>
          <ShortcutButton onClick={() => setActiveTab('homepage')}>
            <i className="fas fa-home"></i> Редактор главной
          </ShortcutButton>
          <ShortcutButton onClick={() => setActiveTab('upload')}>
            <i className="fas fa-upload"></i> Загрузить фото
          </ShortcutButton>
          <ShortcutButton onClick={() => setActiveTab('promotions')}>
            <i className="fas fa-tags"></i> Управление акциями
          </ShortcutButton>
          <ShortcutButton onClick={() => setActiveTab('services')}>
            <i className="fas fa-concierge-bell"></i> Управление услугами
          </ShortcutButton>
          <ShortcutButton onClick={() => setActiveTab('articles')}>
            <i className="fas fa-newspaper"></i> Управление статьями
          </ShortcutButton>
          <ShortcutButton as="a" href="/" target="_blank" rel="noopener noreferrer">
            <i className="fas fa-eye"></i> Предпросмотр сайта
          </ShortcutButton>
        </ShortcutsGrid>
      </Section>

    </DashboardWrapper>
  );
};

export default Dashboard; 
import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { bookingService } from '../utils/api';

// Пропсы для компонента
interface BookingDetails {
  _id?: string;
  room?: { name: string };
  checkIn?: string;
  checkOut?: string;
  guestName?: string;
  totalPrice?: number;
  // Добавьте другие поля, если нужно
}

const PageWrapper = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--success-color);
  margin-bottom: 1.5rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const DetailsCard = styled.div`
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-md);
  text-align: left;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
  
  h3 {
    margin-top: 0;
    margin-bottom: 1.5rem;
    color: var(--text-primary);
  }

  p {
    margin-bottom: 0.8rem;
    color: var(--text-secondary);
    strong {
      color: var(--text-primary);
      margin-right: 0.5rem;
    }
  }
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const BookingSuccessPage: React.FC = () => {
  const { bookingId } = useParams<{ bookingId: string }>();
  const [bookingDetails, setBookingDetails] = useState<BookingDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBooking = async () => {
      if (!bookingId) {
        setError('ID бронирования не найден.');
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        const data = await bookingService.getBookingById(bookingId);
        setBookingDetails(data);
        setError(null);
      } catch (err) {
        console.error('Ошибка загрузки деталей бронирования:', err);
        setError('Не удалось загрузить детали вашего бронирования. Пожалуйста, свяжитесь с нами.');
        setBookingDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchBooking();
  }, [bookingId]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ru-RU');
  };

  return (
    <PageWrapper>
      <Title>✓ Бронирование успешно!</Title>
      <Message>
        Спасибо за ваше бронирование! Детали были отправлены на вашу электронную почту.
        Ниже приведена информация о вашем бронировании.
      </Message>

      {loading && <p>Загрузка деталей...</p>}
      {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

      {bookingDetails && (
        <DetailsCard>
          <h3>Детали бронирования (ID: {bookingDetails._id || 'N/A'})</h3>
          <p><strong>Номер:</strong> {bookingDetails.room?.name || 'Не указан'}</p>
          <p><strong>Заезд:</strong> {bookingDetails.checkIn ? formatDate(bookingDetails.checkIn) : '-'}</p>
          <p><strong>Выезд:</strong> {bookingDetails.checkOut ? formatDate(bookingDetails.checkOut) : '-'}</p>
          <p><strong>Гость:</strong> {bookingDetails.guestName || 'Не указан'}</p>
          <p><strong>Сумма:</strong> {bookingDetails.totalPrice !== undefined ? `${bookingDetails.totalPrice} ₽` : '-'}</p>
        </DetailsCard>
      )}

      <BackLink to="/">Вернуться на главную</BackLink>
    </PageWrapper>
  );
};

export default BookingSuccessPage; 
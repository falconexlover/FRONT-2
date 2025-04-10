import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { useSearchParams } from 'react-router-dom';
import { bookingService } from '../utils/api';
import { BookingConfirmation } from '../types/Booking';

const StatusContainer = styled.div`
  padding: 6rem 2rem 4rem;
  min-height: calc(100vh - 100px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
`;

const Title = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--dark-color);
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: var(--text-color);
  margin-bottom: 2rem;
  max-width: 500px;
`;

const BookingDetails = styled.div`
  margin-top: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  min-width: 300px;
  max-width: 90%;

  h3 {
      margin-bottom: 1rem;
      color: var(--primary-color);
  }
  p {
      margin-bottom: 0.5rem;
  }
  strong {
      color: var(--text-primary);
  }
`;

const BookingStatusPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get('bookingId');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'pending'>('loading');
  const [bookingDetails, setBookingDetails] = useState<BookingConfirmation | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    let timer: NodeJS.Timeout | undefined = undefined;
    let isMounted = true; // Флаг для предотвращения обновления состояния после размонтирования
    let attemptCount = 0; // Счетчик попыток
    const MAX_ATTEMPTS = 5; // Максимальное количество проверок
    const RETRY_DELAY = 5000; // Задержка между проверками (5 секунд)

    const checkBookingStatus = async () => {
      if (!bookingId) {
        if (isMounted) {
            setStatus('error');
            setErrorMessage('Не найден ID бронирования.');
        }
        return;
      }

      // Сбрасываем ошибку перед новой попыткой
      if (isMounted) {
          setErrorMessage(null);
      }

      try {
        console.log(`Проверка статуса бронирования ${bookingId}, попытка ${attemptCount + 1}`);
        const details = await bookingService.getBookingById(bookingId);
        attemptCount++;

        if (!isMounted) return; // Не обновлять состояние, если компонент размонтирован

        setBookingDetails(details); // Сохраняем детали в любом случае

        if (details.status === 'paid') {
          setStatus('success');
          console.log(`Бронирование ${bookingId} успешно оплачено.`);
        } else if (details.status === 'cancelled' || details.status === 'failed') {
            setStatus('error');
            setErrorMessage('Платеж не прошел или был отменен.');
            console.log(`Бронирование ${bookingId} отменено или не удалось.`);
        } else { // Статус 'pending' или 'waiting_for_payment'
           if (attemptCount < MAX_ATTEMPTS) {
               setStatus('pending'); // Все еще обрабатывается
               console.log(`Статус бронирования ${bookingId}: ${details.status}. Повторная проверка через ${RETRY_DELAY / 1000} сек.`);
               timer = setTimeout(checkBookingStatus, RETRY_DELAY); // Проверить еще раз через 5 сек
           } else {
               setStatus('error');
               setErrorMessage('Не удалось подтвердить оплату за установленное время. Пожалуйста, свяжитесь с нами.');
               console.log(`Превышено количество попыток проверки статуса для бронирования ${bookingId}.`);
           }
        }
      } catch (err) {
        console.error("Ошибка получения статуса брони:", err);
        if (isMounted) {
            setStatus('error');
            setErrorMessage('Не удалось получить информацию о бронировании. Пожалуйста, попробуйте обновить страницу или свяжитесь с нами.');
        }
      }
    };

    checkBookingStatus(); // Запускаем первую проверку

    // Функция очистки при размонтировании
    return () => {
        isMounted = false; // Устанавливаем флаг
        if (timer) {
            clearTimeout(timer); // Очищаем таймер, если он был запущен
        }
    };
  }, [bookingId]); // Зависимость только от bookingId

  return (
    <StatusContainer>
      {status === 'loading' && (
        <>
          <Title>Загрузка...</Title>
          <Message>Получаем информацию о вашем платеже...</Message>
          <i className="fas fa-spinner fa-spin" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
        </>
      )}
      {status === 'pending' && (
        <>
          <Title>Оплата обрабатывается</Title>
          <Message>Ваш платеж обрабатывается платежной системой. Статус бронирования будет обновлен автоматически. Вы получите email-подтверждение после успешной оплаты.</Message>
          <i className="fas fa-hourglass-half" style={{ fontSize: '2rem', color: 'var(--primary-color)' }}></i>
        </>
      )}
      {status === 'success' && bookingDetails && (
        <>
          <Title>Оплата прошла успешно!</Title>
          <Message>Ваше бронирование подтверждено. Информация отправлена на ваш email.</Message>
          <i className="fas fa-check-circle" style={{ fontSize: '2rem', color: 'var(--success-color)' }}></i>
          <BookingDetails>
            <h3>Детали бронирования</h3>
            <p>Номер брони: <strong>{bookingDetails.bookingNumber}</strong></p>
            <p>Комната: <strong>{bookingDetails.room?.name || '-'}</strong></p>
            <p>Даты: <strong>{bookingDetails.checkIn ? new Date(bookingDetails.checkIn).toLocaleDateString() : '-'} - {bookingDetails.checkOut ? new Date(bookingDetails.checkOut).toLocaleDateString() : '-'}</strong></p>
            <p>Сумма: <strong>{bookingDetails.totalPrice} ₽</strong></p>
          </BookingDetails>
        </>
      )}
      {status === 'error' && (
        <>
          <Title>Ошибка</Title>
          <Message>{errorMessage || 'Произошла ошибка при обработке платежа или бронирования. Пожалуйста, свяжитесь с нами.'}</Message>
          <i className="fas fa-times-circle" style={{ fontSize: '2rem', color: 'var(--danger-color)' }}></i>
        </>
      )}
    </StatusContainer>
  );
};

export default BookingStatusPage; 
import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RoomType } from '../../types/Room'; // Может понадобиться для SuccessMessage

// --- Styled Components (перенесены/адаптированы из BookingPage) ---

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 1.5rem; // Немного увеличим padding
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1.1rem; // Немного увеличим шрифт
  cursor: pointer;
  transition: var(--transition);
  display: flex; // Для центрирования иконки/текста
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  &:hover:not(:disabled) {
    background-color: var(--accent-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  &:disabled {
    background-color: #ccc;
    color: var(--text-secondary);
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

// Сообщение об успехе (адаптировано из BookingPage)
const SuccessMessageContainer = styled(motion.div)` 
  padding: 2rem;
  background-color: rgba(33, 113, 72, 0.1);
  border-left: 4px solid var(--primary-color); // Увеличим толщину линии
  color: var(--dark-color); // Основной текст сделаем темнее
  border-radius: var(--radius-md);
  margin: 2rem auto; // Центрируем и добавляем отступы
  text-align: center;
  max-width: 800px; // Ограничим ширину для читаемости

  h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
    font-size: 1.8rem;
  }

  p {
    margin-bottom: 1rem;
    line-height: 1.6;
  }

  .booking-details {
    background-color: white;
    border: 1px solid var(--border-color);
    padding: 1.5rem;
    border-radius: var(--radius-sm);
    margin: 1.5rem 0;
    text-align: left;
    box-shadow: var(--shadow-sm);

    h4 {
      margin-top: 0;
      margin-bottom: 1rem; // Увеличим отступ
      color: var(--dark-color);
      font-weight: 600;
      border-bottom: 1px solid var(--border-color);
      padding-bottom: 0.5rem;
    }

    ul {
      list-style: none;
      padding: 0;
      margin: 0;

      li {
        display: flex;
        justify-content: space-between;
        padding: 0.6rem 0; // Немного увеличим отступы
        border-bottom: 1px dashed var(--border-color);
        font-size: 0.95rem;

        &:last-child {
          border-bottom: none;
        }

        span:first-child {
          font-weight: 500;
          color: var(--text-color);
          margin-right: 1rem;
        }
        span:last-child {
          font-weight: 400;
          color: var(--text-secondary);
          text-align: right;
        }
      }
    }
  }
  
  .booking-number {
      font-weight: 600;
      color: var(--primary-color);
  }
`;

// Сообщение об ошибке (адаптировано из BookingPage)
const ErrorMessageContainer = styled.p` 
  color: var(--danger-color, #e53935);
  background-color: rgba(229, 57, 53, 0.08);
  border: 1px solid rgba(229, 57, 53, 0.3);
  padding: 1rem 1.5rem;
  border-radius: var(--radius-sm);
  margin-top: 1rem; 
  margin-bottom: 1.5rem; 
  text-align: center;
  font-size: 0.95rem;
  font-weight: 500;
`;

// --- Component ---

interface BookingActionsProps {
  isSubmitting: boolean;
  canSubmit: boolean; // Флаг, можно ли отправлять (выбрана комната, цена > 0)
  submissionStatus: 'idle' | 'success' | 'error';
  error: string | null; 
  submittedBookingDetails: any; // TODO: Уточнить тип, если возможно
  rooms: RoomType[]; // Нужны для отображения названия комнаты в SuccessMessage
}

const BookingActions: React.FC<BookingActionsProps> = ({ 
    isSubmitting,
    canSubmit,
    submissionStatus,
    error,
    submittedBookingDetails,
    rooms
}) => {

  // Сообщение об успехе
  if (submissionStatus === 'success') {
    return (
      <SuccessMessageContainer 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
      >
        <h3>Бронирование успешно оформлено!</h3>
        <p>Спасибо! Ваша заявка принята. Мы скоро свяжемся с вами для подтверждения.</p>
        {submittedBookingDetails && (
            <div className="booking-details">
                <h4>Детали вашего бронирования:</h4>
                <ul>
                    <li><span>Номер:</span> <span>{rooms.find((r: RoomType) => r._id === submittedBookingDetails.roomId)?.title || 'Не указан'}</span></li>
                    <li><span>Даты:</span> <span>{new Date(submittedBookingDetails.checkIn).toLocaleDateString()} - {new Date(submittedBookingDetails.checkOut).toLocaleDateString()} ({submittedBookingDetails.numberOfNights} ночей)</span></li>
                    <li><span>Гостей:</span> <span>{submittedBookingDetails.guests}</span></li>
                    <li><span>Итоговая стоимость:</span> <span>{submittedBookingDetails.totalPrice} ₽</span></li>
                    <li><span>Ваше имя:</span> <span>{submittedBookingDetails.customerName}</span></li>
                    <li><span>Email:</span> <span>{submittedBookingDetails.customerEmail}</span></li>
                    <li><span>Телефон:</span> <span>{submittedBookingDetails.customerPhone}</span></li>
                    {submittedBookingDetails.notes && <li><span>Пожелания:</span> <span>{submittedBookingDetails.notes}</span></li>}
                </ul>
            </div>
        )}
        <p>Номер вашей заявки: <span className="booking-number">#{submittedBookingDetails?.bookingNumber || '...'}</span></p> 
      </SuccessMessageContainer>
    );
  }

  // Форма отправки (кнопка и сообщение об ошибке)
  return (
    <>
      <SubmitButton 
        type="submit" // Важно, чтобы кнопка была внутри <form>
        disabled={!canSubmit || isSubmitting}
      >
        {isSubmitting ? 'Обработка...' : 'Забронировать'}
         {/* Можно добавить иконку */} 
         {/* {isSubmitting ? <i className="fas fa-spinner fa-spin"></i> : <i className="fas fa-check"></i>} */} 
      </SubmitButton>
      
      {/* Показываем сообщение об ошибке отправки */} 
      {submissionStatus === 'error' && error && (
        <ErrorMessageContainer>{error}</ErrorMessageContainer>
      )}
      {/* Общая ошибка (не связанная с отправкой) может отображаться выше */} 
    </>
  );
};

export default BookingActions; 
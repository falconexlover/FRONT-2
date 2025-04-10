import React /*, { useEffect, useState } */ from 'react';
import styled from 'styled-components';
import { Link, useSearchParams } from 'react-router-dom';

const PageWrapper = styled.div`
  padding: 3rem 1rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 2.5rem;
  color: var(--danger-color);
  margin-bottom: 1.5rem;
`;

const Message = styled.p`
  font-size: 1.1rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
  line-height: 1.6;
`;

const BackLink = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  margin-right: 1rem; 
  color: var(--primary-color);
  text-decoration: none;
  
  &:hover {
    text-decoration: underline;
  }
`;

const TryAgainButton = styled(Link)`
  display: inline-block;
  margin-top: 1rem;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: var(--text-on-primary-bg);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--secondary-color);
  }
`;

const BookingFailurePage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const reason = searchParams.get('reason') || 'Неизвестная ошибка';
  const roomId = searchParams.get('roomId'); // Получаем ID комнаты для кнопки "Попробовать снова"

  return (
    <PageWrapper>
      <Title>✗ Ошибка бронирования</Title>
      <Message>
        К сожалению, при обработке вашего бронирования или платежа произошла ошибка:
        <br />
        <strong>{reason}</strong>
        <br />
        Пожалуйста, попробуйте еще раз или свяжитесь с нами для помощи.
      </Message>

      {roomId && (
        <TryAgainButton to={`/booking/${roomId}`}>Попробовать еще раз</TryAgainButton>
      )}
      <BackLink to="/">Вернуться на главную</BackLink>

    </PageWrapper>
  );
};

export default BookingFailurePage; 
import React from 'react';
import styled from 'styled-components';
import { RoomType } from '../../types/Room'; // Импортируем тип номера

// --- Styled Components (перенесены из BookingPage) ---

const PriceCalculationContainer = styled.div` // Переименовано для ясности
  background-color: var(--gray-bg, #f8f9fa); // Добавлен цвет по умолчанию
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-top: 1.5rem; // Добавлен отступ сверху
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px dashed var(--border-color);
  color: var(--text-secondary);
  font-size: 0.95rem;

  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }

  &.total {
    font-weight: 700;
    color: var(--dark-color);
    font-size: 1.2rem;
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
  }
  
  span:last-child {
      font-weight: 500;
  }
`;

// --- Component ---

interface PriceSummaryProps {
  selectedRoomDetails: RoomType | undefined;
  numberOfNights: number;
  totalPrice: number;
}

const PriceSummary: React.FC<PriceSummaryProps> = ({ 
    selectedRoomDetails,
    numberOfNights,
    totalPrice 
}) => {

  // Не рендерим компонент, если нет выбранного номера или кол-ва ночей
  if (!selectedRoomDetails || numberOfNights <= 0) {
    return null;
  }

  return (
    <PriceCalculationContainer>
      <h4>Расчет стоимости</h4>
      <PriceRow>
        <span>Стоимость за ночь ({selectedRoomDetails.title}):</span>
        <span>{selectedRoomDetails.pricePerNight} ₽</span>
      </PriceRow>
      <PriceRow>
        <span>Количество ночей:</span>
        <span>{numberOfNights}</span>
      </PriceRow>
      <PriceRow className="total">
        <span>Итого:</span>
        <span>{totalPrice} ₽</span>
      </PriceRow>
    </PriceCalculationContainer>
  );
};

export default PriceSummary; 
import React from 'react';
import styled, { keyframes } from 'styled-components';
// Убираем импорт Link
// import { Link } from 'react-router-dom';

// Анимация пульсации (остается)
const pulse = keyframes`
  0% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 115, 115, 0.7); }
  70% { transform: scale(1.05); box-shadow: 0 0 0 10px rgba(229, 115, 115, 0); }
  100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(229, 115, 115, 0); }
`;

// Стили значка - теперь это <button>, а не <Link>
const BadgeButton = styled.button`
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background-color: var(--danger-color);
  color: white;
  border-radius: 50%;
  width: 55px;
  height: 55px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 1.5rem;
  font-weight: bold;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  border: none; // Убираем границу у кнопки
  padding: 0; // Убираем внутренний отступ кнопки
  transition: transform 0.2s ease, background-color 0.2s ease;
  animation: ${pulse} 2s infinite;

  &:hover {
    transform: scale(1.1);
    background-color: #e57373;
  }

   &:focus {
       outline: 2px solid var(--primary-color-light); // Стиль фокуса
       outline-offset: 2px;
   }
   &:focus:not(:focus-visible) {
       outline: none; // Убираем стандартный фокус, если он не от клавиатуры
   }


  @media (max-width: 768px) {
      width: 45px;
      height: 45px;
      font-size: 1.2rem;
      bottom: 15px;
      right: 15px;
  }
`;

interface PromotionBadgeProps {
  onClick: () => void; // Принимаем обработчик клика
}

const PromotionBadge: React.FC<PromotionBadgeProps> = ({ onClick }) => {
  return (
    // Меняем BadgeWrapper на BadgeButton и передаем onClick
    <BadgeButton onClick={onClick} title="Посмотреть акции">
       %
    </BadgeButton>
  );
};

export default PromotionBadge; 
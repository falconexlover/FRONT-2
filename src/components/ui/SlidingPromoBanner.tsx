import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom'; // Импортируем useNavigate
// import { PromotionType } from '../../types/Promotion'; // Больше не нужно

// Удаляем promotion из интерфейса
/*
interface SlidingPromoBannerProps {
  promotion: PromotionType; 
}
*/

const BANNER_WIDTH = '250px'; // Ширина выезжающей части
const TAB_WIDTH = '35px'; // Ширина видимого язычка

// Используем transient prop $isExpanded
const BannerWrapper = styled.div<{
  $visible: boolean;
  $position: 'left' | 'right';
}>`
  position: fixed;
  top: 50%;
  ${({ $position }) => $position}: ${({ $visible }) => ($visible ? '0' : '-300px')}; /* Скрываем за экраном */
  transform: translateY(-50%);
  width: 300px;
  padding: 1rem;
  background-color: var(--danger-color); /* Используем переменную */
  color: white;
  z-index: 1040;
  box-shadow: -2px 0 8px rgba(0, 0, 0, 0.2);
  transition: ${({ $position }) => $position} 0.4s ease-in-out;
  border-radius: ${({ $position }) => $position === 'left' ? '0 var(--radius-md) var(--radius-md) 0' : 'var(--radius-md) 0 0 var(--radius-md)'};
`;

const Tab = styled.div`
  width: ${TAB_WIDTH};
  min-height: 80px; /* Минимальная высота язычка */
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  background-color: var(--danger-color); /* Фон язычка */
  border-radius: var(--radius-md) 0 0 var(--radius-md); /* Скругляем левые углы язычка */
  font-weight: bold;
  font-size: 1.2rem; /* Размер значка */
  flex-shrink: 0; /* Запрещаем сжиматься */
  padding: 10px 0; /* Можно оставить или изменить на горизонтальный padding, если нужно */

  /* Можно добавить иконку стрелки вместо текста */
  /* &::before { content: '◀'; } */
  /* &.expanded::before { content: '▶'; } */
`;

const Content = styled.div`
  padding: 1rem 1.5rem 1rem 1rem; /* Отступы внутри контентной части */
  width: ${BANNER_WIDTH};
  flex-grow: 1; /* Занимает оставшееся место */
  border-left: 1px solid rgba(255, 255, 255, 0.3); /* Разделитель */

  h4 {
    margin: 0 0 0.5rem 0;
    font-size: 1.1rem;
    font-family: 'Montserrat', sans-serif; /* Используем основной шрифт */
    font-weight: 600;
    color: white;
  }

  p {
    margin: 0;
    font-size: 0.9rem;
    color: white;
    opacity: 0.9;
    line-height: 1.4;
  }

  /* Стили для кнопки/ссылки "Перейти" */
  button {
    display: inline-block;
    margin-top: 1rem;
    padding: 0.4rem 0.8rem;
    background-color: rgba(255, 255, 255, 0.9);
    color: var(--danger-color);
    border-radius: var(--radius-sm);
    text-decoration: none;
    font-size: 0.85rem;
    font-weight: 600;
    border: none;
    cursor: pointer;
    transition: background-color 0.2s ease;

    &:hover {
        background-color: white;
    }
  }
`;

// Удаляем неиспользуемые стили
/*
const PromoTitle = styled.h4`
  margin: 0 0 0.5rem 0;
  color: white; 
`;

const PromoText = styled.p`
  margin: 0 0 1rem 0;
  font-size: 0.9rem;
  line-height: 1.4;
  color: white; 
`;

const ToggleButton = styled.button<{
  $visible: boolean;
  $position: 'left' | 'right';
}>`
  position: absolute;
  top: 50%;
  ${({ $position, $visible }) => $position === 'left' ? 'right' : 'left'}: -40px; 
  transform: translateY(-50%) rotate(${({ $position }) => $position === 'left' ? '-90deg' : '90deg'});
  transform-origin: center;
  width: 80px;
  height: 40px;
  background-color: var(--danger-color); 
  color: white;
  border: none;
`;

const DismissButton = styled.button`
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.7); 
  font-size: 1.2rem;
`;

const ClaimButton = styled.button`
  background-color: rgba(255, 255, 255, 0.9);
  color: var(--danger-color); 
  border: none;
  padding: 0.6rem 1.2rem;
`;
*/

// Удаляем пропс promotion
// const SlidingPromoBanner: React.FC<SlidingPromoBannerProps> = ({ promotion }) => {
const SlidingPromoBanner: React.FC = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const navigate = useNavigate(); // Получаем функцию навигации

  const toggleBanner = () => {
    setIsExpanded(!isExpanded);
  };

  const handleGoToPromotions = () => {
      navigate('/promotions'); // Переходим на страницу /promotions
      // Можно добавить закрытие баннера после перехода, если нужно
      // toggleBanner();
  };

  return (
    // Передаем $isExpanded вместо isExpanded и убираем className
    <BannerWrapper $visible={isExpanded} $position="right">
      {/* Убираем className из Tab */}
      <Tab onClick={toggleBanner}>
        %
      </Tab>
      <Content>
        {/* Заменяем заголовок */}
        <h4>Скидки и акции</h4>
        {/* Заменяем кнопку */}
        <button onClick={handleGoToPromotions}>Перейти</button>
      </Content>
    </BannerWrapper>
  );
};

export default SlidingPromoBanner; 
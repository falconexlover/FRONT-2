import React from 'react';
import styled from 'styled-components';
import { TabItem } from '../ui/Tabs'; // Импортируем тип из Tabs для элементов меню

interface SidebarProps {
  menuItems: TabItem[];
  activeItemId: string;
  onItemClick: (id: string) => void;
  onLogout: () => void;
  // Новые необязательные пропсы для мобильной версии
  isMobileOpen?: boolean;
  closeMobileSidebar?: () => void;
}

const SidebarNav = styled.nav`
  flex-grow: 1; /* Занимает место между заголовком и кнопкой выхода */
  margin-top: 2rem; /* Отступ от возможного заголовка/логотипа */
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin-bottom: 0.25rem; /* Уменьшим отступ */
`;

// Адаптируем Ссылки/Кнопки навигации
const NavLink = styled.button<{ isActive: boolean }>`
  display: block;
  width: 100%;
  padding: 0.8rem 1.5rem;
  border: none;
  /* Используем переменные темной темы */
  background-color: ${props => props.isActive ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.isActive ? 'var(--text-on-primary-bg)' : 'var(--text-secondary)'}; 
  text-align: left;
  font-weight: ${props => props.isActive ? '600' : '500'}; /* Немного изменим вес */
  font-size: 0.95rem; /* Чуть меньше */
  cursor: pointer;
  transition: background-color 0.2s ease, color 0.2s ease;
  /* Убираем бордер справа, т.к. фон будет меняться */
  /* border-right: ${props => props.isActive ? '3px solid var(--primary-color)' : 'none'}; */
  border-radius: var(--radius-sm); /* Добавим небольшое скругление */
  margin: 0 0.5rem; /* Небольшие отступы по бокам */
  width: calc(100% - 1rem); /* Учитываем отступы */

  &:hover {
    background-color: ${props => props.isActive ? 'var(--primary-color)' : 'var(--bg-tertiary)'}; 
    color: var(--text-primary); /* При наведении текст всегда основной */
  }

  i {
    margin-right: 12px; /* Чуть больше отступ для иконки */
    width: 20px;
    text-align: center;
    opacity: ${props => props.isActive ? '1' : '0.8'}; /* Делаем неактивные иконки чуть тусклее */
  }

  @media (max-width: 768px) {
    /* Стили для мобильной версии можно оставить */
    padding: 0.8rem 1rem;
    font-size: 0.9rem;
    /* border-bottom: ${props => props.isActive ? '2px solid var(--primary-color)' : 'none'}; */
    /* Убираем нижнюю границу, используем фон */
  }
`;

// Адаптируем Кнопку Выхода
const LogoutButton = styled.button`
  display: block;
  width: calc(100% - 3rem);
  margin: 1.5rem 1.5rem 1rem; /* Скорректируем нижний отступ */
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color); /* Темная граница */
  background-color: transparent;
  color: var(--text-secondary); /* Вторичный текст */
  border-radius: var(--radius-sm);
  text-align: center;
  cursor: pointer;
  transition: var(--transition);

  &:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--text-secondary);
    color: var(--text-primary);
  }

  i {
    margin-right: 8px;
  }

  @media (max-width: 768px) {
    width: auto;
    margin: 1rem;
  }
`;

// Адаптируем Кнопку Закрытия (для мобильных)
const CloseButton = styled.button`
  display: none;
  position: absolute;
  top: 10px;
  right: 15px;
  background: none;
  border: none;
  font-size: 1.8rem; /* Увеличим */
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s ease;

  &:hover {
    color: var(--text-primary);
  }

  @media (max-width: 768px) {
    display: block;
  }
`;

const Sidebar: React.FC<SidebarProps> = ({ 
    menuItems, 
    activeItemId, 
    onItemClick, 
    onLogout, 
    isMobileOpen, 
    closeMobileSidebar 
}) => {
  // Можно добавить иконки к menuItems, если нужно
  const getIcon = (id: string): string => {
      switch (id) {
          case 'dashboard': return 'fa-tachometer-alt'; // Добавляем иконку для дашборда
          case 'homepage': return 'fa-home';
          case 'rooms': return 'fa-bed';
          case 'services': return 'fa-concierge-bell';
          case 'gallery': return 'fa-images';
          case 'upload': return 'fa-upload';
          case 'promotions': return 'fa-tags'; // Добавляем иконку для акций
          default: return 'fa-question-circle';
      }
  };

  // Обработчик клика по ссылке, который также закрывает мобильный сайдбар
  const handleItemClick = (id: string) => {
    onItemClick(id);
    if (isMobileOpen && closeMobileSidebar) {
      closeMobileSidebar();
    }
  };

  return (
    <>
      {/* Показываем кнопку закрытия только если сайдбар открыт на мобильных */} 
      {isMobileOpen && closeMobileSidebar && (
          <CloseButton onClick={closeMobileSidebar}>
              <i className="fas fa-times"></i>
          </CloseButton>
      )}
      {/* Можно добавить лого или заголовок админки сюда */}
      <SidebarNav>
        <NavList>
          {menuItems.map(item => (
            <NavItem key={item.id}>
              <NavLink 
                isActive={item.id === activeItemId}
                onClick={() => handleItemClick(item.id)} // Используем новый обработчик
              >
                <i className={`fas ${getIcon(item.id)}`}></i>
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </NavList>
      </SidebarNav>
      <LogoutButton onClick={onLogout}>
        <i className="fas fa-sign-out-alt"></i>
        Выход
      </LogoutButton>
    </>
  );
};

export default Sidebar; 
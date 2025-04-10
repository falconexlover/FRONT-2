import React, { useState, useCallback } from 'react';
import styled, { css } from 'styled-components';
import Sidebar from './Sidebar';
import { TabItem } from '../ui/Tabs'; // Общий тип для вкладок/пунктов меню

interface AdminLayoutProps {
  children: React.ReactNode;
  menuItems: TabItem[];
  activeMenuItemId: string;
  onMenuItemSelect: (id: string) => void;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: calc(100vh - 80px); /* Оставляем расчет высоты, если футер админки будет */
  background-color: var(--bg-primary); /* Используем темный фон */

  /* Убираем flex-direction: column на мобильных, т.к. сайдбар становится fixed */
  /* 
  @media (max-width: 768px) {
    flex-direction: column;
  }
  */
`;

const ContentContainer = styled.main`
  flex-grow: 1;
  padding: 1.5rem; 
  overflow-y: auto;
  background-color: var(--bg-primary); /* Фон контента */
  margin: 0; 
  border-radius: 0; 

  @media (max-width: 768px) {
    padding: 1rem;
  }
   @media (max-width: 576px) {
    padding: 0.8rem;
  }
`;

const BurgerButton = styled.button`
  display: none;
  position: fixed;
  top: 15px;
  left: 15px;
  z-index: 1020;
  background: var(--primary-color); /* Основной акцентный цвет */
  color: var(--text-on-primary-bg); /* Текст на акцентном фоне */
  border: none;
  border-radius: 50%;
  width: 45px; /* Чуть больше */
  height: 45px;
  font-size: 1.3rem; /* Чуть больше */
  cursor: pointer;
  box-shadow: var(--shadow-md);
  transition: var(--transition);

  &:hover {
    background: var(--secondary-color); /* Светлее при наведении */
  }

  @media (max-width: 768px) {
    display: flex; /* Используем flex для центрирования иконки */
    align-items: center;
    justify-content: center;
  }
`;

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7); /* Затемнение можно оставить или сделать чуть плотнее */
  z-index: 1000;

  ${props => props.$isOpen && css`
    @media (max-width: 768px) {
      display: block;
    }
  `}
`;

// Возвращаем контейнер для сайдбара
const SidebarWrapper = styled.aside<{ $isOpenOnMobile: boolean }>`
  width: 220px; 
  background-color: var(--bg-secondary);
  border-right: 1px solid var(--border-color);
  padding: 1.5rem 0; /* Вертикальные отступы */
  display: flex;
  flex-direction: column;
  flex-shrink: 0; /* Не сжиматься */
  transition: transform 0.3s ease-in-out;
  z-index: 1010;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100vh;
    width: 250px; /* Можно сделать чуть шире на мобильных */
    border-right: 1px solid var(--border-color); 
    padding: 1.5rem 0;
    transform: translateX(${props => props.$isOpenOnMobile ? '0' : '-100%'});
    background-color: var(--bg-secondary);
  }
`;

const AdminLayout: React.FC<AdminLayoutProps> = ({ 
  children, 
  menuItems, 
  activeMenuItemId, 
  onMenuItemSelect 
}) => {
  const [sidebarOpenOnMobile, setSidebarOpenOnMobile] = useState(false);

  const handleSelectItem = useCallback((id: string) => {
    onMenuItemSelect(id);
    setSidebarOpenOnMobile(false);
  }, [onMenuItemSelect]);

  const toggleMobileSidebar = () => {
    setSidebarOpenOnMobile(!sidebarOpenOnMobile);
  };

  const closeMobileSidebar = () => {
    setSidebarOpenOnMobile(false);
  };

  return (
    <>
      <BurgerButton onClick={toggleMobileSidebar}>
        <i className={`fas ${sidebarOpenOnMobile ? 'fa-times' : 'fa-bars'}`}></i>
      </BurgerButton>
      <Overlay $isOpen={sidebarOpenOnMobile} onClick={closeMobileSidebar} />
      <LayoutContainer>
        <SidebarWrapper $isOpenOnMobile={sidebarOpenOnMobile}>
          <Sidebar
            menuItems={menuItems} 
            activeItemId={activeMenuItemId} 
            onItemClick={handleSelectItem}
            isMobileOpen={sidebarOpenOnMobile}
            closeMobileSidebar={closeMobileSidebar}
            onLogout={() => console.log('logout')}
          />
        </SidebarWrapper>
        <ContentContainer>{children}</ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default AdminLayout; 
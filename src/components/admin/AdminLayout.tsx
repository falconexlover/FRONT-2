import React, { useState } from 'react';
import styled, { css } from 'styled-components';

interface AdminLayoutProps {
  sidebar: React.ReactNode;
  children: React.ReactNode;
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

const SidebarContainer = styled.aside<{ isOpenOnMobile: boolean }>`
  width: 220px; /* Чуть шире для лучшего вида */
  background-color: var(--bg-secondary); /* Фон сайдбара */
  border-right: 1px solid var(--border-color); /* Темная граница */
  padding: 1.5rem 0;
  display: flex;
  flex-direction: column;
  flex-shrink: 0;
  transition: transform 0.3s ease-in-out;
  z-index: 1010;

  @media (max-width: 768px) {
    position: fixed;
    top: 0;
    left: 0;
    bottom: 0;
    height: 100vh;
    width: 250px;
    border-right: 1px solid var(--border-color);
    border-bottom: none;
    padding: 1.5rem 0;
    transform: translateX(${props => props.isOpenOnMobile ? '0' : '-100%'});
    background-color: var(--bg-secondary); /* Убедимся, что фон и тут темный */
  }
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

const Overlay = styled.div<{ isOpen: boolean }>`
  display: none;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.7); /* Затемнение можно оставить или сделать чуть плотнее */
  z-index: 1000;

  ${props => props.isOpen && css`
    @media (max-width: 768px) {
      display: block;
    }
  `}
`;

const AdminLayout: React.FC<AdminLayoutProps> = ({ sidebar, children }) => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  const sidebarWithProps = React.isValidElement(sidebar)
    ? React.cloneElement(sidebar, { isMobileOpen: isMobileSidebarOpen, closeMobileSidebar } as any)
    : sidebar;

  return (
    <>
      <BurgerButton onClick={toggleMobileSidebar}>
        <i className={`fas ${isMobileSidebarOpen ? 'fa-times' : 'fa-bars'}`}></i>
      </BurgerButton>
      <Overlay isOpen={isMobileSidebarOpen} onClick={closeMobileSidebar} />
      <LayoutContainer>
        <SidebarContainer isOpenOnMobile={isMobileSidebarOpen}>{sidebarWithProps}</SidebarContainer>
        <ContentContainer>{children}</ContentContainer>
      </LayoutContainer>
    </>
  );
};

export default AdminLayout; 
import React, { useState /*, useEffect, useCallback */ } from 'react';
// import { Link } from 'react-router-dom'; // Link больше не нужен
import AdminLoginForm from './AdminLoginForm';
import AdminPanel from './AdminPanel'; // Импортируем AdminPanel
import * as apiUtils from '../utils/api';
import { toast } from 'react-toastify';
import styled from 'styled-components';
import Modal from './ui/Modal';

const AdminFooterContainer = styled.div`
  text-align: center;
  padding: 0.5rem 1rem;
  background-color: inherit;
`;

// Убираем AdminLink

// Переименовываем AdminButton в AdminTrigger
const AdminTrigger = styled.button`
  background: none;
  border: none;
  color: #aaa; // Незаметный серый цвет
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: #ccc;
    text-decoration: underline;
  }
`;

const FooterAdminSection: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(apiUtils.authService.isAuthenticated());
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false); // Состояние для модалки админ-панели

  // handleLoginSuccessInternal теперь закрывает модальное окно админ-панели
  const handleLoginSuccessInternal = () => {
    setIsAuthenticated(true);
    setShowLoginModal(false);
    setShowAdminModal(true); // Открываем админ-панель после входа
    toast.success("Вход выполнен успешно!");
  };

  const handleAdminClick = () => {
    if (isAuthenticated) {
      setShowAdminModal(true); // Открываем модалку с админ-панелью
    } else {
      setShowLoginModal(true); // Открываем модалку для входа
    }
  };

  return (
    <AdminFooterContainer>
      {/* Всегда показываем одну и ту же кнопку */}
      <AdminTrigger onClick={handleAdminClick}>Панель администратора</AdminTrigger>

      {/* Модальное окно для входа */} 
      <Modal 
        isOpen={showLoginModal} 
        onClose={() => setShowLoginModal(false)}
        title="Вход для администратора"
      >
        <AdminLoginForm 
          onLoginSuccess={handleLoginSuccessInternal} 
          onCancel={() => setShowLoginModal(false)} 
        />
      </Modal>

      {/* Модальное окно для админ-панели */} 
      <Modal 
        isOpen={showAdminModal} 
        onClose={() => setShowAdminModal(false)}
        title="Панель администратора"
      >
        <AdminPanel /> 
      </Modal>

    </AdminFooterContainer>
  );
};

export default FooterAdminSection; 
import React from 'react';
import { useNavigate } from 'react-router-dom'; // Используем useNavigate для навигации
// import AdminLoginForm from './AdminLoginForm'; // Больше не нужен
// import AdminPanel from './AdminPanel'; // Больше не нужен
// import * as apiUtils from '../utils/api'; // Используем useAuth
// import { toast } from 'react-toastify'; // Не нужен
import styled from 'styled-components';
// import Modal from './ui/Modal'; // Больше не нужен
import { useAuth } from '../context/AuthContext'; // Импортируем useAuth

const AdminFooterContainer = styled.div`
  text-align: center;
  padding: 1rem; /* Немного увеличим отступ */
  background-color: inherit;
  display: flex; /* Используем flex для расположения кнопок */
  justify-content: center; /* Центрируем кнопки */
  align-items: center;
  gap: 1rem; /* Отступ между кнопками */
`;

// Убираем AdminLink

// Переименовываем AdminButton в AdminTrigger
const AdminTrigger = styled.button`
  background: none;
  border: none;
  color: var(--text-muted); /* Заменяем #aaa */
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: var(--text-secondary); /* Заменяем #ccc */
    text-decoration: underline;
  }
`;

const FooterAdminSection: React.FC = () => {
  const { isAuthenticated, logout } = useAuth(); // Получаем статус и функцию выхода
  const navigate = useNavigate(); // Хук для навигации

  const handleAdminClick = () => {
    // Прокручиваем вверх перед навигацией
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    
    if (isAuthenticated) {
      navigate('/admin'); // Переход в админку
    } else {
      navigate('/login'); // Переход на страницу входа
    }
  };

  const handleLogoutClick = () => {
    // Прокручиваем вверх перед выходом
    window.scrollTo({ top: 0, behavior: 'smooth' });
    logout(); // Вызываем logout из контекста
    // Перенаправление на /login произойдет внутри logout() или в ProtectedRoute
  };

  return (
    <AdminFooterContainer>
      {/* Всегда показываем одну и ту же кнопку */}
      <AdminTrigger onClick={handleAdminClick}>Панель администратора</AdminTrigger>

      {/* Показываем кнопку "Выход" только если пользователь аутентифицирован */}
      {isAuthenticated && (
        <AdminTrigger onClick={handleLogoutClick}>Выход</AdminTrigger>
      )}

      {/* Модальные окна удалены */}

    </AdminFooterContainer>
  );
};

export default FooterAdminSection; 
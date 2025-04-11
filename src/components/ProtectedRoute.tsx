// FRONT-2/src/components/ProtectedRoute.tsx

import React, { ReactNode } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext'; // Импортируем наш хук
import { LoadingSpinner } from './AdminPanel'; // Используем существующий спиннер

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation(); // Для сохранения исходного пути

  if (isLoading) {
    // Показываем спиннер, пока идет проверка токена
    return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '80vh' }}>
            <LoadingSpinner>
                <i className="fas fa-spinner"></i>
                <span>Проверка авторизации...</span>
            </LoadingSpinner>
      </div>
    );
  }

  if (!isAuthenticated) {
    // Пользователь не аутентифицирован, перенаправляем на страницу входа
    // Сохраняем путь, с которого его перенаправили, чтобы вернуть после логина
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  // Пользователь аутентифицирован, рендерим запрошенный компонент
  return <>{children}</>;
};

export default ProtectedRoute; 
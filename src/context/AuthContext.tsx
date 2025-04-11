// FRONT-2/src/context/AuthContext.tsx

import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { authService } from '../utils/api'; // Убираем комментарий
import { TokenData } from '../utils/api'; // <<< Импортируем TokenData

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean; // Добавим состояние загрузки для проверки токена
  login: (tokenData: TokenData) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true); // Начинаем с загрузки

  useEffect(() => {
    const verifyAuthToken = async () => {
      const authDataString = localStorage.getItem('hotel_forest_admin_auth');
      if (authDataString) {
        try {
          const authData = JSON.parse(authDataString);
          const token = authData.token;
          const timestamp = authData.timestamp;
          const expiresIn = authData.expiresIn;

          // Проверяем локальный срок годности (быстрая проверка)
          if (!token || !timestamp || !expiresIn || Date.now() - timestamp >= expiresIn) {
            localStorage.removeItem('hotel_forest_admin_auth');
            setIsAuthenticated(false);
            setIsLoading(false);
            return;
          }

          // Проверяем токен на бэкенде
          await authService.verifyToken(token);
          setIsAuthenticated(true); // Токен валиден

        } catch (error) {
          // Ошибка при парсинге JSON или при проверке токена на бэкенде
          console.error('Ошибка проверки аутентификации:', error);
          localStorage.removeItem('hotel_forest_admin_auth');
          setIsAuthenticated(false);
        }
      } else {
        setIsAuthenticated(false);
      }
      setIsLoading(false); // Завершаем загрузку в любом случае
    };

    verifyAuthToken();

  }, []);

  const login = (tokenData: TokenData) => { // Принимаем объект TokenData
    // Сохраняем токен и время жизни
    localStorage.setItem('hotel_forest_admin_auth', JSON.stringify({
      isAuthenticated: true,
      token: tokenData.token,
      timestamp: Date.now(),
      expiresIn: tokenData.expiresIn || 3600000 // Используем expiresIn из ответа или дефолтное
    }));
    setIsAuthenticated(true);
  };

  const logout = () => {
    localStorage.removeItem('hotel_forest_admin_auth');
    setIsAuthenticated(false);
    // Добавим перенаправление на страницу логина после выхода
    // Это можно сделать и в компоненте, где вызывается logout
    window.location.href = '/login'; // Простой вариант перенаправления
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth должен использоваться внутри AuthProvider');
  }
  return context;
}; 
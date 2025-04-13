import React, { useState } from 'react';
import styled from 'styled-components';
import { authService } from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';

interface AdminLoginFormProps {
  // Пропс больше не нужен, так как форма на отдельной странице
  // onLoginSuccess?: () => void; // Сделаем необязательным или уберем
  // onCancel?: () => void; // Сделаем необязательным
}

const LoginFormContainer = styled.div`
  background-color: white;
  padding: 2rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
`;

const FormTitle = styled.h2`
  color: var(--dark-color);
  margin-bottom: 1.5rem;
  text-align: center;
  font-family: 'Playfair Display', serif;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 600;
    text-align: left;
  }
  
  input {
    width: 100%;
    padding: 0.8rem;
    border: 1px solid #e0e0e0;
    border-radius: var(--radius-sm);
    font-size: 1rem;
    transition: var(--transition);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(33, 113, 72, 0.2);
    }
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  flex: 1;
  
  &.primary {
    background-color: var(--primary-color);
    color: white;
    
    &:hover {
      background-color: var(--dark-color);
    }
  }
  
  &.secondary {
    background-color: #e0e0e0;
    color: var(--dark-color);
    
    &:hover {
      background-color: #d0d0d0;
    }
  }
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  font-size: 0.875rem;
  margin-top: 1rem;
  text-align: center;
`;

const AdminLoginForm: React.FC<AdminLoginFormProps> = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { login } = useAuth(); // Получаем функцию login из контекста
  const navigate = useNavigate(); // Хук для навигации
  const location = useLocation(); // Хук для получения location

  // Определяем, куда перенаправить после успешного логина
  const from = location.state?.from?.pathname || '/admin';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    if (!username || !password) {
      setError('Пожалуйста, введите логин и пароль');
      setIsLoading(false);
      return;
    }

    try {
      // Получаем весь объект TokenData
      const tokenData = await authService.login(username, password); 
      // Передаем весь объект в функцию login из контекста
      login(tokenData); 
      // onLoginSuccess?.(); // Вызываем колбэк, если он был передан (теперь не нужен)
      navigate(from, { replace: true }); // Перенаправляем на нужную страницу
    } catch (err) {
      // Обработка ошибок остается прежней
      const errorMessage = err instanceof Error ? err.message : 'Неверный логин или пароль';
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <LoginFormContainer style={{ marginTop: '5rem' }}> {/* Добавим отступ сверху */}
      <FormTitle>Вход в панель администратора</FormTitle>

      <form onSubmit={handleSubmit}>
        <FormGroup>
          <label htmlFor="username">Логин:</label>
          <input 
            type="text" 
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            autoComplete="username"
            disabled={isLoading}
          />
        </FormGroup>
        
        <FormGroup>
          <label htmlFor="password">Пароль:</label>
          <input 
            type="password" 
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
            disabled={isLoading}
          />
        </FormGroup>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}

        <ButtonGroup>
          {/* Кнопка "Отмена" больше не нужна на отдельной странице */}
          {/* 
          <Button 
            type="button" 
            className="secondary" 
            onClick={onCancel} // onCancel больше не используется
            disabled={isLoading}
          >
            Отмена
          </Button>
          */}
          {/* Оставляем только кнопку "Войти" */}
          <Button 
            type="submit" 
            className="primary" 
            disabled={isLoading} 
            style={{ flexGrow: 1 }} // Растянем на всю ширину
          >
            {isLoading ? 'Вход...' : 'Войти'}
          </Button>
        </ButtonGroup>
      </form>
    </LoginFormContainer>
  );
};

export default AdminLoginForm; 
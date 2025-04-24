import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useAuth } from '../context/AuthContext';

const AdminFooterContainer = styled.div`
  text-align: center;
  padding: 1rem;
  background-color: inherit;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
`;

const AdminTrigger = styled.button`
  background: none;
  border: none;
  color: var(--text-muted);
  font-size: 0.8rem;
  cursor: pointer;
  padding: 0;
  transition: color 0.2s;

  &:hover {
    color: var(--text-secondary);
    text-decoration: underline;
  }
`;

const FooterAdminSection: React.FC = () => {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleAdminClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' }); 
    
    if (isAuthenticated) {
      navigate('/admin');
    } else {
      navigate('/login');
    }
  };

  const handleLogoutClick = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    logout();
  };

  return (
    <AdminFooterContainer>
      <AdminTrigger onClick={handleAdminClick}>Панель администратора</AdminTrigger>

      {isAuthenticated && (
        <AdminTrigger onClick={handleLogoutClick}>Выход</AdminTrigger>
      )}

    </AdminFooterContainer>
  );
};

export default FooterAdminSection; 
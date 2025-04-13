import React from 'react';
import styled from 'styled-components';

// --- Styled Components (перенесены из AdminPanel) ---

const TabsContainerStyled = styled.div` // Переименовано
  display: flex;
  border-bottom: 1px solid var(--border-color); /* Убираем фоллбэк */
  margin-bottom: 1.5rem;
  overflow-x: auto; // Добавим прокрутку, если вкладок много
`;

const TabStyled = styled.button<{ active: boolean }>` // Переименовано
  padding: 0.8rem 1.5rem;
  background: none;
  border: none;
  border-bottom: 3px solid ${props => props.active ? 'var(--primary-color)' : 'transparent'};
  color: ${props => props.active ? 'var(--dark-color)' : 'var(--text-color)'};
  font-weight: ${props => props.active ? '600' : '500'}; // Сделаем неактивные чуть жирнее
  cursor: pointer;
  transition: var(--transition);
  white-space: nowrap; // Предотвратим перенос текста
  font-size: 1rem;
  position: relative;
  bottom: -1px; // Чтобы нижняя граница контейнера перекрывалась границей активной вкладки

  &:hover {
    color: var(--primary-color);
    background-color: var(--gray-bg, #f8f9fa);
  }
  
  &:focus {
      outline: none;
  }

  &:focus-visible {
      outline: 2px solid var(--primary-color);
      outline-offset: -2px;
      border-radius: var(--radius-sm);
  }
`;

// --- Component Props ---

export interface TabItem {
  id: string;
  label: string;
  path?: string; // Добавляем опциональное поле path
}

interface TabsProps {
  tabs: TabItem[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
}

// --- Component ---

const Tabs: React.FC<TabsProps> = ({ tabs, activeTabId, onTabChange }) => {
  return (
    <TabsContainerStyled>
      {tabs.map(tab => (
        <TabStyled
          key={tab.id}
          active={activeTabId === tab.id}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </TabStyled>
      ))}
    </TabsContainerStyled>
  );
};

export default Tabs; 
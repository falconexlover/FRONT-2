import styled from 'styled-components';

const ActionButton = styled.button`
  padding: 0.8rem 1.5rem;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
  font-size: 0.9rem;
  
  &.primary {
    background-color: var(--primary-color);
    color: var(--text-on-primary-bg);
    
    &:hover:not(:disabled) {
      background-color: var(--secondary-color);
    }
  }
  
  &.secondary, &.outline { // Добавляем alias .outline для .secondary для единообразия
    background-color: var(--bg-tertiary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
    
    &:hover:not(:disabled) {
      background-color: var(--border-color);
      border-color: var(--text-secondary);
    }
  }

  &.outline-dark {
    background-color: transparent;
    color: black; /* Черный текст */
    border: 1px solid black; /* Черный контур */

    &:hover:not(:disabled) {
      background-color: rgba(0, 0, 0, 0.05); /* Легкий фон при наведении */
      border-color: #333; /* Чуть темнее контур при наведении */
    }
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export default ActionButton; 
import styled from 'styled-components';

export const TableContainer = styled.div`
  margin-top: 2rem;
  overflow-x: auto;
  min-width: 400px; /* Минимальная ширина для узкой таблицы */
  width: 100%;
  background-color: var(--bg-secondary); /* Фон для таблицы */
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
`;

export const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

// Добавляем поддержку дженерик-пропса для isDragging, если понадобится
export const StyledTableRow = styled.tr<{ $isDragging?: boolean }>`
  border-bottom: 1px solid var(--border-color);
  background-color: var(--bg-secondary);
  transition: background-color 0.2s ease, opacity 0.2s ease;

  &:last-child {
    border-bottom: none;
  }

  &:hover {
    background-color: var(--bg-tertiary); /* Легкое выделение при наведении */
  }

  // Стили для перетаскивания (опционально, если $isDragging передается)
  opacity: ${({ $isDragging }) => ($isDragging ? 0.5 : 1)};
  box-shadow: ${({ $isDragging }) => ($isDragging ? '0 4px 12px rgba(0, 0, 0, 0.1)' : 'none')};
`;

export const StyledTableCell = styled.td`
  padding: 0.3rem 0.5rem; /* Меньше отступы */
  color: black;
  vertical-align: middle;
  white-space: normal; /* Разрешаем перенос текста */
  font-size: 0.85rem; /* Меньше шрифт */
  line-height: 1.1;

  /* Классы для специфичных ячеек можно добавлять по месту использования */
  &.drag-handle {
    width: 40px; 
    cursor: grab;
    text-align: center;
    color: var(--text-secondary);
    &:active {
        cursor: grabbing;
    }
  }

  &.image-cell {
    width: 120px; 
    @media screen and (max-width: 768px) {
      padding-right: 0.5rem; 
    }
  }

  &.features-cell {
    max-width: 200px; 
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    cursor: default; 
  }

  &.actions {
    width: 100px; 
    white-space: nowrap;
    text-align: right; 
    @media screen and (max-width: 768px) {
      width: auto; 
      text-align: left;
      padding-left: 0.5rem; 
    }
  }

  // Скрываем колонки на мобильных
  &.hide-mobile {
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
`;

export const TableHeader = styled.th`
  padding: 0.3rem 0.5rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: black;
  white-space: normal;
  font-size: 0.85rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  // Скрываем колонки на мобильных
  &.hide-mobile {
    @media screen and (max-width: 768px) {
      display: none;
    }
  }
`;

export const ActionButtonsContainer = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    flex-wrap: nowrap;
    justify-content: flex-start; // По умолчанию слева

    /* Если кнопки должны быть справа (как в Rooms), можно переопределить в компоненте */
    /* justify-content: flex-end; */ 
`;

export const IconButton = styled.button`
    padding: 0.3rem;
    min-width: auto;
    line-height: 1;
    font-size: 0.95rem;
    background: none;
    border: none;
    color: var(--text-secondary);
    border-radius: 50%;
    width: 26px;
    height: 26px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s ease, color 0.2s ease;

    &:hover:not(:disabled) {
        background-color: var(--bg-tertiary);
        color: var(--text-primary);
    }

    &.edit {
       &:hover:not(:disabled) {
           color: var(--primary-color);
           background-color: rgba(42, 167, 110, 0.1);
       }
    }

    &.delete {
        &:hover:not(:disabled) {
            color: var(--danger-color);
            background-color: rgba(229, 115, 115, 0.1);
        }
    }

    i {
        margin: 0;
        font-size: 0.9rem; 
    }
    
    &:disabled {
        opacity: 0.4;
        cursor: not-allowed;
    }
`; 
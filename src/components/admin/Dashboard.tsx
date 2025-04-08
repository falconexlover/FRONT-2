import React from 'react';
import styled from 'styled-components';

const DashboardContainer = styled.div`
  padding: 1.5rem;
  /* Стили для контейнера дашборда */
`;

const DashboardTitle = styled.h2`
  margin-bottom: 2rem;
  color: var(--text-primary);
`;

const WidgetGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1.5rem;
  /* Стили для сетки виджетов */
`;

// Пример виджета (пока пустой)
const WidgetCard = styled.div`
  background-color: var(--bg-secondary);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
`;

const Dashboard: React.FC = () => {
  return (
    <DashboardContainer>
      <DashboardTitle>Панель управления</DashboardTitle>
      <WidgetGrid>
        {/* Здесь будут размещаться виджеты */}
        <WidgetCard>
          <h3>Виджет 1 (Скоро)</h3>
          <p>Данные...</p>
        </WidgetCard>
         <WidgetCard>
          <h3>Виджет 2 (Скоро)</h3>
          <p>Данные...</p>
        </WidgetCard>
         <WidgetCard>
          <h3>Виджет 3 (Скоро)</h3>
          <p>Данные...</p>
        </WidgetCard>
        {/* ... другие виджеты ... */}
      </WidgetGrid>
    </DashboardContainer>
  );
};

export default Dashboard; 
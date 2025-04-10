import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  padding: 2rem 1rem; // Добавляем отступы
  max-width: 1200px;
  margin: 0 auto;
`;

const ServicesPage: React.FC = () => {
  return (
    <PageWrapper>
      <h1>Наши услуги</h1>
      <p>Содержимое страницы услуг будет здесь.</p>
      {/* TODO: Добавить описание услуг (сауна, конференц-зал и т.д.) */}
    </PageWrapper>
  );
};

export default ServicesPage; 
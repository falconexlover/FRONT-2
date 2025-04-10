import React from 'react';
import styled from 'styled-components';

const PageWrapper = styled.div`
  padding: 2rem 1rem; // Добавляем отступы
  max-width: 1200px;
  margin: 0 auto;
`;

const ContactsPage: React.FC = () => {
  return (
    <PageWrapper>
      <h1>Контакты</h1>
      <p>Содержимое страницы контактов будет здесь.</p>
      {/* TODO: Добавить форму обратной связи, карту и контактные данные */}
    </PageWrapper>
  );
};

export default ContactsPage; 
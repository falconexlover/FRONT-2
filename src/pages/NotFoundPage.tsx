import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';

const PageWrapper = styled.div`
  padding: 4rem 1rem;
  text-align: center;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h1`
  font-size: 3rem;
  color: var(--primary-color);
  margin-bottom: 1rem;
`;

const Message = styled.p`
  font-size: 1.2rem;
  color: var(--text-secondary);
  margin-bottom: 2rem;
`;

const HomeLink = styled(Link)`
  display: inline-block;
  padding: 0.8rem 1.5rem;
  background-color: var(--primary-color);
  color: var(--text-on-primary-bg);
  border-radius: var(--radius-sm);
  text-decoration: none;
  transition: background-color 0.2s;

  &:hover {
    background-color: var(--secondary-color);
  }
`;

const NotFoundPage: React.FC = () => {
  return (
    <PageWrapper>
      <Title>404 - Страница не найдена</Title>
      <Message>К сожалению, страница, которую вы ищете, не существует.</Message>
      <HomeLink to="/">Вернуться на главную</HomeLink>
    </PageWrapper>
  );
};

export default NotFoundPage; 
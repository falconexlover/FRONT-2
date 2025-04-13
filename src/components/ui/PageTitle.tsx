import styled from 'styled-components';

const PageTitle = styled.h1`
  color: var(--text-primary);
  margin-bottom: 2rem;
  font-size: 2.2rem; 
  font-weight: 600; // Сделаем немного жирнее
  border-bottom: 1px solid var(--border-color); /* Убираем фоллбэк */
  padding-bottom: 1rem;
  line-height: 1.3;

  @media (max-width: 768px) {
      font-size: 1.8rem;
      margin-bottom: 1.5rem;
      padding-bottom: 0.8rem;
  }
  @media (max-width: 576px) {
      font-size: 1.6rem;
      margin-bottom: 1rem;
  }
`;

export default PageTitle; 
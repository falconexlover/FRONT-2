import styled from 'styled-components';

const PageContainer = styled.div`
  padding: var(--space-xl) var(--space-md); /* 32px по бокам 16px */
  max-width: var(--max-width);
  margin: var(--space-xl) auto; /* 32px сверху/снизу */
  width: 100%; // Убедимся, что занимает всю доступную ширину до max-width
  box-sizing: border-box; // Чтобы padding не увеличивал общую ширину

  @media (max-width: 768px) {
      padding-top: var(--space-lg); /* 24px */
      padding-bottom: var(--space-lg); /* 24px */
      margin-top: var(--space-lg); /* 24px */
      margin-bottom: var(--space-lg); /* 24px */
  }
  @media (max-width: 576px) {
      padding-left: var(--space-sm); /* 8px */
      padding-right: var(--space-sm); /* 8px */
      padding-top: var(--space-md); /* 16px */
      padding-bottom: var(--space-md); /* 16px */
      margin-top: var(--space-md); /* 16px */
      margin-bottom: var(--space-md); /* 16px */
  }
`;

export default PageContainer; 
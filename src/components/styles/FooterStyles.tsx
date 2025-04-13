import styled from 'styled-components';

export const FooterWrapper = styled.footer`
  background-color: var(--dark-color);
  color: rgba(255, 255, 255, 0.7);
  padding: var(--space-xxl) 0 var(--space-md); /* 48px 0 16px */
  margin-top: var(--space-xxl); /* 48px */
`;

export const FooterContainer = styled.div`
  max-width: var(--max-width);
  margin: 0 auto;
  padding: 0 var(--space-xl); /* 0 32px */
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: var(--space-xl); /* 32px */
  margin-bottom: var(--space-xxl); /* 48px */

  @media screen and (max-width: 768px) {
      padding: 0 var(--space-lg); /* 0 24px */
      gap: var(--space-lg); /* 24px */
      margin-bottom: var(--space-xl); /* 32px */
  }
`;

export const FooterColumn = styled.div`
  h4 {
    color: white;
    margin-bottom: var(--space-lg); /* 24px */
    font-size: 1.1rem;
    font-weight: 600;
    position: relative;
    padding-bottom: var(--space-sm); /* 8px */
    
    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: 0;
      width: 40px;
      height: 2px;
      background-color: var(--primary-color);
    }
  }

  p, li {
    font-size: 0.95rem;
    margin-bottom: var(--space-sm); /* 8px */
    line-height: 1.8;
  }

  ul {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  a {
    color: rgba(255, 255, 255, 0.7);
    text-decoration: none;
    transition: var(--transition);
    
    &:hover {
      color: white;
      text-decoration: underline;
    }
  }
`;

export const SocialLinks = styled.div`
  margin-top: var(--space-md); /* 16px */
  
  a {
    color: white;
    font-size: 1.3rem;
    margin-right: var(--space-md); /* 16px */
    transition: var(--transition);
    
    &:hover {
      color: var(--primary-color);
      transform: scale(1.1);
    }
  }
`;

export const Copyright = styled.div`
  text-align: center;
  padding: var(--space-lg) var(--space-md); /* 24px 16px */
  margin-top: var(--space-xxl); /* 48px */
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.5);
`;

// Удаляем стили админки, так как они теперь в FooterAdminSection
/*
export const AdminContainer = styled.div` ... `;
export const AdminToggle = styled.button` ... `;
export const AdminContent = styled.div` ... `;
*/ 
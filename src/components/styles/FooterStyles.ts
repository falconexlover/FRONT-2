import styled from 'styled-components';

export const FooterWrapper = styled.footer`
  background-color: #24282f;
  color: #e1e1e1;
  position: relative;
  padding-top: 3.5rem;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 5px;
    background: linear-gradient(to right, var(--primary-color), var(--accent-color));
  }
`;

export const FooterContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 2rem 3rem;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2.5rem;
  position: relative;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 0 1.5rem 2rem;
  }
  @media (max-width: 576px) {
    padding: 0 1rem 1.5rem;
  }
`;

export const SectionTitle = styled.h3`
  color: #e1e1e1;
  font-family: 'Playfair Display', serif;
  font-size: 1.3rem;
  margin-bottom: 1.5rem;
  position: relative;
  display: inline-block;

  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 0;
    width: 50px;
    height: 2px;
    background-color: var(--accent-color);
  }

  @media (max-width: 768px) {
    font-size: 1.2rem;
    margin-bottom: 1.2rem;
  }
`;

export const FooterSection = styled.div`
  &.faq-section {
    .faq-item {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);

      &:last-child {
        border-bottom: none;
      }

      .question {
        color: var(--accent-color);
        font-weight: 600;
        margin-bottom: 0.5rem;
        display: flex;
        align-items: center;

        &::before {
          content: "?";
          background-color: rgba(255, 255, 255, 0.1);
          color: var(--accent-color);
          width: 20px;
          height: 20px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin-right: 10px;
          font-size: 0.8rem;
          font-weight: bold;
        }
      }

      .answer {
        color: #a0a7b3;
        font-size: 0.95rem;
        margin-left: 30px;

        @media (max-width: 576px) {
          font-size: 0.9rem;
          margin-left: 25px;
        }
      }
    }
  }

  &.links-section {
    ul {
      list-style: none;
      padding: 0;

      li {
        margin-bottom: 0.8rem;

        a {
          color: #a0a7b3;
          text-decoration: none;
          transition: all 0.3s;
          display: flex;
          align-items: center;

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              color: #e1e1e1;
              transform: translateX(5px);
            }
          }
          
          &:active {
             color: #e1e1e1;
          }

          &::before {
            content: "›";
            margin-right: 10px;
            color: var(--accent-color);
            font-size: 1.2rem;
            font-weight: bold;
          }

          @media (max-width: 576px) {
             font-size: 0.9rem;
          }
        }
      }
    }
  }

  &.contact-section {
    .contact-item {
      display: flex;
      margin-bottom: 1.2rem;

      .icon {
        color: var(--accent-color);
        margin-right: 15px;
        width: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        flex-shrink: 0;
      }

      .content {
        color: #a0a7b3;
        font-size: 0.95rem;
        line-height: 1.5;

        a {
          color: #a0a7b3;
          text-decoration: none;
          transition: color 0.3s;

          @media (hover: hover) and (pointer: fine) {
            &:hover {
              color: #e1e1e1;
              text-decoration: underline;
            }
          }
          
          &:active {
             color: #e1e1e1;
             text-decoration: underline;
          }
        }

        @media (max-width: 576px) {
          font-size: 0.9rem;
        }
      }
    }
  }
`;

export const FooterBottom = styled.div`
  background-color: #1a1d21;
  padding: 1.5rem 2rem;
  text-align: center;
  font-size: 0.9rem;
  color: #a0a7b3;
  border-top: 1px solid rgba(255, 255, 255, 0.08);

  a {
    color: #a0a7b3;
    text-decoration: underline;
    
    @media (hover: hover) and (pointer: fine) {
      &:hover {
          color: #e1e1e1;
      }
    }
    
    &:active {
        color: #e1e1e1;
    }
  }

  @media (max-width: 768px) {
    padding: 1.2rem 1.5rem;
  }
  @media (max-width: 576px) {
    padding: 1rem 1rem;
    font-size: 0.85rem;
  }
`;

export const AdminContainer = styled.div`
  background-color: var(--bg-tertiary);
  padding: 10px 0;
  border-top: 1px solid var(--border-color);
`;

export const AdminToggle = styled.button`
  display: block;
  margin: 0 auto 10px;
  padding: 8px 15px;
  background-color: var(--primary-color);
  color: var(--text-on-primary-bg);
  border: none;
  border-radius: var(--radius-sm);
  cursor: pointer;
  transition: var(--transition);
  &:hover { background-color: var(--secondary-color); }
  i { margin-right: 8px; }
`;

export const AdminContent = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 1rem;
  background: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
`; 
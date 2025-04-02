import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  
  &.scrolled {
    box-shadow: var(--shadow-md);
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 2rem;
  
  @media screen and (max-width: 768px) {
    padding: 1rem;
  }
`;

const Logo = styled(Link)`
  position: relative;
  display: inline-block;
  
  img {
    height: 100px;
    max-width: 350px;
    object-fit: contain;
  }
  
  @media screen and (max-width: 768px) {
    img {
      height: 60px;
    }
  }
`;

const HeaderContact = styled.div`
  text-align: right;
  font-size: 0.9rem;
  
  p:first-child {
    font-weight: 600;
    color: var(--primary-color);
    
    a {
      color: var(--primary-color);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
  
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 2rem;
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  
  @media screen and (max-width: 768px) {
    justify-content: space-between;
    padding: 0 1rem;
  }
`;

const NavMenu = styled.ul<{ isOpen: boolean }>`
  display: flex;
  list-style: none;
  
  @media screen and (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${({ isOpen }) => (isOpen ? '0' : '-100%')};
    width: 80%;
    height: 100vh;
    background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
    flex-direction: column;
    justify-content: center;
    padding-top: 60px;
    transition: all 0.4s ease;
    z-index: 99;
    box-shadow: var(--shadow-lg);
  }
`;

const NavItem = styled.li`
  position: relative;
  
  @media screen and (max-width: 768px) {
    text-align: center;
    margin: 1rem 0;
  }
`;

const NavLink = styled(Link)`
  display: block;
  padding: 1.2rem 1.5rem;
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: 0.95rem;
  letter-spacing: 0.5px;
  transition: var(--transition);
  text-transform: uppercase;
  
  &:hover {
    color: white;
    background-color: rgba(255, 255, 255, 0.1);
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: 10px;
    left: 50%;
    width: 0;
    height: 2px;
    background-color: white;
    transform: translateX(-50%);
    transition: var(--transition);
  }
  
  &:hover::after {
    width: 30px;
  }
  
  @media screen and (max-width: 768px) {
    font-size: 1.1rem;
    width: 100%;
  }
`;

const BookButton = styled(Link)`
  background-color: white;
  color: var(--primary-color);
  font-weight: 600;
  padding: 0.8rem 1.5rem;
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: none;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  text-decoration: none;
  
  &:hover {
    background-color: var(--accent-color);
    color: white;
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
  }
`;

const MobileMenuButton = styled.button<{ isOpen: boolean }>`
  display: none;
  background: transparent;
  border: none;
  width: 40px;
  height: 40px;
  position: relative;
  cursor: pointer;
  z-index: 100;
  
  span {
    display: block;
    width: 30px;
    height: 3px;
    background-color: white;
    margin: 6px auto;
    transition: all 0.3s ease;
  }
  
  &.open span:nth-child(1) {
    transform: rotate(45deg) translate(7px, 7px);
  }
  
  &.open span:nth-child(2) {
    opacity: 0;
  }
  
  &.open span:nth-child(3) {
    transform: rotate(-45deg) translate(7px, -7px);
  }
  
  @media screen and (max-width: 768px) {
    display: block;
  }
`;

const MENU_ITEMS = [
  { label: 'Главная', path: '/' },
  { label: 'Номера', path: '/rooms' },
  { label: 'Галерея', path: '/gallery' },
  { label: 'Бронирование', path: '/booking' },
  { label: 'Контакты', path: '/contact' }
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.classList.toggle('menu-open');
  };

  return (
    <HeaderContainer className={isScrolled ? 'scrolled' : ''}>
      <LogoContainer>
        <Logo to="/">
          <img src="/images/logo/logo.png" alt="Лесной дворик - Санаторий-профилакторий ОАО ЖМЗ" />
        </Logo>
        <HeaderContact>
          <p><a href="tel:+74984831941">8 (498) 483 19 41</a></p>
          <p>г. Жуковский, ул. Нижегородская, д. 4</p>
        </HeaderContact>
      </LogoContainer>
      
      <Navigation>
        <MobileMenuButton 
          onClick={toggleMenu} 
          aria-label="Меню"
          className={isMenuOpen ? 'open' : ''}
          isOpen={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </MobileMenuButton>
        
        <NavMenu isOpen={isMenuOpen}>
          {MENU_ITEMS.map((item, index) => (
            <NavItem key={index}>
              <NavLink to={item.path} onClick={() => setIsMenuOpen(false)}>
                {item.label}
              </NavLink>
            </NavItem>
          ))}
        </NavMenu>
        
        <BookButton to="/booking">Забронировать</BookButton>
      </Navigation>
    </HeaderContainer>
  );
}

export default Header; 
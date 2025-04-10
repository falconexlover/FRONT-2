import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { homePageService } from '../utils/api';
import { HomePageContent } from '../types/HomePage';

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
  padding: 0.25rem 2rem;
  
  @media screen and (max-width: 768px) {
    padding: 0.25rem 1rem;
  }
`;

const Logo = styled(Link)`
  position: relative;
  display: inline-block;
  
  img {
    height: 80px;
    max-width: 350px;
    object-fit: contain;
  }
  
  @media screen and (max-width: 768px) {
    img {
      height: 50px;
    }
  }
`;

const HeaderContact = styled.div`
  text-align: right;
  font-size: 0.9rem;
  
  p {
    margin-bottom: 0.3rem;
  }

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

  .address {
    color: #555;
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

const NavMenu = styled.ul<{ $isOpen: boolean }>`
  display: flex;
  list-style: none;
  
  @media screen and (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${({ $isOpen }) => ($isOpen ? '0' : '-100%')};
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
  
  // Применяем hover только на устройствах с мышью
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
      &::after {
        width: 30px;
      }
    }
  }
  
  // Добавляем стиль для active (тап на мобильных)
  &:active {
    background-color: rgba(255, 255, 255, 0.15); // Немного темнее для отклика
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
  
  // Применяем hover только на устройствах с мышью
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: var(--accent-color);
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
  
  // Добавляем стиль для active (тап на мобильных)
  &:active {
    background-color: var(--accent-color);
    color: white;
    transform: translateY(1px); // Легкое нажатие
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1); // Меньшая тень
  }
`;

const MobileMenuButton = styled.button<{ $isOpen: boolean }>`
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
  { label: 'Сауна', path: '/sauna' },
  { label: 'Услуги', path: '/services' },
  { label: 'Конференц-зал', path: '/conference' },
  { label: 'Детские праздники', path: '/party' },
  { label: 'Контакты', path: '/contact' }
];

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [contactInfo, setContactInfo] = useState<HomePageContent['contact'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const menuRef = useRef<HTMLUListElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);

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

  useEffect(() => {
    const loadContent = async () => {
      setIsLoading(true);
      try {
        const content = await homePageService.getHomePage();
        if (content && content.contact) {
          setContactInfo(content.contact);
        } else {
          console.warn("Home page content or contact info not found.");
        }
      } catch (error) {
        console.error("Failed to load home page content:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadContent();
  }, []);

  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        isMenuOpen &&
        menuRef.current &&
        !menuRef.current.contains(event.target as Node) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target as Node)
      ) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <HeaderContainer className={isScrolled ? 'scrolled' : ''}>
      <LogoContainer>
        <Logo to="/">
          <img src="/images/logo/logo.png" alt="Логотип Лесной Дворик" />
        </Logo>
        <HeaderContact>
          {isLoading ? (
            <p>Загрузка...</p>
          ) : contactInfo && contactInfo.phone && contactInfo.phone.length > 0 ? (
            <p><a href={`tel:${contactInfo.phone[0].replace(/\D/g, '')}`}>{contactInfo.phone[0]}</a></p>
          ) : (
            <p><a href="tel:+74984831941">8 (498) 483 19 41</a></p>
          )}
          {isLoading ? null : contactInfo && contactInfo.address ? (
            <p className="address">{contactInfo.address}</p>
          ) : (
            <p className="address">г. Жуковский, ул. Нижегородская, д. 4</p>
          )}
        </HeaderContact>
        <MobileMenuButton
          ref={buttonRef}
          $isOpen={isMenuOpen}
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className={isMenuOpen ? 'open' : ''}
          aria-label={isMenuOpen ? 'Закрыть меню' : 'Открыть меню'}
          aria-expanded={isMenuOpen}
        >
          <span></span>
          <span></span>
          <span></span>
        </MobileMenuButton>
      </LogoContainer>
      
      <Navigation>
        <NavMenu $isOpen={isMenuOpen} ref={menuRef}>
          {MENU_ITEMS.map((item) => (
            <NavItem key={item.path} onClick={() => setIsMenuOpen(false)}>
              <NavLink to={item.path}>{item.label}</NavLink>
            </NavItem>
          ))}
        </NavMenu>
        <BookButton to="/booking">Забронировать</BookButton>
      </Navigation>
    </HeaderContainer>
  );
}

export default Header; 
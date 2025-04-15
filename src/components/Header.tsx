import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import styled, { css } from 'styled-components';
import { homePageService } from '../utils/api';
import { HomePageContent } from '../types/HomePage';

const HeaderContainer = styled.header`
  background-color: white;
  position: sticky;
  top: 0;
  z-index: 1030;
  transition: var(--transition);
  
  &.scrolled {
    /* box-shadow: var(--shadow-md); */
  }
`;

const LogoContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--space-xs) var(--space-xl); /* 4px 32px */
  
  @media screen and (max-width: 768px) {
    padding: var(--space-xs) var(--space-md); /* 4px 16px */
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
    margin-bottom: var(--space-xs); /* 4px */
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
    color: var(--text-secondary);
  }
  
  @media screen and (max-width: 768px) {
    display: none;
  }
`;

const Navigation = styled.nav`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 var(--space-xl); /* 0 32px */
  background: linear-gradient(to right, var(--primary-color), var(--secondary-color));
  border-radius: var(--radius-sm) var(--radius-sm) 0 0;
  min-height: 50px;
  
  @media screen and (max-width: 768px) {
    justify-content: flex-end;
    padding: 0 var(--space-md); /* 0 16px */
  }
`;

const NavMenu = styled.ul<{ $isOpen: boolean }>`
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  align-items: center;

  @media screen and (max-width: 768px) {
    position: fixed;
    top: 0;
    left: ${({ $isOpen }) => ($isOpen ? '0' : '-100%')};
    width: 80%;
    max-width: 350px;
    height: 100vh;
    background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
    flex-direction: column;
    justify-content: flex-start;
    padding: 0 0 var(--space-xl) 0; /* 0 0 32px 0 */
    transition: left 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
    z-index: 99;
    box-shadow: 0 8px 30px rgba(0,0,0,0.2);
    align-items: stretch;
    overflow-y: auto;
  }
`;

const MenuLogoContainer = styled.div`
  padding: var(--space-lg) var(--space-lg); /* 24px 24px */ 
  text-align: center;
  border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
  margin-bottom: var(--space-sm); /* 8px */
  
  img {
    height: 45px;
    width: 100%;
    object-fit: contain;
    display: block;
    margin: 0 auto;
  }
`;

const NavItem = styled.li`
  position: relative;
  margin: 0;
  padding: 0;

  @media screen and (max-width: 768px) {
    text-align: left;
    margin: 0;
    width: 100%;
    border-bottom: 1px dashed rgba(255, 255, 255, 0.15);
    padding: 0 var(--space-lg); /* 0 24px */

    &:first-child {
      border-top: 1px dashed rgba(255, 255, 255, 0.15);
    }
    &:last-child {
       border-bottom: none;
       margin-bottom: var(--space-md); /* 16px */
    }
    &:has(> a[data-mobile-button="true"]) {
        margin-bottom: 0;
        padding: 0;
    }
  }
`;

const NavLinkStyles = css<{ $isSmall?: boolean }>`
  display: block;
  padding: ${({ $isSmall }) => $isSmall ? 'calc(var(--space-lg) - var(--space-xs)) var(--space-md)' : 'var(--space-lg) var(--space-lg)'}; /* ~20px 16px : 24px 24px */
  text-decoration: none;
  color: rgba(255, 255, 255, 0.9);
  font-weight: 500;
  font-size: ${({ $isSmall }) => $isSmall ? '0.85rem' : '0.95rem'};
  letter-spacing: 0.5px;
  transition: background-color 0.2s ease, color 0.2s ease, padding-left 0.2s ease;
  text-transform: uppercase;
  position: relative;
  cursor: pointer;
  white-space: nowrap;

  @media (hover: hover) and (pointer: fine) {
    &:hover {
      color: white;
      background-color: rgba(255, 255, 255, 0.1);
      &::after {
        width: 30px;
      }
    }
  }
  
  &:active {
    background-color: rgba(255, 255, 255, 0.15);
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
    font-size: ${({ $isSmall }) => $isSmall ? '1.0rem' : '1.1rem'};
    width: 100%;
    padding: calc(var(--space-lg) - var(--space-xs)) 0; /* ~20px 0 */
    color: #f0f0f0;
    position: relative;

    &:hover {
        background-color: rgba(255, 255, 255, 0.1);
        color: #fff;
        padding-left: var(--space-sm); /* 8px */
    }
    &:active {
        background-color: rgba(255, 255, 255, 0.15);
    }

    &.active {
      color: #fff;
      font-weight: 600;
      background-color: rgba(0, 0, 0, 0.1);

      &::before {
        content: '';
        position: absolute;
        left: 0;
        top: 0;
        bottom: 0;
        width: 4px;
        background-color: var(--accent-color);
        border-radius: 0 2px 2px 0;
      }
    }
  }
`;

const NavLink = styled(Link)<{ $isSmall?: boolean }>`
  ${NavLinkStyles}
`;

const NavScrollLink = styled.a<{ $isSmall?: boolean }>`
  ${NavLinkStyles}
`;

const BookButton = styled(Link)<{ $mobile?: boolean }>`
  background-color: white;
  color: var(--primary-color);
  font-weight: 600;
  padding: var(--space-sm) var(--space-lg); /* 8px 24px */
  border-radius: var(--radius-sm);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
  border: none;
  transition: var(--transition);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: 0.9rem;
  text-decoration: none;
  display: inline-block;
  
  @media (hover: hover) and (pointer: fine) {
    &:hover {
      background-color: var(--accent-color);
      color: white;
      transform: translateY(-3px);
      box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    }
  }
  
  &:active {
    background-color: var(--accent-color);
    color: white;
    transform: translateY(1px);
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  }

  ${({ $mobile }) => $mobile && `
    background-color: #fff;
    color: var(--primary-color);
    width: calc(100% - calc(var(--space-lg) * 2)); /* 100% - 48px */
    margin: var(--space-xl) auto; /* 32px auto */
    padding: calc(var(--space-md) + var(--space-xs)) var(--space-lg); /* ~20px 24px */
    text-align: center;
    display: block;
    font-size: 1rem;
    font-weight: 600;
    border: 2px solid transparent;

    &:hover {
      background-color: transparent;
      color: #fff;
      border: 2px solid #fff;
      transform: none;
      box-shadow: none;
    }
  `}
`;

const MobileMenuButton = styled.button<{ $isOpen: boolean }>`
  display: none;
  background-color: var(--primary-color);
  border: none;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  cursor: pointer;
  z-index: 1050;
  padding: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  transition: background-color 0.2s ease, transform 0.2s ease;

  &:hover {
    background-color: var(--secondary-color);
    transform: scale(1.05);
  }
  &:active {
    transform: scale(0.95);
  }

  span {
    display: block;
    width: 22px;
    height: 2px;
    background-color: white;
    margin: var(--space-xs) auto; /* 4px auto */
    transition: all 0.3s ease-in-out;
    border-radius: 1px;
    position: relative;
    transform-origin: center;
  }

  ${({ $isOpen }) => $isOpen && `
    background-color: var(--secondary-color);

    span:nth-child(1) {
      transform: translateY(6px) rotate(45deg);
    }
    span:nth-child(2) {
      opacity: 0;
      transform: scaleX(0.5);
    }
    span:nth-child(3) {
      transform: translateY(-6px) rotate(-45deg);
    }
  `}
  
  @media screen and (max-width: 768px) {
    display: block;
    position: fixed;
    bottom: calc(var(--space-xxxl) + env(safe-area-inset-bottom));
    right: calc(var(--space-md) + env(safe-area-inset-right));
  }
`;

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;
  @media screen and (max-width: 768px) {
    display: block;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.5);
    z-index: 98;
    opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
    visibility: ${({ $isOpen }) => ($isOpen ? 'visible' : 'hidden')};
    transition: opacity 0.4s ease, visibility 0.4s ease;
  }
`;

const Header: React.FC = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [content, setContent] = useState<HomePageContent | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);
  const location = useLocation();
  const navigate = useNavigate();
  const menuRef = useRef<HTMLUListElement>(null);
  const headerRef = useRef<HTMLElement>(null);
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
      try {
        const fetchedContent = await homePageService.getHomePage();
        setContent(fetchedContent);
      } catch (error) {
        console.error("Failed to load home page content:", error);
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
    const checkMobile = () => {
        const mobile = window.innerWidth <= 768;
        setIsMobile(mobile);
        if (!mobile) {
            setIsMenuOpen(false);
        }
    };
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const handleScrollLinkClick = (event: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    event.preventDefault();
    setIsMenuOpen(false);

    const headerHeight = headerRef.current?.offsetHeight ?? 80;
    const scrollOffset = headerHeight + 10;

    if (location.pathname === '/') {
      const element = document.getElementById(targetId);
      if (element) {
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;

        window.scrollTo({
             top: offsetPosition,
             behavior: "smooth"
        });
      }
    } else {
      localStorage.setItem('scrollToAnchor', targetId);
      navigate('/');
    }
  };

  useEffect(() => {
    const anchor = localStorage.getItem('scrollToAnchor');
    if (anchor && location.pathname === '/' && location.hash === '') {
      // Функция для попытки прокрутки к элементу
      const tryScrollToElement = (remainingAttempts = 10) => {
        const element = document.getElementById(anchor);
        
        if (element) {
          // Элемент найден - выполняем прокрутку
          const headerHeight = headerRef.current?.offsetHeight ?? 80;
          const scrollOffset = headerHeight + 10;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - scrollOffset;
          
          window.scrollTo({ 
            top: offsetPosition, 
            behavior: "smooth" 
          });
          
          // Убираем метку из localStorage
          localStorage.removeItem('scrollToAnchor');
        } else if (remainingAttempts > 0) {
          // Элемент не найден, но у нас еще есть попытки
          // Ждем 100мс и пробуем снова
          setTimeout(() => {
            tryScrollToElement(remainingAttempts - 1);
          }, 100);
        } else {
          // Исчерпаны все попытки, элемент не найден
          console.warn(`Не удалось найти элемент с id "${anchor}" после нескольких попыток`);
          localStorage.removeItem('scrollToAnchor');
        }
      };
      
      // Запускаем механизм проверки
      // Небольшая начальная задержка, чтобы страница успела загрузиться
      setTimeout(() => {
        tryScrollToElement();
      }, 200);
    } else if (anchor && location.pathname !== '/') {
      localStorage.removeItem('scrollToAnchor');
    }
  }, [location.pathname, location.hash, headerRef]);

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

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen, menuRef, buttonRef]);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.pathname]);

  const handleLinkClick = () => {
    if (isMobile) {
      setIsMenuOpen(false);
    }
  };

  const toggleMenu = () => setIsMenuOpen(!isMenuOpen);

  useEffect(() => {
    if (isMenuOpen && isMobile) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMenuOpen, isMobile]);

  const logoUrl = '/images/logo/logo.png';
  const phoneNumber = content?.contact?.phone?.[0];
  const address = content?.contact?.address;

  return (
    <HeaderContainer ref={headerRef} className={isScrolled ? 'scrolled' : ''}>
      <LogoContainer>
        <Logo to="/">
          <img src={logoUrl} alt="Лесной Дворик Логотип" />
        </Logo>
        {!isMobile && (
          <HeaderContact>
            {phoneNumber && <p><a href={`tel:+${phoneNumber.replace(/\D/g, '')}`}>{phoneNumber}</a></p>}
            {address && <p className="address">{address}</p>}
          </HeaderContact>
        )}
      </LogoContainer>
      
      <Navigation>
        <NavMenu $isOpen={isMenuOpen} ref={menuRef}>
          {isMobile && (
            <MenuLogoContainer>
              <Link to="/" onClick={handleLinkClick}>
                <img src={logoUrl} alt="Лесной Дворик Логотип" />
              </Link>
            </MenuLogoContainer>
          )}

          <NavItem><NavLink to="/" onClick={handleLinkClick}>Главная</NavLink></NavItem>
          <NavItem><NavScrollLink href="/#about-section" onClick={(e) => handleScrollLinkClick(e, 'about-section')}>О нас</NavScrollLink></NavItem>
          <NavItem><NavLink to="/rooms" onClick={handleLinkClick}>Номера</NavLink></NavItem>
          <NavItem><NavLink to="/sauna" onClick={handleLinkClick}>Сауна</NavLink></NavItem>
          <NavItem><NavLink to="/conference" onClick={handleLinkClick}>Конференц-зал</NavLink></NavItem>
          <NavItem><NavLink to="/party" onClick={handleLinkClick}>Детские праздники</NavLink></NavItem>
          <NavItem><NavScrollLink href="/#services-section" onClick={(e) => handleScrollLinkClick(e, 'services-section')}>Предложения</NavScrollLink></NavItem>
          <NavItem><NavLink to="/promotions" onClick={handleLinkClick}>Акции</NavLink></NavItem>
          <NavItem><NavLink to="/gallery" onClick={handleLinkClick}>Галерея</NavLink></NavItem>
          <NavItem><NavLink to="/blog" onClick={handleLinkClick}>Блог</NavLink></NavItem>
          <NavItem><NavLink to="/contacts" onClick={handleLinkClick}>Контакты</NavLink></NavItem>
          
          {isMobile && (
            <NavItem>
              <BookButton to="/rooms" $mobile={true} onClick={handleLinkClick} data-mobile-button="true">
                Забронировать
              </BookButton>
            </NavItem>
          )}
        </NavMenu>
        
        {!isMobile && (
          <BookButton to="/rooms">
            Забронировать
          </BookButton>
        )}
      </Navigation>
      
      {isMobile && (
          <MobileMenuButton 
            $isOpen={isMenuOpen} 
            onClick={toggleMenu} 
            aria-label={isMenuOpen ? "Закрыть меню" : "Открыть меню"}
            aria-expanded={isMenuOpen}
            ref={buttonRef}
          >
            <span></span>
            <span></span>
            <span></span>
          </MobileMenuButton>
      )}

      {isMobile && <MobileMenuOverlay $isOpen={isMenuOpen} onClick={toggleMenu} />}
    </HeaderContainer>
  );
}

export default Header; 
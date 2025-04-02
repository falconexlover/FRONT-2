import React, { useState } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import AdminLoginForm from './AdminLoginForm';
import HomePageEditor from './HomePageEditor';
import AdminPanel from './AdminPanel';
import RoomsAdminPanel from './RoomsAdminPanel';
import { authService } from '../utils/api';

const FooterWrapper = styled.footer`
  background-color: var(--dark-color);
  color: white;
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

const FooterContainer = styled.div`
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
`;

const SectionTitle = styled.h3`
  color: white;
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
`;

const FooterSection = styled.div`
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
        color: #bbb;
        font-size: 0.95rem;
        margin-left: 30px;
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
          color: #bbb;
          text-decoration: none;
          transition: all 0.3s;
          display: flex;
          align-items: center;
          
          &:hover {
            color: white;
            transform: translateX(5px);
          }
          
          &::before {
            content: "›";
            margin-right: 10px;
            color: var(--accent-color);
            font-size: 1.2rem;
            font-weight: bold;
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
        color: #bbb;
        font-size: 0.95rem;
        line-height: 1.5;
        
        a {
          color: #bbb;
          text-decoration: none;
          transition: color 0.3s;
          
          &:hover {
            color: white;
            text-decoration: underline;
          }
        }
      }
    }
  }
`;

const Copyright = styled.div`
  text-align: center;
  padding: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
  color: #999;
  font-size: 0.9rem;
  background-color: rgba(0, 0, 0, 0.2);
  
  p {
    margin-bottom: 0.5rem;
  }
`;

const AdminLink = styled.button`
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  font-size: 0.85rem;
  transition: all 0.3s;
  text-decoration: underline;
  padding: 0;
  
  &:hover {
    color: white;
  }
`;

const ModalBackdrop = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
  padding: 20px;
  overflow-y: auto;
`;

const AdminMenuContainer = styled.div`
  background-color: white;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  padding: 2rem;
  max-width: 600px;
  width: 100%;
`;

const AdminMenuTitle = styled.h2`
  color: var(--dark-color);
  margin-bottom: 1.5rem;
  text-align: center;
  font-family: 'Playfair Display', serif;
`;

const AdminMenuButtons = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  
  @media (max-width: 576px) {
    grid-template-columns: 1fr;
  }
`;

const AdminMenuButton = styled.button`
  padding: 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  
  i {
    font-size: 1.5rem;
  }
  
  &:hover {
    background-color: var(--dark-color);
    transform: translateY(-3px);
  }
`;

const AdminMenuCloseButton = styled.button`
  margin-top: 1.5rem;
  padding: 0.8rem;
  background-color: #f0f0f0;
  color: var(--dark-color);
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  width: 100%;
  
  &:hover {
    background-color: #e0e0e0;
  }
`;

const Footer: React.FC = () => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showHomePageEditor, setShowHomePageEditor] = useState(false);
  const [showGalleryAdmin, setShowGalleryAdmin] = useState(false);
  const [showRoomsAdmin, setShowRoomsAdmin] = useState(false);
  const [showAdminMenu, setShowAdminMenu] = useState(false);
  const [isAdmin, setIsAdmin] = useState(authService.isAuthenticated());

  const handleAdminClick = () => {
    if (isAdmin) {
      setShowAdminMenu(true);
    } else {
      setShowLoginModal(true);
    }
  };

  const handleLogout = () => {
    authService.logout();
    setIsAdmin(false);
    setShowAdminMenu(false);
    setShowGalleryAdmin(false);
    setShowRoomsAdmin(false);
    setShowHomePageEditor(false);
    alert('Вы вышли из режима администратора');
  };

  const handleLoginSuccess = () => {
    setShowLoginModal(false);
    setIsAdmin(true);
    setShowAdminMenu(true);
  };
  
  const handleEditHomePage = () => {
    setShowAdminMenu(false);
    setShowHomePageEditor(true);
  };
  
  const handleEditGallery = () => {
    setShowAdminMenu(false);
    setShowGalleryAdmin(true);
  };
  
  const handleEditRooms = () => {
    setShowAdminMenu(false);
    setShowRoomsAdmin(true);
  };
  
  const handleCloseModal = () => {
    setShowAdminMenu(false);
    setShowHomePageEditor(false);
    setShowGalleryAdmin(false);
    setShowRoomsAdmin(false);
  };
  
  // Заглушка для обработки событий галереи
  const handleImageUpload = (images: any[]) => {};
  const handleImageDelete = (imageId: string) => {};
  const handleImageUpdate = (imageId: string, updates: any) => {};

  return (
    <FooterWrapper>
      <FooterContainer>
        <FooterSection className="faq-section">
          <SectionTitle>Часто задаваемые вопросы</SectionTitle>
          <div className="faq-item">
            <div className="question">Как забронировать номер?</div>
            <div className="answer">Через сайт, по телефону или email.</div>
          </div>
          <div className="faq-item">
            <div className="question">Время заезда/выезда?</div>
            <div className="answer">Заезд с 14:00, выезд до 12:00.</div>
          </div>
          <div className="faq-item">
            <div className="question">Есть ли парковка?</div>
            <div className="answer">Да, бесплатная охраняемая парковка.</div>
          </div>
          <div className="faq-item">
            <div className="question">Принимаете карты?</div>
            <div className="answer">Да, наличные и банковские карты.</div>
          </div>
        </FooterSection>
        
        <FooterSection className="links-section">
          <SectionTitle>Быстрые ссылки</SectionTitle>
          <ul>
            <li><Link to="/#about">О нас</Link></li>
            <li><Link to="/#rooms">Номера</Link></li>
            <li><Link to="/#services">Услуги</Link></li>
            <li><Link to="/gallery">Фотогалерея</Link></li>
            <li><Link to="/contact">Контакты</Link></li>
            <li><Link to="/booking">Бронирование</Link></li>
          </ul>
        </FooterSection>
        
        <FooterSection className="contact-section">
          <SectionTitle>Контактная информация</SectionTitle>
          <div className="contact-item">
            <div className="icon"><i className="fas fa-map-marker-alt"></i></div>
            <div className="content">Московская область, г. Жуковский, ул. Нижегородская, д. 4</div>
          </div>
          <div className="contact-item">
            <div className="icon"><i className="fas fa-phone-alt"></i></div>
            <div className="content">
              Гостиница: <a href="tel:+74984831941">8 (498) 483 19 41</a>,<br />
              <a href="tel:+79151201744">8 (915) 120 17 44</a>
            </div>
          </div>
          <div className="contact-item">
            <div className="icon"><i className="fas fa-hot-tub"></i></div>
            <div className="content">Сауна: <a href="tel:+79151201744">8 (915) 120 17 44</a></div>
          </div>
          <div className="contact-item">
            <div className="icon"><i className="fas fa-briefcase"></i></div>
            <div className="content">Конференц-зал: <a href="tel:+79169266514">8 (916) 926 65 14</a></div>
          </div>
          <div className="contact-item">
            <div className="icon"><i className="fab fa-vk"></i></div>
            <div className="content">
              <a href="https://vk.com/lesnoy_dvorik" target="_blank" rel="noopener noreferrer">
                ВКонтакте: lesnoy_dvorik
              </a>
            </div>
          </div>
        </FooterSection>
      </FooterContainer>
      
      <Copyright>
        <p>&copy; {new Date().getFullYear()} Санаторий-профилакторий «Лесной дворик». Все права защищены.</p>
        <AdminLink onClick={handleAdminClick}>
          {isAdmin ? 'Панель администратора' : 'Режим администратора'}
        </AdminLink>
      </Copyright>
      
      {showLoginModal && (
        <ModalBackdrop onClick={() => setShowLoginModal(false)}>
          <div onClick={e => e.stopPropagation()}>
            <AdminLoginForm 
              onLoginSuccess={handleLoginSuccess} 
              onCancel={() => setShowLoginModal(false)} 
            />
          </div>
        </ModalBackdrop>
      )}
      
      {showAdminMenu && (
        <ModalBackdrop onClick={handleCloseModal}>
          <AdminMenuContainer onClick={e => e.stopPropagation()}>
            <AdminMenuTitle>Панель администратора</AdminMenuTitle>
            <AdminMenuButtons>
              <AdminMenuButton onClick={handleEditHomePage}>
                <i className="fas fa-home"></i>
                Редактировать главную страницу
              </AdminMenuButton>
              <AdminMenuButton onClick={handleEditGallery}>
                <i className="fas fa-images"></i>
                Управление галереей
              </AdminMenuButton>
              <AdminMenuButton onClick={handleEditRooms}>
                <i className="fas fa-bed"></i>
                Управление номерами
              </AdminMenuButton>
              <AdminMenuButton onClick={handleLogout}>
                <i className="fas fa-sign-out-alt"></i>
                Выйти из режима администратора
              </AdminMenuButton>
            </AdminMenuButtons>
            <AdminMenuCloseButton onClick={handleCloseModal}>
              Закрыть
            </AdminMenuCloseButton>
          </AdminMenuContainer>
        </ModalBackdrop>
      )}
      
      {showHomePageEditor && (
        <ModalBackdrop onClick={handleCloseModal}>
          <div onClick={e => e.stopPropagation()}>
            <HomePageEditor onClose={handleCloseModal} />
          </div>
        </ModalBackdrop>
      )}
      
      {showGalleryAdmin && (
        <ModalBackdrop onClick={handleCloseModal}>
          <div onClick={e => e.stopPropagation()}>
            <AdminPanel
              onLogout={handleLogout}
              onImageUpload={handleImageUpload}
              onImageDelete={handleImageDelete}
              onImageUpdate={handleImageUpdate}
              staticImagesCount={0}
            />
          </div>
        </ModalBackdrop>
      )}
      
      {showRoomsAdmin && (
        <ModalBackdrop onClick={handleCloseModal}>
          <div onClick={e => e.stopPropagation()}>
            <RoomsAdminPanel onLogout={handleLogout} />
          </div>
        </ModalBackdrop>
      )}
    </FooterWrapper>
  );
};

export default Footer; 
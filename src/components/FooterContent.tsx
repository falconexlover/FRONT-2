import React from 'react';
import { Link } from 'react-router-dom';
import {
  FooterContainer,
  SectionTitle,
  FooterSection,
  FooterBottom
} from './styles/FooterStyles';
import MapPin from '../assets/map-pin.png';

const FooterContent: React.FC = () => {
  return (
    <>
      <FooterContainer>
        {/* Секция FAQ */}
        <FooterSection className="faq-section">
          <SectionTitle>Часто задаваемые вопросы</SectionTitle>
          <div className="faq-item">
            <p className="question">Какие удобства есть в номерах?</p>
            <p className="answer">Во всех номерах есть Wi-Fi, ТВ, холодильник, санузел с душем.</p>
          </div>
          <div className="faq-item">
            <p className="question">Есть ли парковка?</p>
            <p className="answer">Да, у нас есть бесплатная охраняемая парковка для гостей.</p>
          </div>
          <div className="faq-item">
            <p className="question">Можно ли с животными?</p>
            <p className="answer">К сожалению, у нас нет условий для проживания с животными.</p>
          </div>
        </FooterSection>

        {/* Секция ссылок */}
        <FooterSection className="links-section">
          <SectionTitle>Полезные ссылки</SectionTitle>
          <ul>
            <li><Link to="/">Главная</Link></li>
            <li><Link to="/rooms">Номера</Link></li>
            <li><Link to="/gallery">Галерея</Link></li>
            <li><Link to="/services">Услуги</Link></li>
            <li><Link to="/contacts">Контакты</Link></li>
          </ul>
        </FooterSection>

        {/* Секция контактов */}
        <FooterSection className="contact-section">
          <SectionTitle>Свяжитесь с нами</SectionTitle>
          <div className="contact-item">
            <div className="icon"><i className="fas fa-map-marker-alt"></i></div>
            <div className="content">санаторий-профилакторий «Лесной дворик», г. Жуковский, ул. Нижегородская, д.4.</div>
          </div>
          <div className="contact-item">
            <div className="icon"><i className="fas fa-phone"></i></div>
            <div className="content"><a href="tel:+79998887766">+7 (999) 888-77-66</a></div>
          </div>
          <div className="contact-item">
            <div className="icon"><i className="fab fa-vk"></i></div>
            <div className="content"><a href="https://vk.com/lesnoy_dvorik" target="_blank" rel="noopener noreferrer">Наша страница ВК</a></div>
          </div>
        </FooterSection>
      </FooterContainer>

      {/* YandexMap component removed */}
      {/* <YandexMap /> */}

      <FooterBottom>
        <p>&copy; {new Date().getFullYear()} Отель "Лесной дворик". Все права защищены.</p>
      </FooterBottom>
    </>
  );
};

export default FooterContent; 
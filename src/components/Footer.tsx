import React from 'react';
// Удаляем неиспользуемые импорты
// import { Link } from 'react-router-dom'; 
// import AdminPanel from './AdminPanel';
// import AdminLoginForm from './AdminLoginForm';
// import * as apiUtils from '../utils/api';
// import { toast } from 'react-toastify';

import {
  FooterWrapper,
  // Удаляем неиспользуемые стили
  // FooterContainer,
  // SectionTitle,
  // FooterSection,
  // Copyright,
  // AdminContainer,
  // AdminToggle,
  // AdminContent
} from './styles/FooterStyles';
import FooterContent from './FooterContent';
import FooterAdminSection from './FooterAdminSection';

const Footer: React.FC = () => {
  return (
    <FooterWrapper>
      <FooterContent />
      <FooterAdminSection />
    </FooterWrapper>
  );
};

export default Footer; 
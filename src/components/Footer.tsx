import React from 'react';

import {
  FooterWrapper,
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
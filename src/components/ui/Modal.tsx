import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  key?: string;
}

const ModalOverlay = styled(motion.div)<{ isOpen?: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
`;

const overlayVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
};

const ModalContent = styled(motion.div)`
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  max-width: 1300px;
  width: 90%;
  position: relative;
  max-height: 90vh;
  overflow-y: auto;
  border: 1px solid var(--border-color);
`;

const contentVariants = {
    hidden: { scale: 0.9, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { delay: 0.1 } },
    exit: { scale: 0.9, opacity: 0 },
};

const CloseButton = styled.button`
  position: absolute;
  top: 1rem;
  right: 1rem;
  background: none;
  border: none;
  font-size: 1.5rem;
  color: var(--text-secondary);
  cursor: pointer;
  transition: color 0.2s;
  line-height: 1;

  &:hover {
    color: var(--text-primary);
  }
`;

const ModalTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 1.5rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  font-weight: 600;
  text-align: center;
  padding-right: 2rem;
`;

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, key }) => {
  if (!isOpen) return null;

  return (
    <ModalOverlay 
      variants={overlayVariants}
      initial="hidden"
      animate="visible"
      exit="hidden"
      transition={{ duration: 0.2 }}
      onClick={onClose}
    > 
      <ModalContent 
        variants={contentVariants}
        initial="hidden"
        animate="visible"
        exit="exit"
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        onClick={(e) => e.stopPropagation()}
      > 
        <CloseButton onClick={onClose}>&times;</CloseButton>
        {title && <ModalTitle>{title}</ModalTitle>}
        {children}
      </ModalContent>
    </ModalOverlay>
  );
};

export default Modal; 
import React, { ReactNode } from 'react';
import styled from 'styled-components';
// Удаляем неиспользуемый импорт motion
// import { motion } from 'framer-motion'; 
import Modal from './Modal'; // Используем базовый Modal
import ActionButton from './ActionButton';

// --- Component Props ---

interface ConfirmModalProps {
  isOpen: boolean;
  title: string;
  message: ReactNode; // Может содержать разметку
  onConfirm: () => void;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  isConfirming?: boolean;
  confirmButtonClass?: 'primary' | 'danger' | 'secondary';
}

// Стили для внутреннего контента модалки подтверждения (темная тема)
const ConfirmContent = styled.div`
  padding: 1rem 0 0; /* Добавим отступ сверху */
  color: var(--text-primary);
`;

const Message = styled.div`
  margin-bottom: 2rem;
  font-size: 1rem;
  line-height: 1.6;
  color: var(--text-secondary); /* Сообщение вторичным цветом */
  
  /* Стили для вложенных элементов, если message - ReactNode */
  strong, b {
    color: var(--text-primary);
    font-weight: 600;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 1.5rem; /* Добавим отступ сверху */
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color); /* Разделитель */
`;

// --- Component ---

const ConfirmModal: React.FC<ConfirmModalProps> = ({
  isOpen,
  title,
  message,
  onConfirm,
  onCancel,
  confirmText = 'ОК',
  cancelText = 'Отмена',
  isConfirming = false,
  confirmButtonClass = 'primary',
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onCancel} title={title}>
      <ConfirmContent>
        <Message>{message}</Message>
        <ButtonGroup>
          <ActionButton 
            className="secondary" 
            onClick={onCancel}
            disabled={isConfirming}
          >
            {cancelText}
          </ActionButton>
          <ActionButton 
            className={confirmButtonClass} 
            onClick={onConfirm}
            disabled={isConfirming}
          >
            {isConfirming ? 'Выполнение...' : confirmText}
          </ActionButton>
        </ButtonGroup>
      </ConfirmContent>
    </Modal>
  );
};

export default ConfirmModal; 
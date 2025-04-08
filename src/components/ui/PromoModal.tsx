import React from 'react';
import styled from 'styled-components';
import Modal from './Modal'; // Используем базовый компонент модального окна
import { PromotionType } from '../../types/Promotion';

interface PromoModalProps {
  isOpen: boolean;
  onClose: () => void;
  promotions: PromotionType[];
}

// Обертка для контента с ограничением ширины
const ContentWrapper = styled.div`
  max-width: 550px; // Ограничиваем максимальную ширину контента внутри модалки
  margin: 0 auto; // Центрируем, если окно шире
`;

// Стили для самого скроллящегося контента
const ModalContent = styled.div`
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 0.5rem 1rem 0.5rem; // Уменьшаем боковой padding для компактности
  margin: 0 -0.5rem -1rem -0.5rem; // Компенсируем

  /* Стилизация скроллбара (остается) */
  &::-webkit-scrollbar { width: 8px; }
  &::-webkit-scrollbar-track { background: var(--bg-primary); border-radius: 4px; }
  &::-webkit-scrollbar-thumb { background-color: var(--border-color); border-radius: 4px; border: 2px solid var(--bg-primary); }
  scrollbar-width: thin;
  scrollbar-color: var(--border-color) var(--bg-primary);
`;

const PromotionItem = styled.div`
  padding: 1.5rem; // Увеличим внутренние отступы
  background-color: var(--bg-primary);
  border-radius: var(--radius-md); // Чуть больше скругление
  margin-bottom: 1rem;
  box-shadow: var(--shadow-sm); // Добавляем легкую тень

  &:last-child {
    margin-bottom: 0;
  }
`;

// Добавляем стилизованный разделитель (если хотим его вместо margin)
/*
const Divider = styled.hr`
  border: none;
  height: 1px;
  background-color: var(--border-color);
  margin: 1.5rem 0;
`;
*/

const PromotionTitle = styled.h4`
  margin: 0 0 0.6rem 0;
  color: var(--primary-color);
  font-size: 1.2rem; // Вернем чуть больший размер
  font-weight: 600;
  line-height: 1.4;
`;

const PromotionDescription = styled.p`
  margin: 0 0 1rem 0;
  color: var(--text-secondary); // Сделаем описание чуть светлее заголовка
  font-size: 1rem; // Увеличим шрифт описания
  line-height: 1.6;
`;

const PromotionDetails = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  display: flex;
  flex-wrap: wrap;
  // Увеличим горизонтальный gap
  gap: 0.6rem 1.5rem;
  align-items: center;
  padding-top: 1rem; // Увеличим отступ сверху
  // Сделаем линию сплошной и светлой
  border-top: 1px solid var(--border-color-light);
`;

const Detail = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 0.6rem; // Увеличим gap между иконкой и текстом

  i {
      width: 15px; // Чуть больше иконка
      text-align: center;
      color: var(--primary-color); // Сделаем иконки основного цвета
      flex-shrink: 0;
      opacity: 0.9; // Менее прозрачные
  }

  strong {
      font-weight: 500;
      color: var(--text-primary); // Сделаем ярлыки чуть темнее
  }
`;

const NoPromotions = styled.p`
  text-align: center;
  color: var(--text-secondary);
  padding: 2rem 0; // Уменьшаем padding
  font-style: italic;
  font-size: 0.95rem;
`;

// Вспомогательная функция форматирования (можно вынести)
const formatDate = (dateString?: string) => {
    if (!dateString) return '';
    try {
        return new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(dateString));
    } catch { return 'Неверная дата'; }
}

const formatDiscount = (type: 'percentage' | 'fixed_amount', value: number) => {
    if (type === 'percentage') return `${value}%`;
    if (type === 'fixed_amount') return `${value} ₽`;
    return '-';
}

const PromoModal: React.FC<PromoModalProps> = ({ isOpen, onClose, promotions }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Действующие акции">
      <ContentWrapper>
        <ModalContent>
          {promotions.length === 0 ? (
            <NoPromotions>Сейчас нет активных акций.</NoPromotions>
          ) : (
            promotions.map((promo, index) => ( // Добавляем index для разделителя
              // Используем React.Fragment, если нужен разделитель
              <React.Fragment key={promo._id}>
                <PromotionItem>
                  <PromotionTitle>{promo.title}</PromotionTitle>
                  {promo.description && <PromotionDescription>{promo.description}</PromotionDescription>}
                  <PromotionDetails>
                    <Detail>
                      <i className="fas fa-tag"></i>
                      <span><strong>Скидка:</strong> {formatDiscount(promo.discountType, promo.discountValue)}</span>
                    </Detail>
                    {(promo.startDate || promo.endDate) && (
                      <Detail>
                        <i className="far fa-calendar-alt"></i>
                        <span>
                          <strong>Срок:</strong>
                          {promo.startDate ? ` с ${formatDate(promo.startDate)}` : ''}
                          {promo.endDate ? ` по ${formatDate(promo.endDate)}` : ' (бессрочно)'}
                        </span>
                      </Detail>
                    )}
                    {promo.code && (
                      <Detail>
                        <i className="fas fa-barcode"></i>
                        <span><strong>Код:</strong> {promo.code}</span>
                      </Detail>
                    )}
                  </PromotionDetails>
                </PromotionItem>
                {/* Можно добавить разделитель <Divider /> здесь, если убрать margin-bottom у PromotionItem */}
                {/* {index < promotions.length - 1 && <Divider />} */}
              </React.Fragment>
            ))
          )}
        </ModalContent>
      </ContentWrapper>
    </Modal>
  );
};

export default PromoModal; 
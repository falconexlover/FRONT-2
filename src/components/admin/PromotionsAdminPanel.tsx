import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { promotionsService } from '../../utils/api';
import { PromotionType } from '../../types/Promotion';
import { toast } from 'react-toastify';
import ActionButton from '../ui/ActionButton';
import ConfirmModal from '../ui/ConfirmModal';
import PromotionForm from './PromotionForm';
import { LoadingSpinner } from '../AdminPanel';

// Стили (можно вынести или оставить здесь для начала)
const PanelContainer = styled.div``; // Пока пустой, общие стили в AdminLayout

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
`;

const Title = styled.h2`
  color: var(--text-primary);
  font-family: 'Playfair Display', serif;
  margin: 0;
  font-size: 1.6rem;
`;

const TableContainer = styled.div`
  margin-top: 2rem;
  overflow-x: auto;
  width: 100%;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
`;

const TableHeader = styled.th`
  padding: 1rem 1.2rem;
  text-align: left;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-secondary);
  white-space: nowrap;
  font-size: 0.9rem;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const TableRow = styled.tr`
  &:hover {
    background-color: var(--bg-tertiary);
  }
`;

const TableCell = styled.td`
  padding: 1rem 1.2rem;
  border-bottom: 1px solid var(--border-color);
  color: var(--text-primary);
  vertical-align: middle;

  &:last-child {
      border-bottom: none; /* У последней строки убираем нижний бордер ячейки */
  }
  
  &.actions {
    text-align: right;
  }
`;

const ActionButtonsContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 0.8rem;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  padding: 0.5rem;
  font-size: 1rem;
  transition: color 0.2s ease;

  &:hover {
    color: var(--primary-color);
  }

  &.delete:hover {
    color: var(--danger-color);
  }
  
  &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
  }
`;

const StatusBadge = styled.span<{ isActive: boolean }>`
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-sm);
    font-size: 0.8rem;
    font-weight: 600;
    color: white;
    background-color: ${props => props.isActive ? 'var(--success-color)' : 'var(--text-secondary)'};
`;

const NoItemsMessage = styled.div`
  text-align: center;
  padding: 3rem 1rem;
  color: var(--text-secondary);
`;

// --- Компонент --- 
const PromotionsAdminPanel: React.FC = () => {
  const [promotions, setPromotions] = useState<PromotionType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [showForm, setShowForm] = useState(false);
  const [editingPromotion, setEditingPromotion] = useState<PromotionType | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingPromotionId, setDeletingPromotionId] = useState<string | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

  // Загрузка акций
  const fetchPromotions = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data: PromotionType[] = await promotionsService.getAllPromotions(); 
      setPromotions(data);
    } catch (err) {
      console.error("Ошибка загрузки акций:", err);
      const message = err instanceof Error ? err.message : 'Не удалось загрузить акции';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPromotions();
  }, [fetchPromotions]);

  // Обработчики для формы
  const handleAddClick = () => {
    setEditingPromotion(null);
    setShowForm(true);
  };

  const handleEditClick = (promotion: PromotionType) => {
    setEditingPromotion(promotion);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingPromotion(null);
  };

  const handleSave = async (formData: Omit<PromotionType, '_id' | 'createdAt' | 'updatedAt'> | Partial<PromotionType>) => {
    setIsSaving(true);
    try {
      let savedPromotion: PromotionType;
      if (editingPromotion && editingPromotion._id) {
        savedPromotion = await promotionsService.updatePromotion(editingPromotion._id, formData as Partial<PromotionType>); 
        toast.success(`Акция "${savedPromotion.title}" успешно обновлена!`);
      } else {
        savedPromotion = await promotionsService.createPromotion(formData as Omit<PromotionType, '_id' | 'createdAt' | 'updatedAt'>);
        toast.success(`Акция "${savedPromotion.title}" успешно создана!`);
      }
      fetchPromotions();
      handleFormCancel();
    } catch (err) {
      console.error("Ошибка сохранения акции:", err);
      const message = err instanceof Error ? err.message : 'Не удалось сохранить акцию';
      toast.error(`Ошибка сохранения: ${message}`);
    } finally {
      setIsSaving(false);
    }
  };

  // Обработчики удаления
  const handleDeleteClick = (id: string) => {
    setDeletingPromotionId(id);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingPromotionId(null);
  };

  const confirmDelete = async () => {
    if (!deletingPromotionId) return;
    setIsProcessingDelete(true);
    try {
      await promotionsService.deletePromotion(deletingPromotionId);
      toast.success('Акция успешно удалена');
      setShowDeleteConfirm(false);
      setDeletingPromotionId(null);
      fetchPromotions();
    } catch (err: any) {
      console.error("Ошибка удаления акции:", err);
      toast.error(`Ошибка удаления: ${err.message || 'Неизвестная ошибка'}`);
    } finally {
      setIsProcessingDelete(false);
    }
  };
  
  // Форматирование даты
  const formatDate = (dateString?: string) => {
      if (!dateString) return '-';
      try {
          return new Intl.DateTimeFormat('ru-RU').format(new Date(dateString));
      } catch {
          return 'Неверная дата';
      }
  }
  
  // Форматирование скидки
  const formatDiscount = (type: 'percentage' | 'fixed_amount', value: number) => {
      if (type === 'percentage') return `${value}%`;
      if (type === 'fixed_amount') return `${value} ₽`; // Или другая валюта
      return '-';
  }

  return (
    <PanelContainer>
      <Header>
        <Title>Управление акциями</Title>
        {!showForm && (
          <ActionButton onClick={handleAddClick} className="primary">
            <i className="fas fa-plus" style={{ marginRight: '8px' }}></i>
            Добавить акцию
          </ActionButton>
        )}
      </Header>

      <AnimatePresence>
        {showForm && (
          <motion.div
            key="promotion-form"
            initial={{ opacity: 0, height: 0, marginBottom: 0 }}
            animate={{ opacity: 1, height: 'auto', marginBottom: '2rem' }}
            exit={{ opacity: 0, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.3 }}
            style={{ overflow: 'hidden' }}
          >
            <PromotionForm 
              initialData={editingPromotion}
              onSave={handleSave}
              onCancel={handleFormCancel}
              isSaving={isSaving}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {isLoading && <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка...</LoadingSpinner>}
      {error && <p style={{ color: 'var(--danger-color)', textAlign: 'center' }}>{error}</p>}
      
      {!showForm && (
        promotions.length === 0 ? (
          <NoItemsMessage>
             <h3>Акций пока нет</h3>
             <p>Нажмите "Добавить акцию", чтобы создать первую.</p>
          </NoItemsMessage>
        ) : (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <TableHeader>Название</TableHeader>
                  <TableHeader>Код</TableHeader>
                  <TableHeader>Скидка</TableHeader>
                  <TableHeader>Начало</TableHeader>
                  <TableHeader>Конец</TableHeader>
                  <TableHeader>Статус</TableHeader>
                  <TableHeader>Действия</TableHeader>
                </tr>
              </thead>
              <tbody>
                {promotions.map((promo) => (
                  <TableRow key={promo._id}>
                    <TableCell>{promo.title}</TableCell>
                    <TableCell>{promo.code || '-'}</TableCell>
                    <TableCell>{formatDiscount(promo.discountType, promo.discountValue)}</TableCell>
                    <TableCell>{formatDate(promo.startDate)}</TableCell>
                    <TableCell>{formatDate(promo.endDate)}</TableCell>
                    <TableCell>
                        <StatusBadge isActive={promo.isActive}>
                            {promo.isActive ? 'Активна' : 'Неактивна'}
                        </StatusBadge>
                    </TableCell>
                    <TableCell className="actions">
                      <ActionButtonsContainer>
                        <IconButton 
                            onClick={() => handleEditClick(promo)} 
                            title="Редактировать"
                            disabled={showForm}
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </IconButton>
                        <IconButton 
                            className="delete" 
                            onClick={() => handleDeleteClick(promo._id)} 
                            title="Удалить"
                            disabled={showForm}
                        >
                          <i className="fas fa-trash-alt"></i>
                        </IconButton>
                      </ActionButtonsContainer>
                    </TableCell>
                  </TableRow>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
        )
      )}
      
      {showDeleteConfirm && (
        <ConfirmModal
          isOpen={showDeleteConfirm}
          title="Подтвердите удаление"
          message={`Вы уверены, что хотите удалить акцию "${promotions.find(p => p._id === deletingPromotionId)?.title}"? Это действие необратимо.`}
          onConfirm={confirmDelete}
          onCancel={cancelDelete}
          confirmText="Удалить"
          cancelText="Отмена"
          isConfirming={isProcessingDelete}
          confirmButtonClass="danger"
        />
      )}
    </PanelContainer>
  );
};

export default PromotionsAdminPanel; 
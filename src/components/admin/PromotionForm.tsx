import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { PromotionType } from '../../types/Promotion';
import ActionButton from '../ui/ActionButton';

interface PromotionFormProps {
  initialData?: PromotionType | null;
  onSave: (formData: Omit<PromotionType, '_id' | 'createdAt' | 'updatedAt'> | Partial<PromotionType>) => Promise<void>; // Возвращает Promise для отслеживания сохранения
  onCancel: () => void;
  isSaving?: boolean;
}

// Стили для формы (можно адаптировать из других форм)
const FormContainer = styled.form`
  background-color: var(--bg-secondary);
  padding: 2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem; // Отступ от таблицы/кнопок
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--primary-color);
  font-family: 'Playfair Display', serif;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }

  &[type="date"] {
      // Стили для поля даты, если нужно
      appearance: none; // Убирает стандартные стрелки в некоторых браузерах
      color-scheme: dark; // Улучшает вид календаря в темной теме
  }

  &[type="number"] {
      appearance: textfield; // Убирает стрелки у числового поля
      &::-webkit-outer-spin-button,
      &::-webkit-inner-spin-button {
        -webkit-appearance: none;
        margin: 0;
      }
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  min-height: 100px; // Меньше высота для описания акции
  resize: vertical;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;

const Select = styled.select`
   width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  appearance: none; // Убираем стандартную стрелку
  background-image: url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%23cccccc%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E');
  background-repeat: no-repeat;
  background-position: right 1rem center;
  background-size: 0.8em;
  padding-right: 2.5rem; // Место для стрелки

  &:focus {
    outline: none;
    border-color: var(--primary-color);
    box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;


const CheckboxGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 0.8rem;
  margin-top: 0.5rem;
`;

const CheckboxLabel = styled.label`
  color: var(--text-primary);
  font-size: 0.95rem;
  cursor: pointer;
`;

const Checkbox = styled.input`
  cursor: pointer;
  width: 18px;
  height: 18px;
  accent-color: var(--primary-color); // Цвет галочки
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
`;

// Убираем applicableTo и minPurchaseAmount из типа состояния
type PromotionFormData = Omit<PromotionType, '_id' | 'createdAt' | 'updatedAt' | 'applicableTo' | 'minPurchaseAmount'>;

const PromotionForm: React.FC<PromotionFormProps> = ({ initialData, onSave, onCancel, isSaving }) => {
    const [formData, setFormData] = useState<PromotionFormData>({
        title: '',
        description: '',
        discountType: 'percentage',
        discountValue: 0,
        startDate: '',
        endDate: '',
        isActive: true,
        code: '',
    });

    useEffect(() => {
        if (initialData) {
            const formatInputDate = (date?: string) => date ? new Date(date).toISOString().split('T')[0] : '';
            setFormData({
                title: initialData.title || '',
                description: initialData.description || '',
                discountType: initialData.discountType || 'percentage',
                discountValue: initialData.discountValue || 0,
                startDate: formatInputDate(initialData.startDate),
                endDate: formatInputDate(initialData.endDate),
                isActive: initialData.isActive === undefined ? true : initialData.isActive,
                code: initialData.code || '',
            });
        } else {
             setFormData({
                title: '', description: '', discountType: 'percentage', discountValue: 0,
                startDate: '', endDate: '', isActive: true, code: ''
             });
        }
    }, [initialData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const { checked } = e.target as HTMLInputElement;
             setFormData(prev => ({ ...prev, [name]: checked }));
        } else if (type === 'number') {
            setFormData(prev => ({ ...prev, [name]: value === '' ? '' : Number(value) })); // Преобразуем в число
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <FormContainer onSubmit={handleSubmit}>
            <FormTitle>{initialData ? 'Редактировать акцию' : 'Добавить новую акцию'}</FormTitle>

            <FormGroup>
                <Label htmlFor="title">Название акции</Label>
                <Input type="text" id="title" name="title" value={formData.title} onChange={handleChange} required />
            </FormGroup>

            <FormGroup>
                <Label htmlFor="description">Описание</Label>
                <TextArea id="description" name="description" value={formData.description} onChange={handleChange} />
            </FormGroup>

            <FormGroup style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                     <Label htmlFor="discountType">Тип скидки</Label>
                     <Select id="discountType" name="discountType" value={formData.discountType} onChange={handleChange}>
                         <option value="percentage">Процент (%)</option>
                         <option value="fixed_amount">Фиксированная сумма (₽)</option>
                     </Select>
                 </div>
                 <div style={{ flex: 1 }}>
                     <Label htmlFor="discountValue">Значение скидки</Label>
                     <Input type="number" id="discountValue" name="discountValue" value={formData.discountValue} onChange={handleChange} min="0" step="any" required />
                 </div>
            </FormGroup>

            <FormGroup style={{ display: 'flex', gap: '1rem' }}>
                 <div style={{ flex: 1 }}>
                    <Label htmlFor="startDate">Дата начала</Label>
                    <Input type="date" id="startDate" name="startDate" value={formData.startDate} onChange={handleChange} />
                 </div>
                 <div style={{ flex: 1 }}>
                    <Label htmlFor="endDate">Дата окончания</Label>
                    <Input type="date" id="endDate" name="endDate" value={formData.endDate} onChange={handleChange} />
                 </div>
            </FormGroup>
             <FormGroup>
                <Label htmlFor="code">Промокод (необязательно)</Label>
                <Input type="text" id="code" name="code" value={formData.code} onChange={handleChange} />
            </FormGroup>

            <FormGroup>
                 <CheckboxGroup>
                     <Checkbox type="checkbox" id="isActive" name="isActive" checked={formData.isActive} onChange={handleChange} />
                     <CheckboxLabel htmlFor="isActive">Акция активна</CheckboxLabel>
                 </CheckboxGroup>
            </FormGroup>

            <FormActions>
                <ActionButton type="button" className="outline" onClick={onCancel} disabled={isSaving}>
                    Отмена
                </ActionButton>
                <ActionButton type="submit" className="primary" disabled={isSaving}>
                    {isSaving ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Добавить акцию')}
                </ActionButton>
            </FormActions>
        </FormContainer>
    );
};

export default PromotionForm; 
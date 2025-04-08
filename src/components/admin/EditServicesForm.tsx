import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ActionButton from '../ui/ActionButton';
import { ServiceType } from '../../types/Service';

// Тип для состояния редактируемых полей
interface EditingServiceState {
  description: string;
  price: string; 
}

// НОВЫЙ тип для состояния данных формы добавления/редактирования
interface ServiceFormData {
  _id?: string; // ID для идентификации при редактировании
  name?: string;
  description?: string;
  icon?: string;
  price?: string; // Цена в форме всегда строка
}

// --- Styled Components (восстанавливаем определения) ---
const FormContainer = styled.div`
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
`;

const Title = styled.h2`
  color: var(--text-primary);
  margin-bottom: 1.5rem;
  font-size: 1.5rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
`;

const ServiceCard = styled.div`
  background-color: var(--bg-primary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  box-shadow: var(--shadow-sm);
`;

const ServiceHeader = styled.h3`
  margin-top: 0;
  margin-bottom: 1rem;
  font-size: 1.2rem;
  color: var(--text-primary);
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-secondary); /* Фон поля */
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
  &:disabled {
      background-color: var(--bg-tertiary);
      opacity: 0.7;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  min-height: 80px;
  resize: vertical;
  background-color: var(--bg-secondary);
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
  &:disabled {
      background-color: var(--bg-tertiary);
      opacity: 0.7;
  }
`;

const SaveButton = styled(ActionButton)`
    margin-top: 1rem;
`;

const DeleteButton = styled(ActionButton)`
    margin-left: 1rem; // Добавим отступ
`;

// Добавляем стили для новой формы и ее элементов
const AddEditFormWrapper = styled.div`
    background-color: var(--bg-primary);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: 1.5rem 2rem;
    margin-bottom: 2rem;
    box-shadow: var(--shadow-sm);
`;

const FormActions = styled.div`
    display: flex;
    justify-content: flex-end;
    gap: 1rem;
    margin-top: 1.5rem;
`;

// Определяем НОВЫЙ интерфейс EditServicesFormProps
interface EditServicesFormProps {
  services: ServiceType[];
  onSave: (id: string | null, data: Partial<Omit<ServiceType, '_id'>> | ServiceType) => Promise<void>; 
  onDelete: (id: string) => Promise<void>; 
  isSaving?: boolean; 
  isDeleting?: boolean; 
}

// Теперь компонент принимает пропсы согласно НОВОМУ интерфейсу
const EditServicesForm: React.FC<EditServicesFormProps> = ({ 
  services, // Принимаем services
  onSave, // Принимаем onSave
  onDelete, // Принимаем onDelete
  isSaving = false, // Принимаем isSaving
  isDeleting = false // Принимаем isDeleting
}) => {
    // Состояние для редактируемых описаний/цен существующих услуг
    const [editingServices, setEditingServices] = useState<{ [key: string]: EditingServiceState }>({});
    // Состояние для ID текущей редактируемой услуги ИЛИ флаг для "новой" услуги
    const [currentEditId, setCurrentEditId] = useState<string | null | 'new'>(null);
    // Используем НОВЫЙ тип ServiceFormData для состояния формы
    const [formData, setFormData] = useState<ServiceFormData>({});

    // Эффект для инициализации editingServices при изменении пропса services
    useEffect(() => {
        const initialEditingState: { [key: string]: EditingServiceState } = {};
        services.forEach(service => {
            if (service._id) {
                initialEditingState[service._id] = {
                    description: service.description || '',
                    price: service.price !== undefined ? String(service.price) : ''
                };
            }
        });
        setEditingServices(initialEditingState);
    }, [services]);

    // Обработчик изменения полей в КАРТОЧКАХ существующих услуг
    const handleCardInputChange = (id: string, field: keyof EditingServiceState, value: string) => {
        setEditingServices(prev => ({
            ...prev,
            [id]: {
                ...(prev[id] ?? { description: '', price: '' }),
                [field]: value
            }
        }));
    };

    // Обработчик изменения полей в ФОРМЕ добавления/редактирования
    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        // Теперь setFormData работает с простым типом ServiceFormData
        setFormData(prev => ({ ...prev, [name]: value }));
    };
    
    // Обработчик цены в ФОРМЕ
    const handleFormPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (/^\d*\.?\d*$/.test(value)) { 
            // setFormData ожидает ServiceFormData, все правильно
            setFormData(prev => ({ ...prev, price: value }));
        }
    };

    // Начать добавление новой услуги
    const handleAddNewClick = () => {
        setCurrentEditId('new');
        setFormData({}); // Очистить форму
    };

    // Начать редактирование существующей услуги
    const handleEditClick = (service: ServiceType) => {
        setCurrentEditId(service._id);
        // Заполняем ServiceFormData
        setFormData({ 
            _id: service._id,
            name: service.name,
            description: service.description,
            icon: service.icon,
            price: service.price !== undefined ? String(service.price) : '' // Преобразуем в строку
        });
    };

    // Отмена редактирования/добавления
    const handleCancelEdit = () => {
        setCurrentEditId(null);
        setFormData({});
    };

    // Сохранение из ФОРМЫ добавления/редактирования
    const handleFormSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        // Теперь доступ к formData.name корректен
        if (!formData.name?.trim()) {
            toast.error('Название услуги обязательно.');
            return;
        }

        // Доступ к formData.price корректен (это строка)
        const priceString = formData.price?.trim();
        const priceValue = priceString === '' || priceString === undefined 
                           ? undefined 
                           : parseFloat(priceString);
                           
        if (priceString !== '' && priceString !== undefined && isNaN(priceValue as number)) {
            toast.error('Цена должна быть числом.');
            return;
        }

        // dataToSend соответствует ожиданиям бэкенда (price: number | undefined)
        const dataToSend: Partial<Omit<ServiceType, '_id'>> = {
            name: formData.name,
            description: formData.description || '',
            icon: formData.icon || 'fas fa-concierge-bell',
            price: priceValue
        };

        // Доступ к formData._id корректен
        await onSave(formData._id ?? null, dataToSend as ServiceType);
        handleCancelEdit(); 
    };
    
    // Сохранение описания/цены из КАРТОЧКИ существующей услуги
    const handleCardSave = async (id: string) => {
        const editedState = editingServices[id];
        if (!editedState) return;
        const priceValue = editedState.price.trim() === '' ? undefined : parseFloat(editedState.price);
        if (editedState.price.trim() !== '' && isNaN(priceValue as number)) {
            toast.error('Цена должна быть числом.');
            return;
        }
        const dataToSend: Partial<Omit<ServiceType, '_id'>> = {
            description: editedState.description,
            price: priceValue
        };
        await onSave(id, dataToSend as ServiceType);
    };

    // Удаление услуги (вызывает onDelete из пропсов)
    const handleDelete = (id: string) => {
        onDelete(id);
    };

    return (
        <FormContainer>
            <Title>Управление Услугами</Title>
            
            {/* Кнопка Добавить новую */}
            {!currentEditId && (
              <ActionButton onClick={handleAddNewClick} className="primary" style={{ marginBottom: '1.5rem' }}>
                 <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Добавить услугу
              </ActionButton>
            )}

            {/* Форма добавления/редактирования */} 
            {currentEditId !== null && (
                <AddEditFormWrapper>
                    <h3>{currentEditId === 'new' ? "Новая услуга" : "Редактировать услугу"}</h3>
                    <form onSubmit={handleFormSubmit}>
                         <FormGroup>
                           <Label htmlFor="serviceName">Название*</Label>
                           <Input 
                              type="text" 
                              id="serviceName" 
                              name="name" 
                              value={formData.name || ''} 
                              onChange={handleFormInputChange} 
                              required 
                              disabled={isSaving} // Блокируем всю форму при сохранении
                           />
                         </FormGroup>
                         <FormGroup>
                           <Label htmlFor="serviceDesc">Описание</Label>
                           <TextArea 
                              id="serviceDesc" 
                              name="description" 
                              value={formData.description || ''} 
                              onChange={handleFormInputChange} 
                              disabled={isSaving}
                           />
                         </FormGroup>
                         <FormGroup>
                           <Label htmlFor="serviceIcon">Иконка (FontAwesome класс)</Label>
                           <Input 
                              type="text" 
                              id="serviceIcon" 
                              name="icon" 
                              value={formData.icon || ''} 
                              onChange={handleFormInputChange} 
                              placeholder="напр., fas fa-wifi"
                              disabled={isSaving}
                           />
                         </FormGroup>
                         <FormGroup>
                           <Label htmlFor="servicePrice">Цена (₽)</Label>
                           <Input 
                              type="text" // Используем text для гибкости ввода
                              id="servicePrice" 
                              name="price" 
                              value={formData.price ?? ''} // Используем ?? для пустого значения
                              onChange={handleFormPriceChange} // Специальный обработчик для цены
                              placeholder="Оставьте пустым для бесплатной услуги"
                              disabled={isSaving}
                           />
                         </FormGroup>
                         <FormActions>
                             <ActionButton type="button" className="secondary" onClick={handleCancelEdit} disabled={isSaving}>
                                 Отмена
                             </ActionButton>
                             <ActionButton type="submit" className="primary" disabled={isSaving}>
                                 {isSaving ? 'Сохранение...' : (currentEditId === 'new' ? 'Добавить услугу' : 'Сохранить изменения')}
                             </ActionButton>
                         </FormActions>
                    </form>
                </AddEditFormWrapper>
            )}
          
            {/* Список существующих услуг (карточки) */}
            {services.map(service => (
                service._id ? (
                    <ServiceCard key={service._id}>
                        <ServiceHeader>{service.name}</ServiceHeader>
                        {/* Поля для быстрого редактирования описания/цены */}
                        <FormGroup>
                            <Label htmlFor={`description-${service._id}`}>Описание:</Label>
                            <TextArea
                                id={`description-${service._id}`}
                                value={editingServices[service._id]?.description ?? ''}
                                onChange={(e) => handleCardInputChange(service._id!, 'description', e.target.value)}
                                // disabled={isSaving} // Можно убрать disabled отсюда, если есть кнопка Сохранить ниже
                            />
                        </FormGroup>
                        <FormGroup>
                            <Label htmlFor={`price-${service._id}`}>Цена (₽):</Label>
                            <Input
                                id={`price-${service._id}`}
                                type="text" 
                                value={editingServices[service._id]?.price ?? ''}
                                onChange={(e) => handleCardInputChange(service._id!, 'price', e.target.value)}
                                // disabled={isSaving}
                                placeholder="Оставьте пустым для бесплатной услуги"
                            />
                        </FormGroup>
                        <div> 
                            {/* Кнопка сохранения для карточки */}
                            <SaveButton
                                className="secondary" // Сделаем ее вторичной
                                onClick={() => handleCardSave(service._id!)}
                                disabled={isSaving} // Используем глобальный флаг
                            >
                                {isSaving ? 'Сохранение...' : 'Сохранить описание/цену'} 
                            </SaveButton>
                            {/* Кнопка Редактировать (открывает форму) */}
                            <ActionButton 
                                className="secondary" 
                                style={{marginLeft: '1rem'}} 
                                onClick={() => handleEditClick(service)} 
                                disabled={isSaving || isDeleting}
                            >
                                Редактировать все
                            </ActionButton>
                            <DeleteButton
                                className="danger" 
                                onClick={() => handleDelete(service._id!)}
                                disabled={isDeleting || isSaving}
                            >
                                Удалить
                            </DeleteButton>
                        </div>
                    </ServiceCard>
                ) : null
            ))}
        </FormContainer>
    );
};

export default EditServicesForm; 
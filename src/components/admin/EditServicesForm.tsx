import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ActionButton from '../ui/ActionButton';
import { ServiceType } from '../../types/Service';
import Modal from '../ui/Modal';

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

// Список иконок Font Awesome для выбора
const availableIcons = [
  { name: 'Не выбрано', class: '' },
  { name: 'Wi-Fi', class: 'fas fa-wifi' },
  { name: 'Парковка', class: 'fas fa-parking' },
  { name: 'Ресторан/Кафе', class: 'fas fa-utensils' },
  { name: 'Бар', class: 'fas fa-glass-martini-alt' },
  { name: 'Завтрак', class: 'fas fa-coffee' },
  { name: 'Трансфер', class: 'fas fa-shuttle-van' },
  { name: 'Бассейн', class: 'fas fa-swimmer' },
  { name: 'Спортзал', class: 'fas fa-dumbbell' },
  { name: 'Конференц-зал', class: 'fas fa-users' },
  { name: 'Бизнес-центр', class: 'fas fa-briefcase' },
  { name: 'Прачечная', class: 'fas fa-tshirt' },
  { name: 'Кондиционер', class: 'fas fa-wind' },
  { name: 'Сейф', class: 'fas fa-shield-alt' },
  { name: 'Телефон', class: 'fas fa-phone' },
  { name: 'Телевизор', class: 'fas fa-tv' },
  { name: 'Холодильник', class: 'fas fa-snowflake' }, // Пример иконки для холодильника
  { name: 'Обслуживание номеров', class: 'fas fa-concierge-bell' },
  { name: 'Услуги для инвалидов', class: 'fas fa-wheelchair' },
  { name: 'Разрешено с животными', class: 'fas fa-paw' },
  { name: 'Место для курения', class: 'fas fa-smoking' },
  { name: 'Запрещено курить', class: 'fas fa-smoking-ban' },
  { name: 'Другое (Колокольчик)', class: 'fas fa-bell' },
];

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
  display: flex; /* Добавляем flex для расположения кнопки */
  justify-content: space-between; /* Разносим название и кнопку */
  align-items: center; /* Выравниваем по центру */
`;

// Добавляем кнопку для редактирования в заголовке
const EditNameButton = styled.button`
  background: none;
  border: none;
  color: var(--text-secondary);
  cursor: pointer;
  font-size: 0.9rem; /* Меньше основного заголовка */
  padding: 0.2rem 0.4rem;
  margin-left: 0.5rem; /* Небольшой отступ слева */
  line-height: 1;
  border-radius: var(--radius-sm);
  transition: color 0.2s ease, background-color 0.2s ease;
  
  &:hover {
    color: var(--primary-color);
    background-color: var(--bg-secondary);
  }

  i { /* Стиль для иконки внутри кнопки */
    pointer-events: none; /* Чтобы клик проходил на button */
  }
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
    padding: 1.5rem 2rem;
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
    const handleFormInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
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
            <Title>Управление Преимуществами</Title>
            
            {/* Кнопка Добавить новую */}
            {!currentEditId && (
              <ActionButton onClick={handleAddNewClick} className="primary" style={{ marginBottom: '1.5rem' }}>
                 <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Добавить преимущество
              </ActionButton>
            )}

            {/* Модальное окно для формы добавления/редактирования */}
            <Modal 
                isOpen={currentEditId !== null} 
                onClose={handleCancelEdit} 
                title={currentEditId === 'new' ? "Новая услуга" : "Редактировать услугу"}
            >
                <AddEditFormWrapper>
                    <h3>{currentEditId === 'new' ? "Новое преимущество" : "Редактировать преимущество"}</h3>
                    <form onSubmit={handleFormSubmit}>
                         <FormGroup>
                           <Label htmlFor="serviceName">Название преимущества*</Label>
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
                           <Label htmlFor="serviceDesc">Описание преимущества</Label>
                           <TextArea 
                              id="serviceDesc" 
                              name="description" 
                              value={formData.description || ''} 
                              onChange={handleFormInputChange} 
                              disabled={isSaving}
                           />
                         </FormGroup>
                         <FormGroup>
                           <Label htmlFor="serviceIcon">Иконка</Label>
                           {/* Заменяем Input на Select */}
                           <Select 
                             id="serviceIcon" 
                             name="icon" 
                             value={formData.icon || ''} // Используем пустую строку, если иконка не задана
                             onChange={handleFormInputChange} 
                             disabled={isSaving}
                           >
                             {availableIcons.map(icon => (
                               <option key={icon.class} value={icon.class}>
                                 {icon.name} ({icon.class || '-'})
                               </option>
                             ))}
                           </Select>
                           {/* Отображаем выбранную иконку для предпросмотра */}
                           {formData.icon && (
                             <div style={{ marginTop: '0.5rem', fontSize: '1.5rem' }}>
                               <i className={formData.icon}></i>
                             </div>
                           )}
                         </FormGroup>
                         <FormGroup>
                           <Label htmlFor="servicePrice">Цена (₽)</Label>
                           <Input 
                              type="text"
                              id="servicePrice" 
                              name="price" 
                              value={formData.price ?? ''}
                              onChange={handleFormPriceChange}
                              placeholder="Оставьте пустым для бесплатного преимущества"
                              disabled={isSaving}
                           />
                         </FormGroup>
                         <FormActions>
                             <ActionButton type="button" className="secondary" onClick={handleCancelEdit} disabled={isSaving}>
                                 Отмена
                             </ActionButton>
                             <ActionButton type="submit" className="primary" disabled={isSaving}>
                                 {isSaving ? 'Сохранение...' : (currentEditId === 'new' ? 'Добавить преимущество' : 'Сохранить изменения')}
                             </ActionButton>
                         </FormActions>
                    </form>
                </AddEditFormWrapper>
            </Modal>
          
            {/* Список существующих услуг (карточки) */}
            {services.map(service => (
                service._id ? (
                    <ServiceCard key={service._id}>
                        <ServiceHeader>
                            {service.name}
                            <EditNameButton onClick={() => handleEditClick(service)} title="Редактировать услугу">
                                <i className="fas fa-pencil-alt"></i>
                            </EditNameButton>
                        </ServiceHeader>
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

// Добавляем стилизованный Select, если его нет
const Select = styled.select`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-secondary); /* Фон поля */
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
  cursor: pointer;

  &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
  &:disabled {
      background-color: var(--bg-tertiary);
      opacity: 0.7;
      cursor: not-allowed;
  }
`;

export default EditServicesForm; 
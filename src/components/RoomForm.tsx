import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
// import RoomImageUploader from './RoomImageUploader'; // Убираем старый загрузчик
// import MultiImageDropzone from './ui/MultiImageDropzone'; // Импортируем новый
import { RoomType } from '../types/Room';
// import { ActionButton as ConfirmActionButton } from './ui/ConfirmModal'; // Убираем импорт, если он не используется
import ActionButton from './ui/ActionButton'; // Импортируем общую кнопку
// import { roomsService } from '../utils/api';
// import { toast } from 'react-toastify';

// Удаляем локальное определение интерфейса RoomType
/*
interface RoomType { ... } 
*/

interface RoomFormProps {
  initialData?: RoomType | null; 
  onSave: (data: Omit<RoomType, '_id' | 'imageUrls' | 'cloudinaryPublicIds'>, newFiles: File[], deletedPublicIds: string[]) => Promise<void>; // Обновляем onSave
  onCancel: () => void;
  // Убираем isLoading, т.к. форма сама управляет своим состоянием сохранения
  // isLoading: boolean; 
}

// Адаптация стилей под темную тему
const FormWrapper = styled.div`
  background-color: var(--bg-secondary); /* Фон формы */
  padding: 2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
`;

const FormTitle = styled.h3`
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--text-primary);
  font-size: 1.4rem;
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
`;

const Grid = styled.div`
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: 1.5rem 2rem; /* Row gap, Column gap */
`;

const FormGroup = styled.div`
  margin-bottom: 1rem;

  /* Стили для группы чекбокса доступности */
  .checkbox-group {
      display: flex;
      align-items: center;
      background-color: var(--bg-primary);
      padding: 0.9rem 1rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-sm);

      label {
          margin-bottom: 0;
          margin-left: 0.8rem;
          color: black; /* <<< Делаем текст черным */
          font-weight: 400;
          font-size: 1rem;
          flex-grow: 1;
      }
      
      input[type="checkbox"] {
          width: 18px;
          height: 18px;
          accent-color: var(--primary-color);
      }
  }
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.6rem;
  font-weight: 500;
  color: var(--text-secondary); // Оставляем стандартный цвет для остальных меток
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary); // Основной цвет текста для ввода
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  /* Стиль для плейсхолдера поля добавления особенности */
  &[name="newFeature"]::placeholder {
    color: black; /* <<< Делаем плейсхолдер черным */
    opacity: 1; 
  }

  &[type="number"]::-webkit-inner-spin-button,
  &[type="number"]::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }
  &[type="number"] {
      -moz-appearance: textfield; /* Firefox */
  }

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
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  background-color: var(--bg-primary);
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

const FeaturesContainer = styled.div`
  margin-bottom: 1rem;
  /* Используем ID для таргетинга только этой метки */
  label#features-label {
    display: block;
    margin-bottom: 0.8rem;
    font-weight: 500;
    color: black; /* <<< Делаем текст черным */
    font-size: 0.9rem;
  }
`;

const FormActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color);
`;

const ErrorText = styled.p`
    color: var(--danger-color);
    font-size: 0.85rem;
    margin-top: 0.3rem;
`;

// Обновляем DEFAULT_ROOM под новый интерфейс
// Убираем _id, т.к. он генерируется базой
// Убираем imageUrl, добавляем imageUrls и cloudinaryPublicIds
// Заменяем priceValue на pricePerNight
const DEFAULT_ROOM: Omit<RoomType, '_id'> = {
  title: "",
  // imageUrl: "", // Удалено
  imageUrls: [], // Добавлено
  cloudinaryPublicIds: [], // Добавлено
  price: "", // Пользователь введет строку
  // priceValue: 0, // Удалено
  pricePerNight: 0, // Добавлено и переименовано
  capacity: 2,
  features: [],
  description: "", // Добавлено для полноты
  isAvailable: true // Добавлено для полноты
};

// Тип для состояния формы, может включать _id для редактирования
// Используем pricePerNight вместо priceValue
// Не храним imageUrls/cloudinaryPublicIds в состоянии формы напрямую, используем initialData
// Переопределяем тип для большей ясности и исправления ошибки с _id
// Сначала берем все поля ИЗ RoomType, КРОМЕ массивов изображений
type RoomFormFields = Omit<RoomType, 'imageUrls' | 'cloudinaryPublicIds'>;
// Затем делаем _id опциональным для состояния формы
type RoomFormData = Omit<RoomFormFields, '_id'> & { _id?: string };

// --- Стили для блока Особенностей --- 

const FeatureList = styled.ul`
    list-style: none;
    padding: 0;
    margin: 0 0 1rem 0;
    display: flex;
    flex-wrap: wrap;
    gap: 0.8rem;
`;

const FeatureItem = styled.li`
    display: inline-flex;
    align-items: center;
    background-color: var(--bg-tertiary);
    padding: 0.5rem 0.8rem;
    border-radius: var(--radius-sm);
    font-size: 0.9rem;
    color: black; /* <<< Делаем текст черным */
    border: 1px solid var(--border-color);
`;

const RemoveButton = styled.button`
    background: none;
    border: none;
    color: black; /* <<< Делаем текст черным */
    margin-left: 0.7rem;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    padding: 0;
    line-height: 1;

    &:hover {
        color: var(--danger-color);
    }
`;

const AddFeatureControls = styled.div`
    display: flex;
    gap: 1rem;
    align-items: center;
`;

// Используем базовый ActionButton и переопределяем стили
const AddFeatureButton = styled(ActionButton)`
    padding: 0.9rem 1.2rem;
    flex-shrink: 0;
    background-color: var(--primary-color);
    color: black; /* <<< Делаем текст черным */

    &:hover:not(:disabled) {
        background-color: var(--secondary-color);
        color: black;
    }
`;

// --- КОНЕЦ СТИЛЕЙ ДЛЯ ОСОБЕННОСТЕЙ --- 

const RoomForm: React.FC<RoomFormProps> = ({ initialData, onSave, onCancel }) => {
  // Инициализируем состояние формы без полей изображений
  // Теперь тип RoomFormData корректно обрабатывает опциональный _id
  const [formData, setFormData] = useState<RoomFormData>(() => {
    const data = initialData || DEFAULT_ROOM;
    return {
      _id: initialData?._id, // Добавляем _id если редактируем
      title: data.title || '',
      price: data.price || '',
      pricePerNight: data.pricePerNight || 0, // Используем pricePerNight
      capacity: data.capacity || 2,
      features: data.features || [],
      description: data.description || '', // Добавлено
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true // Добавлено
    };
  });
  
  const [newFeature, setNewFeature] = useState("");
  // Состояние для НОВЫХ файлов, выбранных в MultiImageDropzone
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  // Состояние для ID СУЩЕСТВУЮЩИХ изображений, помеченных на удаление
  const [deletedPublicIds, setDeletedPublicIds] = useState<string[]>([]);
  // Убираем imageUrl из ключей ошибок
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<RoomFormData, '_id'> | 'form', string>>>({});

  useEffect(() => {
    // Обновляем форму при изменении initialData
    const data = initialData || DEFAULT_ROOM;
    setFormData({
       _id: initialData?._id,
       title: data.title || '',
       price: data.price || '',
       pricePerNight: data.pricePerNight || 0, // Используем pricePerNight
       capacity: data.capacity || 2,
       features: data.features || [],
       description: data.description || '',
       isAvailable: data.isAvailable !== undefined ? data.isAvailable : true
    });
    // Устанавливаем превью из первого URL существующего номера
    setNewImageFiles([]);
    setDeletedPublicIds([]);
    setErrors({}); // Сбрасываем ошибки
  }, [initialData]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;

    if (type === 'number') {
      processedValue = parseFloat(value);
    }
    // Обработка чекбокса
    if (name === 'isAvailable' && e.target instanceof HTMLInputElement) {
       processedValue = e.target.checked;
    }

    setFormData(prev => ({ ...prev, [name]: processedValue as any }));
    // Убираем ошибку для измененного поля
    if (errors[name as keyof typeof errors]) {
      setErrors(prev => ({ ...prev, [name]: undefined }));
    }
  };

  // Обработчик выбора новых файлов из MultiImageDropzone
  // const handleFilesSelected = (files: File[]) => {
  //     setNewImageFiles(files);
  //     // Можно добавить валидацию количества файлов здесь
  // };

  // Обработчик удаления существующего изображения из MultiImageDropzone
  // const handleExistingImageDelete = (publicId: string) => {
  //     setDeletedPublicIds(prev => [...prev, publicId]);
  //     // Можно также обновить formData.imageUrls/cloudinaryPublicIds, 
  //     // чтобы превью сразу исчезло, но это необязательно,
  //     // т.к. MultiImageDropzone управляет своим превью
  // };
  
  // Валидация формы
  const validateForm = (): boolean => {
    // Используем Omit<RoomFormData, '_id'> для проверки полей данных
    const newErrors: Partial<Record<keyof Omit<RoomFormData, '_id'> | 'form', string>> = {};
    if (!formData.title.trim()) {
      newErrors.title = 'Название номера обязательно';
    }
    // Валидируем pricePerNight
    if (formData.pricePerNight <= 0) { 
      newErrors.pricePerNight = 'Цена должна быть положительным числом'; // Обновлено имя поля
    }
    if (!formData.price.trim()) {
        newErrors.price = 'Представление цены обязательно (напр., 3500 ₽/сутки)';
    }
     if (formData.capacity <= 0) {
      newErrors.capacity = 'Вместимость должна быть положительным числом';
    }
    // Добавим валидацию для нового файла, если это создание новой комнаты
    // if (!initialData && !selectedImageFile) {
    //   newErrors.form = 'Изображение обязательно для нового номера';
    // } 
    // Пока убрал, т.к. загрузка может быть необязательной или обрабатываться иначе

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleAddFeature = () => {
    if (newFeature.trim() && !formData.features.includes(newFeature.trim())) {
      setFormData(prev => ({
        ...prev,
        features: [...prev.features, newFeature.trim()]
      }));
      setNewFeature("");
    }
  };
  
  const handleRemoveFeature = (index: number) => {
    setFormData(prev => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index)
    }));
  };
  
  // Вызываем onSave с новыми файлами и ID для удаления
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    const dataToSend: Omit<RoomType, '_id' | 'imageUrls' | 'cloudinaryPublicIds'> = {
      title: formData.title,
      price: formData.price,
      pricePerNight: formData.pricePerNight, 
      capacity: formData.capacity,
      features: formData.features,
      description: formData.description,
      isAvailable: formData.isAvailable
    };
    try {
      await onSave(dataToSend, newImageFiles, deletedPublicIds); 
      // Успех обработается в RoomsAdminPanel
    } catch (error) {
       console.error("Ошибка при вызове onSave:", error);
       setErrors(prev => ({ ...prev, form: 'Произошла ошибка при сохранении номера.' }));
    }
  };

  // Формируем список существующих изображений для MultiImageDropzone
  // const existingImagesForDropzone = initialData?.imageUrls?.map((url, index) => ({
  //     url,
  //     publicId: initialData.cloudinaryPublicIds?.[index] // Предполагаем, что массивы синхронизированы
  // })).filter(img => img.publicId && !deletedPublicIds.includes(img.publicId)) ?? []; // Исключаем помеченные на удаление

  return (
    <FormWrapper>
      <FormTitle>{initialData ? 'Редактировать номер' : 'Добавить новый номер'}</FormTitle>
      <form onSubmit={handleSubmit} noValidate>
        {/* Поле Title */}
        <FormGroup>
          <Label htmlFor="title">Название номера</Label>
          <Input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
          {errors.title && <ErrorText>{errors.title}</ErrorText>}
        </FormGroup>
        
        {/* Загрузчик изображения */}
        <FormGroup>
          <Label>Изображения номера</Label>
          {/* <MultiImageDropzone 
                existingImages={existingImagesForDropzone}
                onFilesSelected={handleFilesSelected}
                onExistingImageDelete={handleExistingImageDelete}
                // maxFiles={5} // Можно задать лимит
          /> */}
           {/* Можно добавить вывод ошибок, связанных с файлами */}
        </FormGroup>

        <Grid>
           {/* Поле Price (строка) */}
          <FormGroup>
            <Label htmlFor="price">Цена (текст)</Label>
            <Input
              type="text"
              id="price"
              name="price"
              value={formData.price}
              onChange={handleChange}
              placeholder="Напр., 3500 ₽ / сутки"
              required
            />
             {errors.price && <ErrorText>{errors.price}</ErrorText>}
          </FormGroup>

          {/* Поле Price Value (число) - теперь pricePerNight */}
          <FormGroup>
            <Label htmlFor="pricePerNight">Цена за ночь (число)</Label>
            <Input
              type="number"
              id="pricePerNight" 
              name="pricePerNight" // Обновлено имя
              value={isNaN(formData.pricePerNight) ? '' : formData.pricePerNight ?? ''} 
              onChange={handleChange}
              min="0"
              required
            />
             {/* Валидация должна будет корректно обрабатывать NaN или 0 */}
             {errors.pricePerNight && <ErrorText>{errors.pricePerNight}</ErrorText>}
          </FormGroup>

          {/* Поле Capacity */}
          <FormGroup>
            <Label htmlFor="capacity">Вместимость (чел)</Label>
            <Input
              type="number"
              id="capacity"
              name="capacity"
              value={formData.capacity}
              onChange={handleChange}
              min="1"
              required
            />
             {errors.capacity && <ErrorText>{errors.capacity}</ErrorText>}
          </FormGroup>
        </Grid>

        {/* Поле Description */}
         <FormGroup>
           <Label htmlFor="description">Описание</Label>
           <TextArea
             id="description"
             name="description"
             value={formData.description || ''}
             onChange={handleChange}
             placeholder="Подробное описание номера..."
           />
         </FormGroup>
        
         {/* Поле Is Available */}
         <FormGroup>
           <div className="checkbox-group">
             <input
               type="checkbox"
               id="isAvailable"
               name="isAvailable"
               checked={formData.isAvailable}
               onChange={handleChange}
             />
             {/* Используем обычный label, т.к. стили внутри FormGroup */} 
             <label htmlFor="isAvailable">Номер доступен для бронирования</label>
           </div>
         </FormGroup>

        {/* Поле Features */}
        <FeaturesContainer>
          {/* Добавляем ID для стилизации */} 
          <label id="features-label">Особенности номера</label> 
          {/* Используем новые styled-компоненты */} 
          <FeatureList>
            {formData.features.map((feature, index) => (
              <FeatureItem key={index}>
                {feature}
                <RemoveButton onClick={() => handleRemoveFeature(index)} title="Удалить особенность">
                  &times;
                </RemoveButton>
              </FeatureItem>
            ))}
          </FeatureList>
          <AddFeatureControls>
            <Input
              type="text"
              name="newFeature" // Добавляем имя для стилизации плейсхолдера
              placeholder="Добавить особенность..."
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              // Можно добавить обработку Enter
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddFeature(); } }}
            />
            <AddFeatureButton type="button" onClick={handleAddFeature} disabled={!newFeature.trim()}>
              Добавить
            </AddFeatureButton>
          </AddFeatureControls>
        </FeaturesContainer>

        {/* Сообщение об общей ошибке формы */}
         {errors.form && <ErrorText style={{ marginBottom: '1rem', textAlign: 'center' }}>{errors.form}</ErrorText>}

        {/* Кнопки */}
        <FormActions>
          <ActionButton // Используем импортированный ActionButton
            type="button"
            className="outline" // Используем .outline как alias для .secondary
            onClick={onCancel}
           >
            Отмена
          </ActionButton>
          <ActionButton // Используем импортированный ActionButton
            type="submit"
            className="primary"
          >
            Сохранить номер
          </ActionButton>
        </FormActions>
      </form>
    </FormWrapper>
  );
};

export default RoomForm; 
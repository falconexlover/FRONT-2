import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
// import RoomImageUploader from './RoomImageUploader'; // Убираем старый загрузчик
// import MultiImageDropzone from './ui/MultiImageDropzone'; // Импортируем новый
import { RoomType } from '../types/Room';
// import { ActionButton as ConfirmActionButton } from './ui/ConfirmModal'; // Убираем импорт, если он не используется
import ActionButton from './ui/ActionButton'; // Импортируем общую кнопку
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils'; // Импортируем оптимизатор
// import { roomsService } from '../utils/api';
// import { toast } from 'react-toastify';
import ConfirmModal from './ui/ConfirmModal';
import { DragDropContext, Droppable, Draggable, DropResult } from '@hello-pangea/dnd';

// Удаляем локальное определение интерфейса RoomType
/*
interface RoomType { ... } 
*/

interface RoomFormProps {
  initialData?: RoomType | null; 
  onSave: (data: Omit<RoomType, '_id' | 'imageUrls' | 'cloudinaryPublicIds'>, newFiles: File[], imagesToDelete: { url: string, publicId: string | null }[]) => Promise<void>;
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
  imageUrls: [], 
  cloudinaryPublicIds: [], 
  price: "", 
  pricePerNight: 0, 
  capacity: 2,
  features: [],
  isAvailable: true,
  bathroomImages: [],
  bathroomCloudinaryPublicIds: [],
  description: '',
  fullDescription: '',
};

// Типы для состояния формы
type RoomFormFields = Omit<RoomType, 'imageUrls' | 'cloudinaryPublicIds' | 'bathroomImages' | 'bathroomCloudinaryPublicIds'>;
// Теперь RoomFormData соответствует RoomFormFields + опциональный _id
type RoomFormData = Omit<RoomFormFields, '_id'> & { _id?: string } & {
  bathroomImages?: string[];
  bathroomCloudinaryPublicIds?: string[];
};

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

// --- КОНЕЦ СТИЛЕЙ ДЛЯ ОСОБЕННОСТЕЙ --- 

// Добавляем стили для секции изображений
const ImageSection = styled.div`
  margin-bottom: 2rem;
  padding-bottom: 2rem;
  border-bottom: 1px solid var(--border-color);
`;

const ImageGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
  align-items: start;
`;

const ImagePreviewContainer = styled.div`
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  background-color: var(--bg-primary);
  min-height: 90px;

  img {
    display: block;
    width: 100%;
    height: 90px;
    object-fit: cover;
  }

  .delete-btn {
    position: absolute;
    top: 4px;
    right: 4px;
    background-color: rgba(229, 57, 53, 0.8); // Красный с прозрачностью
    color: white;
    border: none;
    border-radius: 50%;
    width: 24px;
    height: 24px;
    font-size: 12px;
    line-height: 24px;
    text-align: center;
    cursor: pointer;
    transition: background-color 0.2s;

    &:hover {
      background-color: rgba(211, 47, 47, 1); // Темнее при наведении
    }
  }
`;

const FileInput = styled.input`
  display: block; /* Или скрыть и стилизовать label как кнопку */
  margin-top: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;

  /* Стили для стандартной кнопки */
  &::file-selector-button {
      padding: 0.5rem 1rem;
      border: 1px solid var(--primary-color);
      background-color: transparent;
      color: var(--primary-color);
      border-radius: var(--radius-sm);
      cursor: pointer;
      transition: background-color 0.2s, color 0.2s;
      margin-right: 1rem;

      &:hover {
          background-color: rgba(42, 167, 110, 0.1);
      }
  }
`;

const RoomForm: React.FC<RoomFormProps> = ({ initialData, onSave, onCancel }) => {
  // Инициализируем состояние формы
  const [formData, setFormData] = useState<RoomFormData>(() => {
    const data = initialData || DEFAULT_ROOM;
    return {
      _id: initialData?._id,
      title: data.title || '',
      price: data.price || '',
      pricePerNight: data.pricePerNight || 0, 
      capacity: data.capacity || 2,
      features: data.features || [],
      isAvailable: data.isAvailable !== undefined ? data.isAvailable : true,
      bathroomImages: data.bathroomImages || [],
      bathroomCloudinaryPublicIds: data.bathroomCloudinaryPublicIds || [],
      description: data.description || '',
      fullDescription: data.fullDescription || '',
    };
  });
  
  const [newFeature, setNewFeature] = useState("");
  // Состояние для ID СУЩЕСТВУЮЩИХ изображений, помеченных на удаление
  const [imagesMarkedForDeletion, setImagesMarkedForDeletion] = useState<{ url: string, publicId: string | null }[]>([]);
  // Убираем imageUrl из ключей ошибок
  const [errors, setErrors] = useState<Partial<Record<keyof Omit<RoomFormData, '_id'> | 'form', string>>>({});

  // --- Состояния для Изображений ---
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [newFilePreviews, setNewFilePreviews] = useState<string[]>([]);
  // Состояние для отслеживания видимости существующих изображений
  const [existingImages, setExistingImages] = useState<{ url: string; publicId: string | null }[]>([]);
  const [imageToRemove, setImageToRemove] = useState<{ index: number; url: string; publicId: string | null } | null>(null);
  const [isRemovingExisting, setIsRemovingExisting] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);

  // --- Добавляем Ref для input type="file" --- 
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Новый useEffect для инициализации существующих изображений и сброса файлов при изменении initialData
  useEffect(() => {
    // Основные фото номера
    if (initialData?.imageUrls && initialData?.cloudinaryPublicIds) {
      const images = initialData.imageUrls.map((url, index) => ({
        url: url,
        publicId: initialData.cloudinaryPublicIds?.[index] || null
      }));
      setExistingImages(images);
    } else {
      setExistingImages([]);
    }
    // Фото санузла
    if (initialData?.bathroomImages && initialData?.bathroomCloudinaryPublicIds) {
      const bathImages = initialData.bathroomImages.map((url, index) => ({
        url: url,
        publicId: initialData.bathroomCloudinaryPublicIds?.[index] || null
      }));
      setBathroomExistingImages(bathImages);
    } else {
      setBathroomExistingImages([]);
    }
    // Сброс новых файлов и превью
    setNewFiles([]);
    setNewFilePreviews(prev => { prev.forEach(URL.revokeObjectURL); return []; });
    setImagesMarkedForDeletion([]);
    setBathroomNewFiles([]);
    setBathroomNewFilePreviews(prev => { prev.forEach(URL.revokeObjectURL); return []; });
    // setBathroomImagesMarkedForDeletion([]); // если используется
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    let processedValue: string | number | boolean = value;

    if (type === 'number') {
      // Если значение - пустая строка, ставим 0, иначе парсим
      processedValue = value === '' ? 0 : parseFloat(value);
      // Дополнительная проверка на NaN на случай, если введено что-то непарсируемое
      if (isNaN(processedValue as number)) {
          processedValue = 0;
      }
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
  
  // --- Обработчики для Изображений ---

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      // Очищаем предыдущие превью новых файлов
      newFilePreviews.forEach(URL.revokeObjectURL);

      setNewFiles(prev => [...prev, ...filesArray]);
      // Генерируем превью для новых добавленных файлов
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setNewFilePreviews(prev => [...prev, ...previews]);
    }
    // Очищаем значение инпута ПОСЛЕ обработки, чтобы можно было выбрать тот же файл снова
    // Используем ref для большей надежности
    if (fileInputRef.current) {
        fileInputRef.current.value = ''; 
    }
    // Старый способ очистки на всякий случай (может не работать надежно)
    // e.target.value = ''; 
  };

  // Удаление существующего изображения
  const handleDeleteExistingImageClick = (url: string, publicId: string | null) => {
    setImageToRemove({ index: -1, url: url, publicId: publicId }); 
    setIsRemovingExisting(true);
    setShowConfirmModal(true);
  };

  // Удаление нового файла
  const handleRemoveNewFileClick = (index: number) => {
    setImageToRemove({ index, url: newFilePreviews[index], publicId: null }); 
    setIsRemovingExisting(false);
    setShowConfirmModal(true);
  };

  // Выполняется при подтверждении в модальном окне
  const confirmImageRemoval = () => {
    if (imageToRemove === null) return;

    if (isRemovingExisting) {
      // Удаление существующего
      const { url: urlToRemove, publicId: publicIdToRemove } = imageToRemove;
      
      // Убираем из видимого списка по URL
      setExistingImages(prev => prev.filter(img => img.url !== urlToRemove));
      
      // Добавляем объект {url, publicId} в список на удаление
      setImagesMarkedForDeletion(prev => [...prev, { url: urlToRemove, publicId: publicIdToRemove }]);
      
    } else {
      // Удаление нового (логика остается прежней)
       const indexToRemove = imageToRemove.index;
       if (indexToRemove !== -1 && !isNaN(indexToRemove)) {
           if (newFilePreviews[indexToRemove]) {
               URL.revokeObjectURL(newFilePreviews[indexToRemove]);
           }
           setNewFiles(prev => prev.filter((_, index) => index !== indexToRemove));
           setNewFilePreviews(prev => prev.filter((_, index) => index !== indexToRemove));
       }
    }
    // Закрываем модалку и сбрасываем состояния
    setShowConfirmModal(false);
    setImageToRemove(null);
    setIsRemovingExisting(false);
  };

  // Выполняется при отмене в модальном окне
  const cancelImageRemoval = () => {
    setShowConfirmModal(false);
    setImageToRemove(null);
    setIsRemovingExisting(false);
  };

  // --- Валидация и Сохранение ---

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    // Собираем данные для отправки, убираем fullDescription
    const dataToSend: Omit<RoomType, '_id' | 'imageUrls' | 'cloudinaryPublicIds'> = {
      title: formData.title,
      price: formData.price,
      pricePerNight: formData.pricePerNight, 
      capacity: formData.capacity,
      features: formData.features,
      isAvailable: formData.isAvailable,
      bathroomImages: formData.bathroomImages,
      bathroomCloudinaryPublicIds: formData.bathroomCloudinaryPublicIds,
      description: formData.description,
      fullDescription: formData.fullDescription,
      // --- КЛЮЧЕВОЕ: imageUrls теперь только не удалённые + новые ---
      imageUrls: [
        ...((initialData?.imageUrls || []).filter(
          url => !imagesMarkedForDeletion.some(img => img.url === url)
        )),
        ...publicNewPreviews // если publicNewPreviews содержит url новых фото, иначе используйте массив новых файлов после загрузки
      ],
    } as any;
    try {
      await onSave(dataToSend, [...newFiles, ...publicNewFiles], imagesMarkedForDeletion); 
      // Успех обработается в RoomsAdminPanel
    } catch (error) {
       console.error("Ошибка при вызове onSave:", error);
       setErrors(prev => ({ ...prev, form: 'Произошла ошибка при сохранении номера.' }));
    }
  };

  const [bathroomNewFiles, setBathroomNewFiles] = useState<File[]>([]);
  const [bathroomNewFilePreviews, setBathroomNewFilePreviews] = useState<string[]>([]);
  const [bathroomExistingImages, setBathroomExistingImages] = useState<{ url: string; publicId: string | null }[]>([]);

  const handleBathroomFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      bathroomNewFilePreviews.forEach(URL.revokeObjectURL);
      setBathroomNewFiles(prev => [...prev, ...filesArray]);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setBathroomNewFilePreviews(prev => [...prev, ...previews]);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleDeleteExistingBathroomImageClick = (url: string, publicId: string | null) => {
    setBathroomExistingImages(prev => prev.filter(img => img.url !== url));
    // setBathroomImagesMarkedForDeletion(prev => [...prev, { url, publicId }]);
  };

  const handleRemoveNewBathroomFileClick = (index: number) => {
    if (bathroomNewFilePreviews[index]) URL.revokeObjectURL(bathroomNewFilePreviews[index]);
    setBathroomNewFiles(prev => prev.filter((_, i) => i !== index));
    setBathroomNewFilePreviews(prev => prev.filter((_, i) => i !== index));
  };

  // --- DnD обработчики для основной галереи ---
  const onMainImageDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    // Сортируем существующие изображения
    if (result.source.droppableId === 'main-images' && result.destination.droppableId === 'main-images') {
      setExistingImages(prev => {
        const arr = Array.from(prev);
        const [removed] = arr.splice(result.source.index, 1);
        arr.splice(result.destination!.index, 0, removed);
        return arr;
      });
    }
    // Сортируем новые файлы
    if (result.source.droppableId === 'main-new' && result.destination.droppableId === 'main-new') {
      setNewFiles(prev => {
        const arr = Array.from(prev);
        const [removed] = arr.splice(result.source.index, 1);
        arr.splice(result.destination!.index, 0, removed);
        return arr;
      });
      setNewFilePreviews(prev => {
        const arr = Array.from(prev);
        const [removed] = arr.splice(result.source.index, 1);
        arr.splice(result.destination!.index, 0, removed);
        return arr;
      });
    }
  };
  // --- DnD обработчики для санузловой галереи ---
  const onBathroomImageDragEnd = (result: DropResult) => {
    if (!result.destination) return;
    if (result.source.droppableId === 'bathroom-images' && result.destination.droppableId === 'bathroom-images') {
      setBathroomExistingImages(prev => {
        const arr = Array.from(prev);
        const [removed] = arr.splice(result.source.index, 1);
        arr.splice(result.destination!.index, 0, removed);
        return arr;
      });
    }
    if (result.source.droppableId === 'bathroom-new' && result.destination.droppableId === 'bathroom-new') {
      setBathroomNewFiles(prev => {
        const arr = Array.from(prev);
        const [removed] = arr.splice(result.source.index, 1);
        arr.splice(result.destination!.index, 0, removed);
        return arr;
      });
      setBathroomNewFilePreviews(prev => {
        const arr = Array.from(prev);
        const [removed] = arr.splice(result.source.index, 1);
        arr.splice(result.destination!.index, 0, removed);
        return arr;
      });
    }
  };

  // --- ДОБАВЛЯЕМ СОСТОЯНИЕ ДЛЯ ПУБЛИЧНЫХ ФОТО ---
  const [publicNewFiles, setPublicNewFiles] = useState<File[]>([]);
  const [publicNewPreviews, setPublicNewPreviews] = useState<string[]>([]);
  // Больше не храним локальный массив publicImages, всегда используем initialData?.imageUrls

  // --- ОБРАБОТЧИКИ ДЛЯ ПУБЛИЧНЫХ ФОТО ---
  const handleRemovePublicImage = (url: string) => {
    console.log('Удаляю фото:', url);
    // Если фото уже есть в initialData (то есть оно уже на сервере)
    const idx = initialData?.imageUrls?.indexOf(url);
    if (idx !== undefined && idx !== -1 && initialData?.cloudinaryPublicIds) {
      const publicId = initialData.cloudinaryPublicIds[idx];
      setImagesMarkedForDeletion(prev => {
        const updated = [...prev, { url, publicId }];
        console.log('imagesMarkedForDeletion:', updated);
        return updated;
      });
    } else {
      setImagesMarkedForDeletion(prev => {
        const updated = [...prev, { url, publicId: null }];
        console.log('imagesMarkedForDeletion:', updated);
        return updated;
      });
    }
    // Не меняем локальный массив, просто скрываем фото в UI через фильтрацию при рендере
    if (initialData?.imageUrls) {
      initialData.imageUrls.forEach(u => {
        console.log('Сравниваю:', u, '===', url, u === url);
      });
    }
  };
  const handleAddPublicFiles = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const filesArray = Array.from(e.target.files);
      setPublicNewFiles(prev => [...prev, ...filesArray]);
      const previews = filesArray.map(file => URL.createObjectURL(file));
      setPublicNewPreviews(prev => [...prev, ...previews]);
    }
    if (e.target) e.target.value = '';
  };
  const handleRemoveNewPublicFile = (idx: number) => {
    if (publicNewPreviews[idx]) URL.revokeObjectURL(publicNewPreviews[idx]);
    setPublicNewFiles(prev => prev.filter((_, i) => i !== idx));
    setPublicNewPreviews(prev => prev.filter((_, i) => i !== idx));
  };

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
        
        {/* --- Секция Изображений --- */}
        <ImageSection>
          <Label>Фото, которые видны на сайте</Label>
          <ImageGrid>
            {initialData?.imageUrls && initialData.imageUrls
              .filter(url => !imagesMarkedForDeletion.some(img => img.url === url))
              .map((url, idx) => (
                <ImagePreviewContainer key={url}>
                  <img src={optimizeCloudinaryImage(url, 'w_200,h_150,c_fill,q_auto')} alt={`Фото ${idx + 1}`} />
                  <button type="button" className="delete-btn" title="Удалить это фото" onClick={() => handleRemovePublicImage(url)}>&times;</button>
                </ImagePreviewContainer>
              ))}
            {publicNewPreviews.map((preview, idx) => (
              <ImagePreviewContainer key={preview}>
                <img src={preview} alt={`Новое фото ${idx + 1}`} />
                <button type="button" className="delete-btn" title="Убрать это фото" onClick={() => handleRemoveNewPublicFile(idx)}>&times;</button>
              </ImagePreviewContainer>
            ))}
          </ImageGrid>
          <FormGroup>
            <Label htmlFor="publicImagesInput">Добавить фото</Label>
            <FileInput
              type="file"
              id="publicImagesInput"
              multiple
              accept="image/*"
              onChange={handleAddPublicFiles}
            />
          </FormGroup>
        </ImageSection>

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
            {/* Используем ActionButton вместо AddFeatureButton */}
            <ActionButton 
              type="button" 
              className="secondary" // Применяем стиль
              onClick={handleAddFeature} 
              disabled={!newFeature.trim()}
              style={{ flexShrink: 0 }} // Предотвращаем сжатие кнопки
            >
              Добавить
            </ActionButton>
          </AddFeatureControls>
        </FeaturesContainer>

        {/* Поле для описания номера */}
        <FormGroup>
          <Label htmlFor="description">Описание номера</Label>
          <TextArea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Введите описание номера"
          />
          {errors.description && <ErrorText>{errors.description}</ErrorText>}
        </FormGroup>

        {/* Поле для подробного описания номера */}
        <FormGroup>
          <Label htmlFor="fullDescription">Подробное описание</Label>
          <TextArea
            id="fullDescription"
            name="fullDescription"
            value={formData.fullDescription || ''}
            onChange={handleChange}
            placeholder="Введите подробное описание номера"
          />
        </FormGroup>

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

      {/* Модальное окно подтверждения удаления изображения */}
      <ConfirmModal
          isOpen={showConfirmModal}
          onConfirm={confirmImageRemoval}
          onCancel={cancelImageRemoval}
          title="Подтвердить удаление"
          // Упрощаем сообщение
          message="Вы уверены, что хотите удалить это фото?"
          confirmText="Удалить"
          cancelText="Отмена"
      />
    </FormWrapper>
  );
};

export default RoomForm; 
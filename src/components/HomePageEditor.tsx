import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { homePageService, galleryService } from '../utils/api';
import { HomePageContent } from '../types/HomePage';
import { toast } from 'react-toastify';
import ActionButton from './ui/ActionButton';

// Адаптация стилей под темную тему
const EditorContainer = styled.div`
  padding: 1.5rem;
  background-color: var(--bg-secondary); /* Темный фон для контейнера */
  border-radius: var(--radius-md); /* Увеличим радиус */
  border: 1px solid var(--border-color);
  color: var(--text-primary);
`;

const EditorTitle = styled.h3`
  color: var(--primary-color); /* Акцентный цвет для заголовка */
  font-family: 'Playfair Display', serif;
  margin-top: 0;
  margin-bottom: 2rem; /* Увеличим отступ */
  text-align: center;
  font-size: 1.6rem; /* Увеличим шрифт */
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.6rem; /* Немного увеличим */
  font-weight: 500; /* Сделаем чуть менее жирным */
  color: var(--text-secondary); /* Вторичный цвет текста */
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.9rem 1rem; /* Увеличим padding */
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-primary); /* Основной фон для поля */
  color: var(--text-primary);
  transition: border-color 0.2s ease, box-shadow 0.2s ease;

  &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3); /* Свечение под цвет primary */
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.9rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  min-height: 150px;
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

// Добавим стиль для подзаголовков секций
const SectionSubheader = styled.h4`
    margin-top: 2.5rem; /* Увеличим отступ */
    margin-bottom: 1.5rem;
    color: var(--text-primary);
    border-bottom: 1px solid var(--border-color);
    padding-bottom: 0.8rem;
    font-size: 1.2rem;
    font-weight: 600;
`;

// Контейнер для кнопки сохранения
const SaveButtonContainer = styled.div`
  margin-top: 2.5rem;
  text-align: right; // Выравниваем кнопку вправо
`;

// Добавляем стили для загрузчика и превью
const ImagePreview = styled.img`
    max-width: 200px;
    max-height: 150px;
    margin-top: 1rem;
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
`;

const FileInput = styled.input`
  display: block;
  margin-top: 0.5rem;
  /* Добавить стили, если нужно */
`;

const HomepageEditor: React.FC = () => {
  const [formData, setFormData] = useState<Partial<HomePageContent>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  // Состояние для нового файла секции "О нас"
  const [aboutImageFile, setAboutImageFile] = useState<File | null>(null);
  // Состояние для URL превью нового файла
  const [aboutImagePreview, setAboutImagePreview] = useState<string | null>(null);

  const loadContent = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await homePageService.getHomePage();
      if (data) {
        setFormData({
            banner: data.banner ?? { title: '', subtitle: '', buttonText: '', buttonLink: '' },
            about: data.about ?? { title: '', content: '', image: '' },
            contact: data.contact ?? { title: '', address: '', phone: [], email: '' }
        });
      }
      // Сбрасываем файл и превью при загрузке
      setAboutImageFile(null);
      setAboutImagePreview(null);
    } catch (err) {
      console.error("Ошибка загрузки данных гл. страницы:", err);
      toast.error(`Ошибка загрузки: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadContent();
  }, [loadContent]);

  const handleNestedChange = <K extends keyof HomePageContent>(
    section: K, 
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
      const { name, value } = e.target;
      setFormData(prev => {
        const currentSection = prev[section] ?? {};
        return {
            ...prev,
            [section]: {
                ...currentSection,
                [name]: value
            }
        }
      });
  };

  const handlePhoneChange = (index: number, value: string) => {
      setFormData(prev => {
          const contactData = prev.contact ?? { title: '', address: '', phone: [], email: '' };
          const newPhones = [...(contactData.phone || [])];
          newPhones[index] = value;
          return {
              ...prev,
              contact: { ...contactData, phone: newPhones }
          }
      });
  };
  const addPhoneField = () => {
       setFormData(prev => {
          const contactData = prev.contact ?? { title: '', address: '', phone: [], email: '' };
          const newPhones = [...(contactData.phone || []), ''];
          return {
              ...prev,
              contact: { ...contactData, phone: newPhones }
          }
       });
  };
  const removePhoneField = (index: number) => {
      setFormData(prev => {
          const contactData = prev.contact ?? { title: '', address: '', phone: [], email: '' };
          const newPhones = [...(contactData.phone || [])];
          newPhones.splice(index, 1);
          return {
              ...prev,
              contact: { ...contactData, phone: newPhones }
          }
      });
  };

  // Обработчик выбора файла для секции "О нас"
  const handleAboutImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
        const file = e.target.files[0];
        setAboutImageFile(file);
        // Генерируем URL для превью
        const reader = new FileReader();
        reader.onloadend = () => {
            setAboutImagePreview(reader.result as string);
        }
        reader.readAsDataURL(file);
    } else {
        setAboutImageFile(null);
        setAboutImagePreview(null);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    // Сохраняем ID старого изображения перед потенциальной перезаписью
    const oldPublicId = formData.about?.imagePublicId;
    let newImageUrl = formData.about?.image; // URL по умолчанию - текущий
    let newPublicId = formData.about?.imagePublicId; // ID по умолчанию - текущий

    try {
      // 1. Загрузка нового изображения (если выбрано)
      if (aboutImageFile) {
        console.log('Загрузка нового изображения для "О нас"...');
        const uploadFormData = new FormData();
        uploadFormData.append('image', aboutImageFile);
        // Добавим категорию или папку для порядка в Cloudinary
        uploadFormData.append('category', 'homepage'); 

        try {
            // Используем galleryService для загрузки, он возвращает { imageUrl, cloudinaryPublicId }
            const uploadedImage = await galleryService.uploadImage(uploadFormData);
            newImageUrl = uploadedImage.imageUrl; // Получаем новый URL
            newPublicId = uploadedImage.cloudinaryPublicId; // Получаем новый ID
            console.log('Изображение загружено:', newImageUrl, newPublicId);
            
            // 2. Удаление старого изображения (если оно было и новое загружено успешно)
            if (oldPublicId && oldPublicId !== newPublicId) {
              console.log('Удаление старого изображения:', oldPublicId);
              try {
                await galleryService.deleteImage(oldPublicId);
                console.log('Старое изображение удалено.');
              } catch (deleteError) {
                console.error("Ошибка удаления старого изображения из Cloudinary:", deleteError);
                toast.warn('Не удалось удалить старое изображение из хранилища.');
                // Не прерываем процесс, просто предупреждаем
              }
            }
            
            setAboutImageFile(null);
            setAboutImagePreview(null);
        } catch (uploadError) {
            console.error("Ошибка загрузки изображения:", uploadError);
            toast.error(`Не удалось загрузить изображение: ${uploadError instanceof Error ? uploadError.message : 'Ошибка сервера'}`);
            setIsSaving(false); // Прерываем сохранение, если загрузка не удалась
            return;
        }
      }

      // 3. Подготовка ВСЕХ данных для отправки
      const dataToSend: Partial<HomePageContent> = { ...formData };
      
      // Обновляем URL и ID изображения в секции 'about'
      if (dataToSend.about) {
          dataToSend.about.image = newImageUrl || '';
          dataToSend.about.imagePublicId = newPublicId || '';
      } else if (newImageUrl) { // Если секции about не было, но загрузили картинку
           dataToSend.about = { 
             title: '', 
             content: '', 
             image: newImageUrl,
             imagePublicId: newPublicId
           };
      }

      // Очищаем пустые телефоны в контактах
       if (dataToSend.contact?.phone) {
            dataToSend.contact.phone = dataToSend.contact.phone.filter(p => p && p.trim() !== '');
       }

      // 4. Отправка данных на бэкенд
      await homePageService.updateHomePageData(dataToSend);
      toast.success('Данные главной страницы успешно сохранены!');
      // Обновляем formData локально, чтобы отразить сохраненные URL/ID
      setFormData(dataToSend);

    } catch (err) {
      console.error("Ошибка сохранения данных главной страницы:", err);
      toast.error(`Ошибка сохранения: ${err instanceof Error ? err.message : 'Неизвестная ошибка'}`);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
        <EditorContainer style={{ textAlign: 'center', padding: '3rem' }}>
            <i className="fas fa-spinner"></i>
             Загрузка редактора...
        </EditorContainer>
    );
  }

  return (
    <EditorContainer>
      <EditorTitle>Редактирование главной страницы</EditorTitle>
      
      {/* --- Секция Баннер --- */}
      <SectionSubheader>Баннер</SectionSubheader>
      <FormGroup>
        <Label htmlFor="banner.title">Заголовок</Label>
        <Input id="banner.title" name="title" value={formData.banner?.title || ''} onChange={(e) => handleNestedChange('banner', e)} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="banner.subtitle">Подзаголовок</Label>
        <Input id="banner.subtitle" name="subtitle" value={formData.banner?.subtitle || ''} onChange={(e) => handleNestedChange('banner', e)} />
      </FormGroup>
       <FormGroup>
        <Label htmlFor="banner.buttonText">Текст кнопки</Label>
        <Input id="banner.buttonText" name="buttonText" value={formData.banner?.buttonText || ''} onChange={(e) => handleNestedChange('banner', e)} />
      </FormGroup>
       <FormGroup>
        <Label htmlFor="banner.buttonLink">Ссылка кнопки (напр., /booking)</Label>
        <Input id="banner.buttonLink" name="buttonLink" value={formData.banner?.buttonLink || ''} onChange={(e) => handleNestedChange('banner', e)} />
      </FormGroup>

      {/* --- Секция "О нас" --- */}
      <SectionSubheader>О нас</SectionSubheader>
       <FormGroup>
        <Label htmlFor="about.title">Заголовок</Label>
        <Input id="about.title" name="title" value={formData.about?.title || ''} onChange={(e) => handleNestedChange('about', e)} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="about.content">Текст</Label>
        <TextArea id="about.content" name="content" value={formData.about?.content || ''} onChange={(e) => handleNestedChange('about', e)} />
      </FormGroup>
       <FormGroup>
        <Label htmlFor="about.image">Изображение</Label>
        {/* Отображаем текущее или новое превью */} 
        {(aboutImagePreview || formData.about?.image) && (
            <ImagePreview src={aboutImagePreview || formData.about?.image} alt="Превью О нас" />
        )}
        <FileInput type="file" id="about.image.file" accept="image/*" onChange={handleAboutImageChange} />
        {/* Оставляем поле URL видимым для справки, но можно будет убрать */} 
        <Input 
            style={{marginTop: '1rem', opacity: 0.6}}
            id="about.image.url" 
            name="image" 
            value={formData.about?.image || ''} 
            onChange={(e) => handleNestedChange('about', e)} 
            placeholder="URL текущего изображения (будет обновлен при загрузке нового)" 
            readOnly // Делаем только для чтения
         />
      </FormGroup>
      
      {/* --- Секция Контакты --- */} 
      <SectionSubheader>Контактная информация</SectionSubheader>
      <FormGroup>
        <Label htmlFor="contact.title">Заголовок</Label>
        <Input id="contact.title" name="title" value={formData.contact?.title || ''} onChange={(e) => handleNestedChange('contact', e)} />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="contact.address">Адрес</Label>
        <Input id="contact.address" name="address" value={formData.contact?.address || ''} onChange={(e) => handleNestedChange('contact', e)} />
      </FormGroup>
      <FormGroup>
        <Label>Телефоны</Label>
        {(formData.contact?.phone || []).map((phone: string, index: number) => (
             <div key={index} style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <Input type="tel" value={phone} onChange={(e) => handlePhoneChange(index, e.target.value)} placeholder="+7 (XXX) XXX-XX-XX" />
                <button type="button" onClick={() => removePhoneField(index)} style={{ padding: '0.5rem', background:'#fdd' }}>-</button>
             </div>
        ))}
        <button type="button" onClick={addPhoneField} style={{ padding: '0.5rem' }}>+ Добавить телефон</button>
      </FormGroup>
       <FormGroup>
        <Label htmlFor="contact.email">Email</Label>
        <Input type="email" id="contact.email" name="email" value={formData.contact?.email || ''} onChange={(e) => handleNestedChange('contact', e)} />
      </FormGroup>

      {/* --- Кнопка Сохранения --- */}
      <SaveButtonContainer>
        <ActionButton 
            className="primary" 
            onClick={handleSave} 
            disabled={isSaving}
        >
            {isSaving ? 'Сохранение...' : 'Сохранить все изменения'}
        </ActionButton>
      </SaveButtonContainer>

    </EditorContainer>
  );
};

export default HomepageEditor; 
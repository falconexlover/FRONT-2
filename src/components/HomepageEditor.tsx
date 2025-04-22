import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { HomePageContent, BannerContent, AboutContent, ContactContent, PartyContent, ConferenceContent } from '../types/HomePage';
import { homePageService } from '../utils/api';
import ActionButton from './ui/ActionButton';
import ImageUpload from './ui/ImageUpload';
import MultiImageManager from './ui/MultiImageManager';

// --- Styled Components ---

const EditorWrapper = styled.div`
  padding: 0; // Основной контейнер без отступов
`;

const SectionCard = styled.section`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem 2rem;
  margin-bottom: 2rem;
  border: 1px solid var(--border-color);
`;

const SectionTitle = styled.h3`
  font-size: 1.5rem;
  color: var(--dark-color);
  margin: 0 0 1.5rem 0;
  padding-bottom: 0.75rem;
  border-bottom: 1px solid var(--border-color);
  font-family: 'Playfair Display', serif;
  font-weight: 600;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.9rem;
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  min-height: 120px;
  resize: vertical;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  transition: border-color 0.2s ease;

  &:focus {
    outline: none;
    border-color: var(--primary-color);
  }
`;

const PhoneInputGroup = styled.div`
    display: flex;
    align-items: center;
    gap: 0.5rem;
    margin-bottom: 0.5rem;
`;

const RemoveButton = styled.button`
    background: none;
    border: none;
    color: var(--danger-color);
    cursor: pointer;
    padding: 0.5rem;
    font-size: 1.2rem;
    line-height: 1;

    &:hover {
        opacity: 0.7;
    }
`;

const LoadingOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(255, 255, 255, 0.7);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 10;
`;

const SaveButtonContainer = styled.div`
  margin-top: 1rem;
  padding: 1rem 2rem;
  text-align: right;
  background-color: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: var(--radius-md);
  margin-top: -1rem;
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin-bottom: 1rem;
`;

// --- Helper Functions ---

// Helper to safely get nested properties
// Corrected function signature
const getNested = <T,>(obj: any, path: string, defaultValue: T): T => {
    // Split the path into parts
    const parts = path.split('.');
    // Reduce the path to find the value
    let current = obj;
    for (const part of parts) {
        if (current === null || current === undefined) {
            return defaultValue;
        }
        current = current[part];
    }
    // Return the found value or the default value if it's null/undefined
    return current ?? defaultValue;
};

// --- Component ---

interface HomepageEditorProps {
  onUnsavedChange?: (hasUnsaved: boolean) => void;
}
const HomepageEditor: React.FC<HomepageEditorProps> = ({ onUnsavedChange }) => {
  const [content, setContent] = useState<Partial<HomePageContent>>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Load initial data
  useEffect(() => {
    const loadData = async () => {
        setIsLoading(true);
      setError(null);
        try {
            const data = await homePageService.getHomePage();
        setContent(data || {});
        } catch (err) {
        const message = err instanceof Error ? err.message : 'Ошибка загрузки данных';
        setError(message);
        toast.error(message);
        console.error('Failed to load homepage data:', err);
        } finally {
            setIsLoading(false);
        }
    };
    loadData();
  }, []);

  // --- Handlers ---

  // Generic handler for simple text inputs within sections
  const handleInputChange = (section: keyof HomePageContent, field: string, value: string) => {
    setContent(prev => ({
        ...prev,
      [section]: {
        ...(prev[section] as any),
        [field]: value
      }
      }));
  };

  // Specific handler for contact phones (array)
  const handleContactPhoneChange = (index: number, value: string) => {
    setContent(prev => {
      const phones = [...getNested<string[]>(prev, 'contact.phone', [])];
      phones[index] = value;
      // Add a new empty input if the last one is filled
      if (index === phones.length - 1 && value !== '') {
          phones.push('');
          }
          return {
              ...prev,
              contact: { 
              ...getNested<ContactContent>(prev, 'contact', { title: '', address: '', phone: [] }),
              phone: phones.filter((p, i) => i < phones.length - 1 || p !== '') // Keep last only if not empty
          }
      };
      });
  };

   const handleRemoveContactPhone = (index: number) => {
    setContent(prev => {
      const phones = [...getNested<string[]>(prev, 'contact.phone', [])];
      phones.splice(index, 1);
      // Ensure there's always an empty input at the end if list is not empty
      if (phones.length === 0 || phones[phones.length - 1] !== '') {
        phones.push('');
          }
          return {
              ...prev,
          contact: {
              ...getNested<ContactContent>(prev, 'contact', { title: '', address: '', phone: [] }),
              phone: phones
          }
      };
      });
  };

  // Handlers for single image uploads (Banner, About)
  const handleSingleImageUpload = async (section: 'banner' | 'about', file: File | null) => {
    if (!file) return; // Выходим, если файл не выбран
    setIsSaving(true); // Indicate activity
    try {
      const updatedContent = await homePageService.uploadHomePageImage(file, section);
      if (updatedContent && updatedContent[section]) {
        setContent(prev => ({
          ...prev,
          [section]: updatedContent[section] // Update section with new image URL from response
        }));
        toast.success(`Изображение для "${section}" загружено.`);
      } else {
          throw new Error('Не удалось обновить контент после загрузки изображения');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка загрузки изображения';
      toast.error(message);
      console.error(`Failed to upload image for ${section}:`, err);
    } finally {
      setIsSaving(false);
    }
  };

  // Handlers for multi-image sections (Conference, Party)
  const handleMultiImageAdd = async (section: 'conference' | 'party', file: File) => {
    setIsSaving(true);
    try {
      const updatedSection = await homePageService.addHomePageSectionImage(file, section);
      if (updatedSection) {
        setContent(prev => ({
          ...prev,
          [section]: updatedSection // Update section with new image list
        }));
        toast.success(`Изображение добавлено в "${section}".`);
      } else {
           throw new Error('Не удалось обновить контент после добавления изображения');
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка добавления изображения';
      toast.error(message);
      console.error(`Failed to add image for ${section}:`, err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleMultiImageDelete = async (section: 'conference' | 'party', publicId: string) => {
    setIsSaving(true);
    try {
      const updatedSection = await homePageService.deleteHomePageSectionImage(publicId, section);
       if (updatedSection) {
        setContent(prev => ({
          ...prev,
          [section]: updatedSection // Update section with new image list
        }));
         toast.success(`Изображение удалено из "${section}".`);
       } else {
           throw new Error('Не удалось обновить контент после удаления изображения');
       }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка удаления изображения';
      toast.error(message);
      console.error(`Failed to delete image for ${section}:`, err);
    } finally {
      setIsSaving(false);
    }
  };


  // Handle final save (text content primarily)
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      // Prepare data - ensure all sections exist even if empty
      const dataToSave: Partial<HomePageContent> = {
        banner: getNested<BannerContent>(content, 'banner', { title: '', subtitle: '', buttonText: '', buttonLink: '' }),
        about: getNested<AboutContent>(content, 'about', { title: '', content: '', image: content.about?.image }), // Preserve image
        contact: getNested<ContactContent>(content, 'contact', { title: '', address: '', phone: [] }),
        party: getNested<PartyContent>(content, 'party', { title: '', content: '', imageUrls: content.party?.imageUrls, cloudinaryPublicIds: content.party?.cloudinaryPublicIds }), // Preserve images
        conference: getNested<ConferenceContent>(content, 'conference', { title: '', content: '', imageUrls: content.conference?.imageUrls, cloudinaryPublicIds: content.conference?.cloudinaryPublicIds }), // Preserve images
        // Exclude rooms and services as they might be managed elsewhere
      };

      await homePageService.updateHomePageData(dataToSave);
      toast.success('Данные главной страницы сохранены!');
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ошибка сохранения данных';
      setError(message);
      toast.error(message);
      console.error('Failed to save homepage data:', err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Render ---

  if (isLoading) {
    return <EditorWrapper>Загрузка редактора...</EditorWrapper>; // Simple loading state
  }

  if (error && !content) { // Show error only if loading failed completely
      return <EditorWrapper><ErrorMessage>{error}</ErrorMessage></EditorWrapper>;
  }

  return (
    <EditorWrapper>
        {isSaving && <LoadingOverlay>Сохранение...</LoadingOverlay>}
        {error && <ErrorMessage>{error}</ErrorMessage>}

      {/* Banner Section */}
      <SectionCard>
        <SectionTitle>Баннер</SectionTitle>
        <FormGroup>
          <Label>Заголовок</Label>
          <TextArea
            value={getNested<string>(content, 'banner.title', '')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('banner', 'title', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Подзаголовок</Label>
          <TextArea
            value={getNested<string>(content, 'banner.subtitle', '')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('banner', 'subtitle', e.target.value)}
          />
        </FormGroup>
         <FormGroup>
          <Label>Текст кнопки</Label>
          <Input
            type="text"
            value={getNested<string>(content, 'banner.buttonText', '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('banner', 'buttonText', e.target.value)}
          />
        </FormGroup>
         <FormGroup>
          <Label>Ссылка кнопки (напр., /rooms)</Label>
          <Input
            type="text"
            value={getNested<string>(content, 'banner.buttonLink', '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('banner', 'buttonLink', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Изображение баннера</Label>
          <ImageUpload
            currentImageUrl={getNested<string | undefined>(content, 'banner.image', undefined)}
            onFileSelect={(file: File | null) => handleSingleImageUpload('banner', file)}
            uploadTriggerText="Загрузить/заменить изображение"
          />
        </FormGroup>
      </SectionCard>

      {/* About Section */}
      <SectionCard>
        <SectionTitle>О нас</SectionTitle>
        <FormGroup>
          <Label>Заголовок</Label>
          <Input
            type="text"
            value={getNested<string>(content, 'about.title', '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('about', 'title', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Описание</Label>
          <TextArea
            value={getNested<string>(content, 'about.content', '')}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('about', 'content', e.target.value)}
          />
        </FormGroup>
       <FormGroup>
          <Label>Изображение "О нас"</Label>
          <ImageUpload
            currentImageUrl={getNested<string | undefined>(content, 'about.image', undefined)}
            onFileSelect={(file: File | null) => handleSingleImageUpload('about', file)}
            uploadTriggerText="Загрузить/заменить изображение"
          />
       </FormGroup>
      </SectionCard>

      {/* Conference Section */}
      <SectionCard>
          <SectionTitle>Конференц-зал (на главной)</SectionTitle>
          <FormGroup>
              <Label>Заголовок</Label>
              <Input
                  type="text"
                  value={getNested<string>(content, 'conference.title', '')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('conference', 'title', e.target.value)}
              />
          </FormGroup>
          <FormGroup>
              <Label>Описание</Label>
              <TextArea
                  value={getNested<string>(content, 'conference.content', '')}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('conference', 'content', e.target.value)}
              />
          </FormGroup>
           <FormGroup>
              <Label>Изображения конференц-зала</Label>
              <MultiImageManager
                  imageUrls={getNested<string[]>(content, 'conference.imageUrls', [])}
                  publicIds={getNested<string[]>(content, 'conference.cloudinaryPublicIds', [])}
                  onAdd={(file: File) => handleMultiImageAdd('conference', file)}
                  onDelete={(publicId: string) => handleMultiImageDelete('conference', publicId)}
              />
          </FormGroup>
      </SectionCard>

       {/* Party Section */}
       <SectionCard>
          <SectionTitle>Детские праздники (на главной)</SectionTitle>
          <FormGroup>
              <Label>Заголовок</Label>
              <Input
                  type="text"
                  value={getNested<string>(content, 'party.title', '')}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('party', 'title', e.target.value)}
              />
          </FormGroup>
          <FormGroup>
              <Label>Описание</Label>
              <TextArea
                  value={getNested<string>(content, 'party.content', '')}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange('party', 'content', e.target.value)}
              />
          </FormGroup>
          <FormGroup>
              <Label>Изображения для детских праздников</Label>
              <MultiImageManager
                  imageUrls={getNested<string[]>(content, 'party.imageUrls', [])}
                  publicIds={getNested<string[]>(content, 'party.cloudinaryPublicIds', [])}
                  onAdd={(file: File) => handleMultiImageAdd('party', file)}
                  onDelete={(publicId: string) => handleMultiImageDelete('party', publicId)}
              />
          </FormGroup>
      </SectionCard>

      {/* Contact Section */}
      <SectionCard>
        <SectionTitle>Контакты</SectionTitle>
        <FormGroup>
          <Label>Заголовок (напр., "Свяжитесь с нами")</Label>
          <Input
            type="text"
            value={getNested<string>(content, 'contact.title', '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contact', 'title', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Адрес</Label>
          <Input
            type="text"
            value={getNested<string>(content, 'contact.address', '')}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleInputChange('contact', 'address', e.target.value)}
          />
        </FormGroup>
        <FormGroup>
          <Label>Телефоны</Label>
          {getNested<string[]>(content, 'contact.phone', ['']).map((phone, index) => ( // Ensure at least one empty string
              <PhoneInputGroup key={index}>
                 <Input
                      type="tel"
                      value={phone}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleContactPhoneChange(index, e.target.value)}
                      placeholder="+7 (XXX) XXX-XX-XX"
                  />
                  {/* Не удаляем последний (пустой) инпут */}
                  {index < getNested<string[]>(content, 'contact.phone', []).length - 1 && (
                      <RemoveButton type="button" onClick={() => handleRemoveContactPhone(index)}>
                          <i className="fas fa-times"></i>
                      </RemoveButton>
                  )}
              </PhoneInputGroup>
          ))}
          {/* Conditional rendering for empty state removed as we ensure one empty string above */}
        </FormGroup>
      </SectionCard>
      
      <SaveButtonContainer>
        <ActionButton 
          className="primary" 
          onClick={handleSave} 
          disabled={isSaving || isLoading}
        >
          {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
          </ActionButton>
      </SaveButtonContainer>

    </EditorWrapper>
  );
};

export default HomepageEditor;
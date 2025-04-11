import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ActionButton from '../../ui/ActionButton';
import { homePageService } from '../../../utils/api';
import { LoadingSpinner } from '../../AdminPanel';
import ImageUploadList from '../../ui/ImageUploadList';
import { HomePageContent } from '../../../types/HomePage';

// Стили можно будет взять из других редакторов
const EditorWrapper = styled.div`
  padding: 2rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-lg);
  border: 1px solid var(--border-color);
`;

const Title = styled.h2`
  margin-top: 0;
  margin-bottom: 2rem;
  color: var(--text-primary);
  border-bottom: 1px solid var(--border-color);
  padding-bottom: 1rem;
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  color: var(--text-secondary);
  font-size: 0.9rem;
  font-weight: 500;
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
  &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-primary);
  color: var(--text-primary);
   &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;

const PartyPageEditor: React.FC = () => {
  const [content, setContent] = useState<HomePageContent['party'] | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Загрузка данных для страницы Детские праздники...");
        const homeData = await homePageService.getHomePage(); 
        if (homeData && homeData.party) {
          setContent(homeData.party);
        } else {
          setContent({ title: 'Детские праздники', content: '', imageUrls: [], cloudinaryPublicIds: [] });
        }
      } catch (err) {
        setError("Ошибка загрузки данных страницы.");
        toast.error("Ошибка загрузки данных страницы.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadData();
  }, []);

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    const { name, value } = e.target;
    setContent(prev => prev ? { ...prev, [name]: value } : null);
  };

  const handleImageUpload = async (file: File) => {
    setIsSaving(true);
    try {
      const updatedSection = await homePageService.addHomePageSectionImage(file, 'party');
      if (updatedSection) {
        setContent(updatedSection);
        toast.success("Изображение добавлено!");
      } else {
          throw new Error("Не удалось обновить секцию после загрузки изображения");
      }
    } catch (err) {
      console.error("Ошибка загрузки изображения:", err);
      toast.error("Не удалось загрузить изображение.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleImageDelete = async (publicId: string) => {
    setIsSaving(true);
    try {
      const updatedSection = await homePageService.deleteHomePageSectionImage(publicId, 'party');
      if (updatedSection) {
        setContent(updatedSection);
        toast.success("Изображение удалено.");
      } else {
           throw new Error("Не удалось обновить секцию после удаления изображения");
      }
    } catch (err) {
      console.error("Ошибка удаления изображения:", err);
      toast.error("Не удалось удалить изображение.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleSave = async () => {
    if (!content) return;
    setIsSaving(true);
    setError(null);
    try {
      console.log("Сохранение данных для 'party':", content);
      await homePageService.updateHomePageData({ party: content }); 
      toast.success("Данные страницы сохранены!");
    } catch (err) {
      setError("Ошибка сохранения данных.");
      toast.error("Ошибка сохранения данных.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading || !content) {
    return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка редактора...</LoadingSpinner>;
  }

  return (
    <EditorWrapper>
      <Title>Редактирование страницы "Детские праздники"</Title>

      {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

      <FormGroup>
        <Label htmlFor="title">Заголовок страницы</Label>
        <Input 
          type="text"
          id="title"
          name="title"
          value={content.title || ''}
          onChange={handleContentChange}
          disabled={isSaving}
        />
      </FormGroup>

      <FormGroup>
        <Label htmlFor="content">Описание страницы</Label>
        <TextArea 
          id="content"
          name="content"
          value={content.content || ''}
          onChange={handleContentChange}
          rows={6}
          disabled={isSaving}
        />
      </FormGroup>

      <FormGroup>
        <Label>Изображения</Label>
        <ImageUploadList 
          imageUrls={content.imageUrls || []}
          cloudinaryPublicIds={content.cloudinaryPublicIds || []}
          onUpload={handleImageUpload}
          onDelete={handleImageDelete}
          disabled={isSaving}
          folderHint="party"
        />
      </FormGroup>

      <ActionButton 
        className="primary" 
        onClick={handleSave} 
        disabled={isSaving || !content}
        style={{ marginTop: '2rem' }}
      >
        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
      </ActionButton>

    </EditorWrapper>
  );
};

export default PartyPageEditor; 
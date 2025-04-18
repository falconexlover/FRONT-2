import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { ArticleType, ContentBlock, IntroBlock, SectionBlock, ConclusionBlock } from '../../types/Article';
import ActionButton from '../ui/ActionButton';
import ImageUpload from '../ui/ImageUpload';
import { v4 as uuidv4 } from 'uuid';
import { articleService } from '../../utils/api';

// Стили для формы
const FormWrapper = styled.div`
  background-color: var(--bg-primary);
  padding: 2rem;
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
  margin-bottom: 2rem;
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

const Input = styled.input`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: var(--bg-input);
  color: var(--text-primary);
  &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;

// Используем тот же TextArea для блоков
const TextArea = styled.textarea`
  width: 100%;
  padding: 0.8rem 1rem;
  border: 1px solid var(--border-color);
  border-radius: var(--radius-sm);
  font-size: 1rem;
  min-height: 100px; // Меньше по умолчанию для блоков
  resize: vertical;
  background-color: var(--bg-input);
  color: var(--text-primary);
  &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(42, 167, 110, 0.3);
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
`;

const AddBlockButtons = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 2rem;
  flex-wrap: wrap;
`;

const BlockWrapper = styled.div`
  border: 1px dashed var(--border-color-light);
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  border-radius: var(--radius-sm);
  position: relative; // Для кнопки удаления
`;

const BlockHeader = styled.div`
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 1rem;
    padding-bottom: 0.5rem;
    border-bottom: 1px solid var(--border-color-light);
`;

const BlockTitle = styled.h4`
    margin: 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    text-transform: uppercase;
`;

const DeleteButton = styled.button`
    background: none;
    border: none;
    color: var(--danger-color);
    cursor: pointer;
    font-size: 1.1rem;
    padding: 0.2rem;
    line-height: 1;
    opacity: 0.7;
    transition: opacity 0.2s ease;

    &:hover {
        opacity: 1;
    }
`;

// --- Компонент формы ---
interface ArticleFormProps {
  initialData?: ArticleType | null;
  // onSave теперь ожидает Partial<ArticleType>, который будет включать contentBlocks
  onSave: (articleData: Partial<ArticleType>) => Promise<void>;
  onCancel: () => void;
}

const ArticleForm: React.FC<ArticleFormProps> = ({ initialData, onSave, onCancel }) => {
  // Состояние для основных полей
  const [formData, setFormData] = useState<Partial<ArticleType>>({});
  // Один intro-блок для простого текста
  const [introText, setIntroText] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        _id: initialData._id,
        title: initialData.title || '',
        imageUrl: initialData.imageUrl,
        imagePublicId: initialData.imagePublicId,
      });
      // Если есть блоки, ищем первый intro
      const intro = initialData.contentBlocks?.find(b => b.type === 'intro') as IntroBlock | undefined;
      setIntroText(intro?.text || '');
    } else {
      setFormData({
        title: '',
      });
      setIntroText('');
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setIntroText(e.target.value);
  };

  const handleImageChange = async (file: File | null) => {
    if (isSaving) return;
    const articleId = formData._id;
    if (file) {
      if (!articleId) {
        toast.error("Сначала нужно сохранить статью, чтобы загрузить изображение.");
        return;
      }
      setIsSaving(true);
      try {
        const updatedArticle = await articleService.uploadArticleImage(articleId, file);
        setFormData(prev => ({
            ...prev,
            imageUrl: updatedArticle.imageUrl,
            imagePublicId: updatedArticle.imagePublicId
        }));
        toast.success("Изображение загружено.");
      } catch (err: any) {
        toast.error(`Ошибка загрузки изображения: ${err.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Удаление изображения
      setFormData(prev => ({ ...prev, imageUrl: undefined, imagePublicId: undefined }));
      toast.info("Изображение будет удалено при следующем сохранении (нужен API endpoint).");
    }
  };

  const handleSaveClick = async () => {
    if (!formData.title) {
        toast.error("Заголовок статьи обязателен.");
        return;
    }
    if (!introText.trim()) {
        toast.error("Текст статьи обязателен.");
        return;
    }
    setIsSaving(true);
    try {
      await onSave({
        ...formData,
        text: introText,
        contentBlocks: [
          { type: 'intro', text: introText }
        ]
      } as any);
    } catch (error) {
      console.error("Ошибка при вызове onSave:", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <FormWrapper style={{ maxWidth: 700, margin: '0 auto' }}>
      <FormGroup>
        <Label htmlFor="title">Заголовок*</Label>
        <Input
          type="text"
          id="title"
          name="title"
          value={formData.title || ''}
          onChange={handleChange}
          disabled={isSaving}
          required
        />
      </FormGroup>
      <FormGroup>
        <Label htmlFor="introText">Текст*</Label>
        <TextArea
          id="introText"
          name="introText"
          rows={8}
          value={introText}
          onChange={handleTextChange}
          disabled={isSaving}
          required
        />
      </FormGroup>
      <FormGroup>
        <Label>Изображение статьи</Label>
        <ImageUpload
          currentImageUrl={formData.imageUrl}
          onFileSelect={handleImageChange}
          uploadTriggerText="Заменить"
        />
        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Загрузите заглавное изображение для статьи.
        </p>
      </FormGroup>
      <ButtonGroup>
        <ActionButton type="button" onClick={handleSaveClick} disabled={isSaving} className="primary" style={{ fontSize: '1.2rem', padding: '1rem 2.5rem', minWidth: 220 }}>
          {isSaving ? 'Сохранение...' : 'Опубликовать'}
        </ActionButton>
      </ButtonGroup>
    </FormWrapper>
  );
};

export default ArticleForm; 
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ActionButton from '../../ui/ActionButton';
import { pageService } from '../../../utils/api';
import { LoadingSpinner } from '../../AdminPanel';

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

const FeaturesList = styled.ul`
  list-style: none;
  padding: 0;
  margin-top: 0.5rem;
`;

const FeatureItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.5rem 0;
  border-bottom: 1px dashed var(--border-color-light);
  font-size: 0.95rem;

  &:last-child {
    border-bottom: none;
  }
`;

const RemoveButton = styled.button`
  background: none;
  border: none;
  color: var(--danger-color);
  cursor: pointer;
  font-size: 1.2rem;
  padding: 0.2rem 0.5rem;
  line-height: 1;
  &:hover { color: var(--danger-dark); }
`;

const AddFeatureWrapper = styled.div`
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
`;

// Используем тот же интерфейс, что и для ConferencePage
interface PageContent {
  description: string;
  features: string[];
  // Можно добавить другие поля, если нужно для этой страницы
}

const PartyPageEditor: React.FC = () => {
  const [content, setContent] = useState<PageContent>({ description: '', features: [] });
  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // --- Загрузка данных для 'party' ---
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Загрузка данных для страницы Детские праздники...");
        const data = await pageService.getPageContent('party');
        if (data && data.content && typeof data.content === 'object') {
          setContent({
            description: data.content.description || '',
            features: Array.isArray(data.content.features) ? data.content.features : []
          });
        } else {
          setContent({ description: '', features: [] });
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

  // --- Обработчики изменений (копируем) ---
  const handleDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(prev => ({ ...prev, description: e.target.value }));
  };

  const handleAddFeature = () => {
    if (newFeature.trim()) {
      setContent(prev => ({ ...prev, features: [...prev.features, newFeature.trim()] }));
      setNewFeature('');
    }
  };

  const handleRemoveFeature = (indexToRemove: number) => {
    setContent(prev => ({ 
        ...prev, 
        features: prev.features.filter((_, index) => index !== indexToRemove)
    }));
  };

  // --- Сохранение данных для 'party' ---
  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      console.log("Сохранение данных для 'party':", content);
      await pageService.updatePageContent('party', content); // Используем pageId 'party'
      toast.success("Данные страницы сохранены!");
    } catch (err) {
      setError("Ошибка сохранения данных.");
      toast.error("Ошибка сохранения данных.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  // --- JSX (копируем и меняем заголовок) ---
  if (isLoading) {
    return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка редактора...</LoadingSpinner>;
  }

  return (
    <EditorWrapper>
      <Title>Редактирование страницы "Детские праздники"</Title>

      {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

      <FormGroup>
        <Label htmlFor="description">Описание страницы</Label>
        <TextArea 
          id="description"
          name="description"
          value={content.description}
          onChange={handleDescriptionChange}
          rows={6}
          disabled={isSaving}
        />
      </FormGroup>

      <FormGroup>
        <Label>Что предлагаем (список)</Label>
        <FeaturesList>
          {content.features.map((feature, index) => (
            <FeatureItem key={index}>
              <span>{feature}</span>
              <RemoveButton 
                onClick={() => handleRemoveFeature(index)}
                disabled={isSaving}
                title="Удалить пункт"
              >
                &times;
              </RemoveButton>
            </FeatureItem>
          ))}
        </FeaturesList>
        <AddFeatureWrapper>
          <Input 
            type="text"
            id="newFeature"
            name="newFeature"
            value={newFeature}
            onChange={(e) => setNewFeature(e.target.value)}
            placeholder="Новый пункт"
            disabled={isSaving}
          />
          <ActionButton className="outline-dark" onClick={handleAddFeature} disabled={!newFeature.trim() || isSaving}>
            Добавить
          </ActionButton>
        </AddFeatureWrapper>
      </FormGroup>
      
      {/* TODO: Добавить загрузчик изображений */}

      <ActionButton 
        className="primary" 
        onClick={handleSave} 
        disabled={isSaving}
        style={{ marginTop: '2rem' }}
      >
        {isSaving ? 'Сохранение...' : 'Сохранить изменения'}
      </ActionButton>

    </EditorWrapper>
  );
};

export default PartyPageEditor; 
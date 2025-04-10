import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ActionButton from '../../ui/ActionButton'; // Уточняем путь к ActionButton
import { pageService } from '../../../utils/api';
import { LoadingSpinner } from '../../AdminPanel'; // Импортируем спиннер

// Стили (можно доработать, взяв из RoomForm или EditServicesForm)
const EditorWrapper = styled.div`
  padding: 2rem;
  background-color: var(--bg-secondary); // Используем вторичный фон для редактора
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

// --- Компонент редактора --- 

interface PageContent {
  description: string;
  features: string[];
}

const ConferencePageEditor: React.FC = () => {
  const [content, setContent] = useState<PageContent>({ description: '', features: [] });
  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Загрузка данных для страницы Конференц-зал...");
        const data = await pageService.getPageContent('conference');
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

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    try {
      console.log("Сохранение данных:", content);
      await pageService.updatePageContent('conference', content);
      toast.success("Данные страницы сохранены!");
    } catch (err) {
      setError("Ошибка сохранения данных.");
      toast.error("Ошибка сохранения данных.");
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка редактора...</LoadingSpinner>;
  }

  return (
    <EditorWrapper>
      <Title>Редактирование страницы "Конференц-зал"</Title>

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
        <Label>Преимущества (список)</Label>
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
            placeholder="Новое преимущество"
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

export default ConferencePageEditor; 
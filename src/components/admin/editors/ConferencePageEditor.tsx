import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import ActionButton from '../../ui/ActionButton'; // Уточняем путь к ActionButton
import { pageService } from '../../../utils/api';
import { LoadingSpinner } from '../../AdminPanel'; // Импортируем спиннер
// Исправляем путь импорта
import { SectionImageManager } from '../../homepageEditor/SectionImageManager'; 

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
  imageUrls?: string[]; // Добавляем поле для URL изображений
  cloudinaryPublicIds?: string[]; // Добавляем поле для Public ID
}

const ConferencePageEditor: React.FC = () => {
  const [content, setContent] = useState<PageContent>({ description: '', features: [], imageUrls: [], cloudinaryPublicIds: [] });
  const [newFeature, setNewFeature] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Состояния для управления изображениями
  const [newFiles, setNewFiles] = useState<File[]>([]);
  const [imagesToDelete, setImagesToDelete] = useState<{ url: string, publicId: string | null }[]>([]);

  const PAGE_ID = 'conference'; // Константа для ID страницы

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        console.log("Загрузка данных для страницы Конференц-зал...");
        const data = await pageService.getPageContent(PAGE_ID);
        if (data && data.content && typeof data.content === 'object') {
          setContent({
            description: data.content.description || '',
            features: Array.isArray(data.content.features) ? data.content.features : [],
            // Инициализируем изображения
            imageUrls: Array.isArray(data.content.imageUrls) ? data.content.imageUrls : [],
            cloudinaryPublicIds: Array.isArray(data.content.cloudinaryPublicIds) ? data.content.cloudinaryPublicIds : []
          });
        } else {
          setContent({ description: '', features: [], imageUrls: [], cloudinaryPublicIds: [] });
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

  // --- Обработчики изображений --- 
  const handleFilesChange = useCallback((files: File[]) => {
    setNewFiles(files);
  }, []);

  const handleExistingDelete = useCallback((image: { url: string, publicId: string | null }) => {
    setImagesToDelete(prev => [...prev, image]);
    // Оптимистичное удаление из стейта для отображения
    setContent(prev => ({
        ...prev,
        imageUrls: prev.imageUrls?.filter(url => url !== image.url),
        cloudinaryPublicIds: prev.cloudinaryPublicIds?.filter(id => id !== image.publicId)
    }));
  }, []);
  // ------------------------------

  const handleSave = async () => {
    setIsSaving(true);
    setError(null);
    let latestContent = { ...content }; // Сохраняем текущее состояние

    try {
        const uploadPromises: Promise<any>[] = [];

        // 1. Удаление изображений
        imagesToDelete.forEach(image => {
            if (image.publicId) {
                uploadPromises.push(
                    // Вызываем (заглушку) API для удаления
                    pageService.deletePageImage(PAGE_ID, image.publicId)
                        .then(updatedPage => {
                            // Обновляем content, если API вернул обновленные данные
                            if(updatedPage?.content) latestContent = updatedPage.content;
                        })
                        .catch(err => {
                            console.error(`Ошибка удаления изображения ${image.publicId}:`, err);
                            toast.error(`Не удалось удалить изображение: ${image.url}`);
                        })
                );
            } else {
                 console.warn('Попытка удалить изображение без publicId:', image.url);
            }
        });

        // 2. Загрузка новых изображений
        newFiles.forEach(file => {
             uploadPromises.push(
                 // Вызываем (заглушку) API для добавления
                 pageService.addPageImage(PAGE_ID, file)
                     .then(updatedPage => {
                         // Обновляем content
                         if(updatedPage?.content) latestContent = updatedPage.content;
                     })
                    .catch(err => {
                        console.error(`Ошибка загрузки изображения ${file.name}:`, err);
                        toast.error(`Не удалось загрузить изображение: ${file.name}`);
                    })
            );
        });
        
        // Выполняем операции с изображениями
        await Promise.all(uploadPromises);

        // 3. Сохраняем основной контент (текст, features и, возможно, обновленные списки imageUrls/publicIds из latestContent)
        // Убедимся, что отправляем актуальные данные после операций с фото
        const contentToSend = { 
            description: latestContent.description, 
            features: latestContent.features, 
            imageUrls: latestContent.imageUrls, 
            cloudinaryPublicIds: latestContent.cloudinaryPublicIds 
        };

        const result = await pageService.updatePageContent(PAGE_ID, contentToSend);
        
        // Обновляем стейт окончательными данными из ответа API
        if (result && result.content && typeof result.content === 'object') {
             setContent({
                 description: result.content.description || '',
                 features: Array.isArray(result.content.features) ? result.content.features : [],
                 imageUrls: Array.isArray(result.content.imageUrls) ? result.content.imageUrls : [],
                 cloudinaryPublicIds: Array.isArray(result.content.cloudinaryPublicIds) ? result.content.cloudinaryPublicIds : []
             });
        } else {
            // Если ответ некорректный, можно оставить latestContent или показать ошибку
            setContent(latestContent);
            console.warn("Некорректный ответ от API после updatePageContent");
        }

        // Сбрасываем временные состояния
        setNewFiles([]);
        setImagesToDelete([]);
        toast.success("Данные страницы сохранены!");

    } catch (err: any) { // Ловим ошибки от заглушек API или updatePageContent
      setError(`Ошибка сохранения: ${err.message || 'Неизвестная ошибка'}`);
      toast.error(`Ошибка сохранения: ${err.message || 'Неизвестная ошибка'}`);
      console.error(err);
      // Возвращаем контент к состоянию до начала сохранения, если были ошибки
      setContent(latestContent); 
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
      
      {/* Добавляем SectionImageManager */}
      <FormGroup style={{marginTop: '2rem'}}>
          <SectionImageManager
              label="Изображения для страницы"
              existingImages={content.imageUrls?.map((url, index) => ({ 
                  url,
                  publicId: content.cloudinaryPublicIds?.[index] ?? null 
              })) ?? []}
              newFiles={newFiles}
              onFilesChange={handleFilesChange}
              onExistingDelete={handleExistingDelete}
              isLoading={isSaving}
            />
      </FormGroup>

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
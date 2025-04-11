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
  const [formData, setFormData] = useState<Partial<Omit<ArticleType, 'contentBlocks'>>>({});
  // Состояние для блоков контента
  const [contentBlocks, setContentBlocks] = useState<ContentBlock[]>([]);
  // Состояние для файла изображения - удаляем
  // const [imageFile, setImageFile] = useState<File | null>(null); // <<< Удаляем неиспользуемое состояние
  const [isSaving, setIsSaving] = useState(false);

  // Инициализация формы при загрузке или изменении initialData
  useEffect(() => {
    if (initialData) {
      const { contentBlocks: initialBlocks, ...restData } = initialData;
      setFormData({
        _id: restData._id,
        title: restData.title || '',
        excerpt: restData.excerpt || '',
        author: restData.author || '',
        imageUrl: restData.imageUrl,
        imagePublicId: restData.imagePublicId,
        slug: restData.slug, // Переносим slug, если он есть
        createdAt: restData.createdAt, // Даты тоже могут быть нужны
        updatedAt: restData.updatedAt,
      });
      // Добавляем временные _id к блокам, если их нет (для ключей React)
      setContentBlocks(initialBlocks?.map(block => ({ ...block, _id: block._id || uuidv4() })) || []);
      // setImageFile(null); // <<< Удаляем
    } else {
      // Сброс для новой статьи
      setFormData({
        title: '',
        excerpt: '',
        author: 'Администратор',
      });
      setContentBlocks([]); // Начинаем с пустых блоков
      // setImageFile(null); // <<< Удаляем
    }
  }, [initialData]);

  // Обработчик для основных полей ввода
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // --- Управление блоками ---

  const addBlock = useCallback((type: 'intro' | 'section' | 'conclusion') => {
    let newBlock: ContentBlock;
    const blockId = uuidv4(); // Генерируем ID здесь

    switch (type) {
      case 'intro':
        newBlock = { _id: blockId, type: 'intro', text: '' };
        break;
      case 'section':
        newBlock = { _id: blockId, type: 'section', title: '', mythText: '', explanationText: '' };
        break;
      case 'conclusion':
        newBlock = { _id: blockId, type: 'conclusion', text: '' };
        break;
      default:
        return; // Неизвестный тип
    }
    setContentBlocks(prev => [...prev, newBlock]);
  }, []);

  const updateBlock = useCallback((blockId: string, field: string, value: string) => {
    setContentBlocks(prevBlocks =>
      prevBlocks.map(block => {
        if (block._id === blockId) {
          // Убедимся, что field существует в этом типе блока
          if (field in block) {
             return { ...block, [field]: value };
          }
        }
        return block;
      })
    );
  }, []);

  const deleteBlock = useCallback((blockId: string) => {
    setContentBlocks(prevBlocks => prevBlocks.filter(block => block._id !== blockId));
  }, []);

  // --- НОВОЕ Управление изображением (Немедленное действие) ---
  const handleImageChange = async (file: File | null) => {
    if (isSaving) return;

    const articleId = formData._id;

    if (file) {
      // Загрузка нового изображения
      if (!articleId) {
        toast.error("Сначала нужно сохранить статью, чтобы загрузить изображение.");
        return;
      }
      setIsSaving(true);
      try {
        const updatedArticle = await articleService.uploadArticleImage(articleId, file);
        setFormData(prev => ({ // Обновляем данные из ответа API
            ...prev,
            imageUrl: updatedArticle.imageUrl,
            imagePublicId: updatedArticle.imagePublicId
        }));
        // setImageFile(null); // <<< Удаляем
        toast.success("Изображение загружено.");
      } catch (err: any) {
        toast.error(`Ошибка загрузки изображения: ${err.message}`);
      } finally {
        setIsSaving(false);
      }
    } else {
      // Удаление существующего изображения
      const currentPublicId = formData.imagePublicId;
      if (articleId && currentPublicId) {
          // Вызываем API для удаления
          // TODO: Создать и использовать articleService.deleteArticleImage(articleId, currentPublicId)
          // Пока просто очищаем локально и выводим предупреждение
          console.warn("API для удаления изображения статьи еще не реализовано.");
          setFormData(prev => ({ ...prev, imageUrl: undefined, imagePublicId: undefined }));
          toast.info("Изображение будет удалено при следующем сохранении (нужен API endpoint).");
          // setImageFile(null); // <<< Удаляем
          // setIsSaving(true);
          // try {
          //   // const updatedArticle = await articleService.deleteArticleImage(articleId, currentPublicId);
          //   // setFormData(prev => ({ ...prev, imageUrl: undefined, imagePublicId: undefined }));
          //   // toast.success("Изображение удалено.");
          // } catch (err: any) {
          //   toast.error(`Ошибка удаления изображения: ${err.message}`);
          // } finally {
          //   setIsSaving(false);
          // }
      } else {
          // Просто убираем превью, если удаляется еще не загруженный файл
          setFormData(prev => ({ ...prev, imageUrl: undefined, imagePublicId: undefined }));
          // setImageFile(null); // <<< Удаляем
      }
    }
  };

  // --- Сохранение (только текст и блоки) ---
  const handleSaveClick = async () => {
    if (!formData.title) {
        toast.error("Заголовок статьи обязателен.");
        return;
    }
    if (contentBlocks.length === 0) {
        toast.warn("Статья не содержит контента. Добавьте хотя бы один блок.");
        // Можно разрешить сохранять пустые статьи, убрав return
        return;
    }

    setIsSaving(true);
    try {
      const blocksToSave = contentBlocks.map(({ _id, ...rest }) => rest);
      // Убираем поля изображения из основных данных, т.к. они управляются отдельно
      const { imageUrl, imagePublicId, ...textData } = formData;
      const articleDataToSave: Partial<ArticleType> = {
        ...textData,
        contentBlocks: blocksToSave as any
      };

      // Передаем только текстовые данные, без файла
      await onSave(articleDataToSave);
      // Нет необходимости очищать форму здесь, это делает родитель
    } catch (error) {
      console.error("Ошибка при вызове onSave:", error);
    } finally {
      setIsSaving(false);
    }
  };

  // --- Рендер компонента ---
  return (
    <FormWrapper>
      {/* Основные поля статьи */}
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
        <Label htmlFor="excerpt">Отрывок (Excerpt)</Label>
        <TextArea
          id="excerpt"
          name="excerpt"
          rows={3}
          value={formData.excerpt || ''}
          onChange={handleChange}
          disabled={isSaving}
        />
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
          Короткое описание для списка статей. Если оставить пустым, сгенерируется автоматически из начала текста (если бэкенд это поддерживает).
        </p>
      </FormGroup>

      <FormGroup>
        <Label htmlFor="author">Автор</Label>
        <Input
          type="text"
          id="author"
          name="author"
          value={formData.author || ''}
          onChange={handleChange}
          disabled={isSaving}
        />
      </FormGroup>

      {/* Загрузка изображения - используем ImageUpload */}
      <FormGroup>
          <Label>Изображение статьи</Label>
          <ImageUpload
              currentImageUrl={formData.imageUrl}
              onFileSelect={handleImageChange} // <<< Используем новый обработчик
              uploadTriggerText="Загрузить/Заменить изображение"
          />
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.3rem' }}>
              Загрузите заглавное изображение для статьи.
          </p>
      </FormGroup>

      {/* Редактор блоков контента */}
      <FormGroup>
        <Label style={{ marginBottom: '1rem' }}>Контент статьи</Label>

        {/* Кнопки добавления блоков */}
        <AddBlockButtons>
            <ActionButton type="button" onClick={() => addBlock('intro')} disabled={isSaving} className="secondary">
                <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Вступление
            </ActionButton>
            <ActionButton type="button" onClick={() => addBlock('section')} disabled={isSaving} className="secondary">
                <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Раздел (Миф/Реальность)
            </ActionButton>
            <ActionButton type="button" onClick={() => addBlock('conclusion')} disabled={isSaving} className="secondary">
                <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i> Заключение
            </ActionButton>
        </AddBlockButtons>

        {/* Отображение и редактирование блоков */}
        {contentBlocks.map((block, index) => (
          <BlockWrapper key={block._id}>
             <BlockHeader>
                <BlockTitle>{block.type}</BlockTitle>
                <DeleteButton onClick={() => deleteBlock(block._id!)} title="Удалить блок" disabled={isSaving}>
                    <i className="fas fa-times"></i>
                </DeleteButton>
             </BlockHeader>

            {block.type === 'intro' && (
              <FormGroup>
                <Label htmlFor={`block-${block._id}-text`}>Текст вступления</Label>
                <TextArea
                  id={`block-${block._id}-text`}
                  name="text"
                  rows={5}
                  value={(block as IntroBlock).text}
                  onChange={(e) => updateBlock(block._id!, 'text', e.target.value)}
                  disabled={isSaving}
                />
              </FormGroup>
            )}

            {block.type === 'section' && (
              <>
                <FormGroup>
                  <Label htmlFor={`block-${block._id}-title`}>Заголовок раздела</Label>
                  <Input
                    type="text"
                    id={`block-${block._id}-title`}
                    name="title"
                    value={(block as SectionBlock).title}
                    onChange={(e) => updateBlock(block._id!, 'title', e.target.value)}
                    disabled={isSaving}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor={`block-${block._id}-mythText`}>Текст мифа/суеверия</Label>
                  <TextArea
                    id={`block-${block._id}-mythText`}
                    name="mythText"
                    rows={4}
                    value={(block as SectionBlock).mythText}
                    onChange={(e) => updateBlock(block._id!, 'mythText', e.target.value)}
                    disabled={isSaving}
                  />
                </FormGroup>
                <FormGroup>
                  <Label htmlFor={`block-${block._id}-explanationText`}>Текст объяснения/реальности</Label>
                  <TextArea
                    id={`block-${block._id}-explanationText`}
                    name="explanationText"
                    rows={4}
                    value={(block as SectionBlock).explanationText}
                    onChange={(e) => updateBlock(block._id!, 'explanationText', e.target.value)}
                    disabled={isSaving}
                  />
                </FormGroup>
              </>
            )}

            {block.type === 'conclusion' && (
               <FormGroup>
                <Label htmlFor={`block-${block._id}-text`}>Текст заключения</Label>
                <TextArea
                  id={`block-${block._id}-text`}
                  name="text"
                  rows={5}
                  value={(block as ConclusionBlock).text}
                  onChange={(e) => updateBlock(block._id!, 'text', e.target.value)}
                  disabled={isSaving}
                />
              </FormGroup>
            )}
             {/* TODO: Добавить кнопки перемещения блоков? */}
          </BlockWrapper>
        ))}
         {contentBlocks.length === 0 && <p style={{ color: 'var(--text-muted)', textAlign:'center', padding: '1rem'}}>Добавьте блоки контента с помощью кнопок выше.</p>}

      </FormGroup>

      {/* Кнопки сохранения/отмены */}
      <ButtonGroup>
        <ActionButton type="button" onClick={onCancel} disabled={isSaving} className="secondary">
          Отмена
        </ActionButton>
        <ActionButton type="button" onClick={handleSaveClick} disabled={isSaving} className="primary">
          {isSaving ? 'Сохранение...' : (initialData ? 'Сохранить изменения' : 'Создать статью')}
        </ActionButton>
      </ButtonGroup>
    </FormWrapper>
  );
};

export default ArticleForm; 
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { articleService } from '../../utils/api';
import { ArticleType } from '../../types/Article';
import ActionButton from '../ui/ActionButton';
import ConfirmModal from '../ui/ConfirmModal';
import { LoadingSpinner } from '../AdminPanel';
import { 
    TableContainer, 
    StyledTable, 
    TableHeader, 
    StyledTableRow, 
    StyledTableCell, 
    ActionButtonsContainer, 
    IconButton 
} from '../styles/TableStyles'; // <<< Исправляем путь на ../styles/
import ArticleForm from './ArticleForm'; // <<< Импортируем форму
import { AnimatePresence, motion } from 'framer-motion'; // Импорт для анимации

const PanelWrapper = styled.div`
  padding: 1.5rem;
`;

const PanelHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
`;

const PanelTitle = styled.h2`
  margin: 0;
  font-family: 'Playfair Display', serif;
`;

const PAGE_SIZE = 10;

const ArticlesAdminPanel: React.FC = () => {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Состояния для модального окна удаления
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Состояния для формы 
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleType | null>(null);
  const [isSaving, setIsSaving] = useState(false); // Состояние для блокировки кнопок во время сохранения
  const [search, setSearch] = useState('');
  const [authorFilter, setAuthorFilter] = useState('');
  const [page, setPage] = useState(1);

  // Получаем уникальных авторов для фильтра
  const authors = useMemo(() => Array.from(new Set(articles.map(a => a.author).filter(Boolean))), [articles]);

  // Фильтрация и поиск
  const filtered = useMemo(() => {
    let arr = articles;
    if (search.trim()) {
      arr = arr.filter(a => a.title.toLowerCase().includes(search.trim().toLowerCase()));
    }
    if (authorFilter) {
      arr = arr.filter(a => a.author === authorFilter);
    }
    return arr;
  }, [articles, search, authorFilter]);

  // Пагинация
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = useMemo(() => filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [filtered, page]);

  useEffect(() => { setPage(1); }, [search, authorFilter]);

  const loadArticles = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await articleService.getAllArticles();
      setArticles(data);
    } catch (err: any) {
      setError("Ошибка загрузки статей: " + err.message);
      toast.error("Ошибка загрузки статей.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadArticles();
  }, [loadArticles]);

  // --- Обработчики для формы --- //
  const handleAddNewClick = () => {
    setEditingArticle(null); // Сбрасываем данные для редактирования
    setShowForm(true); // Показываем форму
  };

  const handleEditClick = (article: ArticleType) => {
    setEditingArticle(article); // Устанавливаем данные для редактирования
    setShowForm(true); // Показываем форму
  };
  
  const handleFormCancel = () => {
    setShowForm(false);
    setEditingArticle(null);
    setIsSaving(false); // Сбрасываем флаг сохранения
  };

  const handleFormSave = async (articleData: Partial<ArticleType>, imageFile?: File | null) => {
    setIsSaving(true);
    setError(null);
    const isEditing = !!editingArticle?._id;

    try {
      let savedArticle: ArticleType;
      
      // 1. Сохраняем/обновляем текстовые данные и блоки
      if (isEditing) {
        const { _id, ...updateData } = articleData;
        savedArticle = await articleService.updateArticle(editingArticle._id, updateData);
        toast.success(`Статья "${savedArticle.title}" обновлена.`);
      } else {
        // Убираем поля, генерируемые бэком
        const { _id, imageUrl, imagePublicId, slug, createdAt, updatedAt, ...createData } = articleData;
        const createPayload = imageFile ? { ...createData, imageFile } : { ...createData };
        savedArticle = await articleService.createArticle(createPayload);
        toast.success(`Статья "${savedArticle.title}" создана.`);
      }
      
      // 2. Загрузка изображения теперь происходит ВНУТРИ ArticleForm
      // Поэтому здесь ничего больше делать не нужно
      
      // 3. Обновляем список статей и закрываем форму
      await loadArticles(); 
      handleFormCancel(); 

    } catch (err: any) {
      const message = err.message || (isEditing ? 'Ошибка обновления статьи' : 'Ошибка создания статьи');
      setError(message);
      toast.error(message);
      console.error("Ошибка сохранения статьи:", err);
       // Не закрываем форму при ошибке сохранения, чтобы пользователь мог исправить
    } finally {
      setIsSaving(false); // Разблокируем форму в любом случае
    }
  };
  
  // --- Обработчики удаления --- //
  const handleDeleteClick = (id: string) => {
    setDeletingArticleId(id);
    setShowDeleteConfirm(true);
  };

  const cancelDelete = () => {
    setShowDeleteConfirm(false);
    setDeletingArticleId(null);
  };

  const confirmDelete = async () => {
    if (!deletingArticleId) return;
    setIsDeleting(true);
    try {
      await articleService.deleteArticle(deletingArticleId);
      toast.success('Статья успешно удалена');
      // Обновляем список статей после удаления
      setArticles(prev => prev.filter(article => article._id !== deletingArticleId));
    } catch (err: any) {
      toast.error("Ошибка удаления статьи: " + err.message);
      console.error("Ошибка удаления статьи:", err);
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirm(false);
      setDeletingArticleId(null);
    }
  };
  
  // --- Рендеринг --- //
  if (isLoading) {
    return <LoadingSpinner><i className="fas fa-spinner"></i> Загрузка...</LoadingSpinner>;
  }

  return (
    <PanelWrapper>
      <PanelHeader>
        <PanelTitle>Управление статьями</PanelTitle>
        {/* Показываем кнопку "Добавить", только если форма скрыта */} 
        {!showForm && (
            <ActionButton 
                className="primary"
                onClick={handleAddNewClick} 
                disabled={isLoading} // Блокируем на время загрузки
            >
              <i className="fas fa-plus" style={{ marginRight: '0.5rem' }}></i>
              Добавить статью
            </ActionButton>
        )}
      </PanelHeader>

      {/* Поиск и фильтры */}
      {!showForm && (
        <div style={{ display: 'flex', gap: 16, marginBottom: 20, alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Поиск по заголовку..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border-color)', flex: 2 }}
          />
          <select
            value={authorFilter}
            onChange={e => setAuthorFilter(e.target.value)}
            style={{ padding: '0.5rem', borderRadius: 6, border: '1px solid var(--border-color)', flex: 1 }}
          >
            <option value="">Все авторы</option>
            {authors.map(a => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
      )}

      {error && <p style={{ color: 'var(--danger-color)' }}>{error}</p>}

      {/* Форма создания/редактирования */} 
      <AnimatePresence>
        {showForm && (
          <motion.div
              key="article-form"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              style={{ overflow: 'hidden', marginBottom: '2rem' }} // Добавляем отступ снизу
          >
              <ArticleForm 
                initialData={editingArticle} 
                onSave={handleFormSave} 
                onCancel={handleFormCancel}
              />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Таблица со статьями (показываем, если форма скрыта) */} 
      {!showForm && paged.length > 0 && (
          <TableContainer>
            <StyledTable>
              <thead>
                <tr>
                  <TableHeader>Заголовок</TableHeader>
                  <TableHeader>Автор</TableHeader>
                  <TableHeader>Дата создания</TableHeader>
                  <TableHeader className="actions">Действия</TableHeader>
                </tr>
              </thead>
              <tbody>
                {paged.map((article) => (
                  <StyledTableRow key={article._id}>
                    <StyledTableCell>{article.title}</StyledTableCell>
                    <StyledTableCell>{article.author}</StyledTableCell>
                    <StyledTableCell>{new Date(article.createdAt).toLocaleDateString('ru-RU')}</StyledTableCell>
                    <StyledTableCell className="actions">
                      <ActionButtonsContainer>
                        <IconButton 
                            className="edit" 
                            title="Редактировать"
                            onClick={() => handleEditClick(article)} 
                            disabled={isSaving || isDeleting} // Блокируем во время сохранения/удаления
                        >
                          <i className="fas fa-pencil-alt"></i>
                        </IconButton>
                        <IconButton 
                            className="delete" 
                            title="Удалить"
                            onClick={() => handleDeleteClick(article._id)}
                            disabled={isSaving || isDeleting} // Блокируем во время сохранения/удаления
                        >
                          <i className="fas fa-trash-alt"></i>
                        </IconButton>
                      </ActionButtonsContainer>
                    </StyledTableCell>
                  </StyledTableRow>
                ))}
              </tbody>
            </StyledTable>
          </TableContainer>
      )}
      {/* Пагинация */}
      {!showForm && pageCount > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 8, margin: '18px 0' }}>
          <button onClick={() => setPage(p => Math.max(1, p-1))} disabled={page === 1} style={{ padding: '0.4rem 1rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: page === 1 ? 'not-allowed' : 'pointer' }}>Назад</button>
          {Array.from({ length: pageCount }, (_, i) => (
            <button key={i+1} onClick={() => setPage(i+1)} disabled={page === i+1} style={{ padding: '0.4rem 0.9rem', borderRadius: 6, border: '1px solid var(--border-color)', background: page === i+1 ? 'var(--primary-color)' : 'var(--bg-secondary)', color: page === i+1 ? 'var(--text-on-primary-bg)' : 'inherit', fontWeight: page === i+1 ? 600 : 400, cursor: page === i+1 ? 'default' : 'pointer' }}>{i+1}</button>
          ))}
          <button onClick={() => setPage(p => Math.min(pageCount, p+1))} disabled={page === pageCount} style={{ padding: '0.4rem 1rem', borderRadius: 6, border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', cursor: page === pageCount ? 'not-allowed' : 'pointer' }}>Вперёд</button>
        </div>
      )}
      {!showForm && paged.length === 0 && !isLoading && (
            <p style={{ textAlign: 'center', padding: '2rem' }}>Нет статей для отображения.</p>
      )}

      {/* Модальное окно подтверждения удаления */} 
      <ConfirmModal
        isOpen={showDeleteConfirm}
        onCancel={cancelDelete}
        onConfirm={confirmDelete}
        title="Подтвердить удаление"
        message="Вы уверены, что хотите удалить эту статью? Это действие необратимо."
        confirmText="Удалить"
        cancelText="Отмена"
        confirmButtonClass="danger"
        isConfirming={isDeleting}
      />
    </PanelWrapper>
  );
};

export default ArticlesAdminPanel; 
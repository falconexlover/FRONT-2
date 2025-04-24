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
import { useCrud } from '../../hooks/useCrud';

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

const ArticleCard = styled.div`
  background: var(--bg-secondary);
  border: 1px solid var(--border-color);
  border-radius: 14px;
  box-shadow: var(--shadow-xs);
  padding: 1rem 1.2rem 1.2rem 1.2rem;
  display: flex;
  flex-direction: column;
  min-height: 180px;
  position: relative;
  cursor: pointer;
  transition: box-shadow 0.18s, border-color 0.18s, transform 0.15s;
  &:hover {
    box-shadow: var(--shadow-md);
    border-color: var(--primary-color);
    transform: translateY(-2px) scale(1.01);
  }
`;

const ArticleImage = styled.img`
  width: 100%;
  max-height: 120px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 0.7rem;
  background: #f3f3f3;
`;

const ArticleTitle = styled.div`
  font-family: 'Playfair Display', serif;
  font-weight: 700;
  font-size: 1.45rem;
  color: var(--primary-color);
  margin: 0.7rem 0 0.5rem 0;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ArticleMeta = styled.div`
  font-size: 0.92rem;
  color: var(--text-secondary);
  margin-bottom: 4px;
`;

const ArticlePreview = styled.div`
  font-size: 0.93rem;
  color: var(--text-secondary);
  margin-bottom: 10px;
  min-height: 2.2em;
  max-height: 3.5em;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: auto;
  align-items: center;
`;

const MoreLink = styled.a`
  color: var(--primary-color);
  font-size: 0.93rem;
  text-decoration: underline;
  margin-left: auto;
  margin-right: 0.2rem;
  &:hover {
    color: var(--secondary-color);
    text-decoration: underline;
  }
`;

const renderArticleContent = (blocks: any[] | undefined) => {
  if (!blocks || !blocks.length) return null;
  return (
    <div style={{ margin: '0.5rem 0 0.7rem 0', fontSize: '0.93rem', color: 'var(--text-secondary)' }}>
      {blocks.map((block, idx) => {
        if (block.type === 'intro') {
          return <div key={idx} style={{ marginBottom: 6 }}>{block.text}</div>;
        }
        if (block.type === 'section') {
          return (
            <div key={idx} style={{ marginBottom: 8 }}>
              <div style={{ fontWeight: 600, color: 'var(--primary-color)', fontSize: '0.97rem' }}>{block.title}</div>
              <div style={{ fontStyle: 'italic', color: 'var(--text-secondary)', marginBottom: 2 }}>{block.mythText}</div>
              <div style={{ color: 'var(--text-primary)' }}>{block.explanationText}</div>
            </div>
          );
        }
        if (block.type === 'conclusion') {
          return <div key={idx} style={{ marginTop: 8, fontWeight: 500 }}>{block.text}</div>;
        }
        return null;
      })}
    </div>
  );
};

const ArticlesAdminPanel: React.FC = () => {
  const {
    items: articles,
    setItems: setArticles,
    isLoading,
    isSaving,
    isDeleting,
    error,
    loadAll,
    createItem,
    updateItem,
    deleteItem,
  } = useCrud<
    ArticleType,
    Partial<ArticleType> & { imageFile?: File },
    Partial<ArticleType>
  >();

  // UI-состояния
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deletingArticleId, setDeletingArticleId] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingArticle, setEditingArticle] = useState<ArticleType | null>(null);
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
  const PAGE_SIZE = 10;
  const pageCount = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paged = useMemo(() => filtered.slice((page-1)*PAGE_SIZE, page*PAGE_SIZE), [filtered, page]);

  useEffect(() => { setPage(1); }, [search, authorFilter]);

  // Загрузка статей при монтировании
  useEffect(() => {
    loadAll(articleService.getAllArticles);
  }, [loadAll]);

  // --- Обработчики для формы --- //
  const handleAddNewClick = () => {
    setEditingArticle(null);
    setShowForm(true);
  };

  const handleEditClick = (article: ArticleType) => {
    setEditingArticle(article);
    setShowForm(true);
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingArticle(null);
  };

  const handleFormSave = async (articleData: Partial<ArticleType>, imageFile?: File | null) => {
    const isEditing = !!editingArticle?._id;
    try {
      if (isEditing && editingArticle?._id) {
        await updateItem(articleService.updateArticle, editingArticle._id, articleData);
      } else {
        await createItem(articleService.createArticle, imageFile ? { ...articleData, imageFile } : articleData);
      }
      handleFormCancel();
    } catch (err) {
      // Ошибка уже обработана в useCrud
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
    try {
      await deleteItem(articleService.deleteArticle, deletingArticleId);
    } catch (err) {
      // Ошибка уже обработана в useCrud
    } finally {
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

      {/* Карточки статей (показываем, если форма скрыта) */}
      {!showForm && paged.length > 0 && (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.2rem',
          marginBottom: 24
        }}>
          {paged.map((article) => (
            <ArticleCard key={article._id} title="Редактировать статью" onClick={e => {
              // Не реагируем на клик по кнопкам
              if ((e.target as HTMLElement).closest('button,a')) return;
              handleEditClick(article);
            }}>
              {article.imageUrl ? (
                <ArticleImage src={article.imageUrl} alt={article.title || 'Превью'} />
              ) : (
                <div style={{
                  width: '100%',
                  height: 90,
                  background: '#f3f3f3',
                  borderRadius: 10,
                  marginBottom: 12,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#bbb',
                  fontSize: 32
                }}>
                  <i className="fas fa-newspaper"></i>
                </div>
              )}
              <ArticleTitle>{article.title || '(Без названия)'}</ArticleTitle>
              <ArticleMeta>Автор: {article.author || '—'}</ArticleMeta>
              <ArticleMeta>Создана: {new Date(article.createdAt).toLocaleDateString('ru-RU')}</ArticleMeta>
              <ArticlePreview>{article.excerpt || 'Нет описания...'}</ArticlePreview>
              {renderArticleContent(article.contentBlocks)}
              <CardActions>
                <ActionButton
                  className="secondary small"
                  onClick={() => handleEditClick(article)}
                  title="Редактировать статью"
                  style={{ minWidth: 32, padding: '0.3rem 0.7rem', fontSize: 14 }}
                  disabled={isSaving || isDeleting}
                >
                  <i className="fas fa-pencil-alt"></i>
                </ActionButton>
                <ActionButton
                  className="danger small"
                  onClick={() => handleDeleteClick(article._id)}
                  title="Удалить статью"
                  style={{ minWidth: 32, padding: '0.3rem 0.7rem', fontSize: 14 }}
                  disabled={isSaving || isDeleting}
                >
                  <i className="fas fa-trash-alt"></i>
                </ActionButton>
                {/* Кнопка "Подробнее" если есть публичная страница */}
                {article.slug && (
                  <MoreLink
                    href={`/blog/${article.slug}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    title="Открыть статью на сайте"
                    onClick={e => e.stopPropagation()}
                  >
                    Подробнее
                  </MoreLink>
                )}
              </CardActions>
            </ArticleCard>
          ))}
        </div>
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
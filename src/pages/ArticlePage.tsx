import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useParams, Link } from 'react-router-dom';
import { articleService } from '../utils/api';
import { ArticleType } from '../types/Article';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';

// Стили (можно доработать)
const PageWrapper = styled.div`
  max-width: 900px; // Сделаем страницу статьи чуть уже
  margin: 2rem auto;
  padding: 2rem 1rem;
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  border: 1px solid var(--border-color);
`;

const ArticleHeader = styled.header`
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--border-color-light);
  padding-bottom: 1.5rem;
`;

const ArticleTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  margin: 0 0 1rem 0;
  font-size: 2.6rem;
  line-height: 1.3;
`;

const ArticleMeta = styled.div`
  font-size: 0.9rem;
  color: var(--text-muted);
  margin-bottom: 1.5rem; // Добавим отступ снизу
`;

const ArticleImage = styled.img`
  width: 100%;
  max-height: 450px; // Ограничим высоту изображения
  object-fit: cover;
  border-radius: var(--radius-sm);
  margin-bottom: 2rem;
  border: 1px solid var(--border-color-light);
`;

const BackLink = styled(Link)`
    display: inline-block;
    margin-top: 3rem;
    color: var(--primary-color);
    text-decoration: none;
    font-weight: 500;
    
    &:hover {
        text-decoration: underline;
    }
`;

const LoadingPlaceholder = styled.div` /* Стили как в других компонентах */ `;
const ErrorPlaceholder = styled.div` /* Стили как в других компонентах */ `;

const ArticlePage: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const [article, setArticle] = useState<ArticleType | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticle = async () => {
      if (!slug) {
        setError('Не указан идентификатор статьи.');
        setLoading(false);
        return;
      }
      setLoading(true);
      setError(null);
      try {
        const data = await articleService.getArticleBySlug(slug);
        if (data) {
          setArticle(data);
        } else {
          setError('Статья не найдена.');
        }
      } catch (err: any) {
        setError("Не удалось загрузить статью: " + err.message);
        console.error("Ошибка загрузки статьи:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticle();
  }, [slug]);

  if (loading) {
    return <LoadingPlaceholder>Загрузка статьи...</LoadingPlaceholder>;
  }

  if (error) {
    return <ErrorPlaceholder>{error}</ErrorPlaceholder>;
  }

  if (!article) {
    // Эта ветка не должна достигаться, если error обработан, но на всякий случай
    return <ErrorPlaceholder>Статья не найдена.</ErrorPlaceholder>; 
  }

  return (
    <PageWrapper>
      <ArticleHeader>
        <ArticleTitle>{article.title}</ArticleTitle>
        <ArticleMeta>
          Опубликовано: {new Date(article.createdAt).toLocaleDateString('ru-RU')} 
          {article.author && ` | Автор: ${article.author}`}
        </ArticleMeta>
        {article.imageUrl && (
          <ArticleImage 
            src={optimizeCloudinaryImage(article.imageUrl, 'w_800,q_auto,f_auto')} 
            alt={article.title} 
            loading="lazy"
          />
        )}
      </ArticleHeader>
      
      {/* Временно убираем рендеринг контента, пока не реализован рендеринг блоков */}

      {/* TODO: Реализовать рендеринг блоков из article.contentBlocks */} 
      <div style={{ padding: '2rem', border: '1px dashed grey', margin: '2rem 0', textAlign: 'center' }}>
          Рендеринг контента статьи (блоков) еще не реализован.
      </div>
      
      <BackLink to="/blog">← Назад к списку статей</BackLink>

    </PageWrapper>
  );
};

export default ArticlePage; 
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
  text-align: center;
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

const ArticleContentWrapper = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 2px 16px 0 rgba(60,80,80,0.07);
  border: 1px solid var(--border-color-light);
  padding: 2.2rem 2.2rem 2.5rem 2.2rem;
  margin-bottom: 2.5rem;
  margin-top: 0.5rem;
  transition: box-shadow 0.18s;
  @media (max-width: 600px) {
    padding: 1.1rem 0.7rem 1.5rem 0.7rem;
  }
  & h2 {
    font-size: 1.35rem;
    color: var(--primary-color);
    margin-bottom: 0.5em;
    margin-top: 1.5em;
    font-family: 'Playfair Display', serif;
  }
  & p {
    font-size: 1.13rem;
    color: var(--text-primary);
    margin-bottom: 1.2em;
  }
  & blockquote {
    font-style: italic;
    color: #6a7;
    background: #f6fff6;
    border-left: 4px solid #7b9;
    padding: 0.7em 1em;
    margin: 0 0 0.7em 0;
    border-radius: 6px;
    font-size: 1.08rem;
  }
  & .conclusion {
    margin-top: 2em;
    font-weight: 600;
    font-size: 1.13rem;
    color: var(--primary-color);
    background: #f7f7f7;
    border-radius: 8px;
    padding: 1em 1.2em;
    display: inline-block;
  }
`;

const renderArticleContent = (blocks: any[] | undefined) => {
  if (!blocks || !blocks.length) return <div style={{color:'#888',textAlign:'center',margin:'2rem 0'}}>Нет содержимого для отображения.</div>;
  return (
    <ArticleContentWrapper>
      {blocks.map((block, idx) => {
        if (block.type === 'intro') {
          return <p key={idx}>{block.text}</p>;
        }
        if (block.type === 'section') {
          return (
            <section key={idx}>
              {block.title && <h2>{block.title}</h2>}
              {block.mythText && <blockquote>{block.mythText}</blockquote>}
              {block.explanationText && <div style={{fontSize:'1.08rem',color:'var(--text-primary)'}}>{block.explanationText}</div>}
            </section>
          );
        }
        if (block.type === 'conclusion') {
          return <div key={idx} className="conclusion">{block.text}</div>;
        }
        return null;
      })}
    </ArticleContentWrapper>
  );
};

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

      {/* TODO: Реализовать рендеринг блоков из article.contentBlocks */} 
      {renderArticleContent(article.contentBlocks)}
      
      <BackLink to="/blog">← Назад к списку статей</BackLink>

    </PageWrapper>
  );
};

export default ArticlePage; 
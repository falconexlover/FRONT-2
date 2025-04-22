import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { articleService } from '../utils/api';
import { ArticleType } from '../types/Article';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';

// Стили (можно доработать)
const PageWrapper = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.8rem;
`;

const ArticleList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  align-items: stretch;
`;

const BlogCardLink = styled(Link)`
  display: flex;
  flex-direction: column;
  background: var(--bg-secondary);
  border-radius: var(--radius-md);
  box-shadow: 0 2px 12px rgba(0,0,0,0.07);
  border: 1px solid var(--border-color);
  overflow: hidden;
  text-decoration: none;
  min-height: 340px;
  height: 100%;
  transition: box-shadow 0.25s, transform 0.25s;
  &:hover {
    box-shadow: 0 8px 32px rgba(0,0,0,0.13);
    transform: translateY(-8px) scale(1.02);
  }
`;

const BlogCardImage = styled.img`
  width: 100%;
  height: 220px;
  object-fit: cover;
  border-radius: var(--radius-md) var(--radius-md) 0 0;
  background: #e0e0e0;
  transition: transform 0.3s, filter 0.3s;
  filter: brightness(1);
  ${BlogCardLink}:hover & {
    transform: scale(1.04);
    filter: brightness(0.85);
  }
`;

const BlogCardTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  margin: 0;
  padding: 1.6rem 1.2rem 2rem 1.2rem;
  font-size: 1.25rem;
  color: var(--dark-color);
  text-align: center;
  font-weight: 500;
  flex: 1 1 auto;
`;

const LoadingPlaceholder = styled.div` /* Стили как в других компонентах */ `;
const ErrorPlaceholder = styled.div` /* Стили как в других компонентах */ `;

const BlogListPage: React.FC = () => {
  const [articles, setArticles] = useState<ArticleType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchArticles = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await articleService.getAllArticles();
        setArticles(data);
      } catch (err: any) {
        setError("Не удалось загрузить статьи: " + err.message);
        console.error("Ошибка загрузки статей:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchArticles();
  }, []);

  return (
    <PageWrapper>
      <PageTitle>Наш Блог</PageTitle>

      {loading && <LoadingPlaceholder>Загрузка статей...</LoadingPlaceholder>}
      {error && <ErrorPlaceholder>{error}</ErrorPlaceholder>}
      
      {!loading && !error && articles.length === 0 && (
          <p>Пока нет ни одной статьи.</p>
      )}

      {!loading && !error && articles.length > 0 && (
        <ArticleList>
          {articles.map((article, index) => (
            <BlogCardLink to={`/blog/${article.slug}`} key={article._id}>
              {article.imageUrl && (
                <BlogCardImage 
                  src={optimizeCloudinaryImage(article.imageUrl, 'w_400,h_250,c_fill,q_auto,f_auto')} 
                  alt={article.title}
                  loading="lazy"
                />
              )}
              <BlogCardTitle>{article.title}</BlogCardTitle>
            </BlogCardLink>
          ))}
        </ArticleList>
      )}
    </PageWrapper>
  );
};

export default BlogListPage; 
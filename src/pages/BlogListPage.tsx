import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { articleService } from '../utils/api';
import { ArticleType } from '../types/Article';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';
import { motion } from 'framer-motion';

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
`;

const ArticleCard = styled(motion.div)`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--border-color);
  transition: var(--transition);
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-5px);
  }
`;

const ArticleImageLink = styled(Link)`
  display: block;
  height: 200px;
  background-color: var(--border-color-light); // Placeholder color
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.3s ease;
  }
  
  &:hover img {
      transform: scale(1.05);
  }
`;

const ArticleContent = styled.div`
  padding: 1.5rem;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
`;

const ArticleTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  margin: 0 0 0.8rem 0;
  font-size: 1.4rem;
  
  a {
    color: var(--dark-color);
    text-decoration: none;
    transition: color 0.2s;
    
    &:hover {
        color: var(--primary-color);
    }
  }
`;

const ArticleExcerpt = styled.p`
  color: var(--text-secondary);
  font-size: 0.95rem;
  line-height: 1.6;
  margin-bottom: 1rem;
  flex-grow: 1;
`;

const ArticleMeta = styled.div`
  font-size: 0.85rem;
  color: var(--text-muted);
  border-top: 1px solid var(--border-color-light);
  padding-top: 0.8rem;
  margin-top: auto; // Прижимаем к низу
`;

const ReadMoreLink = styled(Link)`
  color: var(--primary-color);
  font-weight: 600;
  text-decoration: none;
  
  &:hover {
      text-decoration: underline;
  }
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
            <ArticleCard 
              key={article._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {article.imageUrl && (
                <ArticleImageLink to={`/blog/${article.slug}`}>
                  <img 
                    src={optimizeCloudinaryImage(article.imageUrl, 'w_400,h_250,c_fill,q_auto,f_auto')} 
                    alt="" // Декоративное изображение в списке
                    loading="lazy"
                  />
                </ArticleImageLink>
              )}
              <ArticleContent>
                <ArticleTitle>
                  <Link to={`/blog/${article.slug}`}>{article.title}</Link>
                </ArticleTitle>
                {article.excerpt && <ArticleExcerpt>{article.excerpt}</ArticleExcerpt>}
                <ReadMoreLink to={`/blog/${article.slug}`}>Читать далее →</ReadMoreLink>
                <ArticleMeta>
                  Опубликовано: {new Date(article.createdAt).toLocaleDateString('ru-RU')} 
                  {article.author && `| Автор: ${article.author}`}
                </ArticleMeta>
              </ArticleContent>
            </ArticleCard>
          ))}
        </ArticleList>
      )}
    </PageWrapper>
  );
};

export default BlogListPage; 
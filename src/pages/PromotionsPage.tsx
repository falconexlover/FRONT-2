import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { promotionsService } from '../utils/api';
import { PromotionType } from '../types/Promotion';
import { toast } from 'react-toastify';

// Стили для страницы
const PageContainer = styled.div`
  max-width: var(--max-width, 1100px);
  margin: 2rem auto;
  padding: 2rem 1rem;
`;

const PageTitle = styled.h1`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  text-align: center;
  margin-bottom: 3rem;
  font-size: 2.5rem;
`;

// Стили для сетки акций
const PromotionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

// Стили для карточки акции
const PromotionCard = styled.div`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  display: flex;
  flex-direction: column;

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-5px);
  }

  h3 {
    font-family: 'Playfair Display', serif;
    color: var(--primary-color);
    margin: 0 0 1rem 0;
    font-size: 1.4rem;
  }

  p {
    color: var(--text-secondary);
    font-size: 0.95rem;
    line-height: 1.6;
    margin-bottom: 1rem;
    flex-grow: 1; /* Чтобы текст занимал место, отодвигая даты вниз */
  }

  .dates {
      font-size: 0.85rem;
      color: var(--text-secondary);
      opacity: 0.8;
      margin-top: auto; /* Прижимаем даты к низу */
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
  }

  .status {
    font-size: 0.8rem;
    font-weight: 600;
    padding: 0.3rem 0.6rem;
    border-radius: var(--radius-sm);
    margin-bottom: 1rem;
    display: inline-block; // чтобы занимал только нужную ширину
  }

  .status-active {
    background-color: var(--success-color, #2aa76e);
    color: white;
  }

  .status-inactive {
    background-color: var(--text-secondary);
    color: white;
  }
`;

// Плейсхолдеры
const LoadingPlaceholder = styled.div`
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    color: var(--text-secondary);
`;
const ErrorPlaceholder = styled.div`
    min-height: 200px;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    color: var(--danger-color);
    padding: 2rem;
    text-align: center;
    background-color: rgba(229, 115, 115, 0.1);
    border: 1px solid var(--danger-color);
    border-radius: var(--radius-md);
`; 
const EmptyPlaceholder = styled.div`
    text-align: center;
    padding: 3rem;
    color: var(--text-secondary);
    font-size: 1.1rem;
    background-color: var(--bg-secondary);
    border-radius: var(--radius-md);
    border: 1px dashed var(--border-color);
`;


const PromotionsPage: React.FC = () => {
    const [promotions, setPromotions] = useState<PromotionType[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const fetchPromotions = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const data = await promotionsService.getAllPromotions();
                setPromotions(data || []); // Если data null/undefined, ставим пустой массив
            } catch (err) {
                console.error("Ошибка загрузки акций:", err);
                const message = err instanceof Error ? err.message : 'Не удалось загрузить акции.';
                setError(message);
                toast.error(message);
            } finally {
                setIsLoading(false);
            }
        };

        fetchPromotions();
    }, []);

    const formatDate = (dateString: string | undefined): string => {
        if (!dateString) return 'Не указана';
        try {
            return new Date(dateString).toLocaleDateString('ru-RU');
        } catch {
            return 'Неверная дата';
        }
    };

    return (
        <PageContainer>
            <PageTitle>Специальные предложения и акции</PageTitle>

            {isLoading && <LoadingPlaceholder>Загрузка акций...</LoadingPlaceholder>}
            {error && <ErrorPlaceholder>Ошибка: {error}</ErrorPlaceholder>}

            {!isLoading && !error && (
                promotions.length > 0 ? (
                    <PromotionsGrid>
                        {promotions.map((promo) => (
                            <PromotionCard key={promo._id}>
                                <span className={`status ${promo.isActive ? 'status-active' : 'status-inactive'}`}> 
                                    {promo.isActive ? 'Активна' : 'Завершена'}
                                </span>
                                <h3>{promo.title}</h3>
                                <p>{promo.description}</p>
                                <div className="dates">
                                    Начало: {formatDate(promo.startDate)} <br/>
                                    Окончание: {formatDate(promo.endDate)}
                                </div>
                            </PromotionCard>
                        ))}
                    </PromotionsGrid>
                ) : (
                    <EmptyPlaceholder>На данный момент активных или завершенных акций нет.</EmptyPlaceholder>
                )
            )}
        </PageContainer>
    );
};

export default PromotionsPage; 
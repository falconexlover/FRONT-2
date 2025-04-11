import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { promotionsService } from '../utils/api';
import { PromotionType } from '../types/Promotion';
import { toast } from 'react-toastify';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils'; // Импортируем оптимизатор

// Стили для страницы
const PageContainer = styled.div`
  max-width: var(--max-width, 900px); // Сделаем немного уже для вертикального формата
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

// Стили для блока акции
const PromotionBlock = styled.div`
  background-color: var(--bg-secondary);
  border-radius: var(--radius-md);
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  box-shadow: var(--shadow-sm);
  margin-bottom: 2.5rem; // Отступ между блоками
  transition: var(--transition);

  &:hover {
    box-shadow: var(--shadow-md);
    transform: translateY(-3px);
  }
`;

const PromotionTitle = styled.h3`
  font-family: 'Playfair Display', serif;
  color: var(--primary-color);
  margin: 0 0 1.5rem 0;
  font-size: 1.6rem;
  text-align: center;
`;

const PromotionImage = styled.img`
  display: block;
  width: 100%;
  max-width: 500px; // Ограничим максимальную ширину фото
  height: auto;
  border-radius: var(--radius-sm);
  margin: 0 auto 1.5rem auto; // Центрируем фото
  object-fit: cover;
  border: 1px solid var(--border-color);
`;

const PromotionDescription = styled.p`
  color: var(--text-secondary);
  font-size: 1rem; // Немного увеличим шрифт описания
  line-height: 1.7;
  margin-bottom: 1rem;
  text-align: center; // Опционально: центрировать текст
`;

const PromotionDates = styled.div`
  font-size: 0.9rem;
  color: var(--text-secondary);
  opacity: 0.8;
  text-align: center;
  margin-top: 1.5rem;
  padding-top: 1rem;
  border-top: 1px solid var(--border-color);
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
                // Получаем ВСЕ акции
                const data = await promotionsService.getAllPromotions(); 
                // Фильтруем на клиенте, оставляем только активные
                const activePromotions = (data || []).filter(promo => promo.isActive);
                setPromotions(activePromotions);
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
                    <div>
                        {promotions.map((promo) => (
                            <PromotionBlock key={promo._id}>
                                <PromotionTitle>{promo.title}</PromotionTitle>
                                {
                                  promo.imageUrl && (
                                    <PromotionImage 
                                      // Оптимизируем изображение с Cloudinary
                                      src={optimizeCloudinaryImage(promo.imageUrl, 'w_600,c_limit,q_auto')} 
                                      alt={promo.title}
                                      loading="lazy" // Ленивая загрузка изображений
                                    />
                                  )
                                }
                                {promo.description && (
                                  <PromotionDescription>{promo.description}</PromotionDescription>
                                )}
                                <PromotionDates>
                                    Акция действует {promo.startDate ? `с ${formatDate(promo.startDate)}` : ''} {promo.endDate ? `по ${formatDate(promo.endDate)}` : 'бессрочно'}
                                </PromotionDates>
                            </PromotionBlock>
                        ))}
                    </div>
                ) : (
                    <EmptyPlaceholder>На данный момент активных акций нет.</EmptyPlaceholder>
                )
            )}
        </PageContainer>
    );
};

export default PromotionsPage; 
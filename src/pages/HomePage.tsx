// eslint-disable-next-line @typescript-eslint/no-unused-vars
import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import Banner from '../components/Banner';
import About from '../components/About';
import Services from '../components/Services';
import Rooms from '../components/Rooms';
import YandexMap from '../components/YandexMap';
import { homePageService, promotionsService } from '../utils/api';
import { HomePageContent } from '../types/HomePage';
import { toast } from 'react-toastify';
import SlidingPromoBanner from '../components/ui/SlidingPromoBanner';
import { PromotionType } from '../types/Promotion';
import PromoModal from '../components/ui/PromoModal';

// Контейнер для плейсхолдера загрузки
const LoadingPlaceholder = styled.div`
    // ... стили ...
    min-height: 100vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.5rem;
    color: var(--text-secondary);
`;

const ErrorPlaceholder = styled.div`
    // ... стили ...
    min-height: 60vh;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 1.2rem;
    color: var(--danger-color);
    padding: 2rem;
    text-align: center;
`;

const HomePage: React.FC = () => {
    const [content, setContent] = useState<HomePageContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [activePromotions, setActivePromotions] = useState<PromotionType[]>([]);
    const [isPromoModalOpen, setIsPromoModalOpen] = useState(false);

    const loadContent = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const [homeData, promotionsData] = await Promise.all([
                homePageService.getHomePage(),
                promotionsService.getAllPromotions()
            ]);
            
            setContent(homeData);
            const activePromos = promotionsData?.filter(promo => promo.isActive) ?? [];
            setActivePromotions(activePromos);

        } catch (err) {
            console.error("Ошибка загрузки контента главной страницы:", err);
            let message = 'Не удалось загрузить данные страницы.';
            if (err instanceof Error) {
                message = err.message;
            }
            setError(message);
            toast.error(message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadContent();
    }, [loadContent]);

    if (isLoading) {
        return <LoadingPlaceholder>Загрузка страницы...</LoadingPlaceholder>;
    }

    if (error) {
        return <ErrorPlaceholder>Ошибка загрузки: {error}</ErrorPlaceholder>;
    }

    if (!content) {
        return <ErrorPlaceholder>Не удалось загрузить контент страницы.</ErrorPlaceholder>;
    }

    const { banner, about, rooms, services, contact } = content;

    const hotelCoordinates: [number, number] = [55.591259, 38.141982];

    const closePromoModal = () => setIsPromoModalOpen(false);

    return (
        <>
            {/* Баннер теперь отображается всегда */}
            <SlidingPromoBanner />

            <Banner content={banner} />
            <About content={about} />
            <Rooms title={rooms?.title} subtitle={rooms?.subtitle} />
            <div id="services-section">
                <Services title={services?.title} subtitle={services?.subtitle} />
            </div>
            <section id="contact" className="section" style={{ padding: '6rem 2rem', backgroundColor: '#f8f9fa' }}>
                <div className="container">
                    <SectionTitle>
                        <h2>{contact?.title}</h2>
                    </SectionTitle>
                    
                    <InfoContainer>
                        <InfoColumn>
                            <ContactInfo>
                                <ContactDetail>
                                    <Icon className="fas fa-map-marker-alt" />
                                    <div>
                                        <h4>Адрес</h4>
                                        <p>{contact?.address}</p>
                                    </div>
                                </ContactDetail>
                                
                                <ContactDetail>
                                    <Icon className="fas fa-phone" />
                                    <div>
                                        <h4>Телефон</h4>
                                        {contact?.phone?.map((phone, index) => (
                                            <p key={index}>
                                                <a href={`tel:+${phone.replace(/\D/g, '')}`}>{phone}</a>
                                            </p>
                                        ))}
                                    </div>
                                </ContactDetail>
                                
                                <ContactDetail>
                                    <Icon className="fas fa-envelope" />
                                    <div>
                                        <h4>Email</h4>
                                        <p>{contact?.email}</p>
                                    </div>
                                </ContactDetail>
                            </ContactInfo>
                        </InfoColumn>
                        
                        <MapColumn>
                            <YandexMap 
                                address={contact?.address || ''}
                                coordinates={hotelCoordinates}
                                zoom={16}
                                height="450px"
                            />
                        </MapColumn>
                    </InfoContainer>
                </div>
            </section>

            <PromoModal 
                isOpen={isPromoModalOpen} 
                onClose={closePromoModal} 
                promotions={activePromotions}
            />
        </>
    );
};

const SectionTitle = styled.div`
    // ... стили ...
`;
const InfoContainer = styled.div`
    // ... стили ...
`;
const InfoColumn = styled.div`
    // text-align: center;
`;
const MapColumn = styled.div`
    // ... стили ...
`;
const ContactInfo = styled.div`
    // ... стили ...
`;
const ContactDetail = styled.div`
    display: flex;
    align-items: start; 
    gap: 1.5rem;
    margin-bottom: 1.5rem;
    // text-align: center;
    // justify-content: center;
    
    h4 { margin: 0 0 0.3rem 0; }
    p { margin: 0; color: #555; }
`;
const Icon = styled.i`
    // ... стили ...
`;

export default HomePage; 
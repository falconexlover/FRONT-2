import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { IMAGES } from '../assets/placeholders';
import { servicesService } from '../utils/api';
import { ServiceType } from '../types/Service';
import { toast } from 'react-toastify';
import { optimizeCloudinaryImage } from '../utils/cloudinaryUtils';

const ServicesSection = styled.section`
  padding: 6rem 2rem;
  background-color: var(--gray-bg);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: url(${IMAGES.PATTERN}) center/400px repeat;
    opacity: 0.04;
    z-index: 0;
  }
  
  @media screen and (max-width: 768px) {
    padding: 4rem 1.5rem;
  }
  
  @media screen and (max-width: 576px) {
    padding: 3rem 1rem;
  }
`;

const ServicesGrid = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  
  h2 {
    font-size: 2.8rem;
    color: var(--dark-color);
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    position: relative;
    
    @media screen and (max-width: 768px) {
      font-size: 2.2rem;
    }
    
    @media screen and (max-width: 576px) {
      font-size: 1.8rem;
    }
    
    &::before {
      content: '';
      position: absolute;
      width: 60px;
      height: 3px;
      background-color: var(--accent-color);
      bottom: -15px;
      left: 50%;
      transform: translateX(-50%);
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 20px;
      height: 3px;
      background-color: var(--primary-color);
      bottom: -15px;
      left: calc(50% + 35px);
      transform: translateX(-50%);
    }
  }
`;

const ServiceCard = styled(motion.div)`
  background-color: white;
  padding: 2.5rem;
  border-radius: var(--radius-md);
  text-align: center;
  box-shadow: var(--shadow-sm);
  transition: var(--transition);
  position: relative;
  z-index: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  height: 100%;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 5px;
    height: 0;
    background-color: var(--accent-color);
    transition: var(--transition);
  }
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: var(--shadow-lg);
  }
  
  &:hover::before {
    height: 100%;
  }

  @media screen and (max-width: 768px) {
    padding: 2rem;
  }
  @media screen and (max-width: 576px) {
    padding: 1.5rem;
  }
`;

const ServiceIcon = styled.div`
  width: 200px;
  height: 150px;
  background-color: #f5f5f5;
  border: 2px dashed var(--primary-color);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1.8rem;
  font-size: 1.6rem;
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  @media screen and (max-width: 768px) {
    width: 150px;
    height: 110px;
    margin-bottom: 1.5rem;
    font-size: 1.4rem;
  }
  @media screen and (max-width: 576px) {
    width: 120px;
    height: 90px;
    margin-bottom: 1.2rem;
    font-size: 1.2rem;
  }
`;

const ServiceTextContent = styled.div`
  flex-grow: 1;
  display: flex;
  flex-direction: column;

  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.8rem;
    color: var(--dark-color);

    @media screen and (max-width: 768px) {
        font-size: 1.3rem;
        margin-bottom: 0.6rem;
    }
    @media screen and (max-width: 576px) {
        font-size: 1.2rem;
        margin-bottom: 0.5rem;
    }
  }

  p {
    font-size: 1rem;
    color: #555;
    line-height: 1.6;
    margin-bottom: 1.5rem;

    @media screen and (max-width: 768px) {
        font-size: 0.95rem;
        line-height: 1.5;
    }
    @media screen and (max-width: 576px) {
        font-size: 0.9rem;
        line-height: 1.4;
    }
  }
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ServiceDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
  text-align: center;
  margin-top: auto;
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ServiceDetail = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  color: #555;
  font-size: 0.95rem;
  
  i {
    color: var(--primary-color);
    width: 20px;
    text-align: center;
    font-size: 1rem;
  }
`;

const LoadingPlaceholder = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--text-muted);
`;

const ErrorPlaceholder = styled.div`
  text-align: center;
  padding: 2rem;
  color: var(--danger-color);
  border: 1px solid var(--danger-color);
  border-radius: var(--radius-sm);
  background-color: rgba(var(--danger-color-rgb), 0.05);
`;

interface ServicesProps {
  title?: string;
  subtitle?: string;
}

const Services: React.FC<ServicesProps> = ({ 
  title = "Что мы предлагаем",
  subtitle = "Все необходимое для вашего комфорта"
}) => {
  const [servicesData, setServicesData] = useState<ServiceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchServices = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await servicesService.getAllServices();
        setServicesData(Array.isArray(data) ? data : []);
      } catch (err: any) {
        console.error("Ошибка загрузки услуг:", err);
        const message = err.message || "Не удалось загрузить список услуг. Попробуйте позже.";
        setError(message);
        toast.error(message);
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, []);

  return (
    <ServicesSection id="services">
      <SectionTitle>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {title}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          viewport={{ once: true, amount: 0.3 }}
        >
          {subtitle}
        </motion.p>
      </SectionTitle>
      
      {loading ? (
        <LoadingPlaceholder>Загрузка услуг...</LoadingPlaceholder>
      ) : error ? (
        <ErrorPlaceholder>{error}</ErrorPlaceholder>
      ) : servicesData.length === 0 ? (
        <LoadingPlaceholder>Нет доступных услуг для отображения.</LoadingPlaceholder>
      ) : (
        <ServicesGrid>
          {servicesData.map((service: ServiceType, index: number) => (
            <ServiceCard
              key={service._id}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <ServiceIcon>
                {service.name.toLowerCase().includes('сауна') ? <i className="fas fa-hot-tub"></i> :
                service.name.toLowerCase().includes('wi-fi') ? <i className="fas fa-wifi"></i> :
                service.name.toLowerCase().includes('кухня') ? <i className="fas fa-utensils"></i> :
                service.name.toLowerCase().includes('лесопарковая') ? <i className="fas fa-tree"></i> :
                service.name.toLowerCase().includes('парковка') ? <i className="fas fa-parking"></i> :
                service.name.toLowerCase().includes('транспорт') ? <i className="fas fa-bus"></i> :
                service.icon && (service.icon.startsWith('http') || service.icon.startsWith('/')) ?
                  <img src={optimizeCloudinaryImage(service.icon, 'f_auto,q_auto,w_400')} alt={service.name} loading="lazy" /> :
                service.icon ? 
                  <i className={service.icon}></i> :
                <i className={'fas fa-concierge-bell'}></i>
                }
              </ServiceIcon>
              <ServiceTextContent>
                <h3>{service.name}</h3>
                <p>{service.description || 'Описание услуги скоро появится.'}</p>
              </ServiceTextContent>
            </ServiceCard>
          ))}
        </ServicesGrid>
      )}
    </ServicesSection>
  );
};

export default Services; 
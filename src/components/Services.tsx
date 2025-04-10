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
`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const ServiceDetails = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.8rem;
  margin-bottom: 1.5rem;
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

const OutlineButton = styled.a`
  display: inline-block;
  padding: 0.8rem 1.8rem;
  background: transparent;
  border: 2px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: var(--radius-sm);
  font-weight: 600;
  cursor: pointer;
  text-decoration: none;
  transition: var(--transition);
  text-align: center;
  
  &:hover {
    background: var(--primary-color);
    color: white;
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
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
  color: var(--error-color);
  border: 1px solid var(--error-color);
  border-radius: var(--radius-sm);
  background-color: rgba(255, 0, 0, 0.05);
`;

interface ServicesProps {
  title?: string;
  subtitle?: string;
}

const Services: React.FC<ServicesProps> = ({ 
  title = "Наши Услуги",
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
      
      {loading && <LoadingPlaceholder>Загрузка услуг...</LoadingPlaceholder>}
      {error && <ErrorPlaceholder>{error}</ErrorPlaceholder>}
      
      {!loading && !error && (
        <ServicesGrid>
          {servicesData.map((service: ServiceType, index: number) => (
            <ServiceCard
              key={service._id || index}
              as={motion.div}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true, amount: 0.3 }}
            >
              <ServiceIcon>
                {service.icon && (service.icon.startsWith('http') || service.icon.startsWith('/')) ? (
                  <img 
                    src={optimizeCloudinaryImage(service.icon, 'f_auto,q_auto,w_100')}
                    alt={service.name}
                    loading="lazy"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent && !parent.querySelector('.fallback-icon-text')) {
                          const textNode = document.createElement('span');
                          textNode.className = 'fallback-icon-text';
                          textNode.textContent = service.name;
                          parent.appendChild(textNode);
                      }
                    }} 
                  />
                ) : service.icon && service.icon.startsWith('fa') ? (
                  <i className={service.icon} style={{ fontSize: '3rem' }}></i>
                ) : (
                  <span>{service.name}</span>
                )}
              </ServiceIcon>
              <h3>{service.name}</h3>
              <p>{service.description || 'Описание услуги скоро появится.'}</p>
              <OutlineButton href="/services"> 
                Подробнее
              </OutlineButton>
            </ServiceCard>
          ))}
        </ServicesGrid>
      )}
    </ServicesSection>
  );
};

export default Services; 
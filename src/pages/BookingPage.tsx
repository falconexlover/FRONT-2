import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { useLocation, useNavigate } from 'react-router-dom';

const BookingSection = styled.section`
  padding: var(--space-xxxl) 0; /* Увеличим вертикальный отступ секции */
  background-color: var(--grey-lighter); /* Легкий фон для всей секции */
  min-height: calc(100vh - 200px); /* Примерная высота, чтобы футер не прилипал */
  display: flex;
  align-items: center;
  justify-content: center;
`;

const BookingContainer = styled.div`
  padding: var(--space-xxl) var(--space-xxl); /* 48px */
  max-width: 700px; /* Сделаем чуть уже */
  width: 90%; /* Добавим отступы на мобильных */
  margin: 0 auto;
  background-color: #fff;
  border-radius: var(--radius-lg); /* Скруглим углы побольше */
  box-shadow: var(--shadow-lg); /* Усилим тень */

  @media screen and (max-width: 768px) {
    padding: var(--space-xl) var(--space-lg); /* 32px 24px */
  }
  
  @media screen and (max-width: 576px) {
    padding: var(--space-xl) var(--space-md); /* 32px 16px */
    width: calc(100% - var(--space-lg)); /* 100% - 24px */
    margin: var(--space-lg) auto; /* Добавим вертикальный отступ */
  }
`;

const Title = styled.h1`
  text-align: center;
  color: var(--dark-color);
  margin-bottom: var(--space-xxl); /* 48px */
  font-family: 'Playfair Display', serif;
  font-size: 2.2rem; /* Сделаем заголовок чуть больше */
  position: relative;
  padding-bottom: var(--space-md); /* 16px, место для подчеркивания */

  &::after {
    content: '';
    position: absolute;
    width: 70px;
    height: 3px;
    background-color: var(--primary-color);
    bottom: 0;
    left: 50%;
    transform: translateX(-50%);
  }

  @media screen and (max-width: 576px) {
    font-size: 1.8rem;
    margin-bottom: var(--space-xl); /* 32px */
  }
`;

const Form = styled.form`
  display: grid;
  gap: var(--space-xl); /* Увеличим разрыв между группами */
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
  position: relative; /* Для возможного добавления иконок */
`;

const Label = styled.label`
  margin-bottom: var(--space-sm); /* 8px */
  font-weight: 500; /* Сделаем чуть менее жирным */
  font-size: 0.9rem; /* Уменьшим размер */
  color: var(--text-secondary);
`;

const Input = styled.input`
  padding: var(--space-md); /* 16px */
  border: 1.5px solid var(--grey-dark, #888); /* Толще и темнее граница + fallback */
  border-radius: var(--radius-sm);
  font-size: 1rem;
  background-color: #fff; 
  transition: border-color var(--transition), box-shadow var(--transition);
  color: var(--dark-color, #333); /* Убедимся, что текст темный + fallback */
  width: 100%; 
  box-sizing: border-box; 

  &:focus {
    outline: none;
    border-color: var(--primary-color, #007bff); /* Добавим fallback */
    box-shadow: 0 0 0 3px var(--primary-color-light, rgba(0, 123, 255, 0.25)); /* Добавим fallback */
    background-color: #fff; 
  }

  /* Стили для placeholder */
  &::placeholder {
    color: var(--text-secondary, #6c757d); /* Темнее плейсхолдер + fallback */
    opacity: 1; 
  }

  /* Убираем стандартный вид для date input */
  &[type="date"]::-webkit-calendar-picker-indicator {
    opacity: 0.6;
    cursor: pointer;
    filter: invert(0.4);
    transition: opacity 0.2s;
    &:hover {
      opacity: 0.8;
    }
  }
`;

const DateInputs = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg); /* 24px */

    @media screen and (max-width: 576px) {
        grid-template-columns: 1fr;
        /* gap остается прежним для моб. версии */
    }
`;

const GuestInputs = styled.div`
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-lg); /* 24px */

    @media screen and (max-width: 576px) {
        grid-template-columns: 1fr;
    }
`;

const SubmitButton = styled.button`
  padding: var(--space-md) var(--space-xl); /* 16px 32px */
  background: linear-gradient(to right, var(--primary-color), var(--accent-color)); /* Градиент */
  color: white;
  border: none;
  border-radius: var(--radius-md); /* Немного увеличим скругление */
  font-size: 1.1rem;
  font-weight: 600;
  cursor: pointer;
  transition: all var(--transition);
  margin-top: var(--space-lg); /* 24px */
  box-shadow: var(--shadow-sm);
  width: 100%; /* Растянем кнопку */

  &:hover:not(:disabled) {
    box-shadow: var(--shadow-md);
    transform: translateY(-2px); /* Легкий подъем при наведении */
    filter: brightness(1.1); /* Немного ярче */
  }

  &:active:not(:disabled) {
    transform: translateY(0);
    box-shadow: var(--shadow-sm);
    filter: brightness(1); 
  }

  &:disabled {
    background: var(--grey-light);
    cursor: not-allowed;
    box-shadow: none;
  }
`;

const BookingPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { roomId, roomTitle } = location.state || {};

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    checkInDate: '',
    checkOutDate: '',
    adults: 1,
    children: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!roomId) {
      toast.error('Ошибка: Не указана комната для бронирования. Возвращаем на главную.');
      navigate('/');
    }
  }, [roomId, navigate]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const newValue = (name === 'adults' || name === 'children') ? parseInt(value, 10) : value;
    setFormData(prev => ({ ...prev, [name]: newValue }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!roomId) {
      toast.error('Ошибка: Не удалось определить комнату для бронирования.');
      return;
    }

    if (!formData.checkInDate || !formData.checkOutDate || new Date(formData.checkOutDate) <= new Date(formData.checkInDate)) {
        toast.error('Пожалуйста, выберите корректные даты заезда и выезда.');
        return;
    }

    if (formData.adults < 1) {
        toast.error('Должен быть хотя бы 1 взрослый.');
        return;
    }

    setIsSubmitting(true);
    toast.info('Создаем бронирование и переходим к оплате...');

    try {
        const bookingPayload = {
            roomId: roomId,
            guestName: formData.name,
            guestEmail: formData.email,
            guestPhone: formData.phone,
            checkIn: formData.checkInDate,
            checkOut: formData.checkOutDate,
            guests: { adults: formData.adults, children: formData.children },
            notes: ''
        };

        const response = await fetch('/api/bookings', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(bookingPayload),
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.message || 'Ошибка при создании бронирования.');
        }

        if (data.confirmationUrl) {
            window.location.href = data.confirmationUrl;
        } else {
            throw new Error('Не удалось получить ссылку на оплату.');
        }

    } catch (error) {
        console.error('Booking submission error:', error);
        const errorMessage = error instanceof Error ? error.message : String(error);
        toast.error(`Ошибка бронирования: ${errorMessage}`);
        setIsSubmitting(false);
    }
  };

  return (
    <BookingSection>
      <BookingContainer>
        <Title>Оформление бронирования {roomTitle ? `(${roomTitle})` : ''}</Title>
        <Form onSubmit={handleSubmit}>
          <FormGroup>
            <Label htmlFor="name">Ваше Имя</Label>
            <Input type="text" id="name" name="name" value={formData.name} onChange={handleChange} required placeholder="Иван Иванов" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="email">Email</Label>
            <Input type="email" id="email" name="email" value={formData.email} onChange={handleChange} required placeholder="example@mail.com" />
          </FormGroup>
          <FormGroup>
            <Label htmlFor="phone">Телефон</Label>
            <Input type="tel" id="phone" name="phone" value={formData.phone} onChange={handleChange} required placeholder="+7 (999) 123-45-67" />
          </FormGroup>
          <DateInputs>
              <FormGroup>
                  <Label htmlFor="checkInDate">Дата заезда</Label>
                  <Input type="date" id="checkInDate" name="checkInDate" value={formData.checkInDate} onChange={handleChange} required />
              </FormGroup>
              <FormGroup>
                  <Label htmlFor="checkOutDate">Дата выезда</Label>
                  <Input type="date" id="checkOutDate" name="checkOutDate" value={formData.checkOutDate} onChange={handleChange} required />
              </FormGroup>
          </DateInputs>
          <GuestInputs>
              <FormGroup>
                  <Label htmlFor="adults">Взрослые</Label>
                  <Input type="number" id="adults" name="adults" value={formData.adults} onChange={handleChange} required min="1" />
              </FormGroup>
              <FormGroup>
                  <Label htmlFor="children">Дети</Label>
                  <Input type="number" id="children" name="children" value={formData.children} onChange={handleChange} required min="0" />
              </FormGroup>
          </GuestInputs>
          <SubmitButton type="submit" disabled={isSubmitting || !roomId}>
            {isSubmitting ? 'Обработка...' : 'Перейти к оплате'}
          </SubmitButton>
        </Form>
      </BookingContainer>
    </BookingSection>
  );
};

export default BookingPage;

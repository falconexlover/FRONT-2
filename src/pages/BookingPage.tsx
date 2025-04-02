import React, { useState } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { IMAGES } from '../assets/placeholders';

const BookingSection = styled.section`
  padding: 6rem 2rem;
  background-color: var(--light-color);
`;

const BookingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 4rem;
  position: relative;
  
  h1 {
    font-size: 2.8rem;
    color: var(--dark-color);
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    position: relative;
    
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

const BookingForm = styled(motion.div)`
  margin-top: 2rem;
  background-color: white;
  padding: 3rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-md);
  
  @media screen and (max-width: 768px) {
    padding: 2rem;
  }
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 2rem;
  margin-bottom: 2rem;
  
  @media screen and (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 1.5rem;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 1.5rem;
  
  label {
    display: block;
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-weight: 500;
  }
  
  input, select, textarea {
    width: 100%;
    padding: 0.8rem 1rem;
    border: 1px solid #ddd;
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 1rem;
    transition: var(--transition);
    
    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(33, 113, 72, 0.1);
    }
  }
  
  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

const RoomSelector = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RoomCard = styled.div<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : '#ddd'};
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: var(--shadow-md);
    border-color: ${props => props.selected ? 'var(--primary-color)' : 'var(--accent-color)'};
  }
  
  .check-mark {
    position: absolute;
    top: 10px;
    right: 10px;
    width: 25px;
    height: 25px;
    background-color: var(--primary-color);
    border-radius: 50%;
    display: ${props => props.selected ? 'flex' : 'none'};
    align-items: center;
    justify-content: center;
    color: white;
    font-size: 0.8rem;
    z-index: 1;
  }
`;

const RoomImage = styled.div`
  height: 180px;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const RoomInfo = styled.div`
  padding: 1.5rem;
  
  h3 {
    margin-bottom: 0.5rem;
    color: var(--dark-color);
    font-size: 1.2rem;
  }
  
  .price {
    color: var(--primary-color);
    font-weight: 700;
    font-size: 1.2rem;
    margin-bottom: 0.5rem;
    
    span {
      font-size: 0.9rem;
      font-weight: 400;
      color: #666;
    }
  }
  
  .features {
    margin-top: 1rem;
    
    li {
      display: flex;
      align-items: center;
      margin-bottom: 0.3rem;
      color: #666;
      font-size: 0.9rem;
      
      i {
        color: var(--primary-color);
        margin-right: 0.5rem;
        font-size: 0.8rem;
      }
    }
  }
`;

const PriceCalculation = styled.div`
  background-color: var(--gray-bg);
  padding: 1.5rem;
  border-radius: var(--radius-md);
  margin-bottom: 2rem;
`;

const PriceRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.8rem;
  padding-bottom: 0.8rem;
  border-bottom: 1px dashed #ddd;
  
  &:last-child {
    border-bottom: none;
    margin-bottom: 0;
    padding-bottom: 0;
  }
  
  &.total {
    font-weight: 700;
    color: var(--dark-color);
    font-size: 1.2rem;
    margin-top: 1rem;
    border-top: 1px solid #ddd;
    padding-top: 1rem;
  }
`;

const SubmitButton = styled.button`
  width: 100%;
  padding: 1rem 0;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: var(--radius-sm);
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: var(--transition);
  
  &:hover {
    background-color: var(--accent-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const SuccessMessage = styled(motion.div)`
  padding: 2rem;
  background-color: rgba(33, 113, 72, 0.1);
  border-left: 3px solid var(--primary-color);
  color: var(--primary-color);
  border-radius: var(--radius-md);
  margin-top: 2rem;
  text-align: center;
  
  h3 {
    color: var(--primary-color);
    margin-bottom: 1rem;
  }
  
  p {
    margin-bottom: 1rem;
  }
  
  .booking-details {
    background-color: white;
    padding: 1rem;
    border-radius: var(--radius-sm);
    margin: 1.5rem 0;
    text-align: left;
    
    h4 {
      margin-bottom: 0.5rem;
      color: var(--dark-color);
    }
    
    ul {
      list-style: none;
      
      li {
        display: flex;
        justify-content: space-between;
        padding: 0.5rem 0;
        border-bottom: 1px dashed #eee;
        
        &:last-child {
          border-bottom: none;
        }
        
        span:first-child {
          font-weight: 500;
          color: var(--dark-color);
        }
      }
    }
  }
`;

// Типы комнат
interface RoomType {
  id: string;
  title: string;
  image: string;
  price: string;
  priceValue: number;
  capacity: number;
  features: string[];
}

const BookingPage: React.FC = () => {
  // Комнаты для выбора
  const rooms: RoomType[] = [
    {
      id: '2-economy',
      title: '2-местный эконом',
      image: IMAGES.ROOM_ECONOMY,
      price: '2 500 ₽ / сутки (1 чел)',
      priceValue: 2500,
      capacity: 2,
      features: ['2 отдельные кровати', 'Телевизор', 'Общий душ', 'Балкон']
    },
    {
      id: '2-family',
      title: '2-местный семейный',
      image: IMAGES.ROOM_FAMILY,
      price: '3 800 ₽ / сутки',
      priceValue: 3800,
      capacity: 2,
      features: ['Двуспальная кровать', 'Холодильник', 'Душевая кабина', 'Санузел']
    },
    {
      id: '4-economy',
      title: '4-местный эконом',
      image: IMAGES.ROOM_MULTIPLE,
      price: '5 000 ₽ / сутки',
      priceValue: 5000,
      capacity: 4,
      features: ['4 односпальных кровати', '2 комнаты', 'Душевая кабина', 'Ванна']
    }
  ];
  
  // Состояния для формы
  const [bookingData, setBookingData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    checkIn: '',
    checkOut: '',
    adults: '2',
    children: '0',
    notes: ''
  });
  
  const [selectedRoomId, setSelectedRoomId] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Расчет дат и стоимости
  const checkInDate = bookingData.checkIn ? new Date(bookingData.checkIn) : null;
  const checkOutDate = bookingData.checkOut ? new Date(bookingData.checkOut) : null;
  
  let numberOfNights = 0;
  
  if (checkInDate && checkOutDate) {
    const timeDifference = checkOutDate.getTime() - checkInDate.getTime();
    numberOfNights = Math.ceil(timeDifference / (1000 * 3600 * 24));
  }
  
  // Выбранная комната
  const selectedRoom = rooms.find(room => room.id === selectedRoomId);
  
  // Расчет стоимости
  const roomCost = selectedRoom ? selectedRoom.priceValue * numberOfNights : 0;
  const serviceFee = Math.floor(roomCost * 0.05);
  const totalCost = roomCost + serviceFee;
  
  // Обработчики ввода
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setBookingData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const selectRoom = (roomId: string) => {
    setSelectedRoomId(roomId);
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Имитация отправки формы
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
    }, 1500);
  };
  
  // Форматирование даты для отображения
  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };
  
  return (
    <BookingSection id="booking">
      <BookingContainer>
        <SectionTitle>
          <h1>Бронирование номера</h1>
        </SectionTitle>
        
        {!isSubmitted ? (
          <BookingForm
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            as="form"
            onSubmit={handleSubmit}
          >
            <h3>1. Выберите номер</h3>
            <RoomSelector>
              {rooms.map((room) => (
                <RoomCard 
                  key={room.id} 
                  selected={selectedRoomId === room.id}
                  onClick={() => selectRoom(room.id)}
                >
                  <div className="check-mark">
                    <i className="fas fa-check"></i>
                  </div>
                  <RoomImage>
                    <img src={room.image} alt={room.title} />
                  </RoomImage>
                  <RoomInfo>
                    <h3>{room.title}</h3>
                    <div className="price">{room.price}</div>
                    <ul className="features">
                      {room.features.map((feature, index) => (
                        <li key={index}>
                          <i className="fas fa-check-circle"></i>
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </RoomInfo>
                </RoomCard>
              ))}
            </RoomSelector>
            
            <h3>2. Введите даты и информацию о гостях</h3>
            <FormRow>
              <FormGroup>
                <label htmlFor="checkIn">Дата заезда</label>
                <input 
                  type="date" 
                  id="checkIn" 
                  name="checkIn"
                  value={bookingData.checkIn}
                  onChange={handleChange}
                  min={new Date().toISOString().split('T')[0]}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="checkOut">Дата выезда</label>
                <input 
                  type="date" 
                  id="checkOut" 
                  name="checkOut"
                  value={bookingData.checkOut}
                  onChange={handleChange}
                  min={bookingData.checkIn || new Date().toISOString().split('T')[0]}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label htmlFor="adults">Взрослые</label>
                <select 
                  id="adults" 
                  name="adults"
                  value={bookingData.adults}
                  onChange={handleChange}
                  required
                >
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4</option>
                </select>
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="children">Дети</label>
                <select 
                  id="children" 
                  name="children"
                  value={bookingData.children}
                  onChange={handleChange}
                >
                  <option value="0">0</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </FormGroup>
            </FormRow>
            
            <h3>3. Ваши данные</h3>
            <FormRow>
              <FormGroup>
                <label htmlFor="firstName">Имя</label>
                <input 
                  type="text" 
                  id="firstName" 
                  name="firstName"
                  value={bookingData.firstName}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="lastName">Фамилия</label>
                <input 
                  type="text" 
                  id="lastName" 
                  name="lastName"
                  value={bookingData.lastName}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormRow>
              <FormGroup>
                <label htmlFor="email">Email</label>
                <input 
                  type="email" 
                  id="email" 
                  name="email"
                  value={bookingData.email}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
              
              <FormGroup>
                <label htmlFor="phone">Телефон</label>
                <input 
                  type="tel" 
                  id="phone" 
                  name="phone"
                  value={bookingData.phone}
                  onChange={handleChange}
                  required
                />
              </FormGroup>
            </FormRow>
            
            <FormGroup>
              <label htmlFor="notes">Особые пожелания (необязательно)</label>
              <textarea 
                id="notes" 
                name="notes"
                value={bookingData.notes}
                onChange={handleChange}
              ></textarea>
            </FormGroup>
            
            {selectedRoomId && numberOfNights > 0 && (
              <PriceCalculation>
                <h3>Расчет стоимости</h3>
                <PriceRow>
                  <span>{selectedRoom?.title}</span>
                  <span>{selectedRoom?.priceValue} ₽ × {numberOfNights} ночей</span>
                </PriceRow>
                <PriceRow>
                  <span>Стоимость номера</span>
                  <span>{roomCost} ₽</span>
                </PriceRow>
                <PriceRow>
                  <span>Сервисный сбор</span>
                  <span>{serviceFee} ₽</span>
                </PriceRow>
                <PriceRow className="total">
                  <span>Итого</span>
                  <span>{totalCost} ₽</span>
                </PriceRow>
              </PriceCalculation>
            )}
            
            <SubmitButton 
              type="submit" 
              disabled={!selectedRoomId || numberOfNights <= 0 || isSubmitting}
            >
              {isSubmitting ? 'Обработка...' : 'Забронировать'}
            </SubmitButton>
          </BookingForm>
        ) : (
          <SuccessMessage
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h3>Бронирование успешно выполнено!</h3>
            <p>Спасибо, {bookingData.firstName}! Ваше бронирование успешно отправлено.</p>
            <p>Мы отправили подтверждение на указанный вами адрес электронной почты. Наш менеджер свяжется с вами в ближайшее время для подтверждения деталей брони.</p>
            
            <div className="booking-details">
              <h4>Детали бронирования:</h4>
              <ul>
                <li>
                  <span>Номер:</span>
                  <span>{selectedRoom?.title}</span>
                </li>
                <li>
                  <span>Даты проживания:</span>
                  <span>{formatDate(bookingData.checkIn)} - {formatDate(bookingData.checkOut)}</span>
                </li>
                <li>
                  <span>Количество ночей:</span>
                  <span>{numberOfNights}</span>
                </li>
                <li>
                  <span>Гости:</span>
                  <span>{bookingData.adults} взр. / {bookingData.children} детей</span>
                </li>
                <li>
                  <span>Итоговая стоимость:</span>
                  <span>{totalCost} ₽</span>
                </li>
              </ul>
            </div>
            
            <p>Номер вашего бронирования: <strong>BK-{Math.floor(Math.random() * 100000)}</strong></p>
            <p>Если у вас возникнут вопросы, пожалуйста, свяжитесь с нами по телефону: <strong><a href="tel:+74984831941">8 (498) 483 19 41</a></strong></p>
          </SuccessMessage>
        )}
      </BookingContainer>
    </BookingSection>
  );
};

export default BookingPage; 
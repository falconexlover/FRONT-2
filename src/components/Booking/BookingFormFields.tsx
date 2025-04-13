import React from 'react';
import styled from 'styled-components';

// --- Styled Components (перенесены из BookingPage) ---

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
    border: 1px solid var(--border-color);
    border-radius: var(--radius-sm);
    font-family: inherit;
    font-size: 1rem;
    transition: var(--transition);

    &:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(33, 113, 72, 0.1);
    }

    &:disabled {
        background-color: #f0f0f0; // Стиль для неактивных полей
        cursor: not-allowed;
    }
  }

  textarea {
    min-height: 100px;
    resize: vertical;
  }
`;

// --- Component ---

// Используем тот же интерфейс, что и в BookingPage, или определим локально нужные поля
interface BookingFormState {
    checkIn: string;
    checkOut: string;
    guests: string;
    fullName: string;
    email: string;
    phone: string;
    notes: string;
    // Добавляем selectedRoomId, чтобы можно было вычислить min для checkOut
    selectedRoomId: string | null; 
}

interface BookingFormFieldsProps {
  formData: BookingFormState;
  handleInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
  isSubmitting: boolean;
}

const BookingFormFields: React.FC<BookingFormFieldsProps> = ({ formData, handleInputChange, isSubmitting }) => {

    // Минимальная дата для выбора - сегодня
    const today = new Date().toISOString().split('T')[0];
    // Минимальная дата выезда - дата заезда или сегодня
    const minCheckOutDate = formData.checkIn || today;

  return (
    <>
      {/* --- Поля формы --- */}
      <FormRow>
        <FormGroup>
          <label htmlFor="checkIn">Дата заезда:</label>
          <input 
            type="date" 
            id="checkIn" 
            name="checkIn" 
            value={formData.checkIn} 
            onChange={handleInputChange} 
            required 
            disabled={isSubmitting} 
            min={today} // Нельзя выбрать дату раньше сегодняшнего дня
          />
        </FormGroup>
        <FormGroup>
          <label htmlFor="checkOut">Дата выезда:</label>
          <input 
            type="date" 
            id="checkOut" 
            name="checkOut" 
            value={formData.checkOut} 
            onChange={handleInputChange} 
            required 
            disabled={isSubmitting || !formData.checkIn} // Блокируем, если не выбрана дата заезда
            min={minCheckOutDate} // Нельзя выбрать дату раньше даты заезда
          />
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
            <label htmlFor="guests">Количество гостей:</label>
            <select 
                id="guests" 
                name="guests" 
                value={formData.guests} 
                onChange={handleInputChange} 
                required 
                disabled={isSubmitting}
            >
            {[1, 2, 3, 4, 5, 6].map(num => <option key={num} value={num}>{num}</option>)}
            </select>
        </FormGroup>
      </FormRow>

      <FormRow>
        <FormGroup>
          <label htmlFor="fullName">Ваше имя:</label>
          <input 
            type="text" 
            id="fullName" 
            name="fullName" 
            value={formData.fullName} 
            onChange={handleInputChange} 
            required 
            disabled={isSubmitting} 
          />
        </FormGroup>
        <FormGroup>
            <label htmlFor="email">Email:</label>
            <input 
                type="email" 
                id="email" 
                name="email" 
                value={formData.email} 
                onChange={handleInputChange} 
                required 
                disabled={isSubmitting} 
            />
        </FormGroup>
      </FormRow>

        <FormRow>
        <FormGroup>
            <label htmlFor="phone">Телефон:</label>
            <input 
                type="tel" 
                id="phone" 
                name="phone" 
                value={formData.phone} 
                onChange={handleInputChange} 
                required 
                disabled={isSubmitting} 
            />
        </FormGroup>
        </FormRow>

      <FormGroup>
        <label htmlFor="notes">Дополнительные пожелания:</label>
        <textarea 
            id="notes" 
            name="notes" 
            value={formData.notes} 
            onChange={handleInputChange} 
            disabled={isSubmitting}
        ></textarea>
      </FormGroup>
    </>
  );
};

export default BookingFormFields; 
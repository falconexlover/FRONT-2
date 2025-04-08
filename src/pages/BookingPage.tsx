import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { roomsService, bookingService } from '../utils/api';
import { RoomType } from '../types/Room';
import { BookingData } from '../types/Booking';
import RoomSelection from '../components/Booking/RoomSelection';
import BookingFormFields from '../components/Booking/BookingFormFields';
import PriceSummary from '../components/Booking/PriceSummary';
import BookingActions from '../components/Booking/BookingActions';

const BookingSection = styled.section`
  padding: 6rem 2rem 4rem;
  background-color: var(--light-color);
  min-height: calc(100vh - 100px);
`;

const BookingContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`;

const SectionTitle = styled.div`
  text-align: center;
  margin-bottom: 3rem;
  position: relative;
  
  h1 {
    font-size: 2.5rem;
    color: var(--dark-color);
    display: inline-block;
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    position: relative;
    padding-bottom: 1rem;
    
    &::before {
      content: '';
      position: absolute;
      width: 50px;
      height: 3px;
      background-color: var(--accent-color);
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
    }
    
    &::after {
      content: '';
      position: absolute;
      width: 15px;
      height: 3px;
      background-color: var(--primary-color);
      bottom: 0;
      left: calc(50% + 30px);
      transform: translateX(-50%);
    }
  }
`;

const BookingFormWrapper = styled(motion.form)`
  margin-top: 2rem;
  background-color: white;
  padding: 2.5rem;
  border-radius: var(--radius-md);
  box-shadow: var(--shadow-lg);
  
  @media screen and (max-width: 768px) {
    padding: 1.5rem;
  }
`;

const GeneralErrorMessage = styled.p`
    color: var(--danger-color, #e53935);
    background-color: rgba(229, 57, 53, 0.08);
    border: 1px solid rgba(229, 57, 53, 0.3);
    padding: 1rem 1.5rem;
    border-radius: var(--radius-sm);
    margin-bottom: 1.5rem;
    text-align: center;
    font-size: 0.95rem;
    font-weight: 500;
`;

const LoadingIndicator = styled.div`
    text-align: center;
    padding: 3rem 0;
    font-size: 1.2rem;
    color: var(--primary-color);
`;

const BookingPage: React.FC = () => {
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [rooms, setRooms] = useState<RoomType[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  interface BookingPageState {
    selectedRoomId: string | null;
    checkIn: string;
    checkOut: string;
    guests: string;
    fullName: string;
    email: string;
    phone: string;
    notes: string;
  }
  const [formData, setFormData] = useState<BookingPageState>({
    selectedRoomId: null,
    checkIn: '',
    checkOut: '',
    guests: '1',
    fullName: '',
    email: '',
    phone: '',
    notes: '',
  });
  
  const [numberOfNights, setNumberOfNights] = useState<number>(0);
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [submissionError, setSubmissionError] = useState<string | null>(null);
  const [submittedBookingDetails, setSubmittedBookingDetails] = useState<any>(null);
  
  useEffect(() => {
    let isMounted = true;
    const fetchRooms = async () => {
      setIsLoadingRooms(true);
      setError(null);
      try {
        const fetchedRooms = await roomsService.getAllRooms();
        if (isMounted) {
            setRooms(fetchedRooms);
            const firstAvailableRoom = fetchedRooms.find((room: RoomType) => room.isAvailable !== false && room._id);
            if (firstAvailableRoom?._id) {
              setFormData(prev => ({ ...prev, selectedRoomId: firstAvailableRoom._id || null }));
            }
        }
      } catch (err) {
        if (isMounted) {
            console.error("Ошибка загрузки номеров:", err);
            setError("Не удалось загрузить доступные номера. Пожалуйста, обновите страницу или попробуйте позже.");
        }
      } finally {
        if (isMounted) {
            setIsLoadingRooms(false);
        }
      }
    };
    fetchRooms();
    return () => { isMounted = false; };
  }, []);
  
  useEffect(() => {
    const calculate = () => {
      if (formData.checkIn && formData.checkOut && formData.selectedRoomId) {
        const checkInDate = new Date(formData.checkIn);
        const checkOutDate = new Date(formData.checkOut);
        const selectedRoom = rooms.find((room: RoomType) => room._id === formData.selectedRoomId);

        if (checkOutDate > checkInDate && selectedRoom) {
          const diffTime = Math.abs(checkOutDate.getTime() - checkInDate.getTime());
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
          setNumberOfNights(diffDays);
          setTotalPrice(diffDays * selectedRoom.pricePerNight);
        } else {
          setNumberOfNights(0);
          setTotalPrice(0);
        }
      } else {
        setNumberOfNights(0);
        setTotalPrice(0);
      }
    };
    calculate();
  }, [formData.checkIn, formData.checkOut, formData.selectedRoomId, rooms]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (submissionStatus === 'error') {
        setSubmissionStatus('idle');
        setSubmissionError(null);
    }
  };
  
  const handleRoomSelect = (roomId: string | null) => {
    setFormData(prev => ({ ...prev, selectedRoomId: prev.selectedRoomId === roomId ? null : roomId }));
    if (submissionStatus === 'error') {
        setSubmissionStatus('idle');
        setSubmissionError(null);
    }
  };
  
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!formData.selectedRoomId) {
      setSubmissionError("Пожалуйста, выберите номер.");
      setSubmissionStatus('error');
      return;
    }
    if (totalPrice <= 0 || numberOfNights <= 0) {
        setSubmissionError("Пожалуйста, выберите корректные даты заезда и выезда.");
        setSubmissionStatus('error');
      return;
    }

    setIsSubmitting(true);
    setSubmissionError(null);
    setSubmissionStatus('idle');

    try {
      const bookingData: BookingData = {
        roomId: formData.selectedRoomId!,
        checkIn: formData.checkIn,
        checkOut: formData.checkOut,
        guests: parseInt(formData.guests, 10),
        guestName: formData.fullName,
        guestEmail: formData.email,
        guestPhone: formData.phone,
        notes: formData.notes,
        totalPrice: totalPrice,
        numberOfNights: numberOfNights,
      };
      
      const response = await bookingService.createBooking(bookingData);
      setSubmittedBookingDetails(response);
      setSubmissionStatus('success');
    } catch (err: any) {
      console.error("Ошибка бронирования:", err);
      setSubmissionError(err.response?.data?.message || "Произошла ошибка при бронировании. Пожалуйста, попробуйте еще раз.");
      setSubmissionStatus('error');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const selectedRoomDetails = rooms.find((room: RoomType) => room._id === formData.selectedRoomId);
  const canSubmit = !!formData.selectedRoomId && totalPrice > 0 && numberOfNights > 0;

  return (
    <BookingSection id="booking">
      <BookingContainer>
        <SectionTitle>
          <h1>Бронирование номера</h1>
        </SectionTitle>
        
        {isLoadingRooms && <LoadingIndicator>Загрузка доступных номеров...</LoadingIndicator>}
        {!isLoadingRooms && error && <GeneralErrorMessage>{error}</GeneralErrorMessage>}
        
        {!isLoadingRooms && !error && (
            submissionStatus !== 'success' ? (
            <BookingFormWrapper onSubmit={handleSubmit} initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                <RoomSelection
                rooms={rooms}
                selectedRoomId={formData.selectedRoomId}
                onRoomSelect={handleRoomSelect}
                />

                <BookingFormFields 
                formData={formData}
                handleInputChange={handleInputChange}
                isSubmitting={isSubmitting}
                />

                <PriceSummary 
                    selectedRoomDetails={selectedRoomDetails}
                    numberOfNights={numberOfNights}
                    totalPrice={totalPrice}
                />

                <BookingActions
                    isSubmitting={isSubmitting}
                    canSubmit={canSubmit}
                    submissionStatus={submissionStatus} 
                    error={submissionError}
                    submittedBookingDetails={null}
                    rooms={[]}
                />
            </BookingFormWrapper>
            ) : (
            <BookingActions
                isSubmitting={false}
                canSubmit={false}
                submissionStatus={'success'}
                error={null}
                submittedBookingDetails={submittedBookingDetails}
                rooms={rooms}
            />
            )
        )}
      </BookingContainer>
    </BookingSection>
  );
};

export default BookingPage; 
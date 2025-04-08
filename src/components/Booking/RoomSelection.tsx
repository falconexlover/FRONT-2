import React from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import { RoomType } from '../../types/Room'; // Убедитесь, что путь правильный

// --- Styled Components ---

const RoomSelectorContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
`;

const RoomCardStyled = styled(motion.div)<{ selected: boolean }>`
  border: 2px solid ${props => props.selected ? 'var(--primary-color)' : '#ddd'};
  border-radius: var(--radius-md);
  overflow: hidden;
  transition: var(--transition);
  cursor: pointer;
  position: relative;
  background-color: white; // Добавим фон для видимости

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

// --- Component ---

interface RoomSelectionProps {
  rooms: RoomType[];
  selectedRoomId: string | null;
  onRoomSelect: (roomId: string) => void;
}

const RoomSelection: React.FC<RoomSelectionProps> = ({ rooms, selectedRoomId, onRoomSelect }) => {
  // Анимации для карточек
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.1,
        duration: 0.5
      }
    })
  };

  const handleSelect = (roomId: string | undefined) => {
    if (roomId) {
      onRoomSelect(roomId);
    }
  };

  return (
    <>
      <h2>Выберите номер:</h2>
      <RoomSelectorContainer>
        {rooms.map((room, index) => (
          <RoomCardStyled
            key={room._id || index} // Используем index как fallback key, если _id нет
            selected={!!room._id && selectedRoomId === room._id} // Проверяем наличие room._id
            onClick={() => handleSelect(room._id)} // Вызываем handleSelect
            variants={cardVariants}
            initial="hidden"
            animate="visible"
            custom={index}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
          >
            {!!room._id && selectedRoomId === room._id && (
              <div className="check-mark"><i className="fas fa-check"></i></div>
            )}
            <RoomImage>
              <img src={room.imageUrls?.[0] || '/placeholder-image.jpg'} alt={room.title} />
            </RoomImage>
            <RoomInfo>
              <h3>{room.title}</h3>
              <div className="price">
                {room.price}
              </div>
              {room.description && <p>{room.description}</p>}
              <ul className="features">
                {room.features?.slice(0, 3).map((feature: string, idx: number) => (
                  <li key={idx}><i className="fas fa-star"></i> {feature}</li>
                ))}
                {room.features && room.features.length > 3 && <li>...и др.</li>}
              </ul>
            </RoomInfo>
          </RoomCardStyled>
        ))}
      </RoomSelectorContainer>
    </>
  );
};

export default RoomSelection; 
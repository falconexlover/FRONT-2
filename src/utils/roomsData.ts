import { IMAGES } from '../assets/placeholders';

export interface RoomType {
  id: string;
  title: string;
  description: string;
  image: string;
  tag?: string;
  features: string[];
  price: string;
  priceNote?: string;
  additionalPrice?: string;
  additionalPriceNote?: string;
  capacity: number;
  hasPrivateBathroom: boolean;
  size: number;
  bedType: string;
  roomCount?: number;
}

// Массив с данными номеров отеля
export const INITIAL_ROOMS: RoomType[] = [
  {
    id: "2-economy",
    title: "Двухместный номер-эконом с балконом и видом на парк",
    description: "Двухместный эконом, в основном, заказывают те, кто приехал один. Номерного фонда достаточно, чтобы не подселять соседей. Подойдет для пары друзей или коллег одного пола. Или для семейной пары в ссоре - пока один любуется парком с балкона, другой озлобленно пьет чай. При низкой цене проживания, в номере есть все необходимое для удобства.",
    image: IMAGES.ROOM_ECONOMY,
    tag: "Популярный",
    features: ["Две отдельные кровати", "Общая ванная комната", "11 кв.м", "Балкон", "Wi-Fi", "Телевизор", "Душ", "Туалетные принадлежности", "Холодильник", "Чайник", "Бутилированная вода при заезде", "Возможна б/н оплата"],
    price: "2 500 ₽",
    priceNote: "/сутки (1 чел)",
    additionalPrice: "3 000 ₽",
    additionalPriceNote: "/сутки (2 чел)",
    capacity: 2,
    hasPrivateBathroom: false,
    size: 11,
    bedType: "Две односпальные кровати",
    roomCount: 10
  },
  {
    id: "2-family",
    title: "Двухместный семейный номер-стандарт с видом на парк из окна",
    description: "Двухместный семейный номер-стандарт оснащен одной двуспальной кроватью, что подразумевает заселение пары или одиночки, любящего отдыхать с комфортом. Удобные кресла, стол, большая площадь, шикарный вид из окна - все способствует приятному времяпрепровождению.",
    image: IMAGES.ROOM_FAMILY,
    tag: "Комфорт",
    features: ["Двуспальная кровать", "22 кв.м", "Душевая кабина и санузел", "Wi-Fi", "Телевизор", "Туалетные принадлежности", "Холодильник", "Чайник", "Бутилированная вода при заезде", "Возможна б/н оплата"],
    price: "3 800 ₽",
    priceNote: "/сутки",
    capacity: 2,
    hasPrivateBathroom: true,
    size: 22,
    bedType: "Двуспальная кровать",
    roomCount: 5
  },
  {
    id: "4-economy",
    title: "Четырехместный номер-эконом с балконом и видом на парк",
    description: "Четырехместный номер-эконом часто бронируют спортивные команды, друзья. Две комнаты, в каждой две кровати, стол, стулья. Общие душевая кабина, ванна, санузел. Весело и недорого.",
    image: IMAGES.ROOM_MULTIPLE,
    tag: "Для компании",
    features: ["4 односпальных кровати в 2 комнатах", "25 кв.м", "Душевая кабина, ванна, санузел", "Wi-Fi", "Телевизор", "Туалетные принадлежности", "Холодильник", "Чайник", "Бутилированная вода при заезде", "Возможна б/н оплата"],
    price: "5 000 ₽",
    priceNote: "/сутки",
    capacity: 4,
    hasPrivateBathroom: true,
    size: 25,
    bedType: "Четыре односпальные кровати",
    roomCount: 3
  }
];

// Ключ для хранения данных в localStorage
const ROOMS_STORAGE_KEY = 'hotel_forest_rooms_data';

/**
 * Загружает данные о номерах из localStorage
 */
export const loadRoomsFromStorage = (): RoomType[] => {
  try {
    const storedData = localStorage.getItem(ROOMS_STORAGE_KEY);
    if (!storedData) return INITIAL_ROOMS;
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Ошибка при загрузке данных о номерах:', error);
    return INITIAL_ROOMS;
  }
};

/**
 * Сохраняет данные о номерах в localStorage
 */
export const saveRoomsToStorage = (rooms: RoomType[]): void => {
  try {
    localStorage.setItem(ROOMS_STORAGE_KEY, JSON.stringify(rooms));
  } catch (error) {
    console.error('Ошибка при сохранении данных о номерах:', error);
  }
};

/**
 * Добавляет новый номер
 */
export const addRoom = (newRoom: RoomType): RoomType[] => {
  try {
    const currentRooms = loadRoomsFromStorage();
    const updatedRooms = [...currentRooms, newRoom];
    saveRoomsToStorage(updatedRooms);
    return updatedRooms;
  } catch (error) {
    console.error('Ошибка при добавлении номера:', error);
    return loadRoomsFromStorage();
  }
};

/**
 * Обновляет данные номера
 */
export const updateRoom = (roomId: string, updatedData: Partial<RoomType>): RoomType[] => {
  try {
    const currentRooms = loadRoomsFromStorage();
    const updatedRooms = currentRooms.map(room => 
      room.id === roomId ? { ...room, ...updatedData } : room
    );
    saveRoomsToStorage(updatedRooms);
    return updatedRooms;
  } catch (error) {
    console.error('Ошибка при обновлении номера:', error);
    return loadRoomsFromStorage();
  }
};

/**
 * Удаляет номер
 */
export const deleteRoom = (roomId: string): RoomType[] => {
  try {
    const currentRooms = loadRoomsFromStorage();
    const updatedRooms = currentRooms.filter(room => room.id !== roomId);
    saveRoomsToStorage(updatedRooms);
    return updatedRooms;
  } catch (error) {
    console.error('Ошибка при удалении номера:', error);
    return loadRoomsFromStorage();
  }
};

/**
 * Сбрасывает данные о номерах к исходным
 */
export const resetToDefaultRooms = (): RoomType[] => {
  saveRoomsToStorage(INITIAL_ROOMS);
  return INITIAL_ROOMS;
}; 
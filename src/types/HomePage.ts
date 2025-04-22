// FRONT-2/src/types/HomePage.ts

// Определяем структуру для подсекций
export interface BannerContent {
  title: string;
  subtitle: string;
  buttonText: string;
  buttonLink: string;
  image?: string; // Добавляем необязательное поле для URL изображения
}

export interface AboutContent {
  title: string;
  content: string;
  image?: string; // Добавляем необязательное поле для URL изображения
  imagePublicId?: string; // Добавляем ID из Cloudinary
}

// Экспортируем интерфейс для превью комнат на главной
export interface RoomPreview {
  _id?: string; // Используем ID от MongoDB (может отсутствовать у новых)
  title: string;
  price: string;
  // imageUrl?: string; // Раскомментируйте, если нужно для редактора
}

interface RoomsContent {
  title: string;
  subtitle: string;
  roomsData: RoomPreview[];
}

// Экспортируем интерфейс
export interface ServicePreview {
  _id?: string; // Используем ID от MongoDB (может отсутствовать у новых)
  title: string;
  description: string;
  icon: string; // URL или класс иконки
}

interface ServicesContent {
  title: string;
  subtitle: string;
  servicesData: ServicePreview[];
}

// Экспортируем интерфейс для контактов
export interface ContactContent {
  title: string;
  address: string;
  phone: string[];
  vk?: string;           // Добавляем ссылку на ВКонтакте
  coordinates?: [number, number]; // Добавляем необязательные координаты
  openingHours?: string;          // Добавляем необязательные часы работы
}

// Интерфейс для раздела "Детские праздники"
export interface PartyContent {
  title: string;
  content: string;
  imageUrls?: string[]; // Опционально, так как могут быть не загружены
  cloudinaryPublicIds?: string[]; // Опционально
}

// Интерфейс для раздела "Конференц-зал"
export interface ConferenceContent {
  title: string;
  content: string;
  imageUrls?: string[]; // Опционально
  cloudinaryPublicIds?: string[]; // Опционально
}

// Основной интерфейс для всего контента главной страницы
export interface HomePageContent {
  _id?: string; // Добавляется базой данных
  identifier: string;
  aboutText?: string; // TODO: Возможно, устарело
  banner?: BannerContent;
  about?: AboutContent;
  rooms: RoomsContent;
  services: ServicesContent;
  contact?: ContactContent;
  party?: PartyContent;
  conference?: ConferenceContent;
  // Добавьте поле для изображений, если нужно управлять ими централизованно
  // images?: { [key: string]: string }; 
} 
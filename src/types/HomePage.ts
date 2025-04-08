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
}

// Экспортируем интерфейс
export interface RoomPreview {
  _id?: string; // Используем ID от MongoDB (может отсутствовать у новых)
  title: string;
  description: string;
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
  email: string;
}

// Основной интерфейс для всего контента главной страницы
export interface HomePageContent {
  banner: BannerContent;
  about: AboutContent;
  rooms: RoomsContent;
  services: ServicesContent;
  contact: ContactContent;
  // Добавьте поле для изображений, если нужно управлять ими централизованно
  // images?: { [key: string]: string }; 
} 
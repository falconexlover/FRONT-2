// FRONT-2/src/types/HomePage.ts

// Определяем структуру для подсекций
interface BannerContent {
  title: string;
  subtitle: string;
  buttonText: string;
}

interface AboutContent {
  title: string;
  content: string;
  image?: string; // Добавляем необязательное поле для URL изображения
}

// Предполагаем структуру данных для номера (может отличаться от RoomType)
interface RoomPreview {
  id: string; // Используем ID или другой уникальный идентификатор
  title: string;
  description: string;
  price: string;
  // Добавьте imageUrl, если он нужен для редактора
}

interface RoomsContent {
  title: string;
  subtitle: string;
  roomsData: RoomPreview[];
}

// Предполагаем структуру данных для услуги
interface ServicePreview {
  id: string; // Используем ID или другой уникальный идентификатор
  title: string;
  description: string;
  icon: string; // Класс иконки Font Awesome
}

interface ServicesContent {
  title: string;
  subtitle: string;
  servicesData: ServicePreview[];
}

interface ContactContent {
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
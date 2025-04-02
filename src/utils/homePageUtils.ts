import { IMAGES } from '../assets/placeholders';

// Ключи для хранения в localStorage
export const HOME_PAGE_STORAGE_KEY = 'hotel_forest_homepage_content';
export const HOME_IMAGES_STORAGE_KEY = 'hotel_forest_homepage_images';

// Интерфейс для структуры контента главной страницы
export interface HomePageContent {
  banner: {
    title: string;
    subtitle: string;
    buttonText: string;
    backgroundImage: string;
  };
  about: {
    title: string;
    content: string;
    image: string;
  };
  rooms: {
    title: string;
    subtitle: string;
    roomsData: {
      id: string;
      title: string;
      description: string;
      price: string;
      image: string;
    }[];
  };
  services: {
    title: string;
    subtitle: string;
    servicesData: {
      id: string;
      title: string;
      description: string;
      icon: string;
    }[];
  };
  contact: {
    title: string;
    address: string;
    phone: string[];
    email: string;
  };
}

// Интерфейс для загруженного изображения на главной странице
export interface HomePageImage {
  id: string;
  type: 'banner' | 'about' | 'room' | 'background';
  roomId?: string; // Для изображений номеров
  url: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  uploadedAt: string;
}

// Дефолтный контент для главной страницы
export const DEFAULT_HOME_CONTENT: HomePageContent = {
  banner: {
    title: 'Добро пожаловать в «Лесной дворик»',
    subtitle: 'Гостиница, конференц-зал, сауна в одном комплексе в городе Жуковский',
    buttonText: 'Забронировать номер',
    backgroundImage: IMAGES.BANNER
  },
  about: {
    title: 'О нашей гостинице',
    content: 'Наш гостиничный комплекс предлагает комфортное проживание, вкусное питание и дополнительные услуги для отдыха и деловых встреч. Мы находимся в тихом и живописном месте с удобной транспортной доступностью.',
    image: IMAGES.ABOUT
  },
  rooms: {
    title: 'Наши номера',
    subtitle: 'Комфортное проживание для каждого гостя',
    roomsData: [
      {
        id: 'economy',
        title: 'Двухместный эконом',
        description: 'Уютный номер с двумя раздельными кроватями, отдельной ванной комнатой и всем необходимым для комфортного проживания.',
        price: 'от 2500 ₽',
        image: IMAGES.ROOM_ECONOMY
      },
      {
        id: 'family',
        title: 'Двухместный семейный',
        description: 'Просторный номер с двуспальной кроватью, идеально подходящий для семейных пар. В номере есть все необходимое для комфортного отдыха.',
        price: 'от 3500 ₽',
        image: IMAGES.ROOM_FAMILY
      },
      {
        id: 'multiple',
        title: 'Четырехместный эконом',
        description: 'Номер для группы друзей или семьи с четырьмя раздельными кроватями. Включает все необходимые удобства.',
        price: 'от 4500 ₽',
        image: IMAGES.ROOM_MULTIPLE
      }
    ]
  },
  services: {
    title: 'Услуги',
    subtitle: 'Дополнительные возможности для вашего комфорта',
    servicesData: [
      {
        id: 'sauna',
        title: 'Сауна',
        description: 'Расслабляющая сауна с комнатой отдыха и бассейном. Идеальное место для отдыха после трудного дня.',
        icon: 'https://via.placeholder.com/400x300/217148/FFFFFF?text=Сауна'
      },
      {
        id: 'conference',
        title: 'Конференц-зал',
        description: 'Просторный зал для проведения деловых встреч, конференций и презентаций, оборудованный всей необходимой техникой.',
        icon: 'https://via.placeholder.com/400x300/217148/FFFFFF?text=Конференц-зал'
      },
      {
        id: 'childrenParty',
        title: 'Проведение детских праздников',
        description: 'Организация и проведение развлекательных мероприятий для детей с аниматорами, украшением и праздничным угощением.',
        icon: 'https://via.placeholder.com/400x300/217148/FFFFFF?text=Детские+праздники'
      }
    ]
  },
  contact: {
    title: 'Как нас найти',
    address: 'Московская область, г. Жуковский, ул. Нижегородская, д. 4',
    phone: ['8 (498) 483 19 41', '8 (915) 120 17 44'],
    email: 'info@lesnoydvorik.ru'
  }
};

/**
 * Сохраняет контент главной страницы в localStorage
 */
export const saveHomePageContent = (content: HomePageContent): void => {
  try {
    localStorage.setItem(HOME_PAGE_STORAGE_KEY, JSON.stringify(content));
  } catch (error) {
    console.error('Ошибка при сохранении контента главной страницы:', error);
  }
};

/**
 * Загружает контент главной страницы из localStorage
 */
export const loadHomePageContent = (): HomePageContent => {
  try {
    const storedData = localStorage.getItem(HOME_PAGE_STORAGE_KEY);
    if (!storedData) return DEFAULT_HOME_CONTENT;
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Ошибка при загрузке контента главной страницы:', error);
    return DEFAULT_HOME_CONTENT;
  }
};

/**
 * Сохраняет загруженные изображения для главной страницы
 */
export const saveHomePageImages = (images: HomePageImage[]): void => {
  try {
    localStorage.setItem(HOME_IMAGES_STORAGE_KEY, JSON.stringify(images));
  } catch (error) {
    console.error('Ошибка при сохранении изображений главной страницы:', error);
  }
};

/**
 * Загружает изображения для главной страницы
 */
export const loadHomePageImages = (): HomePageImage[] => {
  try {
    const storedData = localStorage.getItem(HOME_IMAGES_STORAGE_KEY);
    if (!storedData) return [];
    
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Ошибка при загрузке изображений главной страницы:', error);
    return [];
  }
};

/**
 * Добавляет новое изображение для главной страницы
 */
export const addHomePageImage = (image: HomePageImage): void => {
  try {
    const images = loadHomePageImages();
    saveHomePageImages([...images, image]);
  } catch (error) {
    console.error('Ошибка при добавлении изображения для главной страницы:', error);
  }
};

/**
 * Обновляет контент главной страницы для определенного раздела
 */
export const updateHomePageSection = <K extends keyof HomePageContent>(
  section: K, 
  newContent: HomePageContent[K]
): void => {
  try {
    const content = loadHomePageContent();
    const updatedContent = {
      ...content,
      [section]: newContent
    };
    saveHomePageContent(updatedContent);
  } catch (error) {
    console.error(`Ошибка при обновлении раздела ${section}:`, error);
  }
}; 
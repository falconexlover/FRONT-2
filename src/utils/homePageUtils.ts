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
    content: 'Санаторий-профилакторий расположен в красивейшей лесопарковой зоне, сохраненной с начала века. Гостиница, конференц-зал, сауна в одном комплексе в городе Жуковский. «Лесной дворик» расположен недалеко от ж/д станции МЦД Отдых, в шаговой доступности от городской инфраструктуры и общественного транспорта. \n\nЗдание построено в 1979 году, в стиле советского постмодернизма. Использовалось как санаторий-профилакторий Жуковского машиностроительного завода. С 1991 года лечебные и оздоровительные процедуры больше не проводятся, зато комплекс прекрасно справляется с ролью отеля. \n\nАтмосфера советской романтики - это не просто слова. Мозаика, лепнина, внешний облик - всё это тщательно сохраняется при ремонте и реконструкции. \n\n«Лесной дворик» - не только гостиница в Жуковском. Это еще и оборудованный конференц-зал, и сауна с купелью и двумя парилками, и собственная кухня с уникальными блюдами по заводским рецептам.\n\nЦены на номера - по нижней границе рынка. Дружелюбный персонал постарается сделать ваше пребывание в гостинице беспроблемным и приятным.',
    image: IMAGES.ABOUT
  },
  rooms: {
    title: 'Наши номера',
    subtitle: 'Комфортное проживание для каждого гостя',
    roomsData: [
      {
        id: 'economy',
        title: 'Двухместный номер-эконом с балконом',
        description: 'Уютный номер с двумя раздельными кроватями, балконом и видом на парк. В номере есть Wi-Fi, телевизор, холодильник и чайник.',
        price: 'от 2500 ₽',
        image: IMAGES.ROOM_ECONOMY
      },
      {
        id: 'family',
        title: 'Двухместный семейный номер-стандарт',
        description: 'Просторный номер с двуспальной кроватью, шикарным видом из окна, индивидуальной душевой кабиной и санузлом. Wi-Fi, телевизор и все необходимое для комфорта.',
        price: '3800 ₽',
        image: IMAGES.ROOM_FAMILY
      },
      {
        id: 'multiple',
        title: 'Четырехместный номер-эконом с балконом',
        description: 'Просторный номер с 4 односпальными кроватями в 2 комнатах, душевой кабиной, ванной и санузлом. Идеально для компаний и спортивных команд.',
        price: '5000 ₽',
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
        title: 'Сауна с купелью и двумя парилками',
        description: 'Сауна - часть санатория-профилактория. Впечатляющая площадь - толкаться не придется. Удобная гардеробная с кабинками и феном. Две парилки - одна для ценителей сухого пара, другая - для любителей банных веников. Прохладная купель (18-20 градусов). Прекрасная комната отдыха: с местом для застолий, удобным диваном, телевизором и Wi-Fi. Цена: 1275 руб/час (минимум 2 часа).',
        icon: 'https://via.placeholder.com/400x300/217148/FFFFFF?text=Сауна'
      },
      {
        id: 'conference',
        title: 'Конференц-зал',
        description: 'Конференц-зал санатория-профилактория «Лесной дворик» расположен на 2 этаже. Отдельное, оборудованное под проведение встреч и семинаров помещение площадью 62 кв.м. Чисто, светло. Предоставляем столы и стулья, оборудование для презентаций (Wi-Fi, проектор, экран, флип-чарт). Отдельный санузел. Возможность организовать питание, кофе-брейки, проживание участников. Цена: 1500 руб/час (минимум 8 часов). Возможна б/н оплата.',
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
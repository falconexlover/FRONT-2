import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Цветовая палитра - ТЕМНАЯ ТЕМА (закомментирована) */
  /*
  :root {
    --primary-color: #2aa76e; 
    --secondary-color: #34cc85; 
    --accent-color: #f5a623;  
    --bg-primary: #1a1d21; 
    --bg-secondary: #24282f; 
    --bg-tertiary: #31363e; 
    --text-primary: #e1e1e1; 
    --text-secondary: #a0a7b3; 
    --text-on-primary-bg: #ffffff; 
    --border-color: #3a4049; 
    --shadow-sm: 0 1px 2px rgba(0,0,0,0.2); 
    --shadow-md: 0 3px 6px rgba(0,0,0,0.3);
    --shadow-lg: 0 10px 20px rgba(0,0,0,0.3);
    --danger-color: #e57373; 
    --success-color: var(--primary-color); 
    --warning-color: var(--accent-color); 
    --radius-sm: 5px;
    --radius-md: 10px;
    --radius-lg: 20px;
    --transition: all 0.2s ease-in-out; 
  }
  */

  /* Цветовая палитра - СВЕТЛАЯ ТЕМА (раскомментирована) */
  :root {
    /* Основные цвета (можно использовать те же, что и были в темной, или стандартные) */
    --primary-color: #217148; /* Исходный зеленый */
    --secondary-color: #2aa76e; /* Светлее зеленый */
    --accent-color: #f5a623;  /* Оранжевый акцент */
    
    /* Фоны */
    --bg-primary: #ffffff; /* Белый фон */
    --bg-secondary: #f9f9f9; /* Очень светлый серый для карточек/полей */
    --bg-tertiary: #f1f1f1; /* Светло-серый для hover */

    /* Текст */
    --text-primary: #333333; /* Основной темный текст */
    --text-secondary: #555555; /* Вторичный серый текст */
    --text-on-primary-bg: #ffffff; /* Белый текст на зеленых кнопках */

    /* Границы и тени */
    --border-color: #e0e0e0; /* Светло-серый цвет границ */
    --shadow-sm: 0 1px 3px rgba(0,0,0,0.08);
    --shadow-md: 0 4px 8px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 20px rgba(0,0,0,0.12);

    /* Состояния */
    --danger-color: #e53935; /* Красный */
    --success-color: var(--primary-color); /* Зеленый */
    --warning-color: var(--accent-color); /* Оранжевый */

    /* Радиусы и переходы (оставляем) */
    --radius-sm: 5px;
    --radius-md: 10px;
    --radius-lg: 20px;
    --transition: all 0.2s ease-in-out; 
  }

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    /* Устанавливаем базовые цвета для светлой темы */
    background-color: var(--bg-primary);
    color: var(--text-primary);
    line-height: 1.7;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    margin-bottom: 1rem;
    color: var(--text-primary); /* Заголовки темные */
  }

  /* Размеры заголовков и отступы можно оставить */
  h1 {
    font-size: 3rem;
  }

  h2 {
    font-size: 2.5rem;
  }

  h3 {
    font-size: 1.8rem;
  }

  p {
    margin-bottom: 1rem;
    color: var(--text-secondary); /* Параграфы серые */
  }

  a {
    text-decoration: none;
    color: var(--primary-color); 
    transition: var(--transition);
    &:hover {
      color: var(--secondary-color);
    }
  }

  ul {
    list-style: none;
  }

  button {
    cursor: pointer;
    border: none;
    outline: none;
    background: none;
    font-family: inherit;
    color: inherit; /* Кнопки по умолчанию наследуют цвет текста */
  }

  /* Стили для .section, .container, .btn и т.д. могут потребовать адаптации */
  /* Например, кнопки .btn */
  .btn {
    display: inline-block;
    padding: 0.8rem 1.8rem;
    background-color: var(--primary-color);
    color: var(--text-on-primary-bg);
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: var(--transition);
    text-align: center;
  }

  .btn:hover {
    background-color: var(--secondary-color);
    /* Убираем transform и тень, т.к. на темном фоне они могут мешать */
    /* transform: translateY(-3px); */
    /* box-shadow: var(--shadow-md); */
  }

  /* Стили секций и заголовков секций тоже адаптируем */
  .section {
    padding: 5rem 2rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }
  
  .section-title {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;
  }

  .section-title h2 {
    color: var(--text-primary); /* Заголовок секции светлый */
    display: inline-block;
    position: relative;
  }

  /* Декоративные линии под заголовком секции можно оставить */
  .section-title h2::before {
    content: '';
    position: absolute;
    width: 60px;
    height: 3px;
    background-color: var(--accent-color);
    bottom: -15px;
    left: 50%;
    transform: translateX(-50%);
  }

  .section-title h2::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 3px;
    background-color: var(--primary-color);
    bottom: -15px;
    left: calc(50% + 35px);
    transform: translateX(-50%);
  }

  /* Адаптивность (оставляем без изменений) */
  @media screen and (max-width: 992px) {
    h1 {
      font-size: 2.5rem;
    }
    h2 {
      font-size: 2rem;
    }
    h3 {
      font-size: 1.5rem;
    }
    .section {
      padding: 4rem 1.5rem;
    }
  }

  @media screen and (max-width: 768px) {
    h1 {
      font-size: 2rem;
    }
    h2 {
      font-size: 1.8rem;
    }
    .section {
      padding: 3rem 1rem;
    }
  }

  @media screen and (max-width: 576px) {
    h1 {
      font-size: 1.8rem;
    }
    h2 {
      font-size: 1.5rem;
    }
    .section {
      padding: 2.5rem 1rem;
    }
  }
`;

export default GlobalStyle; 
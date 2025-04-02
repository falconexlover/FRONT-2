import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  /* Цветовая палитра */
  :root {
    --primary-color: #217148;
    --secondary-color: #2c8e5e;
    --accent-color: #f5a623;
    --dark-color: #333;
    --light-color: #f9f9f9;
    --text-color: #333;
    --gray-bg: #f5f5f5;
    --shadow-sm: 0 2px 15px rgba(0,0,0,0.08);
    --shadow-md: 0 5px 20px rgba(0,0,0,0.1);
    --shadow-lg: 0 10px 30px rgba(0,0,0,0.15);
    --radius-sm: 5px;
    --radius-md: 10px;
    --radius-lg: 20px;
    --transition: all 0.3s ease;
  }

  /* Импорт шрифтов */
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400;500;600;700&family=Montserrat:wght@300;400;500;600;700&display=swap');

  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Montserrat', sans-serif;
    color: var(--text-color);
    line-height: 1.7;
    overflow-x: hidden;
  }

  h1, h2, h3, h4, h5, h6 {
    font-family: 'Playfair Display', serif;
    font-weight: 600;
    margin-bottom: 1rem;
  }

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
  }

  a {
    text-decoration: none;
    color: inherit;
    transition: var(--transition);
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
  }

  .section {
    padding: 5rem 2rem;
  }

  .container {
    max-width: 1200px;
    margin: 0 auto;
  }

  .btn {
    display: inline-block;
    padding: 0.8rem 1.8rem;
    background-color: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-sm);
    font-weight: 600;
    cursor: pointer;
    text-decoration: none;
    transition: var(--transition);
    text-align: center;
  }

  .btn:hover {
    background-color: var(--accent-color);
    transform: translateY(-3px);
    box-shadow: var(--shadow-md);
  }

  .outline-btn {
    background: transparent;
    border: 2px solid var(--primary-color);
    color: var(--primary-color);
  }

  .outline-btn:hover {
    background: var(--primary-color);
    color: white;
  }

  .section-title {
    text-align: center;
    margin-bottom: 4rem;
    position: relative;
  }

  .section-title h2 {
    color: var(--dark-color);
    display: inline-block;
    position: relative;
  }

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

  /* Адаптивность */
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
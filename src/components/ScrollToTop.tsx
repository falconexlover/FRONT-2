import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const ScrollToTop = () => {
  const { pathname } = useLocation(); // Получаем текущий путь

  useEffect(() => {
    // Прокручиваем вверх при изменении pathname
    window.scrollTo(0, 0);
  }, [pathname]); // Зависимость - путь изменился

  return null; // Компонент ничего не рендерит
};

export default ScrollToTop;

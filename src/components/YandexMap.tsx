import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';

interface YandexMapProps {
  address: string;
  coordinates: [number, number]; // [широта, долгота]
  zoom?: number;
  height?: string;
}

const MapContainer = styled.div<{ height: string }>`
  width: 100%;
  height: ${props => props.height};
  border-radius: var(--radius-md);
  overflow: hidden;
  box-shadow: var(--shadow-sm);
  margin-bottom: 2rem;
`;

const YandexMap: React.FC<YandexMapProps> = ({ 
  address, 
  coordinates, 
  zoom = 15, 
  height = '400px' 
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInitializedRef = useRef<boolean>(false);

  useEffect(() => {
    // Функция для загрузки API Яндекс.Карт
    const loadYandexMapScript = (): Promise<void> => {
      return new Promise((resolve) => {
        // Проверяем, загружен ли уже скрипт
        if (window.ymaps) {
          resolve();
          return;
        }

        // Создаем элемент скрипта
        const script = document.createElement('script');
        script.src = 'https://api-maps.yandex.ru/2.1/?apikey=9b7dac5e-f2b6-4aa0-b67a-c66cfd0a688f&lang=ru_RU';
        script.async = true;
        script.onload = () => resolve();
        
        document.body.appendChild(script);
      });
    };

    // Функция инициализации карты
    const initializeMap = async () => {
      if (!mapContainerRef.current || mapInitializedRef.current) return;

      try {
        await loadYandexMapScript();
        
        // Ждем инициализации API
        await new Promise<void>((resolve) => {
          window.ymaps.ready(() => resolve());
        });

        // Создаем карту
        const map = new window.ymaps.Map(mapContainerRef.current, {
          center: coordinates, // Координаты в формате [широта, долгота]
          zoom: zoom,
          controls: ['zoomControl', 'fullscreenControl']
        });

        // Создаем метку на карте
        const placemark = new window.ymaps.Placemark(coordinates, { // Координаты в формате [широта, долгота]
          hintContent: 'Отель "Лесной дворик"',
          balloonContent: `
            <div style="padding: 10px; max-width: 250px;">
              <h3 style="margin-top: 0; color: #217148;">Отель "Лесной дворик"</h3>
              <p style="margin-bottom: 10px;">${address}</p>
              <p style="margin-bottom: 5px;"><b>Телефон:</b> <a href="tel:+74984831941" style="color: #217148;">8 (498) 483 19 41</a></p>
              <a href="#" style="color: #217148; text-decoration: none; font-weight: 600;">Построить маршрут</a>
            </div>
          `
        }, {
          // Опции метки
          preset: 'islands#greenDotIconWithCaption',
          // Метку можно перемещать
          draggable: false,
          // Приоритет метки (чем выше числе, тем выше метка)
          zIndex: 1
        });

        // Добавляем метку на карту
        map.geoObjects.add(placemark);

        // Настройка отображения
        map.behaviors.disable('scrollZoom'); // Отключаем скролл карты колесиком мыши
        map.container.fitToViewport(); // Масштабируем карту под контейнер

        mapInitializedRef.current = true;
      } catch (error) {
        console.error('Ошибка инициализации карты Яндекс:', error);
      }
    };

    initializeMap();

    // Очистка
    return () => {
      mapInitializedRef.current = false;
    };
  }, [address, coordinates, zoom]);

  return <MapContainer ref={mapContainerRef} height={height} />;
};

// Расширяем Window интерфейс для поддержки ymaps
declare global {
  interface Window {
    ymaps: any;
  }
}

export default YandexMap; 
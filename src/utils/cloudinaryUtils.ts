/**
 * Оптимизирует URL изображения Cloudinary, добавляя параметры трансформации.
 * По умолчанию добавляет автоматический выбор формата (f_auto) и качества (q_auto).
 * 
 * @param url Оригинальный URL изображения Cloudinary.
 * @param transformations Строка с параметрами трансформации (например, 'f_auto,q_auto,w_800').
 * @returns Оптимизированный URL или оригинальный URL, если он не от Cloudinary или имеет неожиданную структуру.
 */
export const optimizeCloudinaryImage = (
  url: string | undefined | null, 
  transformations: string = 'f_auto,q_auto'
): string => {
  if (!url || !url.includes('res.cloudinary.com')) {
    return url || ''; // Возвращаем пустую строку если url null/undefined
  }

  try {
    const urlParts = url.split('/upload/');
    
    if (urlParts.length === 2) {
      const pathAndVersion = urlParts[1];
      const pathSegments = pathAndVersion.split('/');

      // Проверяем, есть ли уже параметры трансформации (не начинаются с 'v' + цифра)
      if (pathSegments.length > 0 && !pathSegments[0].match(/^v\d+$/)) {
        // Уже есть трансформации. Добавляем новые перед ними.
        // Можно заменить на логику перезаписи, если нужно.
        return `${urlParts[0]}/upload/${transformations},${pathAndVersion}`;
      } else {
        // Нет трансформаций или они после версии (что маловероятно для стандартных URL)
        // Вставляем наши трансформации.
        return `${urlParts[0]}/upload/${transformations}/${pathAndVersion}`;
      }
    } else {
      // Структура URL не соответствует ожидаемой '.../upload/...' 
      console.warn('Unexpected Cloudinary URL structure:', url);
      return url;
    }
  } catch (error) {
    console.error('Error optimizing Cloudinary URL:', url, error);
    return url; // Возвращаем оригинал в случае ошибки
  }
};

// Добавляем пустой экспорт, если в файле больше ничего нет (на всякий случай)
// export {}; 
// ^^^ Закомментировано, так как уже есть export const 
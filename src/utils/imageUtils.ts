/**
 * Функция для изменения размера изображения перед загрузкой на сервер.
 * Сохраняет пропорции и ограничивает максимальную ширину.
 * 
 * @param file - Исходный файл изображения (тип File).
 * @param maxWidth - Максимальная ширина выходного изображения (по умолчанию 800px).
 * @returns Promise, который разрешается с новым объектом File уменьшенного размера 
 *          или исходным файлом, если изменение размера не требуется.
 */
export const resizeImage = (file: File, maxWidth: number = 800): Promise<File> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    const image = new Image();
    
    reader.onload = (event) => {
      if (!event.target?.result) {
        return reject(new Error('Не удалось прочитать файл для изменения размера.'));
      }
      
      image.onload = () => {
        // Если изображение уже достаточно маленькое, возвращаем оригинал
        if (image.width <= maxWidth) {
          return resolve(file);
        }
        
        // Рассчитываем новые размеры
        const ratio = image.height / image.width;
        const newWidth = maxWidth;
        const newHeight = Math.round(newWidth * ratio);
        
        // Создаем canvas
        const canvas = document.createElement('canvas');
        canvas.width = newWidth;
        canvas.height = newHeight;
        
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return reject(new Error('Не удалось получить 2D контекст canvas.'));
        }
        
        // Рисуем уменьшенное изображение
        ctx.drawImage(image, 0, 0, newWidth, newHeight);
        
        // Конвертируем canvas в Blob, а затем в File
        canvas.toBlob(
          (blob) => {
            if (!blob) {
              return reject(new Error('Не удалось конвертировать canvas в blob.'));
            }
            // Создаем новый File с тем же именем и типом
            const resizedFile = new File([blob], file.name, {
              type: file.type,
              lastModified: Date.now(),
            });
            resolve(resizedFile);
          },
          file.type, // Используем оригинальный тип файла
          0.85 // Качество сжатия (для JPG/WEBP)
        );
      };
      
      image.onerror = () => {
        reject(new Error('Не удалось загрузить изображение в элемент Image.'));
      };
      
      // Устанавливаем источник для элемента Image
      image.src = event.target.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Ошибка чтения файла с помощью FileReader.'));
    };
    
    // Начинаем чтение файла
    reader.readAsDataURL(file);
  });
}; 
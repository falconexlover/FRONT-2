import { useState, useRef, useCallback } from 'react';

interface UseImageUploadOptions {
  allowedTypes?: string[];
  maxSizeMB?: number;
  initialUrl?: string | null;
}

interface UseImageUploadResult {
  previewUrl: string | null;
  file: File | null;
  isUploading: boolean;
  error: string | null;
  fileInputRef: React.RefObject<HTMLInputElement>;
  handleFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleRemove: () => void;
  reset: () => void;
}

export function useImageUpload(options?: UseImageUploadOptions): UseImageUploadResult {
  const {
    allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    maxSizeMB = 5,
    initialUrl = null,
  } = options || {};

  const [previewUrl, setPreviewUrl] = useState<string | null>(initialUrl);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    setError(null);
    if (!selectedFile) return;
    if (!allowedTypes.includes(selectedFile.type)) {
      setError('Недопустимый тип файла. Разрешены: JPEG, PNG, GIF, WebP.');
      return;
    }
    if (selectedFile.size > maxSizeMB * 1024 * 1024) {
      setError(`Файл слишком большой. Максимальный размер ${maxSizeMB}MB.`);
      return;
    }
    setFile(selectedFile);
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewUrl(reader.result as string);
    };
    reader.readAsDataURL(selectedFile);
    // Сброс input, чтобы можно было выбрать тот же файл снова
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [allowedTypes, maxSizeMB]);

  const handleRemove = useCallback(() => {
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const reset = useCallback(() => {
    setFile(null);
    setPreviewUrl(initialUrl);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, [initialUrl]);

  return {
    previewUrl,
    file,
    isUploading,
    error,
    fileInputRef,
    handleFileChange,
    handleRemove,
    reset,
  };
} 
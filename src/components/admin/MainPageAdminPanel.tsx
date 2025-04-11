import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { toast } from 'react-toastify';
import { HomePageContent } from '../../types/HomePage';
import { pageService } from '../../utils/api';
import ActionButton from '../ui/ActionButton';
import ImageUpload from '../ui/ImageUpload';
import MultiImageManager from '../ui/MultiImageManager';

const AdminPanelWrapper = styled.div`
  padding: 2rem;
  background-color: var(--background-light);
  border-radius: 8px;
  box-shadow: var(--shadow-md);
`;

const SectionWrapper = styled.div`
  margin-bottom: 2rem;
  padding: 1.5rem;
  border: 1px solid var(--border-color);
  border-radius: 6px;
  background-color: var(--background-secondary);
`;

const FormField = styled.div`
  margin-bottom: 1rem;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: var(--text-primary);
`;

const Input = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  background-color: var(--input-bg);
  color: var(--input-text);
  &:disabled {
      background-color: var(--input-disabled-bg);
      cursor: not-allowed;
  }
`;

const Textarea = styled.textarea`
 width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 1rem;
  min-height: 100px;
  resize: vertical;
  background-color: var(--input-bg);
  color: var(--input-text);
   &:disabled {
      background-color: var(--input-disabled-bg);
      cursor: not-allowed;
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--border-color-light);
`;

const ErrorMessage = styled.p`
  color: var(--danger-color);
  margin-top: 1rem;
`;

const MainPageAdminPanel: React.FC = () => {
    const [formData, setFormData] = useState<HomePageContent | null>(null);
    const [initialData, setInitialData] = useState<HomePageContent | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isSaving, setIsSaving] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    const loadMainPageData = useCallback(async () => {
        setIsLoading(true);
        setError(null);
        try {
            const data = await pageService.getPageContent('main');
            if (!data || !data.content) {
                throw new Error('Данные главной страницы не найдены или повреждены.');
            }
            setFormData(data.content);
            setInitialData(JSON.parse(JSON.stringify(data.content)));
        } catch (err: any) {
            const message = `Ошибка загрузки данных главной страницы: ${err.message}`;
            setError(message);
            toast.error(message);
            console.error(message, err);
            setFormData(null);
            setInitialData(null);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadMainPageData();
    }, [loadMainPageData]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        if (name.includes('.')) {
            const [section, field] = name.split('.');
            setFormData((prev: HomePageContent | null) => {
                if (!prev) return null;
                const newState = { ...prev };
                if (newState[section as keyof HomePageContent]) {
                    (newState[section as keyof HomePageContent] as any)[field] = value;
                } else {
                    console.warn(`Секция '${section}' не найдена в formData при обновлении поля '${field}'`);
                }
                return newState;
            });
        } else {
            setFormData((prev: HomePageContent | null) => prev ? { ...prev, [name]: value } : null);
        }
    };

    const handleBannerImageChange = async (file: File | null) => {
        if (isSaving || !formData?._id) {
            toast.warn("Сохранение данных или загрузка...");
            return;
        };

        const pageId = formData._id;

        setIsSaving(true);
        setError(null);

        try {
            if (file) {
                console.log("Выбрано новое изображение для баннера:", file.name);
                toast.info(`Загрузка ${file.name}... (API баннера не реализован)`);
            } else {
                 console.log("Запрос на удаление изображения баннера");
                 setFormData((prev: HomePageContent | null) => {
                     if (!prev || !prev.banner) return prev;
                     return {
                         ...prev,
                         banner: { ...prev.banner, image: undefined }
                     };
                 });
                 toast.info(`Удаление изображения баннера... (API не реализован)`);
            }
        } catch (err: any) {
            const message = `Ошибка обработки изображения баннера: ${err.message}`;
            setError(message);
            toast.error(message);
            console.error(message, err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAboutImageChange = async (file: File | null) => {
        if (isSaving || !formData?._id) {
            toast.warn("Сохранение данных или загрузка...");
            return;
        }

        const currentPublicId = formData.about?.imagePublicId;
        const pageId = formData._id;

        setIsSaving(true);
        setError(null);

        try {
            if (file) {
                console.log("Выбрано новое изображение для 'О нас':", file.name);
                toast.info(`Загрузка ${file.name}... (API 'О нас' не реализован)`);
            } else {
                 if (currentPublicId) {
                    console.log("Запрос на удаление изображения 'О нас':", currentPublicId);
                    setFormData((prev: HomePageContent | null) => {
                         if (!prev || !prev.about) return prev;
                         return {
                             ...prev,
                             about: { ...prev.about, image: undefined, imagePublicId: undefined }
                         };
                    });
                    toast.info(`Удаление изображения 'О нас'... (API не реализован)`);
                 } else {
                     console.log("Удаление превью 'О нас'");
                     setFormData((prev: HomePageContent | null) => {
                         if (!prev || !prev.about) return prev;
                         return { ...prev, about: { ...prev.about, image: undefined, imagePublicId: undefined } };
                     });
                 }
            }
        } catch (err: any) {
            const message = `Ошибка обработки изображения 'О нас': ${err.message}`;
            setError(message);
            toast.error(message);
            console.error(message, err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddConferenceImage = async (file: File) => {
        const pageId = initialData?._id;
         if (isSaving || !pageId) {
             toast.warn("Сохранение данных или ID страницы не найден...");
             return;
         }

        setIsSaving(true);
        setError(null);
        try {
            console.log(`Загрузка нового изображения для Конференц-зала: ${file.name}`);
            toast.info(`Загрузка ${file.name}... (API галереи не реализован)`);
             // Пример обновления formData после ответа API:
             // const updatedSection = await pageService.addGalleryImage(pageId, 'conference', file);
             // if (updatedSection) {
             //    setFormData(prev => prev ? {
             //        ...prev,
             //        conference: updatedSection
             //    } : null);
             //    toast.success("Изображение добавлено в галерею Конференц-зала.");
             // }

        } catch (err: any) {
            const message = `Ошибка добавления изображения в галерею Конференц-зала: ${err.message}`;
            setError(message);
            toast.error(message);
            console.error(message, err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDeleteConferenceImage = async (publicId: string) => {
        const pageId = initialData?._id;
         if (isSaving || !pageId || !publicId) {
             toast.warn("Сохранение данных, ID страницы или publicId не найден...");
             return;
         }

        setIsSaving(true);
        setError(null);
        try {
            console.log(`Удаление изображения ${publicId} из галереи Конференц-зала.`);
            toast.info(`Удаление ${publicId}... (API галереи не реализован)`);
             // Пример обновления formData после ответа API:
             // const updatedSection = await pageService.deleteGalleryImage(pageId, 'conference', publicId);
             // if (updatedSection) {
             //     setFormData(prev => prev ? {
             //         ...prev,
             //         conference: updatedSection
             //     } : null);
             //     toast.success("Изображение удалено из галереи Конференц-зала.");
             // } else {
             //      // Если API ничего не вернул, удаляем вручную (но лучше, чтобы API возвращал)
             //      setFormData((prev: HomePageContent | null) => {
             //           if (!prev || !prev.conference || !prev.conference.imageUrls || !prev.conference.cloudinaryPublicIds) return prev;
             //           const indexToDelete = prev.conference.cloudinaryPublicIds.indexOf(publicId);
             //           if (indexToDelete === -1) return prev; // Не найдено
             //           const newUrls = [...prev.conference.imageUrls];
             //           const newIds = [...prev.conference.cloudinaryPublicIds];
             //           newUrls.splice(indexToDelete, 1);
             //           newIds.splice(indexToDelete, 1);
             //           return {
             //               ...prev,
             //               conference: { ...prev.conference, imageUrls: newUrls, cloudinaryPublicIds: newIds }
             //           };
             //      });
             //      toast.success("Изображение удалено из галереи Конференц-зала (локально).");
             // }

             // Пока просто удаляем локально:
             setFormData((prev: HomePageContent | null) => {
                  if (!prev || !prev.conference || !prev.conference.imageUrls || !prev.conference.cloudinaryPublicIds) return prev;
                  const indexToDelete = prev.conference.cloudinaryPublicIds.indexOf(publicId);
                  if (indexToDelete === -1) return prev;
                  const newUrls = [...prev.conference.imageUrls];
                  const newIds = [...prev.conference.cloudinaryPublicIds];
                  newUrls.splice(indexToDelete, 1);
                  newIds.splice(indexToDelete, 1);
                  return {
                      ...prev,
                      conference: { ...prev.conference, imageUrls: newUrls, cloudinaryPublicIds: newIds }
                  };
             });
             toast.info("Изображение удалено из галереи Конференц-зала (локально).");


        } catch (err: any) {
            const message = `Ошибка удаления изображения ${publicId} из галереи Конференц-зала: ${err.message}`;
            setError(message);
            toast.error(message);
            console.error(message, err);
        } finally {
            setIsSaving(false);
        }
    };

    // --- НОВЫЕ ОБРАБОТЧИКИ ДЛЯ ГАЛЕРЕИ ПРАЗДНИКОВ ---
    const handleAddHolidaysImage = async (file: File) => {
        const pageId = initialData?._id;
         if (isSaving || !pageId) { /* ... */ return; }

        setIsSaving(true); setError(null);
        try {
            console.log(`Загрузка нового изображения для Праздников: ${file.name}`);
            // TODO: Вызвать pageService.addGalleryImage(pageId, 'party', file)
            toast.info(`Загрузка ${file.name}... (API галереи Праздников не реализован)`);
            // Пример обновления formData:
            // const updatedSection = await pageService.addGalleryImage(pageId, 'party', file);
            // if (updatedSection) {
            //    setFormData(prev => prev ? { ...prev, party: updatedSection } : null);
            //    toast.success("Изображение добавлено в галерею Праздников.");
            // }
        } catch (err: any) { /* ... обработка ошибки */ 
            const message = `Ошибка добавления изображения в галерею Праздников: ${err.message}`;
            setError(message);
            toast.error(message);
            console.error(message, err);
        } finally { setIsSaving(false); }
    };

    const handleDeleteHolidaysImage = async (publicId: string) => {
        const pageId = initialData?._id;
         if (isSaving || !pageId || !publicId) { /* ... */ return; }

        setIsSaving(true); setError(null);
        try {
            console.log(`Удаление изображения ${publicId} из галереи Праздников.`);
            // TODO: Вызвать pageService.deleteGalleryImage(pageId, 'party', publicId)
            toast.info(`Удаление ${publicId}... (API галереи Праздников не реализован)`);
             // Пока просто удаляем локально:
             setFormData((prev: HomePageContent | null) => {
                  if (!prev || !prev.party || !prev.party.imageUrls || !prev.party.cloudinaryPublicIds) return prev;
                  const indexToDelete = prev.party.cloudinaryPublicIds.indexOf(publicId);
                  if (indexToDelete === -1) return prev;
                  const newUrls = [...prev.party.imageUrls];
                  const newIds = [...prev.party.cloudinaryPublicIds];
                  newUrls.splice(indexToDelete, 1);
                  newIds.splice(indexToDelete, 1);
                  return {
                      ...prev,
                      party: { ...prev.party, imageUrls: newUrls, cloudinaryPublicIds: newIds }
                  };
             });
             toast.info("Изображение удалено из галереи Праздников (локально).");
        } catch (err: any) { /* ... обработка ошибки */ 
             const message = `Ошибка удаления изображения ${publicId} из галереи Праздников: ${err.message}`;
             setError(message);
             toast.error(message);
             console.error(message, err);
        } finally { setIsSaving(false); }
    };
    // --- КОНЕЦ ОБРАБОТЧИКОВ ГАЛЕРЕИ ПРАЗДНИКОВ ---

    const handleSave = async () => {
        const pageId = initialData?._id;
        if (!formData || isSaving || !pageId) return;

        setIsSaving(true);
        setError(null);

        try {
             const dataToSave: Partial<HomePageContent> = {
                 banner: formData.banner ? {
                     title: formData.banner.title,
                     subtitle: formData.banner.subtitle,
                     buttonText: formData.banner.buttonText,
                     buttonLink: formData.banner.buttonLink,
                 } : undefined,
                 about: formData.about ? {
                     title: formData.about.title,
                     content: formData.about.content,
                 } : undefined,
                 conference: formData.conference ? {
                     title: formData.conference.title,
                     content: formData.conference.content,
                 } : undefined,
                  party: formData.party ? {
                     title: formData.party.title,
                     content: formData.party.content,
                 } : undefined,
                 rooms: formData.rooms,
                 services: formData.services,
                 contact: formData.contact,
             };

             const result = await pageService.updatePageContent(pageId, dataToSave);

             if (result?.content) {
                 setFormData(result.content);
                 setInitialData(JSON.parse(JSON.stringify(result.content)));
             } else {
                 console.error("Не удалось обновить formData после сохранения:", result);
                 toast.error("Не удалось обновить данные интерфейса после сохранения.");
             }

             toast.success('Данные главной страницы успешно сохранены!');
        } catch (err: any) {
            const message = `Ошибка сохранения: ${err.message}`;
            setError(message);
            toast.error(message);
            console.error("Ошибка сохранения данных главной страницы:", err);
        } finally {
            setIsSaving(false);
        }
    };

    const handleReset = () => {
        if (initialData) {
            setFormData(JSON.parse(JSON.stringify(initialData)));
            setError(null);
            toast.info("Изменения отменены.");
        }
    };

    if (isLoading) return <div>Загрузка...</div>;
    if (error && !formData) return <ErrorMessage>Ошибка загрузки данных: {error}</ErrorMessage>;
    if (!formData) return <ErrorMessage>Данные главной страницы не найдены.</ErrorMessage>;

    return (
        <AdminPanelWrapper>
            <h2>Управление главной страницей</h2>

            <SectionWrapper>
                <h3>Баннер</h3>
                <FormField>
                    <Label htmlFor="banner.title">Заголовок баннера</Label>
                    <Input id="banner.title" name="banner.title" value={formData.banner?.title || ''} onChange={handleInputChange} disabled={isSaving} />
                </FormField>
                <FormField>
                    <Label htmlFor="banner.subtitle">Подзаголовок баннера</Label>
                    <Input id="banner.subtitle" name="banner.subtitle" value={formData.banner?.subtitle || ''} onChange={handleInputChange} disabled={isSaving} />
                </FormField>
                <ImageUpload
                    currentImageUrl={formData.banner?.image}
                    onFileSelect={handleBannerImageChange}
                    disabled={isSaving}
                />
                <Label style={{marginTop: '0.5rem', fontWeight: 'normal', fontSize: '0.9rem'}}>Изображение баннера</Label>
            </SectionWrapper>

            <SectionWrapper>
                 <h3>О нас</h3>
                 <FormField>
                     <Label htmlFor="about.content">Текст "О нас"</Label>
                     <Textarea
                         id="about.content"
                         name="about.content"
                         value={formData.about?.content || ''}
                         onChange={handleInputChange}
                         rows={5}
                         disabled={isSaving}
                     />
                 </FormField>
                 <ImageUpload
                    currentImageUrl={formData.about?.image}
                    onFileSelect={handleAboutImageChange}
                    disabled={isSaving}
                 />
                 <Label style={{marginTop: '0.5rem', fontWeight: 'normal', fontSize: '0.9rem'}}>Изображение 'О нас'</Label>
            </SectionWrapper>

             <SectionWrapper>
                  <h3>Конференц-зал</h3>
                  <FormField>
                     <Label htmlFor="conference.content">Текст "Конференц-зал"</Label>
                     <Textarea
                         id="conference.content"
                         name="conference.content"
                         value={formData.conference?.content || ''}
                         onChange={handleInputChange}
                         rows={5}
                         disabled={isSaving}
                     />
                 </FormField>
                 <MultiImageManager
                     label="Галерея 'Конференц-зал'"
                     imageUrls={formData.conference?.imageUrls || []}
                     publicIds={formData.conference?.cloudinaryPublicIds || []}
                     onAdd={handleAddConferenceImage}
                     onDelete={handleDeleteConferenceImage}
                     disabled={isSaving}
                 />
             </SectionWrapper>

             <SectionWrapper>
                 <h3>Праздники</h3>
                  <FormField>
                     <Label htmlFor="party.content">Текст "Праздники"</Label>
                     <Textarea id="party.content" name="party.content" value={formData.party?.content || ''} onChange={handleInputChange} rows={5} disabled={isSaving} />
                 </FormField>
                 <MultiImageManager
                     label="Галерея 'Праздники'"
                     imageUrls={formData.party?.imageUrls || []}
                     publicIds={formData.party?.cloudinaryPublicIds || []}
                     onAdd={handleAddHolidaysImage}
                     onDelete={handleDeleteHolidaysImage}
                     disabled={isSaving}
                 />
             </SectionWrapper>

            <ButtonContainer>
                <ActionButton type="button" onClick={handleReset} disabled={isSaving} className="secondary">
                    Сбросить изменения
                </ActionButton>
                <ActionButton type="button" onClick={handleSave} disabled={isSaving || isLoading} className="primary">
                    {isSaving ? 'Сохранение...' : 'Сохранить все изменения'}
                </ActionButton>
            </ButtonContainer>

            {error && <ErrorMessage>Ошибка: {error}</ErrorMessage>}

        </AdminPanelWrapper>
    );
};

export default MainPageAdminPanel; 
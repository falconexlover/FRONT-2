// Типы для блоков контента
export interface IntroBlock {
  _id?: string; // Временный ID для React keys
  type: 'intro';
  text: string;
}

export interface SectionBlock {
  _id?: string;
  type: 'section';
  title: string; // Заголовок раздела (например, "НОЧЬЮ - НИ-НИ")
  mythText: string; // Текст мифа/суеверия
  explanationText: string; // Объяснение/реальность
}

export interface ConclusionBlock {
  _id?: string;
  type: 'conclusion';
  text: string;
}

export type ContentBlock = IntroBlock | SectionBlock | ConclusionBlock;

// Тип для данных статьи
export interface ArticleType {
  _id: string; // Добавляется MongoDB
  title: string;
  contentBlocks: ContentBlock[]; // Новое поле для блоков
  imageUrl?: string; // URL заглавного изображения
  imagePublicId?: string; // ID изображения в Cloudinary
  slug: string; // Уникальный идентификатор для URL
  excerpt?: string; // Короткий отрывок/аннотация
  author?: string; // Автор статьи
  createdAt: string; // Дата создания (ISO строка)
  updatedAt: string; // Дата обновления (ISO строка)
  // Дополнительные поля при необходимости (категории, теги и т.д.)
  // category?: string;
  // tags?: string[];
} 
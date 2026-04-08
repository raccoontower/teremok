import { Timestamp } from 'firebase/firestore';

export type PriceType = 'fixed' | 'negotiable' | 'free';
export type ListingStatus = 'active' | 'closed' | 'deleted';

// ============================
// Общие типы для новых разделов
// ============================

export type SectionStatus = 'active' | 'closed' | 'draft';

export interface ContactV2 {
  name: string;
  phone?: string;
  whatsapp?: string;
  telegram?: string;
  email?: string;
}

// ============================
// РАБОТА
// ============================

export type JobType = 'full-time' | 'part-time' | 'contract' | 'freelance' | 'internship';
export type JobCategory = 'it' | 'construction' | 'medical' | 'trucking' | 'sales' | 'restaurant' | 'cleaning' | 'office' | 'other';
export type SalaryPeriod = 'hour' | 'week' | 'month' | 'year';

export interface Job {
  id: string;
  title: string;
  description: string;
  jobType: JobType;
  category: JobCategory;
  salaryMin?: number;
  salaryMax?: number;
  salaryPeriod?: SalaryPeriod;
  salaryNegotiable: boolean;
  cityId: string;
  requirements?: string;
  authorId: string;
  authorName: string;
  contact: ContactV2;
  status: SectionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewsCount: number;
  isPremium: boolean;
}

// ============================
// ЖИЛЬЁ
// ============================

export type HousingListingType = 'rent' | 'sale';
export type PropertyType = 'apartment' | 'house' | 'room' | 'studio' | 'commercial';
export type BedroomsCount = 0 | 1 | 2 | 3 | 4;

export interface Housing {
  id: string;
  title: string;
  description: string;
  listingType: HousingListingType;
  propertyType: PropertyType;
  bedrooms: BedroomsCount;
  bathrooms?: number;
  sqft?: number;
  price: number;
  utilitiesIncluded: boolean;
  petFriendly: boolean;
  cityId: string;
  neighborhood?: string;
  photos: string[];
  contact: ContactV2;
  authorId: string;
  authorName: string;
  status: SectionStatus;
  availableFrom?: Timestamp;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewsCount: number;
  isPremium: boolean;
}

// ============================
// УСЛУГИ
// ============================

export type ServiceCategory = 'plumbing' | 'electrical' | 'repair' | 'cleaning' | 'it' | 'tutoring' | 'beauty' | 'legal' | 'accounting' | 'translation' | 'moving' | 'other';
export type ServicePriceType = 'fixed' | 'hourly' | 'negotiable';
export type ServiceArea = 'local' | 'remote' | 'both';

export interface Service {
  id: string;
  title: string;
  description: string;
  category: ServiceCategory;
  priceType: ServicePriceType;
  price?: number;
  serviceArea: ServiceArea;
  experience?: number;
  languages: string[];
  cityId: string;
  photos: string[];
  contact: ContactV2;
  authorId: string;
  authorName: string;
  status: SectionStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewsCount: number;
  isPremium: boolean;
}

// ============================
// Лейблы для UI
// ============================

export const JOB_TYPE_LABELS: Record<JobType, string> = {
  'full-time': 'Полная занятость',
  'part-time': 'Частичная занятость',
  'contract': 'Контракт',
  'freelance': 'Фриланс',
  'internship': 'Стажировка',
};

export const JOB_CATEGORY_LABELS: Record<JobCategory, string> = {
  'it': 'IT / Программирование',
  'construction': 'Строительство',
  'medical': 'Медицина',
  'trucking': 'Транспорт / Дальнобой',
  'sales': 'Торговля / Продажи',
  'restaurant': 'Ресторанный бизнес',
  'cleaning': 'Уборка',
  'office': 'Офис / Администрация',
  'other': 'Другое',
};

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  'plumbing': 'Сантехника',
  'electrical': 'Электрика',
  'repair': 'Ремонт',
  'cleaning': 'Уборка',
  'it': 'IT / Компьютеры',
  'tutoring': 'Репетиторство',
  'beauty': 'Красота / Массаж',
  'legal': 'Юридические услуги',
  'accounting': 'Бухгалтерия',
  'translation': 'Переводы',
  'moving': 'Перевозки',
  'other': 'Другое',
};

export const PROPERTY_TYPE_LABELS: Record<PropertyType, string> = {
  'apartment': 'Квартира',
  'house': 'Дом',
  'room': 'Комната',
  'studio': 'Студия',
  'commercial': 'Коммерческая',
};

export const SALARY_PERIOD_LABELS: Record<SalaryPeriod, string> = {
  'hour': 'в час',
  'week': 'в неделю',
  'month': 'в месяц',
  'year': 'в год',
};

export const SERVICE_AREA_LABELS: Record<ServiceArea, string> = {
  'local': 'На месте',
  'remote': 'Удалённо',
  'both': 'На месте и удалённо',
};

export interface Contact {
  phone?: string;
  whatsapp?: string;
  telegram?: string;
}

export interface User {
  uid: string;
  displayName: string;
  email: string;
  photoURL: string | null;
  phone?: string;
  createdAt: Timestamp;
  listingsCount?: number;
}

export interface Listing {
  id: string;
  title: string;
  description: string;
  categoryId: string;
  cityId: string;
  price: number | null;
  priceType: PriceType;
  photos: string[];
  contact: Contact;
  authorId: string;
  authorName: string;
  status: ListingStatus;
  createdAt: Timestamp;
  updatedAt: Timestamp;
  viewsCount?: number;
}

export interface Category {
  slug: string;
  name: string;
  nameEn?: string;
  icon?: string;
  order: number;
  isActive: boolean;
}

export interface City {
  slug: string;
  name: string;
  nameEn: string;
  state: string;
  order: number;
  isActive: boolean;
}

// Тип для фильтров листингов
export interface ListingFilters {
  cityId?: string;
  categoryId?: string;
  status?: ListingStatus;
}

// Тип для создания/обновления листинга (без системных полей)
export type CreateListingData = Omit<Listing, 'id' | 'createdAt' | 'updatedAt' | 'viewsCount'>;
export type UpdateListingData = Partial<Omit<Listing, 'id' | 'createdAt' | 'authorId'>>;

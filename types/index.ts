import { Timestamp } from 'firebase/firestore';

export type PriceType = 'fixed' | 'negotiable' | 'free';
export type ListingStatus = 'active' | 'closed' | 'deleted';

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

import { redirect } from 'next/navigation';
import { ROUTES } from '@/lib/constants/routes';

// Главная страница — редиректим на ленту объявлений
export default function HomePage() {
  redirect(ROUTES.listings);
}

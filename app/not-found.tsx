import Link from 'next/link';
import { Container } from '@/components/layout/Container';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants/routes';

export default function NotFound() {
  return (
    <Container className="py-20 text-center">
      <div className="text-8xl mb-6">🏠</div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3">
        Страница не найдена
      </h1>
      <p className="text-gray-500 mb-8 max-w-md mx-auto">
        Такой страницы не существует. Возможно, она была удалена или вы ввели неверный адрес.
      </p>
      <Link href={ROUTES.listings}>
        <Button variant="primary" size="md">
          Перейти к объявлениям
        </Button>
      </Link>
    </Container>
  );
}

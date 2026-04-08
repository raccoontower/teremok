import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { ROUTES } from '@/lib/constants/routes';

interface EmptyStateProps {
  title?: string;
  description?: string;
  showAddButton?: boolean;
}

export function EmptyState({
  title = 'Объявлений не найдено',
  description = 'По вашему запросу ничего не нашлось. Попробуйте изменить фильтры.',
  showAddButton = true,
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
      <div className="text-6xl mb-4">📭</div>
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-500 max-w-sm mb-6">{description}</p>
      {showAddButton && (
        <Link href={ROUTES.newListing}>
          <Button variant="primary">Подать объявление</Button>
        </Link>
      )}
    </div>
  );
}

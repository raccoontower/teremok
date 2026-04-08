import { Container } from '@/components/layout/Container';

/**
 * Skeleton loader для страницы объявлений
 */
export default function ListingsLoading() {
  return (
    <Container className="py-6">
      {/* Skeleton фильтры */}
      <div className="flex gap-3 mb-6">
        <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-40 bg-gray-200 rounded-lg animate-pulse" />
        <div className="h-10 w-24 bg-gray-200 rounded-lg animate-pulse ml-auto" />
      </div>

      {/* Skeleton сетка карточек */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {/* Фото */}
            <div className="aspect-[4/3] bg-gray-200 animate-pulse" />
            {/* Контент */}
            <div className="p-3 space-y-2">
              <div className="h-4 bg-gray-200 rounded animate-pulse" />
              <div className="h-4 bg-gray-200 rounded w-3/4 animate-pulse" />
              <div className="h-5 bg-gray-200 rounded w-1/2 animate-pulse" />
              <div className="flex gap-2 pt-1">
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
                <div className="h-3 bg-gray-200 rounded w-16 animate-pulse" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </Container>
  );
}

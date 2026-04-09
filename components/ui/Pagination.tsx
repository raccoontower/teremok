'use client';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages: (number | '...')[] = [];
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i);
  } else {
    pages.push(1);
    if (currentPage > 3) pages.push('...');
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i);
    }
    if (currentPage < totalPages - 2) pages.push('...');
    pages.push(totalPages);
  }

  const btnBase = 'min-w-[40px] h-10 px-3 rounded-lg text-sm font-medium transition-colors';
  const btnActive = 'bg-primary-600 text-white';
  const btnInactive = 'bg-white text-neutral-700 border border-neutral-200 hover:border-primary-300 hover:text-primary-600';
  const btnDisabled = 'opacity-40 cursor-not-allowed';

  return (
    <div className="flex items-center justify-center gap-1.5 py-8">
      {/* Назад */}
      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className={`${btnBase} ${btnInactive} ${currentPage === 1 ? btnDisabled : ''}`}
        aria-label="Предыдущая страница"
      >
        ←
      </button>

      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-neutral-400">…</span>
        ) : (
          <button
            key={p}
            onClick={() => onPageChange(p as number)}
            className={`${btnBase} ${p === currentPage ? btnActive : btnInactive}`}
            aria-current={p === currentPage ? 'page' : undefined}
          >
            {p}
          </button>
        )
      )}

      {/* Вперёд */}
      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className={`${btnBase} ${btnInactive} ${currentPage === totalPages ? btnDisabled : ''}`}
        aria-label="Следующая страница"
      >
        →
      </button>
    </div>
  );
}

interface ReportButtonProps {
  itemId: string;
  itemType: 'listing' | 'job' | 'housing' | 'service';
  itemTitle: string;
}

export function ReportButton({ itemId, itemType, itemTitle }: ReportButtonProps) {
  const body = `ID: ${itemId}%0AТип: ${itemType}%0AНазвание: ${encodeURIComponent(itemTitle)}%0A%0AОпишите проблему:`;
  const href = `mailto:report@teremok.app?subject=${encodeURIComponent('Жалоба на объявление')}&body=${body}`;

  return (
    <a
      href={href}
      className="text-xs text-neutral-400 hover:text-red-500 transition-colors"
    >
      🚩 Пожаловаться
    </a>
  );
}

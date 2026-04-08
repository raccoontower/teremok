import Link from 'next/link';

interface LogoProps {
  className?: string;
}

/**
 * SVG логотип Teremok — иконка локации с домиком + текст.
 * Воссоздан по дизайну: зелёный пин + тёмно-синий TEREMOK + зелёный подзаголовок.
 */
export function Logo({ className }: LogoProps) {
  return (
    <Link href="/" className={`flex items-center gap-2 shrink-0 ${className ?? ''}`} aria-label="Teremok — главная">
      {/* Иконка: зелёный пин с домиком */}
      <svg width="36" height="44" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
        {/* Тело пина */}
        <path
          d="M18 0C8.059 0 0 8.059 0 18c0 12.15 18 44 18 44S36 30.15 36 18C36 8.059 27.941 0 18 0z"
          fill="#4a9e6b"
        />
        {/* Домик внутри пина */}
        <g transform="translate(7, 6)">
          {/* Крыша */}
          <path d="M11 2L1 9.5V10h2v9h16V9.5h2v-.5L11 2z" fill="white" opacity="0.15"/>
          <path d="M11 3.5L2.5 10.5V18h17V10.5L11 3.5z" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
          <path d="M11 3.5L2.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          <path d="M11 3.5L19.5 10.5" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
          {/* Дверь */}
          <rect x="8" y="13" width="6" height="5" rx="0.5" fill="white" opacity="0.9"/>
        </g>
      </svg>

      {/* Текстовая часть */}
      <div className="flex flex-col leading-none">
        <span
          className="font-black tracking-wide"
          style={{ color: '#1e3a5f', fontSize: '20px', letterSpacing: '0.05em' }}
        >
          TEREMOK
        </span>
        <span
          className="font-medium"
          style={{ color: '#4a9e6b', fontSize: '10px', letterSpacing: '0.03em' }}
        >
          Local Marketplace
        </span>
      </div>
    </Link>
  );
}

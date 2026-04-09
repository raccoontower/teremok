import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Бренд */}
          <div className="col-span-2 md:col-span-1">
            {/* Белая версия логотипа для тёмного футера */}
            <Link href="/" className="flex items-center gap-2 mb-3">
              <svg width="32" height="39" viewBox="0 0 36 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M18 0C8.059 0 0 8.059 0 18c0 12.15 18 44 18 44S36 30.15 36 18C36 8.059 27.941 0 18 0z" fill="#4a9e6b"/>
                <path d="M18 9L8 17v11h20V17L18 9z" fill="none" stroke="white" strokeWidth="1.8" strokeLinejoin="round"/>
                <path d="M8 17L18 9l10 8" stroke="white" strokeWidth="1.8" strokeLinecap="round"/>
                <rect x="14" y="21" width="8" height="7" rx="0.5" fill="white" opacity="0.9"/>
              </svg>
              <div className="flex flex-col leading-none">
                <span className="font-black text-white tracking-wide" style={{ fontSize: '18px', letterSpacing: '0.05em' }}>TEREMOK</span>
                <span className="font-medium" style={{ color: '#4a9e6b', fontSize: '10px' }}>Local Marketplace</span>
              </div>
            </Link>
            <p className="text-sm leading-relaxed">
              Ваш дом в США — объявления, работа, жильё и услуги.
            </p>
          </div>

          {/* Разделы */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Разделы</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={ROUTES.listings} className="hover:text-white transition-colors">Объявления</Link></li>
              <li><Link href={ROUTES.jobs} className="hover:text-white transition-colors">Работа</Link></li>
              <li><Link href={ROUTES.housing} className="hover:text-white transition-colors">Жильё</Link></li>
              <li><Link href={ROUTES.services} className="hover:text-white transition-colors">Услуги</Link></li>
            </ul>
          </div>

          {/* Подать */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Разместить</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href={ROUTES.newListing} className="hover:text-white transition-colors">Объявление</Link></li>
              <li><Link href={ROUTES.newJob} className="hover:text-white transition-colors">Вакансию или резюме</Link></li>
              <li><Link href={ROUTES.newHousing} className="hover:text-white transition-colors">Жильё</Link></li>
              <li><Link href={ROUTES.newService} className="hover:text-white transition-colors">Услугу</Link></li>
            </ul>
          </div>

          {/* Инфо */}
          <div>
            <h4 className="text-white font-semibold text-sm mb-3">Информация</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/blog" className="hover:text-white transition-colors">Блог</Link></li>
              <li><Link href="/about" className="hover:text-white transition-colors">О нас</Link></li>
              <li><Link href="/contact" className="hover:text-white transition-colors">Контакты</Link></li>
              <li><Link href="/safety" className="hover:text-white transition-colors">Безопасность</Link></li>
              <li>
                <a href="/feed.xml" className="hover:text-white transition-colors">
                  RSS
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-neutral-800 mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
          <span>© {currentYear} Teremok. Все права защищены.</span>
          <span className="flex items-center gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">Конфиденциальность</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Условия использования</Link>
          </span>
        </div>
      </div>
    </footer>
  );
}

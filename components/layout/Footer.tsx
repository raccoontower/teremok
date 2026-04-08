import Link from 'next/link';
import { ROUTES } from '@/lib/constants/routes';
import { Logo } from '@/components/layout/Logo';

const currentYear = new Date().getFullYear();

export function Footer() {
  return (
    <footer className="bg-neutral-900 text-neutral-400 mt-16">
      <div className="max-w-6xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Бренд */}
          <div className="col-span-2 md:col-span-1">
            <div className="mb-3 brightness-0 invert">
              <Logo />
            </div>
            <p className="text-sm leading-relaxed mt-2">
              Русское сообщество в США — объявления, работа, жильё и услуги.
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

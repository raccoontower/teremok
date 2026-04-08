import StaticPage from '@/components/layout/StaticPage';

export const metadata = {
  title: 'О нас — Теремок',
  description: 'Теремок — русскоязычная платформа объявлений в США',
};

const features = [
  {
    icon: '📋',
    title: 'Объявления',
    desc: 'Покупайте и продавайте товары в своём городе — быстро и удобно.',
  },
  {
    icon: '💼',
    title: 'Работа',
    desc: 'Вакансии и резюме для русскоязычных специалистов по всей Америке.',
  },
  {
    icon: '🏡',
    title: 'Жильё',
    desc: 'Аренда и продажа недвижимости — квартиры, дома, комнаты.',
  },
  {
    icon: '🛠',
    title: 'Услуги',
    desc: 'Профессионалы — от бухгалтеров до сантехников — готовы помочь.',
  },
];

const reasons = [
  {
    icon: '✅',
    title: 'Бесплатно',
    desc: 'Размещение объявлений полностью бесплатно. Без скрытых комиссий.',
  },
  {
    icon: '🇷🇺',
    title: 'Только русскоязычная аудитория',
    desc: 'Все пользователи говорят на русском — общение без языкового барьера.',
  },
  {
    icon: '🤝',
    title: 'Без посредников',
    desc: 'Прямой контакт между покупателем и продавцом, нанимателем и кандидатом.',
  },
];

export default function AboutPage() {
  return (
    <StaticPage
      title="О Теремок"
      subtitle="Русскоязычная платформа объявлений в США"
    >
      {/* Наша миссия */}
      <h2>Наша миссия</h2>
      <p>
        Теремок создан для того, чтобы помочь русскоязычным людям в США — найти работу,
        снять жильё, воспользоваться профессиональными услугами и купить или продать
        что угодно — всё на родном языке, без языкового барьера.
      </p>
      <p>
        Переезд в новую страну — непросто. Мы хотим сделать этот путь чуть легче,
        объединив соотечественников на одной платформе. Здесь каждый найдёт то, что ищет.
      </p>

      {/* Что мы предлагаем */}
      <h2>Что мы предлагаем</h2>
      <div className="grid sm:grid-cols-2 gap-4 not-prose mt-4">
        {features.map((f) => (
          <div
            key={f.title}
            className="bg-white border border-neutral-100 rounded-xl p-5 shadow-sm"
          >
            <div className="text-2xl mb-2">{f.icon}</div>
            <h3 className="font-semibold text-neutral-900 mb-1">{f.title}</h3>
            <p className="text-sm text-neutral-600 leading-relaxed">{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Почему Теремок */}
      <h2>Почему Теремок?</h2>
      <div className="space-y-4 not-prose">
        {reasons.map((r) => (
          <div key={r.title} className="flex gap-4 bg-white border border-neutral-100 rounded-xl p-5 shadow-sm">
            <div className="text-2xl flex-shrink-0">{r.icon}</div>
            <div>
              <h3 className="font-semibold text-neutral-900 mb-1">{r.title}</h3>
              <p className="text-sm text-neutral-600 leading-relaxed">{r.desc}</p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className="bg-primary-50 border border-primary-100 rounded-xl p-6 text-center not-prose mt-8">
        <p className="text-neutral-800 font-semibold text-lg mb-1">Готовы начать?</p>
        <p className="text-neutral-500 text-sm mb-4">Разместите первое объявление — это займёт меньше минуты</p>
        <a
          href="/listings/new"
          className="inline-block bg-primary-600 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors no-underline"
        >
          Подать объявление
        </a>
      </div>
    </StaticPage>
  );
}

export const ROUTES = {
  home: '/',
  // Объявления
  listings: '/listings',
  newListing: '/listings/new',
  listing: (id: string) => `/listings/${id}`,
  // Работа
  jobs: '/jobs',
  newJob: '/jobs/new',
  job: (id: string) => `/jobs/${id}`,
  // Жильё
  housing: '/housing',
  newHousing: '/housing/new',
  housingItem: (id: string) => `/housing/${id}`,
  // Услуги
  services: '/services',
  newService: '/services/new',
  service: (id: string) => `/services/${id}`,
  // Блог
  blog: '/blog',
  blogPost: (slug: string) => `/blog/${slug}`,
  // Аккаунт
  login: '/login',
  register: '/register',
  profile: '/profile',
} as const;

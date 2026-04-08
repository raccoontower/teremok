export const ROUTES = {
  home: '/',
  listings: '/listings',
  newListing: '/listings/new',
  listing: (id: string) => `/listings/${id}`,
  login: '/login',
  register: '/register',
  profile: '/profile',
} as const;

/** Маппинг slug → русское название города */
export const CITY_NAMES: Record<string, string> = {
  'new-york': 'Нью-Йорк',
  'los-angeles': 'Лос-Анджелес',
  'miami': 'Майами',
  'chicago': 'Чикаго',
  'boston': 'Бостон',
  'san-francisco': 'Сан-Франциско',
  'houston': 'Хьюстон',
  'seattle': 'Сиэтл',
  'dallas': 'Даллас',
  'washington': 'Вашингтон',
};

/** Название города в предложном падеже (в городе) */
export const CITY_NAMES_LOC: Record<string, string> = {
  'new-york': 'Нью-Йорке',
  'los-angeles': 'Лос-Анджелесе',
  'miami': 'Майами',
  'chicago': 'Чикаго',
  'boston': 'Бостоне',
  'san-francisco': 'Сан-Франциско',
  'houston': 'Хьюстоне',
  'seattle': 'Сиэтле',
  'dallas': 'Далласе',
  'washington': 'Вашингтоне',
};

export const ALL_CITY_SLUGS = Object.keys(CITY_NAMES);

export function getCityName(slug: string): string {
  return CITY_NAMES[slug] ?? slug;
}

export function getCityNameLoc(slug: string): string {
  return CITY_NAMES_LOC[slug] ?? slug;
}

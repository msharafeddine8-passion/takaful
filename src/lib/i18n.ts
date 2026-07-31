export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

export const localeConfig: Record<Locale, { dir: 'rtl' | 'ltr'; label: string; htmlLang: string }> = {
  ar: { dir: 'rtl', label: 'العربية', htmlLang: 'ar' },
  en: { dir: 'ltr', label: 'English', htmlLang: 'en' },
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Swap the locale segment of a pathname, keeping the rest of the route. */
export function switchLocalePath(pathname: string, next: Locale): string {
  const parts = pathname.split('/').filter(Boolean);
  if (parts.length && isLocale(parts[0])) {
    parts[0] = next;
    return '/' + parts.join('/');
  }
  return `/${next}${pathname === '/' ? '' : pathname}`;
}

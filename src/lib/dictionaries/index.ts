import type { Locale } from '@/lib/i18n';
import type { Dictionary } from './types';
import { ar } from './ar';
import { en } from './en';

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale];
}

export type { Dictionary } from './types';

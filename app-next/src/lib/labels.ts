import type { ExplanationLanguage, Skill } from '@/content/types';

export const LANGUAGE_LABELS: Record<ExplanationLanguage, { short: string; name: string }> = {
  kk: { short: 'KK', name: 'Қазақша' },
  zh: { short: '中文', name: '中文' },
  en: { short: 'EN', name: 'English' }
};

export const SKILL_LABELS: Record<Skill, string> = {
  Grammar: 'Грамматика',
  Vocabulary: 'Сөздік қор',
  Reading: 'Оқылым',
  Listening: 'Тыңдалым',
  Speaking: 'Айтылым'
};

export function plural(n: number, word: string): string {
  return `${n} ${word}`;
}

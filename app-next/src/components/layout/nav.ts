import { BookA, ChartNoAxesColumn, ClipboardCheck, Headphones, House, Library, Mic, Route, Settings, Sparkles, type LucideIcon } from 'lucide-react';

export interface NavItem { href: string; label: string; icon: LucideIcon; short?: string }

export const primaryNav: NavItem[] = [
  { href: '/dashboard', label: 'Бүгін', icon: House },
  { href: '/learn', label: 'Оқу жолы', icon: Route, short: 'Оқу' },
  { href: '/teacher', label: 'Mira', icon: Sparkles }
];

export const practiceNav: NavItem[] = [
  { href: '/vocabulary', label: 'Сөздік', icon: BookA },
  { href: '/listening', label: 'Тыңдалым', icon: Headphones },
  { href: '/speaking', label: 'Айтылым', icon: Mic },
  { href: '/exam', label: 'Апталық емтихан', icon: ClipboardCheck, short: 'Емтихан' }
];

export const insightNav: NavItem[] = [
  { href: '/progress', label: 'Прогресс', icon: ChartNoAxesColumn },
  { href: '/library', label: 'Кітапхана', icon: Library }
];

export const settingsNav: NavItem = { href: '/settings', label: 'Баптаулар', icon: Settings };

/** Tabs shown in the mobile bottom bar (the rest live in the menu sheet). */
export const mobileTabs: NavItem[] = [primaryNav[0], primaryNav[1], primaryNav[2], practiceNav[0], insightNav[0]];

export const allNav: NavItem[] = [...primaryNav, ...practiceNav, ...insightNav, settingsNav];

export function isActive(pathname: string, href: string): boolean {
  return pathname === href || pathname.startsWith(href + '/');
}

export function titleFor(pathname: string): string {
  return allNav.find(n => isActive(pathname, n.href))?.label ?? 'LinguaPath AI';
}

'use client';
import { Menu, X } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type ReactNode } from 'react';
import { cn } from '@/lib/cn';
import { LevelSummary, StreakChip } from './learner-chips';
import { Logo } from './logo';
import { allNav, insightNav, isActive, mobileTabs, practiceNav, primaryNav, settingsNav, type NavItem } from './nav';
import { ThemeToggle } from './theme-toggle';

function NavLink({ item, pathname, onNavigate }: { item: NavItem; pathname: string; onNavigate?: () => void }) {
  const active = isActive(pathname, item.href);
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      aria-current={active ? 'page' : undefined}
      className={cn(
        'group flex h-9 items-center gap-3 rounded-lg px-3 text-[13.5px] font-medium transition-colors duration-150',
        active ? 'bg-surface text-fg shadow-soft ring-1 ring-border' : 'text-muted hover:bg-surface-muted hover:text-fg'
      )}
    >
      <Icon className={cn('size-[17px] shrink-0', active ? 'text-primary' : 'text-subtle group-hover:text-muted')} aria-hidden="true" />
      {item.label}
    </Link>
  );
}

function NavSection({ label, items, pathname, onNavigate }: { label?: string; items: NavItem[]; pathname: string; onNavigate?: () => void }) {
  return (
    <div>
      {label && <p className="mb-1.5 px-3 text-[11px] font-medium uppercase tracking-[0.08em] text-subtle">{label}</p>}
      <ul className="grid gap-0.5">
        {items.map(item => <li key={item.href}><NavLink item={item} pathname={pathname} onNavigate={onNavigate} /></li>)}
      </ul>
    </div>
  );
}

function NavTree({ pathname, onNavigate }: { pathname: string; onNavigate?: () => void }) {
  return (
    <div className="grid gap-6">
      <NavSection items={primaryNav} pathname={pathname} onNavigate={onNavigate} />
      <NavSection label="Практика" items={practiceNav} pathname={pathname} onNavigate={onNavigate} />
      <NavSection label="Талдау" items={insightNav} pathname={pathname} onNavigate={onNavigate} />
    </div>
  );
}

function MobileMenu({ open, onClose, pathname }: { open: boolean; onClose: () => void; pathname: string }) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (open && !d.open) d.showModal();
    if (!open && d.open) d.close();
  }, [open]);

  return (
    <dialog
      ref={ref}
      id="mobile-menu"
      aria-label="Негізгі мәзір"
      onClose={onClose}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}
      className="m-0 ml-auto h-dvh max-h-dvh w-[min(86vw,320px)] max-w-none border-l border-border bg-bg p-0 text-fg shadow-float"
    >
      <div className="flex h-full flex-col gap-6 overflow-y-auto p-4">
        <div className="flex items-center justify-between">
          <Logo />
          <button type="button" onClick={onClose} className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-muted hover:text-fg" aria-label="Мәзірді жабу">
            <X className="size-5" aria-hidden="true" />
          </button>
        </div>
        <nav aria-label="Мобиль мәзір"><NavTree pathname={pathname} onNavigate={onClose} /></nav>
        <div className="mt-auto grid gap-3">
          <LevelSummary />
          <NavLink item={settingsNav} pathname={pathname} onNavigate={onClose} />
        </div>
      </div>
    </dialog>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);
  const current = allNav.find(n => isActive(pathname, n.href));

  return (
    <div className="min-h-dvh lg:grid lg:grid-cols-[248px_minmax(0,1fr)]">
      <a href="#main" className="sr-only z-50 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-fg focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        Негізгі мазмұнға өту
      </a>

      {/* Desktop sidebar */}
      <aside className="sticky top-0 hidden h-dvh flex-col gap-6 border-r border-border bg-surface-muted/40 px-3 py-5 lg:flex" aria-label="Бүйірлік панель">
        <div className="px-2"><Logo /></div>
        <nav aria-label="Негізгі мәзір" className="flex-1 overflow-y-auto"><NavTree pathname={pathname} /></nav>
        <div className="grid gap-2">
          <LevelSummary />
          <NavLink item={settingsNav} pathname={pathname} />
        </div>
      </aside>

      <div className="flex min-w-0 flex-col">
        {/* Top bar */}
        <header className="sticky top-0 z-30 border-b border-border bg-bg/85 backdrop-blur-md supports-[backdrop-filter]:bg-bg/75">
          <div className="mx-auto flex h-14 max-w-6xl items-center gap-3 px-4 sm:px-6 lg:px-10">
            <div className="lg:hidden"><Logo /></div>
            <p className="hidden text-sm text-muted lg:block" aria-hidden="true">
              <span className="text-subtle">LinguaPath</span>
              <span className="mx-2 text-border-strong">/</span>
              <span className="font-medium text-fg">{current?.label ?? 'LinguaPath AI'}</span>
            </p>
            <div className="ml-auto flex items-center gap-1.5">
              <StreakChip />
              <ThemeToggle />
              <button
                type="button"
                className="grid size-9 place-items-center rounded-lg text-muted hover:bg-surface-muted hover:text-fg lg:hidden"
                aria-label="Мәзірді ашу"
                aria-haspopup="dialog"
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
                onClick={() => setMenuOpen(true)}
              >
                <Menu className="size-5" aria-hidden="true" />
              </button>
            </div>
          </div>
        </header>

        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-6xl flex-1 px-4 pb-28 pt-6 sm:px-6 sm:pt-8 lg:px-10 lg:pb-16 lg:pt-10">
          {children}
        </main>

        <footer className="mx-auto hidden w-full max-w-6xl px-10 pb-8 text-xs text-subtle lg:block">
          LinguaPath AI · Прототип v0.3 · Деректер тек осы браузерде сақталады · Шынайы AI әлі қосылмаған
        </footer>
      </div>

      {/* Mobile bottom tab bar */}
      <nav aria-label="Жылдам навигация" className="fixed inset-x-0 bottom-0 z-30 border-t border-border bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md lg:hidden">
        <ul className="mx-auto grid max-w-lg grid-cols-5">
          {mobileTabs.map(item => {
            const active = isActive(pathname, item.href);
            const Icon = item.icon;
            return (
              <li key={item.href}>
                <Link href={item.href} aria-current={active ? 'page' : undefined} className={cn('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium', active ? 'text-primary' : 'text-muted')}>
                  <Icon className="size-5" aria-hidden="true" />
                  {item.short ?? item.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} pathname={pathname} />
    </div>
  );
}

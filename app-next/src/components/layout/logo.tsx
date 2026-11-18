import Link from 'next/link';

/** Wordmark: a restrained geometric mark (path + node) in brand colours. */
export function LogoMark({ size = 28 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="shrink-0">
      <rect width="32" height="32" rx="8" fill="var(--brand-navy)" />
      <path d="M10 8v13.5a2.5 2.5 0 0 0 2.5 2.5H22" fill="none" stroke="var(--brand-indigo)" strokeWidth="2.6" strokeLinecap="round" />
      <circle cx="22" cy="10" r="3" fill="var(--brand-cyan)" />
    </svg>
  );
}

export function Logo() {
  return (
    <Link href="/dashboard" className="flex items-center gap-2.5 rounded-md" aria-label="LinguaPath AI — басты бет">
      <LogoMark />
      <span className="text-[15px] font-semibold tracking-tight text-fg">
        LinguaPath <span className="font-medium text-subtle">AI</span>
      </span>
    </Link>
  );
}

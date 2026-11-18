import { cn } from '@/lib/cn';

export type MiraState = 'idle' | 'thinking' | 'speaking' | 'listening';

const STATE_LABEL: Record<MiraState, string> = {
  idle: 'Mira дайын',
  thinking: 'Mira ойланып жатыр',
  speaking: 'Mira сөйлеп жатыр',
  listening: 'Mira тыңдап жатыр'
};

/**
 * Mira's visual identity: an abstract, calm "voice orb" instead of a cartoon face.
 * The `state` prop is ready for future voice mode — the halo breathes while
 * thinking/listening and the inner bars move while speaking (respecting reduced motion).
 */
export function MiraAvatar({ size = 40, state = 'idle', className }: { size?: number; state?: MiraState; className?: string }) {
  const active = state !== 'idle';
  return (
    <span className={cn('relative inline-grid shrink-0 place-items-center', className)} style={{ width: size, height: size }} role="img" aria-label={STATE_LABEL[state]} data-state={state}>
      {active && <span className="absolute -inset-1 animate-pulse-soft rounded-[32%] bg-brand-indigo/25" aria-hidden="true" />}
      <svg viewBox="0 0 48 48" width={size} height={size} className="relative overflow-hidden rounded-[31%]" aria-hidden="true">
        <rect width="48" height="48" rx="15" fill="#121a3d" />
        <circle cx="14" cy="12" r="20" fill="#697afa" opacity="0.22" />
        <rect x="0.75" y="0.75" width="46.5" height="46.5" rx="14.25" fill="none" stroke="#697afa" strokeOpacity="0.45" strokeWidth="1.5" />
        <g fill="#50ddd3" className={cn(state === 'speaking' && '[&>rect]:origin-center [&>rect]:animate-pulse-soft')}>
          <rect x="15" y="20" width="3" height="8" rx="1.5" opacity="0.7" />
          <rect x="20.5" y="16" width="3" height="16" rx="1.5" />
          <rect x="26" y="18" width="3" height="12" rx="1.5" opacity="0.85" />
          <rect x="31.5" y="21" width="3" height="6" rx="1.5" opacity="0.6" />
        </g>
      </svg>
    </span>
  );
}

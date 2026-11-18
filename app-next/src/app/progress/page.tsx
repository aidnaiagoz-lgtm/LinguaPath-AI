import type { Metadata } from 'next';
import { ProgressView } from '@/components/progress/progress-view';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Прогресс', description: 'XP, деңгей, streak, белсенділік және дағдылар бойынша оқу аналитикасы.' };

export default function ProgressPage() {
  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="Analytics" title="Прогресс" description="Оқу белсенділігің, XP динамикасы және қай дағдыға көбірек көңіл бөлу керегі." />
      <ProgressView />
    </div>
  );
}

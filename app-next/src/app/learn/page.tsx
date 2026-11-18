import type { Metadata } from 'next';
import { Roadmap } from '@/components/learning/roadmap';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Оқу жолы', description: 'A0-ден B2-ге дейінгі оқу картасы: сабақтар ретімен, 75% меңгерген соң ашылады.' };

export default function LearnPage() {
  return (
    <div className="grid grid-cols-1 animate-enter gap-10">
      <PageHeader eyebrow="Learning roadmap" title="Оқу жолы" description="Сабақтар ретімен ашылады: әр сабақты кемі 75% нәтижемен аяқтағанда келесісі ашылады. A2–B2 деңгейлері кезең-кезеңімен қосылады." />
      <Roadmap />
    </div>
  );
}

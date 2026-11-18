import type { Metadata } from 'next';
import { SpeakingPractice } from '@/components/practice/speaking-practice';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Айтылым', description: 'Shadowing әдісімен айтылымды жаттықтыру: тыңда, қайтала, салыстыр.' };

export default function SpeakingPage() {
  return (
    <div className="grid max-w-3xl grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="Speaking" title="Айтылым" description="Үлгіні тыңда, дауыстап қайтала және қаласаң өз дауысыңды жазып, салыстыр. AI айтылым бағасы кейінгі кезеңде қосылады." />
      <SpeakingPractice />
    </div>
  );
}

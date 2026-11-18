import type { Metadata } from 'next';
import { ExamRunner } from '@/components/exam/exam-runner';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Апталық емтихан', description: 'Өтілген сабақтар бойынша апталық тест: нәтиже, әлсіз тақырыптар және XP.' };

export default function ExamPage() {
  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="Weekly checkpoint" title="Апталық емтихан" description="Тек өзің өткен сабақтардан құралады. Нәтижеде дағдылар бойынша талдау көрсетіледі." />
      <ExamRunner />
    </div>
  );
}

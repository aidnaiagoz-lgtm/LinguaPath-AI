import type { Metadata } from 'next';
import { ListeningPractice } from '@/components/practice/listening-practice';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Тыңдалым', description: 'Қысқа ағылшын сөйлемдерін тыңдап, түсінуді жаттықтыру.' };

export default function ListeningPage() {
  return (
    <div className="grid max-w-3xl grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="Listening" title="Тыңдалым" description="Сөйлемді тыңда, қажет болса баяулат, содан кейін мағынасын таңда. Дыбыс браузердің кірістірілген дауыс синтезі арқылы ойнатылады." />
      <ListeningPractice />
    </div>
  );
}

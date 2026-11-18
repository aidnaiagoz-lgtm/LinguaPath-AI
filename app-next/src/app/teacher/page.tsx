import type { Metadata } from 'next';
import { MiraChat } from '@/components/mira/mira-chat';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Mira — AI мұғалім', description: 'Үш тілде түсіндіретін оқу көмекшісі Mira (демо режим).' };

export default function TeacherPage() {
  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="AI tutor" title="Mira" description="Грамматиканы, сөздерді және сөйлемдерді қазақша, қытайша немесе ағылшынша түсіндіретін оқу көмекшісі. Қазір демо режимде: жауаптар алдын ала жазылған." />
      <MiraChat />
    </div>
  );
}

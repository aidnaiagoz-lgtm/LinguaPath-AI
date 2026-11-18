import type { Metadata } from 'next';
import { Flashcards } from '@/components/vocabulary/flashcards';
import { WordMatch } from '@/components/vocabulary/word-match';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Сөздік', description: 'Сөз сәйкестендіру және карточкалар: ағылшын ↔ қазақша / 中文.' };

export default function VocabularyPage() {
  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="Vocabulary practice" title="Сөздік практика" description="Сөздерді қазақша немесе қытайша аудармасымен бекіт. Әр жаттығу күніне бір рет XP береді." />
      <div className="grid gap-6 xl:grid-cols-2">
        <WordMatch />
        <Flashcards />
      </div>
    </div>
  );
}

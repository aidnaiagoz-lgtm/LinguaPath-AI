import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getLesson, lessons } from '@/content/lessons';
import { LessonView } from '@/components/learning/lesson-view';
import { Badge } from '@/components/ui/badge';
import { PageHeader } from '@/components/ui/page-header';

export function generateStaticParams() {
  return lessons.map(l => ({ lessonId: l.id }));
}

export async function generateMetadata({ params }: { params: Promise<{ lessonId: string }> }): Promise<Metadata> {
  const lesson = getLesson((await params).lessonId);
  return lesson ? { title: lesson.title, description: `${lesson.level} · ${lesson.objective}` } : {};
}

export default async function LessonPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const lesson = getLesson((await params).lessonId);
  if (!lesson) notFound();
  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <div className="grid gap-5">
        <Link href="/learn" className="inline-flex w-fit items-center gap-1.5 rounded-md text-sm text-muted hover:text-fg">
          <ArrowLeft className="size-4" aria-hidden="true" />Оқу жолы
        </Link>
        <PageHeader
          eyebrow={`${lesson.level} · ${lesson.tag}`}
          title={lesson.title}
          description={lesson.description}
          actions={<Badge tone="primary">{lesson.minutes} мин · {lesson.xp} XP</Badge>}
        />
      </div>
      <LessonView key={lesson.id} lesson={lesson} />
    </div>
  );
}

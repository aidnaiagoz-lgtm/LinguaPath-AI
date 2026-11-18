import { ExternalLink, ShieldCheck } from 'lucide-react';
import type { Metadata } from 'next';
import { resources } from '@/content/practice';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Кітапхана', description: 'Тексерілген халықаралық және қытай тіліндегі ағылшын оқу көздері — тек ресми сілтемелер.' };

export default function LibraryPage() {
  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="Curated resources" title="Кітапхана" description="Деңгейіңе сай халықаралық және қытай тіліндегі оқу көздері. Авторлық құқықты сақтап, тек ресми беттерге сілтеме береміз." />
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {resources.map(r => (
          <li key={r.name}>
            <Card className="flex h-full flex-col p-5 transition-colors hover:border-border-strong">
              <div className="flex items-center justify-between gap-2">
                <Badge tone={r.language === 'zh' ? 'accent' : 'neutral'}>{r.type}</Badge>
                <span className="text-xs text-subtle">{r.language === 'zh' ? '中文' : 'English'}</span>
              </div>
              <h2 className="mt-4 text-[15px] font-semibold text-fg">{r.name}</h2>
              <p className="mt-1.5 flex-1 text-sm leading-relaxed text-muted">{r.note}</p>
              <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-5 inline-flex w-fit items-center gap-1.5 rounded-md text-sm font-medium text-primary hover:underline">
                Ресми сайтты ашу<ExternalLink className="size-3.5" aria-hidden="true" /><span className="sr-only"> ({r.name}, жаңа бетте ашылады)</span>
              </a>
            </Card>
          </li>
        ))}
      </ul>
      <Card className="flex items-start gap-3 bg-surface-muted/60 p-5 shadow-none">
        <ShieldCheck className="mt-0.5 size-5 shrink-0 text-accent" aria-hidden="true" />
        <div>
          <h2 className="text-sm font-semibold text-fg">Авторлық құқыққа құрмет</h2>
          <p className="mt-1 text-sm leading-relaxed text-muted">VOA, BBC, British Council, Bilibili материалдарын рұқсатсыз көшірмейміз. Платформаға тек өз материалымыз, қолдануға рұқсат етілген контент немесе ресми сілтеме қосылады.</p>
        </div>
      </Card>
    </div>
  );
}

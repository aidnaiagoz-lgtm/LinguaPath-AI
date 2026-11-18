import { Compass } from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { EmptyState } from '@/components/ui/empty-state';

export default function NotFound() {
  return (
    <div className="grid min-h-[50vh] place-items-center">
      <EmptyState icon={<Compass className="size-5" />} title="Бет табылмады" description="Сілтеме ескірген немесе қате терілген болуы мүмкін." action={<ButtonLink href="/dashboard">Басты бетке</ButtonLink>} />
    </div>
  );
}

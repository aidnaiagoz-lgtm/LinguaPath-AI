import type { Metadata } from 'next';
import { SettingsForm } from '@/components/settings/settings-form';
import { PageHeader } from '@/components/ui/page-header';

export const metadata: Metadata = { title: 'Баптаулар', description: 'Түсіндірме тілі, оқу кестесі, күндік мақсат, тақырып және деректер.' };

export default function SettingsPage() {
  return (
    <div className="grid grid-cols-1 animate-enter gap-8">
      <PageHeader eyebrow="Preferences" title="Баптаулар" />
      <SettingsForm />
    </div>
  );
}

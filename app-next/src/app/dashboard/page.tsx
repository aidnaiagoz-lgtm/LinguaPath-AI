import type { Metadata } from 'next';
import { Today } from '@/components/dashboard/today';

export const metadata: Metadata = { title: 'Бүгін', description: 'Күндік мақсат, streak, келесі сабақ және бүгінгі оқу жоспары.' };

export default function DashboardPage() {
  return <Today />;
}

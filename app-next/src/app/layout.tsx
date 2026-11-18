import '@fontsource-variable/inter';
import './globals.css';
import type { Metadata, Viewport } from 'next';
import type { ReactNode } from 'react';
import { AppShell } from '@/components/layout/app-shell';
import { themeScript } from '@/components/layout/theme-toggle';
import { ToastProvider } from '@/components/ui/toast';
import { SITE_URL } from '@/lib/site';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'LinguaPath AI — жеке ағылшын академиясы', template: '%s · LinguaPath AI' },
  description: 'Beginner деңгейінен B2-ге дейін ағылшын тілін қазақша, қытайша және ағылшынша түсіндірумен үйрететін бейімделетін оқу платформасы.',
  applicationName: 'LinguaPath AI',
  keywords: ['ағылшын тілі', 'English', 'CEFR', 'A0', 'B2', 'IELTS', 'қазақша', '中文', 'AI tutor'],
  openGraph: {
    type: 'website',
    siteName: 'LinguaPath AI',
    title: 'LinguaPath AI — жеке ағылшын академиясы',
    description: 'A0 → B2 ағылшын тілі: сабақтар, сөздік, тыңдалым, айтылым, апталық емтихан және AI мұғалім Mira (демо).',
    locale: 'kk_KZ'
  },
  formatDetection: { telephone: false }
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#f6f7fb' },
    { media: '(prefers-color-scheme: dark)', color: '#10162a' }
  ],
  width: 'device-width',
  initialScale: 1
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="kk" data-theme="light" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body>
        <ToastProvider>
          <AppShell>{children}</AppShell>
        </ToastProvider>
      </body>
    </html>
  );
}

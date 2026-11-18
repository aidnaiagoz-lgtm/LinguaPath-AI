import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'LinguaPath AI',
    short_name: 'LinguaPath',
    description: 'A0 → B2 ағылшын тілі: kk / 中文 / EN түсіндірмемен.',
    start_url: '/dashboard',
    display: 'standalone',
    background_color: '#f6f7fb',
    theme_color: '#080f26',
    lang: 'kk',
    icons: [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }]
  };
}

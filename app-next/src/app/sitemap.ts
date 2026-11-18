import type { MetadataRoute } from 'next';
import { lessons } from '@/content/lessons';
import { SITE_URL } from '@/lib/site';

const routes = ['/dashboard', '/learn', '/teacher', '/vocabulary', '/listening', '/speaking', '/exam', '/progress', '/library', '/settings'];

export default function sitemap(): MetadataRoute.Sitemap {
  return [...routes, ...lessons.map(l => `/learn/${l.id}`)].map(path => ({ url: `${SITE_URL}${path}`, changeFrequency: 'weekly', priority: path === '/dashboard' ? 1 : 0.6 }));
}

/* Verifies the design tokens in globals.css meet WCAG 2.1 AA contrast. */
import fs from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';

const css = fs.readFileSync(path.resolve(__dirname, '../../src/app/globals.css'), 'utf8');

function block(theme: 'light' | 'dark'): Record<string, string> {
  const body = css.split(`[data-theme="${theme}"] {`)[1]?.split('}')[0] ?? '';
  return Object.fromEntries([...body.matchAll(/--([\w-]+):\s*(#[0-9a-f]{6})/gi)].map(m => [m[1], m[2]]));
}

const luminance = (hex: string) => {
  const [r, g, b] = hex.slice(1).match(/../g)!.map(x => parseInt(x, 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const ratio = (a: string, b: string) => {
  const [x, y] = [luminance(a), luminance(b)].sort((p, q) => q - p);
  return (x + 0.05) / (y + 0.05);
};

const themes = { light: block('light'), dark: block('dark') };

describe.each(Object.entries(themes))('%s theme', (_, t) => {
  it('defines its tokens', () => {
    expect(Object.keys(t).length).toBeGreaterThan(20);
  });

  const text: [string, string][] = [
    ['text', 'bg'], ['text', 'surface'], ['text-muted', 'bg'], ['text-muted', 'surface'], ['text-muted', 'surface-muted'],
    ['text-subtle', 'surface'], ['text-subtle', 'bg'], ['text-subtle', 'surface-muted'],
    ['primary-fg', 'primary'], ['primary', 'surface'], ['primary-soft-fg', 'primary-soft'],
    ['accent', 'surface'], ['accent-soft-fg', 'accent-soft'],
    ['success', 'surface'], ['success', 'success-soft'], ['warning', 'surface'], ['warning', 'warning-soft'], ['danger', 'surface'], ['danger', 'danger-soft']
  ];
  it.each(text)('%s on %s ≥ 4.5:1', (fg, bg) => {
    expect(t[fg], fg).toBeDefined();
    expect(t[bg], bg).toBeDefined();
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(4.5);
  });

  it.each([['input-border', 'surface'], ['ring', 'bg'], ['ring', 'surface']] as const)('%s on %s ≥ 3:1 (UI components)', (fg, bg) => {
    expect(ratio(t[fg], t[bg])).toBeGreaterThanOrEqual(3);
  });
});

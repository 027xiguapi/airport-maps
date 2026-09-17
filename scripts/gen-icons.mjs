/**
 * One-off generator: converts the raw SVG strings in lib/icons.ts into real JSX
 * components (lib/icons.tsx) so icons render with no extra wrapper element —
 * the ported stylesheets use descendant selectors (`.transit-row span`) that a
 * wrapper would break.
 *
 * Usage: node scripts/gen-icons.mjs
 */
import { readFileSync, writeFileSync, unlinkSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT } from './_env.mjs';

const source = readFileSync(join(ROOT, 'lib', 'icons.ts'), 'utf8');

const ATTRS = {
  'stroke-width': 'strokeWidth',
  'stroke-linecap': 'strokeLinecap',
  'stroke-linejoin': 'strokeLinejoin',
  'stroke-dasharray': 'strokeDasharray',
  'fill-rule': 'fillRule',
  'clip-rule': 'clipRule',
  'stroke-opacity': 'strokeOpacity',
  'fill-opacity': 'fillOpacity',
  class: 'className',
};

/** Pulls `name: '<svg .../>',` pairs out of the ICONS object literal. */
const entries = [];
const re = /^\s{2}(\w+):\s*\n?\s*'((?:[^'\\]|\\.)*)',?\s*$/gm;
let m;
while ((m = re.exec(source)) !== null) {
  const [, key, raw] = m;
  const svg = raw.replace(/\\'/g, "'").replace(/\\\\/g, '\\');
  if (!svg.startsWith('<svg')) {
    throw new Error(`entry "${key}" does not look like an svg: ${svg.slice(0, 40)}`);
  }
  entries.push([key, svg]);
}

if (entries.length < 15) {
  throw new Error(`only parsed ${entries.length} icons — the regex needs updating`);
}

function toJsx(svg) {
  let out = svg;
  for (const [kebab, camel] of Object.entries(ATTRS)) {
    out = out.replaceAll(`${kebab}=`, `${camel}=`);
  }
  return out;
}

const pascal = (name) => name.charAt(0).toUpperCase() + name.slice(1);
const lines = [];

lines.push(`import type { SVGProps } from 'react';`);
lines.push('');
lines.push('/**');
lines.push(' * Inline SVG icon set, generated from the original build\'s sprite strings by');
lines.push(' * scripts/gen-icons.mjs. Each icon is a plain component so markup stays');
lines.push(' * identical to the ported stylesheets\' expectations (no wrapper element).');
lines.push(' */');
lines.push('type IconProps = SVGProps<SVGSVGElement>;');
lines.push('');

for (const [name, svg] of entries) {
  lines.push(`export function ${pascal(name)}Icon(props: IconProps) {`);
  lines.push(`  return (`);
  lines.push(`    ${toJsx(svg)}`);
  lines.push(`  );`);
  lines.push(`}`);
  lines.push('');
}

lines.push('export const ICONS = {');
for (const [name] of entries) {
  lines.push(`  ${name}: ${pascal(name)}Icon,`);
}
lines.push('} as const;');
lines.push('');
lines.push('export type IconName = keyof typeof ICONS;');
lines.push('');
lines.push('/** Renders an icon by name, falling back to the "shop" glyph. */');
lines.push('export function Icon({ name, ...props }: { name: string | null | undefined } & IconProps) {');
lines.push('  const Cmp = ICONS[(name ?? \'\') as IconName] ?? ICONS.shop;');
lines.push('  return <Cmp {...props} />;');
lines.push('}');
lines.push('');

writeFileSync(join(ROOT, 'lib', 'icons.tsx'), lines.join('\n'), 'utf8');
unlinkSync(join(ROOT, 'lib', 'icons.ts'));

console.log(`generated lib/icons.tsx with ${entries.length} icons:`);
console.log(entries.map(([n]) => n).join(', '));

/**
 * The tools directory's slugs. A leaf module on purpose (no React, no message
 * catalogs): the tool hub and homepage strip read it through
 * components/tool/shell.tsx, while app/sitemap.ts needs the same list without
 * dragging the component tree into the sitemap's bundle.
 *
 * A tool is only routable when `app/[locale]/tool/<slug>/page.tsx` exists —
 * adding one means adding the route file and its entry here.
 */
export type ToolSlug = 'coordinate-converter' | 'dms-converter' | 'distance-calculator';

export const TOOL_SLUGS: ToolSlug[] = [
  'coordinate-converter',
  'dms-converter',
  'distance-calculator',
];

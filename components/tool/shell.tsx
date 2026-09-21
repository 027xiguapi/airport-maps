import type { ReactNode } from 'react';
import Link from 'next/link';
import type { Metadata } from 'next';
import Breadcrumb from '@/components/Breadcrumb';
import { getMessages, languageAlternates } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { absoluteUrl, SITE_NAME } from '@/lib/site';
import { Button } from '@/components/ui/button';
import type { Messages } from '@/lib/i18n/messages/zh';

/** One entry in the tools directory. Hub cards and "related" strips derive from this. */
export type ToolSlug = 'coordinate-converter' | 'dms-converter' | 'distance-calculator';

export const TOOL_SLUGS: ToolSlug[] = [
  'coordinate-converter',
  'dms-converter',
  'distance-calculator',
];

/**
 * The Card variant for clickable tool cards (hub + homepage tools strip).
 * Mirrors the classes CategoryGrid puts on its cards so every card grid on the
 * site lifts, hovers and collapses identically; `group` drives the icon-well
 * swap on the card's icon.
 */
export const TOOL_CARD_CLASSES =
  'group relative min-h-[126px] cursor-pointer flex-row items-start gap-3.5 px-[22px] py-5 transition-[transform,box-shadow,border-color] duration-[160ms] hover:-translate-y-[3px] hover:border-sky-400 hover:[box-shadow:var(--shadow-md)] max-[620px]:min-h-0 max-[620px]:px-[18px] max-[620px]:py-4';

export type ToolCopy =
  | Messages['tool']['tools']['coordinateConverter']
  | Messages['tool']['tools']['dmsConverter']
  | Messages['tool']['tools']['distanceCalculator'];

/** The per-tool copy block for a slug. */
export function toolMessages(tool: Messages['tool'], slug: ToolSlug): ToolCopy {
  if (slug === 'coordinate-converter') return tool.tools.coordinateConverter;
  if (slug === 'dms-converter') return tool.tools.dmsConverter;
  return tool.tools.distanceCalculator;
}

/** Shared metadata for the hub and each tool page (canonical + hreflang + OG). */
export function toolMetadata(locale: Locale, slug: ToolSlug | null): Metadata {
  const tool = getMessages(locale).tool;
  const path = slug ? `/tool/${slug}` : '/tool';
  const title = slug ? toolMessages(tool, slug).title : tool.hub.title;
  const description = slug
    ? toolMessages(tool, slug).description
    : tool.hub.description;

  return {
    title,
    description,
    alternates: {
      canonical: localizedPath(locale, path),
      languages: languageAlternates(path),
    },
    openGraph: {
      siteName: SITE_NAME,
      title: `${title} | ${SITE_NAME}`,
      description,
      url: absoluteUrl(localizedPath(locale, path)),
    },
  };
}

/**
 * Shared page skeleton for the tool pages: navy page head with the breadcrumb
 * and title, then whatever the tool renders inside the body section.
 */
export default function ToolPageShell({
  locale,
  slug,
  children,
}: {
  locale: Locale;
  slug: ToolSlug | null;
  children: ReactNode;
}) {
  const t = getMessages(locale);
  const current = slug ? toolMessages(t.tool, slug) : null;

  const crumbs = [
    { label: t.common.home, href: '/' },
    { label: t.tool.label, href: slug ? '/tool' : undefined },
    ...(current ? [{ label: current.title }] : []),
  ];

  return (
    <>
      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb locale={locale} items={crumbs} />
          <div className="country-hero">
            <div>
              <h1>{current ? current.title : t.tool.hub.title}</h1>
              <div className="sub">{current ? current.description : t.tool.hub.sub}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="country-airports">{children}</section>
    </>
  );
}

/** The "how to use" panel: numbered steps plus the explainer note. */
export function ToolHowTo({ tool: toolCopy, howTitle }: { tool: ToolCopy; howTitle: string }) {
  return (
    <div className="info-panel">
      <h3>{howTitle}</h3>
      <div className="md">
        <ol>
          {toolCopy.steps.map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </div>
      <p className="sec-sub" style={{ marginTop: 14 }}>
        {toolCopy.note}
      </p>
    </div>
  );
}

/** Chip strip linking to the other tools (and the hub). */
export function ToolRelated({ locale, current }: { locale: Locale; current: ToolSlug | null }) {
  const t = getMessages(locale);
  return (
    <div>
      <div className="section-head" style={{ marginTop: 46, marginBottom: 16 }}>
        <div>
          <div className="section-kicker">{t.tool.hub.kicker}</div>
          <h2 className="section-title">
            {t.tool.relatedTitle}
            <span className="en">{t.tool.hub.en}</span>
          </h2>
        </div>
      </div>
      <div className="ext-links">
        {TOOL_SLUGS.filter((slug) => slug !== current).map((slug) => (
          <Button key={slug} asChild variant="outline">
            <Link href={localizedPath(locale, `/tool/${slug}`)}>
              {toolMessages(t.tool, slug).title} ↗
            </Link>
          </Button>
        ))}
        {current && (
          <Button asChild variant="outline">
            <Link href={localizedPath(locale, '/tool')}>{t.tool.allTools} ↗</Link>
          </Button>
        )}
      </div>
    </div>
  );
}

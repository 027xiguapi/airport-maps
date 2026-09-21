import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowIcon, GlobeIcon, RulerIcon, SwapIcon } from '@/lib/icons';
import { getMessages, parseLocale } from '@/lib/i18n';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import Breadcrumb from '@/components/Breadcrumb';
import { Card } from '@/components/ui/card';
import { TOOL_CARD_CLASSES, toolMessages, TOOL_SLUGS } from '@/components/tool/shell';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = getMessages(parseLocale(locale) ?? 'en');
  return {
    title: t.tool.hub.title,
    description: t.tool.hub.description,
  };
}

/** Card icons for the tools directory, keyed by slug. */
const TOOL_ICONS = {
  'coordinate-converter': SwapIcon,
  'dms-converter': GlobeIcon,
  'distance-calculator': RulerIcon,
} as const;

export default async function ToolHubPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale: Locale = parseLocale(raw) ?? 'en';
  const t = getMessages(locale);

  return (
    <>
      <div className="page-head">
        <div className="page-head-inner">
          <Breadcrumb
            locale={locale}
            items={[{ label: t.common.home, href: '/' }, { label: t.tool.label }]}
          />
          <div className="country-hero">
            <div>
              <h1>{t.tool.hub.title}</h1>
              <div className="sub">{t.tool.hub.sub}</div>
            </div>
          </div>
        </div>
      </div>

      <section className="country-airports">
        <div className="cat-grid">
          {TOOL_SLUGS.map((slug) => {
            const tool = toolMessages(t.tool, slug);
            const Icon = TOOL_ICONS[slug];
            return (
              <Card asChild className={TOOL_CARD_CLASSES} key={slug}>
                <Link href={localizedPath(locale, `/tool/${slug}`)}>
                  <span className="cat-icon transition-[background-color,color] duration-[160ms] group-hover:bg-navy-800 group-hover:text-white">
                    <Icon width={20} height={20} />
                  </span>
                  <span className="cat-body">
                    <b>{tool.title}</b>
                    <span>{tool.description}</span>
                  </span>
                  <span className="cat-meta">
                    <ArrowIcon width={14} height={14} />
                  </span>
                </Link>
              </Card>
            );
          })}
        </div>

        <div className="info-panel" style={{ marginTop: 30 }}>
          <h3>{t.tool.hub.comingTitle}</h3>
          <p className="sec-sub" style={{ marginTop: 0 }}>
            {t.tool.hub.comingSub}
          </p>
        </div>
      </section>
    </>
  );
}

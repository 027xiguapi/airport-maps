import type { Metadata } from 'next';
import CoordinateConverter from '@/components/tool/CoordinateConverter';
import ToolPageShell, {
  ToolHowTo,
  ToolRelated,
  toolMetadata,
} from '@/components/tool/shell';
import { getMessages, parseLocale } from '@/lib/i18n';

export const revalidate = 3600;

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  return toolMetadata(parseLocale(locale) ?? 'en', 'coordinate-converter');
}

export default async function CoordinateConverterPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw) ?? 'en';
  const t = getMessages(locale);

  return (
    <ToolPageShell locale={locale} slug="coordinate-converter">
      <div className="two-col" style={{ marginTop: 0 }}>
        <div className="info-panel">
          <CoordinateConverter t={t.tool.tools.coordinateConverter} />
        </div>
        <ToolHowTo tool={t.tool.tools.coordinateConverter} howTitle={t.tool.howTitle} />
      </div>

      <ToolRelated locale={locale} current="coordinate-converter" />
    </ToolPageShell>
  );
}

import type { Metadata } from 'next';
import DistanceCalculator from '@/components/tool/DistanceCalculator';
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
  return toolMetadata(parseLocale(locale) ?? 'en', 'distance-calculator');
}

export default async function DistanceCalculatorPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw) ?? 'en';
  const t = getMessages(locale);

  return (
    <ToolPageShell locale={locale} slug="distance-calculator">
      <div className="two-col" style={{ marginTop: 0 }}>
        <div className="info-panel">
          <DistanceCalculator t={t.tool.tools.distanceCalculator} />
        </div>
        <ToolHowTo tool={t.tool.tools.distanceCalculator} howTitle={t.tool.howTitle} />
      </div>

      <ToolRelated locale={locale} current="distance-calculator" />
    </ToolPageShell>
  );
}

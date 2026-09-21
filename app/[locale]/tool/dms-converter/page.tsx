import type { Metadata } from 'next';
import DmsConverterTool from '@/components/tool/DmsConverterTool';
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
  return toolMetadata(parseLocale(locale) ?? 'en', 'dms-converter');
}

export default async function DmsConverterPage({ params }: Props) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw) ?? 'en';
  const t = getMessages(locale);

  return (
    <ToolPageShell locale={locale} slug="dms-converter">
      <div className="two-col" style={{ marginTop: 0 }}>
        <div className="info-panel">
          <DmsConverterTool t={t.tool.tools.dmsConverter} />
        </div>
        <ToolHowTo tool={t.tool.tools.dmsConverter} howTitle={t.tool.howTitle} />
      </div>

      <ToolRelated locale={locale} current="dms-converter" />
    </ToolPageShell>
  );
}

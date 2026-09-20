import Markdown from '@/components/Markdown';
import { formatDate } from '@/lib/format';
import { getMessages } from '@/lib/i18n';
import type { Locale } from '@/lib/i18n/config';
import type { MarkdownDoc } from '@/lib/content';

/** Optional long-form guide from content/<locale>/airports/<IATA>.md */
export default function GuideSection({
  locale,
  guide,
}: {
  locale: Locale;
  guide: MarkdownDoc;
}) {
  const t = getMessages(locale);

  return (
    <section id="guide">
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{t.airport.guideKicker}</div>
          <h2 className="section-title">
            {guide.title ?? t.airport.guideTitle}
            <span className="en">{t.airport.guideEn}</span>
          </h2>
        </div>
        {guide.updated && (
          <span className="guide-meta">
            {t.common.updatedOn(formatDate(guide.updated, locale))}
          </span>
        )}
      </div>
      <div className="md-wrap">
        <Markdown>{guide.body}</Markdown>
      </div>
    </section>
  );
}

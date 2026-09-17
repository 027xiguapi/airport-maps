import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import ContentPage, { contentPageMetadata, type PageSlug } from '@/components/ContentPage';
import { parseLocale } from '@/lib/i18n';

export const revalidate = 3600;

const SLUG: PageSlug = 'privacy';

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = parseLocale((await params).locale);
  if (!locale) return {};
  return contentPageMetadata(locale, SLUG);
}

export default async function Page({ params }: Props) {
  const locale = parseLocale((await params).locale);
  if (!locale) notFound();
  return <ContentPage locale={locale} slug={SLUG} />;
}

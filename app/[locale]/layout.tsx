import type { Metadata, Viewport } from 'next';
import { notFound } from 'next/navigation';
import '../globals.css';
import BackToTop from '@/components/BackToTop';
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { getMessages, LOCALE_META, parseLocale, PUBLISHED_LOCALES } from '@/lib/i18n';
import { SITE_NAME, SITE_URL } from '@/lib/site';

/**
 * Pre-render published locales only; untranslated locales 404 (their URL
 * prefixes never reach the app — the proxy redirects them to the visitor's
 * best published language).
 */
export function generateStaticParams() {
  return PUBLISHED_LOCALES.map((locale) => ({ locale }));
}

type Props = { params: Promise<{ locale: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);
  if (!locale) return {};

  const t = getMessages(locale);
  const meta = LOCALE_META[locale];

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: `${t.site.name} — ${t.site.tagline}`,
      template: `%s | ${t.site.name}`,
    },
    description: t.site.description,
    applicationName: t.site.name,
    keywords: t.site.keywords,
    openGraph: {
      type: 'website',
      // Canonical brand spelling, identical in every locale, so og:site_name
      // always matches the title suffix and schema.org names exactly.
      siteName: SITE_NAME,
      locale: meta.ogLocale,
      title: `${t.site.name} — ${t.site.tagline}`,
      description: t.site.description,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${t.site.name} — ${t.site.tagline}`,
      description: t.site.description,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large', 'max-snippet': -1 },
    },
    formatDetection: { telephone: false },
  };
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0A2A43',
};

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  const locale = parseLocale(raw);
  if (!locale) notFound();

  const t = getMessages(locale);
  const meta = LOCALE_META[locale];

  // suppressHydrationWarning: the theme script mutates <html data-theme>
  // before React hydrates, which would otherwise trip a mismatch warning.
  return (
    <html lang={meta.htmlLang} dir={meta.dir} suppressHydrationWarning>
      <head>
        {/* Sets the theme before first paint so a dark preference never
            flashes the light theme. Mirrors ThemeToggle's storage keys. */}
        <script
          dangerouslySetInnerHTML={{
            __html: `try{var t=localStorage.getItem('theme');if(t!=='dark'&&t!=='light'){t=matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.dataset.theme=t}catch(e){}`,
          }}
        />
        <script
            async
            src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5878114055897626"
            crossOrigin="anonymous"
        ></script>
      </head>
      <body>
        {/* Fonts load from the CDN at runtime; the stacks in globals.css fall
            back to system faces when they are unavailable. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@300;400;500;700;900&family=Oswald:wght@400;500;600;700&display=swap"
        />
        <a className="sr-only" href="#view">
          {t.common.skipToContent}
        </a>
        <Header locale={locale} />
        <main id="view">{children}</main>
        <Footer locale={locale} />
        <BackToTop label={t.common.backToTop} />
      </body>
    </html>
  );
}

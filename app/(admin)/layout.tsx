import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import '../globals.css';

/**
 * Root layout for the administrator area (route group so it does not inherit
 * the localized public layout). The area is always Chinese-only and excluded
 * from indexing; it is an internal tool, not a translated page.
 */
export const metadata: Metadata = {
  title: '管理后台 · 全球机场地图',
  robots: { index: false, follow: false },
};

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="zh-hans" suppressHydrationWarning>
      <body className="bg-paper text-ink">{children}</body>
    </html>
  );
}

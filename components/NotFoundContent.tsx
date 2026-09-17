/**
 * 404 content.
 *
 * This is a *server* component with no dynamic APIs, and that is a hard
 * constraint rather than a preference. Next renders the not-found document
 * outside `app/[locale]/layout.tsx`, and in that document:
 *
 *   - the boundary receives no route params, so there is no locale;
 *   - reading it from a request header via `headers()` would opt the whole
 *     `/[locale]` segment into dynamic rendering, costing the static
 *     prerendering of every page;
 *   - client components do not render (anything using `usePathname` throws for
 *     want of a router context, and even `next/link` produces nothing), so this
 *     file uses plain <a> elements throughout.
 *
 * So the language cannot be known here, and the copy is deliberately bilingual
 * while every link is offered in both languages. Plain anchors also mean a
 * navigation away from a 404 is a normal full page load, which is fine here. The search form is a plain GET
 * form — no JavaScript, no client component — which posts to a real directory.
 */
const HOME = [
  { href: '/en', label: 'English home' },
  { href: '/zh', label: '中文首页' },
];
const DIRECTORIES = [
  { href: '/en/airports', label: 'All airports' },
  { href: '/zh/airports', label: '全部机场' },
  { href: '/en/countries', label: 'By country' },
  { href: '/zh/countries', label: '按国家浏览' },
];

export default function NotFoundContent() {
  return (
    <div className="page-head">
      <div className="page-head-inner">
        <nav className="crumb">
          <a href="/en">Home</a>
          <span className="sep">/</span>
          <span>404</span>
        </nav>
        <div className="country-hero">
          <div>
            <h1>404 · Page not found · 页面不存在</h1>
            <div className="sub">
              The page you requested may have been moved or removed. Try searching for an airport, or
              continue from the links below.
            </div>
            <div className="sub">
              您访问的页面可能已被移动或删除。试试搜索机场，或从下面的入口继续浏览。
            </div>

            <form action="/en/airports" method="get" role="search" style={{ marginTop: 22, maxWidth: 520 }}>
              <label className="sr-only" htmlFor="nf-q">
                Search airports / 搜索机场
              </label>
              <input
                id="nf-q"
                type="search"
                name="q"
                placeholder="Search airports, cities or IATA codes / 搜索机场、城市或 IATA 代码"
                style={{
                  width: '100%',
                  height: 56,
                  borderRadius: 28,
                  border: 'none',
                  outline: 'none',
                  background: '#fff',
                  color: 'var(--ink)',
                  fontSize: 15.5,
                  padding: '0 24px',
                  fontFamily: 'inherit',
                  boxShadow: 'var(--shadow-lg)',
                }}
              />
              <div className="filterbar" style={{ marginTop: 14, background: 'transparent', border: 'none', padding: 0 }}>
                <div className="group">
                  <button type="submit" className="chip on">
                    Search / 搜索
                  </button>
                </div>
              </div>
            </form>

            <div className="filterbar" style={{ marginTop: 10, background: 'transparent', border: 'none', padding: 0 }}>
              <div className="group">
                {DIRECTORIES.map((link) => (
                  <a className="chip" href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
                {HOME.map((link) => (
                  <a className="chip" href={link.href} key={link.href}>
                    {link.label}
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

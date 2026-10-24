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
 * So the language cannot be known here, and the copy is deliberately
 * multilingual while every link is offered in every published language. Plain
 * anchors also mean a
 * navigation away from a 404 is a normal full page load, which is fine here. The search form is a plain GET
 * form — no JavaScript, no client component — which posts to a real directory.
 */
const HOME = [
  { href: '/en', label: 'English home' },
  { href: '/de', label: 'Deutsche Startseite' },
  { href: '/fr', label: 'Accueil en français' },
  { href: '/it', label: 'Home in italiano' },
  { href: '/ko', label: '한국어 홈' },
  { href: '/zh', label: '中文首页' },
  { href: '/tw', label: '繁體中文首頁' },
];
const DIRECTORIES = [
  { href: '/en/airports', label: 'All airports' },
  { href: '/de/airports', label: 'Alle Flughäfen' },
  { href: '/fr/airports', label: 'Tous les aéroports' },
  { href: '/it/airports', label: 'Tutti gli aeroporti' },
  { href: '/ko/airports', label: '모든 공항' },
  { href: '/zh/airports', label: '全部机场' },
  { href: '/tw/airports', label: '全部機場' },
  { href: '/en/countries', label: 'By country' },
  { href: '/de/countries', label: 'Nach Land' },
  { href: '/fr/countries', label: 'Par pays' },
  { href: '/it/countries', label: 'Per paese' },
  { href: '/ko/countries', label: '국가별 보기' },
  { href: '/zh/countries', label: '按国家浏览' },
  { href: '/tw/countries', label: '按國家瀏覽' },
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
            <h1>404 · Page not found · Seite nicht gefunden · Page introuvable · Pagina non trovata · 페이지를 찾을 수 없음 · 页面不存在 · 頁面不存在</h1>
            <div className="sub">
              The page you requested may have been moved or removed. Try searching for an airport, or
              continue from the links below.
            </div>
            <div className="sub">
              Die angeforderte Seite wurde möglicherweise verschoben oder entfernt. Suchen Sie nach
              einem Flughafen oder nutzen Sie die Links unten.
            </div>
            <div className="sub">
              La page demandée a peut-être été déplacée ou supprimée. Essayez de rechercher un
              aéroport, ou continuez avec les liens ci-dessous.
            </div>
            <div className="sub">
              La pagina richiesta potrebbe essere stata spostata o rimossa. Prova a cercare un
              aeroporto, oppure continua con i link qui sotto.
            </div>
            <div className="sub">
              요청하신 페이지가 이동되었거나 삭제되었을 수 있습니다. 공항을 검색하거나 아래 링크에서
              계속하세요.
            </div>
            <div className="sub">
              您访问的页面可能已被移动或删除。试试搜索机场，或从下面的入口继续浏览。
            </div>
            <div className="sub">
              您造訪的頁面可能已被移動或刪除。請嘗試搜尋機場，或從下方入口繼續瀏覽。
            </div>

            <form action="/en/airports" method="get" role="search" style={{ marginTop: 22, maxWidth: 520 }}>
              <label className="sr-only" htmlFor="nf-q">
                Search airports / Flughäfen suchen / Rechercher un aéroport / Cerca un aeroporto / 공항 검색 / 搜索机场 / 搜尋機場
              </label>
              <input
                id="nf-q"
                type="search"
                name="q"
                placeholder="Search airports, cities or IATA codes / Flughäfen, Städte oder IATA-Codes suchen / Rechercher un aéroport, une ville ou un code IATA / Cerca un aeroporto, una città o un codice IATA / 공항, 도시 또는 IATA 코드 검색 / 搜索机场、城市或 IATA 代码 / 搜尋機場、城市或 IATA 代碼"
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
                    Search / Suchen / Rechercher / Cerca / 검색 / 搜索
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

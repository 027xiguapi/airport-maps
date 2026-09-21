import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Renders Markdown using react-markdown, which builds React elements rather
 * than injecting HTML — content can never introduce a script tag. GFM is
 * enabled for tables, strikethrough and autolinks.
 *
 * Typography comes from the `.md` rules in app/globals.css.
 */
export default function Markdown({
  children,
  className,
}: {
  children: string;
  className?: string;
}) {
  return (
    <div className={className ? `md ${className}` : 'md'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          // Wide tables (4-column terminal lists in English, for instance) exceed
          // the prose column; give them their own scroll container so they never
          // widen the page.
          table({ children, ...props }) {
            return (
              <div className="md-table-scroll">
                <table {...props}>{children}</table>
              </div>
            );
          },
          // Content links to site-relative paths are fine; external links open
          // safely and get rel=noopener.
          a({ href, children: linkChildren, ...props }) {
            const external = !!href && /^https?:\/\//i.test(href);
            return (
              <a
                href={href}
                {...props}
                {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
              >
                {linkChildren}
              </a>
            );
          },
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}

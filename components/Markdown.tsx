import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import type { ReactNode } from 'react';
import { createIdAllocator, plainHeadingText } from '@/lib/markdown-toc';

/** Plain text of rendered heading children (nested emphasis, links, code). */
function childText(node: ReactNode): string {
  if (node === null || node === undefined || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(childText).join('');
  if (typeof node === 'object' && 'props' in node) {
    return childText((node as { props: { children?: ReactNode } }).props.children);
  }
  return '';
}

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
  imageBase,
}: {
  children: string;
  className?: string;
  /**
   * URL prefix for the document's own relative image references
   * (`./images/0.webp` → `${imageBase}images/0.webp`). Blog articles ship
   * their images inside their `public/blog/<slug>/` directory and refer to
   * them relatively; guides and pages have no local images, so they omit this.
   */
  imageBase?: string;
}) {
  // Heading ids for the page rail. lib/markdown-toc.ts runs the same allocator
  // over the same plain text in the same document order, so the ids it lists
  // always match the ones rendered here.
  const nextId = createIdAllocator();
  const heading = (level: 2 | 3) =>
    function Heading({ children: headingChildren }: { children?: ReactNode }) {
      const id = nextId(plainHeadingText(childText(headingChildren)));
      return level === 2 ? (
        <h2 id={id} className="scroll-mt-[84px]">
          {headingChildren}
        </h2>
      ) : (
        <h3 id={id} className="scroll-mt-[84px]">
          {headingChildren}
        </h3>
      );
    };

  return (
    <div className={className ? `md ${className}` : 'md'}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h2: heading(2),
          h3: heading(3),
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
          img({ src, alt, title }) {
            // react-markdown types `src` as string | Blob (hast allows a Blob
            // payload); a Blob has no URL to rewrite, so it is passed through.
            const isUrl = typeof src === 'string';
            const relative = isUrl && !!imageBase && !/^([a-z][a-z0-9+.-]*:|\/)/i.test(src);
            return (
              <img
                src={relative ? `${imageBase}${src.replace(/^\.\//, '')}` : (src as string | undefined)}
                alt={alt ?? ''}
                title={title}
                // Articles carry dozens of images; only the ones scrolled to
                // should ever be fetched.
                loading="lazy"
                decoding="async"
              />
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

'use client';

import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { commentCountLabel } from '@/lib/comment-labels';
import type { Messages } from '@/lib/i18n/messages/zh';
import type { CommentKind, PublicComment } from '@/lib/comments';

type CommentLabels = Messages['comments'];

type Props = {
  pageKind: CommentKind;
  pageKey: string;
  /** Published site locale, sent to the API to select the thread. */
  locale: string;
  /** BCP 47 tag for date formatting (`zh-hans`, `zh-hant`, `en`, …). */
  lang: string;
  labels: CommentLabels;
  className?: string;
};

const MAX_AUTHOR = 40;
const MAX_BODY = 2000;
const MIN_BODY = 5;

type Notice = 'success' | 'error' | 'rate_limited' | 'invalid_name' | 'invalid_body' | null;

/**
 * Reader comments block, shared by every content page (airport, country, blog,
 * static Markdown pages). Comments load from /api/comments after mount, so the
 * surrounding page keeps its static/ISR rendering and each visitor always sees
 * the current thread rather than a cached snapshot.
 */
export default function Comments({ pageKind, pageKey, locale, lang, labels, className }: Props) {
  const uid = useId();
  const nameId = `${uid}-name`;
  const bodyId = `${uid}-body`;
  const statusId = `${uid}-status`;

  const [comments, setComments] = useState<PublicComment[] | null>(null);
  const [total, setTotal] = useState<number | null>(null);
  const [loadFailed, setLoadFailed] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);

  const [author, setAuthor] = useState('');
  const [body, setBody] = useState('');
  const [website, setWebsite] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<Notice>(null);
  const bodyRef = useRef<HTMLTextAreaElement>(null);

  // Remember the nickname on this device; it is the one field people retype.
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('comment-author');
      if (saved) setAuthor(saved.slice(0, MAX_AUTHOR));
    } catch {
      // Storage can be unavailable (private mode, blocked cookies) — ignore.
    }
  }, []);

  useEffect(() => {
    const controller = new AbortController();
    setLoadFailed(false);
    setComments(null);

    const params = new URLSearchParams({ kind: pageKind, key: pageKey, locale });
    fetch(`/api/comments?${params.toString()}`, {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as {
          comments?: PublicComment[];
          total?: number;
        };
        if (!Array.isArray(data.comments)) throw new Error('malformed response');
        setComments(data.comments);
        setTotal(typeof data.total === 'number' ? data.total : data.comments.length);
      })
      .catch((error: unknown) => {
        if ((error as Error).name === 'AbortError') return;
        setLoadFailed(true);
      });

    return () => controller.abort();
  }, [pageKind, pageKey, locale, reloadToken]);

  const noticeText = notice
    ? {
        success: labels.success,
        error: labels.error,
        rate_limited: labels.rateLimited,
        invalid_name: labels.nameError,
        invalid_body: labels.bodyError,
      }[notice]
    : '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    const cleanAuthor = author.trim();
    const cleanBody = body.trim();
    if (cleanAuthor.length < 2 || cleanAuthor.length > MAX_AUTHOR) {
      setNotice('invalid_name');
      return;
    }
    const bodyLength = [...cleanBody].length;
    if (bodyLength < MIN_BODY || bodyLength > MAX_BODY) {
      setNotice('invalid_body');
      return;
    }

    setSubmitting(true);
    setNotice(null);
    try {
      const response = await fetch('/api/comments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({
          kind: pageKind,
          key: pageKey,
          locale,
          author: cleanAuthor,
          body: cleanBody,
          website,
        }),
      });
      const data = (await response.json().catch(() => ({}))) as {
        comment?: PublicComment | null;
        error?: string;
      };

      if (response.status === 429) {
        setNotice('rate_limited');
        return;
      }
      if (!response.ok) {
        setNotice(
          data.error === 'invalid_name'
            ? 'invalid_name'
            : data.error === 'invalid_body'
              ? 'invalid_body'
              : 'error'
        );
        return;
      }

      const created = data.comment;
      if (created) {
        const isNew = !(comments ?? []).some((item) => item.id === created.id);
        if (isNew) setTotal((value) => (value ?? 0) + 1);
        setComments((current) =>
          current?.some((item) => item.id === created.id) ? current : [...(current ?? []), created]
        );
      }
      setBody('');
      setNotice('success');
      try {
        window.localStorage.setItem('comment-author', cleanAuthor);
      } catch {
        // Ignore storage failures.
      }
      bodyRef.current?.focus();
    } catch {
      setNotice('error');
    } finally {
      setSubmitting(false);
    }
  }

  // Newest first: the form sits above the list, so a just-posted comment lands
  // directly under it instead of at the bottom of a long thread.
  const ordered = comments ? [...comments].reverse() : null;

  return (
    <section
      id="comments"
      className={['mt-12 scroll-mt-24', className].filter(Boolean).join(' ')}
      aria-labelledby={`${uid}-title`}
    >
      <div className="section-head" style={{ marginBottom: 18 }}>
        <div>
          <div className="section-kicker">{labels.kicker}</div>
          <h2 className="section-title" id={`${uid}-title`}>
            {labels.title}
            <span className="en">{labels.en}</span>
          </h2>
        </div>
        {total !== null && total > 0 && (
          <span className="text-[13px] text-ink-soft">{commentCountLabel(labels, total)}</span>
        )}
      </div>

      <p className="mb-5 max-w-[760px] text-[13.5px] leading-[1.8] text-ink-soft">{labels.sub}</p>

      <form
        className="relative rounded-[14px] border border-line bg-card p-5 [box-shadow:var(--shadow-sm)]"
        onSubmit={handleSubmit}
        noValidate
      >
        <h3 className="font-display text-[16px] font-bold text-ink-heading">{labels.formTitle}</h3>
        <p className="mt-1 text-[12.5px] leading-[1.7] text-ink-soft">{labels.note}</p>

        <div className="mt-4">
          <label
            className="mb-1.5 block font-display text-[11.5px] uppercase tracking-[0.14em] text-ink-faint"
            htmlFor={nameId}
          >
            {labels.nameLabel}
          </label>
          <Input
            id={nameId}
            name="author"
            className="h-[40px] max-w-[360px]"
            value={author}
            onChange={(event) => {
              setAuthor(event.target.value);
              if (notice === 'invalid_name') setNotice(null);
            }}
            placeholder={labels.namePlaceholder}
            maxLength={MAX_AUTHOR}
            autoComplete="nickname"
            aria-invalid={notice === 'invalid_name' || undefined}
            aria-describedby={notice === 'invalid_name' ? statusId : undefined}
          />
        </div>

        <div className="mt-3">
          <label
            className="mb-1.5 block font-display text-[11.5px] uppercase tracking-[0.14em] text-ink-faint"
            htmlFor={bodyId}
          >
            {labels.bodyLabel}
          </label>
          <textarea
            id={bodyId}
            name="body"
            ref={bodyRef}
            className="block w-full resize-y rounded-[10px] border border-input bg-card px-4 py-3 text-[14px] leading-[1.75] text-ink outline-none transition-[border-color,box-shadow] duration-150 selection:bg-primary selection:text-primary-foreground placeholder:text-ink-faint focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 aria-invalid:border-destructive"
            rows={5}
            value={body}
            onChange={(event) => {
              setBody(event.target.value);
              if (notice === 'invalid_body') setNotice(null);
            }}
            placeholder={labels.bodyPlaceholder}
            maxLength={MAX_BODY}
            aria-invalid={notice === 'invalid_body' || undefined}
            aria-describedby={notice === 'invalid_body' ? statusId : undefined}
          />
          <div className="mt-1 flex items-center justify-end text-[11.5px] text-ink-faint">
            <span>
              {body.length}/{MAX_BODY}
            </span>
          </div>
        </div>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={submitting}>
            {submitting ? labels.submitting : labels.submit}
          </Button>
          <p
            id={statusId}
            className={`m-0 text-[12.5px] ${
              notice === 'success' ? 'text-sky-600' : 'text-destructive'
            }`}
            role="status"
            aria-live="polite"
          >
            {noticeText}
          </p>
        </div>

        {/* Honeypot: off-screen rather than display:none, and never focusable. */}
        <div className="absolute -left-[9999px] top-0 h-0 w-0 overflow-hidden" aria-hidden="true">
          <label htmlFor={`${uid}-website`}>Website</label>
          <input
            id={`${uid}-website`}
            name="website"
            type="text"
            tabIndex={-1}
            autoComplete="off"
            value={website}
            onChange={(event) => setWebsite(event.target.value)}
          />
        </div>
      </form>

      {loadFailed ? (
        <div className="mt-5 rounded-[12px] border border-dashed border-line bg-card px-5 py-6 text-center">
          <p className="m-0 text-[13.5px] text-ink-soft">{labels.loadError}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3"
            onClick={() => setReloadToken((value) => value + 1)}
          >
            {labels.retry}
          </Button>
        </div>
      ) : ordered === null ? (
        <p className="mt-5 text-[13px] text-ink-faint" role="status">
          {labels.loading}
        </p>
      ) : ordered.length === 0 ? (
        <p className="mt-5 rounded-[12px] border border-dashed border-line bg-card px-5 py-6 text-center text-[13.5px] text-ink-soft">
          {labels.empty}
        </p>
      ) : (
        <ol className="m-0 mt-5 list-none space-y-3 p-0">
          {ordered.map((comment) => {
            const initial = [...comment.author][0]?.toUpperCase() ?? '?';
            return (
              <li
                key={comment.id}
                className="rounded-[12px] border border-line bg-card px-5 py-4 [box-shadow:var(--shadow-sm)]"
              >
                <div className="flex items-center gap-3">
                  <span
                    className="flex h-9 w-9 flex-none items-center justify-center rounded-full bg-sky-100 font-display text-[15px] font-bold text-sky-600"
                    aria-hidden="true"
                  >
                    {initial}
                  </span>
                  <div className="min-w-0">
                    <b className="block truncate text-[14px] text-ink-heading">{comment.author}</b>
                    <time
                      className="text-[11.5px] text-ink-faint"
                      dateTime={comment.createdAt}
                    >
                      {formatCommentDate(comment.createdAt, lang)}
                    </time>
                  </div>
                </div>
                <p className="mt-3 whitespace-pre-wrap break-words text-[14px] leading-[1.8] text-ink">
                  {comment.body}
                </p>
              </li>
            );
          })}
        </ol>
      )}
    </section>
  );
}

/** Server and browser must agree, so the tag is fixed by the passed locale. */
function formatCommentDate(value: string, lang: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  try {
    return new Intl.DateTimeFormat(lang, { dateStyle: 'medium', timeStyle: 'short' }).format(date);
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

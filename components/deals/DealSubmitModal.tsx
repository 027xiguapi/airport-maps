'use client';

import { useEffect, useId, useRef, useState } from 'react';
import DealSubmitForm from '@/components/deals/DealSubmitForm';
import { getAuthMessages, type DealsMessages } from '@/lib/i18n/deals';
import { localizedPath, type Locale } from '@/lib/i18n/config';
import { ArrowIcon } from '@/lib/icons';

type Props = {
  locale: string;
  lang: string;
  labels: DealsMessages;
  /** Optional trigger styling; defaults to the amber primary button. */
  className?: string;
};

type SessionState = 'loading' | 'signed-in' | 'signed-out';

const DEFAULT_TRIGGER =
  'inline-flex items-center gap-1.5 bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] duration-150 hover:brightness-[1.06]';

/**
 * "Post a deal" dialog.
 *
 * The submission form itself is unchanged; this wrapper only adds a dialog
 * shell and the signed-in check. Anonymous visitors get the login prompt
 * instead of a form that would fail with 401 on submit.
 */
export default function DealSubmitModal({ locale, lang, labels, className }: Props) {
  const [open, setOpen] = useState(false);
  const [session, setSession] = useState<SessionState>('loading');
  const titleId = useId();
  const closeRef = useRef<HTMLButtonElement>(null);

  const language = locale as Locale;
  const dealsPath = localizedPath(language, '/deals');
  const signInHref = `${localizedPath(language, '/login')}?next=${encodeURIComponent(dealsPath)}`;
  const authLabels = getAuthMessages(language);

  useEffect(() => {
    if (!open) return;
    const controller = new AbortController();
    setSession('loading');
    fetch('/api/auth/session', {
      signal: controller.signal,
      cache: 'no-store',
      headers: { Accept: 'application/json' },
    })
      .then(async (response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const data = (await response.json()) as { user?: { id?: string | number } | null } | null;
        setSession(data?.user?.id ? 'signed-in' : 'signed-out');
      })
      .catch((error: unknown) => {
        if ((error as Error).name !== 'AbortError') setSession('signed-out');
      });
    return () => controller.abort();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false);
    };
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [open]);

  return (
    <>
      <button
        type="button"
        className={className ?? DEFAULT_TRIGGER}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
      >
        {labels.submit}
        <ArrowIcon />
      </button>

      {open && (
        <div
          className="fixed inset-0 z-[250] flex items-start justify-center overflow-y-auto bg-navy-950/60 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setOpen(false);
          }}
        >
          <div
            className="my-6 w-full max-w-[860px] border border-line bg-card p-5 [box-shadow:var(--shadow-lg)]"
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id={titleId}
                  className="font-display text-[18px] font-bold text-ink-heading"
                >
                  {labels.submitTitle}
                </h2>
                <p className="mt-1 max-w-[680px] text-[12.5px] leading-[1.7] text-ink-soft">
                  {labels.submitSub}
                </p>
              </div>
              <button
                ref={closeRef}
                type="button"
                className="flex h-8 w-8 flex-none items-center justify-center border border-line text-[18px] leading-none text-ink-soft transition-colors hover:border-ink-faint hover:text-ink"
                onClick={() => setOpen(false)}
                aria-label={labels.close}
                title={labels.close}
              >
                ×
              </button>
            </div>

            <div className="mt-4">
              {session === 'loading' ? (
                <div className="border border-dashed border-line bg-paper px-5 py-8 text-center text-[13px] text-ink-soft">
                  …
                </div>
              ) : session === 'signed-out' ? (
                <div className="border border-dashed border-line bg-paper px-5 py-6">
                  <h3 className="font-display text-[16px] font-bold text-ink-heading">
                    {authLabels.signInTitle}
                  </h3>
                  <p className="mt-1.5 max-w-[560px] text-[13px] leading-[1.75] text-ink-soft">
                    {authLabels.signInSub}
                  </p>
                  <a
                    className="mt-4 inline-flex items-center gap-2 border border-amber bg-amber px-4 py-2.5 text-[13.5px] font-bold text-navy-900 transition-[filter] duration-150 hover:brightness-[1.06]"
                    href={signInHref}
                  >
                    {authLabels.signInWithGoogle}
                  </a>
                </div>
              ) : (
                <DealSubmitForm
                  locale={locale}
                  lang={lang}
                  labels={labels}
                  authLabels={authLabels}
                  signInHref={signInHref}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}

'use client';

import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { localizedPath, type Locale } from '@/lib/i18n/config';

type Props = {
  locale: string;
  label: string;
  pendingLabel: string;
  /** Where to land after the session is cleared. */
  redirectTo?: string;
};

/** Explicit sign-out button for the login page (the header chip has its own). */
export default function LogoutButton({
  locale,
  label,
  pendingLabel,
  redirectTo = '/',
}: Props) {
  const router = useRouter();
  const [pending, setPending] = useState(false);

  const onClick = async () => {
    if (pending) return;
    setPending(true);
    try {
      await signOut({ redirect: false });
      router.push(localizedPath(locale as Locale, redirectTo));
      router.refresh();
    } catch {
      setPending(false);
    }
  };

  return (
    <Button type="button" variant="outline" onClick={onClick} disabled={pending}>
      {pending ? pendingLabel : label}
    </Button>
  );
}

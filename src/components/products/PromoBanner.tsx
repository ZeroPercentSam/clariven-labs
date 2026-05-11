'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Tag, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';

type Validated = { code: string; discountPct: number } | null;

function readRefCookie(): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(/(?:^|;\s*)cl_ref=([^;]+)/);
  if (!match) return null;
  try {
    return decodeURIComponent(match[1]);
  } catch {
    return null;
  }
}

function dismissed(): boolean {
  if (typeof sessionStorage === 'undefined') return false;
  try {
    return sessionStorage.getItem('cl_ref_banner_dismissed') === '1';
  } catch {
    return false;
  }
}

export function PromoBanner() {
  const [validated, setValidated] = useState<Validated>(null);
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    if (dismissed()) {
      setHidden(true);
      return;
    }
    const cookie = readRefCookie();
    if (!cookie) return;
    let cancelled = false;
    (async () => {
      try {
        const supabase = createClient();
        const { data } = await supabase.rpc('validate_affiliate_code', { p_code: cookie });
        if (cancelled) return;
        const row = data?.[0];
        if (row?.valid) {
          setValidated({ code: cookie.toUpperCase(), discountPct: Number(row.discount_pct) });
        }
      } catch {
        /* ignore */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (hidden || !validated) return null;

  return (
    <div className="bg-cl-teal text-white">
      <div className="max-w-7xl mx-auto px-6 py-2 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2 min-w-0">
          <Tag className="w-4 h-4 shrink-0" />
          <p className="text-sm truncate">
            Code{' '}
            <span className="font-mono font-semibold tracking-wider">
              {validated.code}
            </span>{' '}
            applied — <span className="font-semibold">{validated.discountPct}% off</span> at
            checkout.
          </p>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <Link
            href="/cart"
            className="hidden sm:inline text-xs font-semibold uppercase tracking-wider underline hover:no-underline"
          >
            View cart
          </Link>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => {
              try {
                sessionStorage.setItem('cl_ref_banner_dismissed', '1');
              } catch {
                /* no-op */
              }
              setHidden(true);
            }}
            className="text-white/80 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

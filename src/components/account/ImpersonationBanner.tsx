'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { endImpersonation } from '@/lib/impersonation/actions';

type Ctx = {
  session_id: string;
  impersonated_user_id: string;
  email: string | null;
  full_name: string | null;
  expires_at: string;
  started_at: string;
};

function remaining(expiresAt: string): string {
  const ms = new Date(expiresAt).getTime() - Date.now();
  if (ms <= 0) return 'expired';
  const m = Math.floor(ms / 60000);
  const s = Math.floor((ms % 60000) / 1000);
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Global impersonation banner. A client island (so the root layout stays static
// — no cookie read) that fetches the active session on mount + every navigation.
// Renders a bold amber strip with a live countdown + End session while a session
// is active; nothing otherwise.
export function ImpersonationBanner() {
  const pathname = usePathname();
  const router = useRouter();
  const [ctx, setCtx] = useState<Ctx | null>(null);
  const [ending, setEnding] = useState(false);
  const [, setTick] = useState(0);

  async function handleEnd() {
    setEnding(true);
    try {
      await endImpersonation();
      setCtx(null); // optimistic hide; refresh restores the admin view server-side
      router.refresh();
    } catch {
      setEnding(false);
    }
  }

  useEffect(() => {
    let alive = true;
    fetch('/api/impersonation/context', { cache: 'no-store' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (alive) setCtx(d);
      })
      .catch(() => {});
    return () => {
      alive = false;
    };
  }, [pathname]);

  // Tick once a second so the countdown re-renders while a session is active.
  useEffect(() => {
    if (!ctx) return;
    const id = setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, [ctx]);

  if (!ctx) return null;

  const who = ctx.full_name || ctx.email || ctx.impersonated_user_id.slice(0, 8);
  return (
    // Fixed to the bottom so a fixed site header can never cover the End button.
    <div
      className="fixed bottom-0 inset-x-0 z-[100] bg-amber-500 text-amber-950 shadow-[0_-2px_8px_rgba(0,0,0,0.12)]"
      data-testid="impersonation-banner"
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 px-4 py-2 text-sm">
        <span>
          Impersonating <strong>{who}</strong>
          {ctx.email ? ` · ${ctx.email}` : ''} · session ends in{' '}
          <span className="font-mono font-semibold">{remaining(ctx.expires_at)}</span>
        </span>
        <button
          type="button"
          onClick={handleEnd}
          disabled={ending}
          className="px-3 py-1 rounded-md bg-amber-950 text-amber-50 text-xs font-semibold hover:bg-amber-900 disabled:opacity-60"
        >
          {ending ? 'Ending…' : 'End session'}
        </button>
      </div>
    </div>
  );
}

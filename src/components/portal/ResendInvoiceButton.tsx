'use client';

import { useState } from 'react';
import { Mail } from 'lucide-react';

export function ResendInvoiceButton({ orderId }: { orderId: string }) {
  const [state, setState] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setState('sending');
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/resend-invoice`, { method: 'POST' });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setState('sent');
      setTimeout(() => setState('idle'), 4000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed');
      setState('error');
    }
  }

  return (
    <div>
      <button
        type="button"
        onClick={resend}
        disabled={state === 'sending'}
        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-cl-teal text-white text-xs font-semibold hover:bg-cl-teal-light transition disabled:opacity-50"
      >
        <Mail className="w-3.5 h-3.5" />
        {state === 'sending' ? 'Sending…' : state === 'sent' ? 'Sent!' : 'Resend payment email'}
      </button>
      {error ? <p className="text-[11px] text-red-500 mt-2">{error}</p> : null}
    </div>
  );
}

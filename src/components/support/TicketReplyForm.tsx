'use client';

import { useRef, useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';
import { replyToTicket } from '@/lib/support/actions';

export function TicketReplyForm({
  ticketId,
  canMarkInternal = false,
  reopensOnReply = false,
}: {
  ticketId: string;
  canMarkInternal?: boolean;
  reopensOnReply?: boolean;
}) {
  const router = useRouter();
  const formRef = useRef<HTMLFormElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    startTransition(async () => {
      const res = await replyToTicket(ticketId, formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      formRef.current?.reset();
      router.refresh();
    });
  }

  return (
    <form
      ref={formRef}
      action={onSubmit}
      className="bg-white border border-cl-gray-200 rounded-xl p-4 space-y-3"
    >
      <textarea
        name="body"
        required
        rows={4}
        maxLength={4000}
        placeholder={canMarkInternal ? 'Reply to the customer…' : 'Add a reply…'}
        className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy focus:outline-none focus:border-cl-teal/60"
      />
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          {canMarkInternal ? (
            <label className="inline-flex items-center gap-1.5 text-xs text-cl-gray-600">
              <input type="checkbox" name="is_internal" value="on" className="rounded border-cl-gray-300" />
              Internal note (staff only)
            </label>
          ) : null}
          {reopensOnReply ? (
            <span className="text-[11px] text-amber-600">Replying will reopen this ticket.</span>
          ) : null}
        </div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light disabled:opacity-50"
        >
          <Send className="w-4 h-4" />
          {pending ? 'Sending…' : 'Send reply'}
        </button>
      </div>
      {error ? <p className="text-xs text-red-500">{error}</p> : null}
    </form>
  );
}

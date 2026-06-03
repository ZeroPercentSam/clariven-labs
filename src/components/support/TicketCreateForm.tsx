'use client';

import { useState, useTransition } from 'react';
import { createRepTicket, createTicket } from '@/lib/support/actions';
import { TICKET_CATEGORIES, ticketCategoryLabel } from '@/lib/support/constants';

export function TicketCreateForm({
  linkableOrders = [],
  defaultOrderId,
  repMode = false,
}: {
  linkableOrders?: Array<{ id: string; orderNumber: number }>;
  defaultOrderId?: string;
  repMode?: boolean;
}) {
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [pending, startTransition] = useTransition();

  function onSubmit(formData: FormData) {
    setError(null);
    setFieldErrors({});
    startTransition(async () => {
      // create{Rep}Ticket redirects on success; only an error result returns here.
      const res = await (repMode ? createRepTicket(formData) : createTicket(formData));
      if (res && !res.ok) {
        setError(res.error);
        setFieldErrors(res.fieldErrors ?? {});
      }
    });
  }

  return (
    <form action={onSubmit} className="bg-white border border-cl-gray-200 rounded-xl p-5 space-y-4">
      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          Subject
        </span>
        <input
          name="subject"
          type="text"
          required
          maxLength={200}
          placeholder="Short summary of your request"
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy focus:outline-none focus:border-cl-teal/60"
        />
        {fieldErrors.subject ? <p className="text-[11px] text-red-500 mt-1">{fieldErrors.subject[0]}</p> : null}
      </label>

      <div className="grid sm:grid-cols-2 gap-4">
        <label className="block">
          <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
            Category
          </span>
          <select
            name="category"
            defaultValue="general"
            className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy"
          >
            {TICKET_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {ticketCategoryLabel(c)}
              </option>
            ))}
          </select>
        </label>

        {!repMode ? (
          <label className="block">
            <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
              Link an order (optional)
            </span>
            <select
              name="order_id"
              defaultValue={defaultOrderId ?? ''}
              className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy"
            >
              <option value="">— None —</option>
              {linkableOrders.map((o) => (
                <option key={o.id} value={o.id}>
                  Order #{o.orderNumber}
                </option>
              ))}
            </select>
          </label>
        ) : null}
      </div>

      <label className="block">
        <span className="block text-[11px] font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
          How can we help?
        </span>
        <textarea
          name="body"
          required
          rows={6}
          maxLength={4000}
          placeholder="Describe your question or issue in detail…"
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm bg-white text-cl-navy focus:outline-none focus:border-cl-teal/60"
        />
        {fieldErrors.body ? <p className="text-[11px] text-red-500 mt-1">{fieldErrors.body[0]}</p> : null}
      </label>

      {error ? <p className="text-xs text-red-500">{error}</p> : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light disabled:opacity-50"
      >
        {pending ? 'Submitting…' : 'Open ticket'}
      </button>
    </form>
  );
}

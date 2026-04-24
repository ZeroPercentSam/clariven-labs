'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Send } from 'lucide-react';

export type Message = {
  id: string;
  author_role: string;
  body: string;
  created_at: string;
};

export function MessageThread({
  orderId,
  initial,
  currentRole,
}: {
  orderId: string;
  initial: Message[];
  currentRole: 'customer' | 'admin';
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>(initial);
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function send() {
    const text = body.trim();
    if (!text) return;
    setSending(true);
    setError(null);
    try {
      const res = await fetch(`/api/orders/${orderId}/messages`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ body: text }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error ?? `HTTP ${res.status}`);
      setMessages((prev) => [...prev, json.message]);
      setBody('');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send');
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-cl-gray-200">
        <h3 className="text-cl-navy text-sm font-semibold">
          {currentRole === 'admin' ? 'Customer conversation' : 'Messages from our team'}
        </h3>
      </div>
      <ul className="divide-y divide-cl-gray-100 max-h-80 overflow-y-auto">
        {messages.length === 0 ? (
          <li className="px-4 py-6 text-sm text-cl-gray-500 text-center">No messages yet.</li>
        ) : (
          messages.map((m) => {
            const self = m.author_role === currentRole;
            return (
              <li key={m.id} className={`px-4 py-3 ${self ? 'bg-white' : 'bg-cl-gray-50'}`}>
                <div className="flex items-center gap-2 text-[11px] text-cl-gray-500 mb-1 uppercase tracking-wider">
                  <span>{m.author_role === 'admin' ? 'Clariven team' : 'You'}</span>
                  <span>·</span>
                  <span>{new Date(m.created_at).toLocaleString()}</span>
                </div>
                <p className="text-sm text-cl-navy whitespace-pre-wrap">{m.body}</p>
              </li>
            );
          })
        )}
      </ul>
      <div className="p-3 border-t border-cl-gray-200">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder={
            currentRole === 'admin'
              ? 'Post guidance or a status update for the customer…'
              : 'Ask a question about this order…'
          }
          rows={3}
          maxLength={5000}
          className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
        />
        <div className="flex items-center justify-between mt-2">
          <p className="text-[11px] text-red-500">{error ?? ''}</p>
          <button
            type="button"
            onClick={send}
            disabled={sending || body.trim().length === 0}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light disabled:opacity-50"
          >
            <Send className="w-4 h-4" />
            {sending ? 'Sending…' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

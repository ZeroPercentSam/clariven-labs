'use client';

import { useRef, useState, useTransition, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { Upload, Trash2, FileText, ExternalLink, EyeOff } from 'lucide-react';
import { uploadResource, deleteResource } from '@/lib/resources/actions';
import type { ClientResourceView } from '@/lib/resources/queries';

const CATEGORIES = [
  { value: 'starter-kit', label: 'Starter Kit' },
  { value: 'guide', label: 'Guide' },
  { value: 'protocol', label: 'Protocol' },
  { value: 'reference', label: 'Reference' },
  { value: 'document', label: 'Document' },
];

function prettyBytes(n: number | null): string {
  if (!n) return '';
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export function ResourceManager({ initial }: { initial: ClientResourceView[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const formRef = useRef<HTMLFormElement>(null);

  function handleUpload(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setMsg(null);
    startTransition(async () => {
      const res = await uploadResource(fd);
      if (res.ok) {
        setMsg({ ok: true, text: 'Uploaded.' });
        formRef.current?.reset();
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  function handleDelete(id: string) {
    setMsg(null);
    startTransition(async () => {
      const res = await deleteResource(id);
      if (res.ok) {
        setMsg({ ok: true, text: 'Deleted.' });
        router.refresh();
      } else {
        setMsg({ ok: false, text: res.error });
      }
    });
  }

  return (
    <div className="space-y-6">
      <form
        ref={formRef}
        onSubmit={handleUpload}
        className="bg-white border border-cl-gray-200 rounded-xl p-5 space-y-4"
      >
        <div className="grid sm:grid-cols-2 gap-4">
          <label className="block">
            <span className="text-xs font-medium text-cl-gray-500">Title</span>
            <input
              name="title"
              required
              maxLength={200}
              placeholder="RUO Client Starter Kit"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
            />
          </label>
          <label className="block">
            <span className="text-xs font-medium text-cl-gray-500">Category</span>
            <select
              name="category"
              defaultValue="document"
              className="mt-1 w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
            >
              {CATEGORIES.map((c) => (
                <option key={c.value} value={c.value}>
                  {c.label}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label className="block">
          <span className="text-xs font-medium text-cl-gray-500">Description (optional)</span>
          <input
            name="description"
            maxLength={1000}
            placeholder="Short summary shown to customers"
            className="mt-1 w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
          />
        </label>
        <div className="flex flex-wrap items-end gap-4">
          <label className="block">
            <span className="text-xs font-medium text-cl-gray-500">Sort order</span>
            <input
              name="sort_order"
              type="number"
              defaultValue={0}
              className="mt-1 w-24 px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
            />
          </label>
          <label className="block flex-1 min-w-[200px]">
            <span className="text-xs font-medium text-cl-gray-500">PDF file (max 20 MB)</span>
            <input
              name="file"
              type="file"
              accept="application/pdf"
              required
              className="mt-1 w-full text-sm text-cl-gray-600 file:mr-3 file:py-2 file:px-3 file:rounded-lg file:border-0 file:bg-cl-teal/10 file:text-cl-teal file:text-sm file:font-medium"
            />
          </label>
          <button
            type="submit"
            disabled={pending}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-cl-teal text-white text-sm font-medium hover:bg-cl-teal-light disabled:opacity-50"
          >
            <Upload className="w-4 h-4" />
            {pending ? 'Uploading…' : 'Upload'}
          </button>
        </div>
        {msg ? (
          <p className={`text-sm ${msg.ok ? 'text-cl-teal' : 'text-red-500'}`}>{msg.text}</p>
        ) : null}
        <p className="text-xs text-cl-gray-400">
          Client-facing onboarding docs only. Never upload cost / margin sheets here — those live on
          the admin Sales Sheet and must never reach a customer.
        </p>
      </form>

      <div className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-cl-gray-200 bg-cl-gray-50 text-sm font-semibold text-cl-navy">
          Published resources ({initial.length})
        </div>
        {initial.length === 0 ? (
          <p className="px-5 py-8 text-sm text-cl-gray-500 text-center">No resources yet.</p>
        ) : (
          <ul className="divide-y divide-cl-gray-100">
            {initial.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <FileText className="w-4 h-4 text-cl-teal shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-cl-navy truncate">{r.title}</span>
                    <span className="text-[10px] uppercase tracking-wider text-cl-gray-400 border border-cl-gray-200 rounded px-1.5 py-0.5">
                      {r.category}
                    </span>
                    {!r.active ? (
                      <span className="inline-flex items-center gap-1 text-[10px] text-cl-gray-400">
                        <EyeOff className="w-3 h-3" /> hidden
                      </span>
                    ) : null}
                  </div>
                  <div className="text-xs text-cl-gray-400 truncate">
                    {r.fileName} {r.fileBytes ? `· ${prettyBytes(r.fileBytes)}` : ''}
                  </div>
                </div>
                {r.signedUrl ? (
                  <a
                    href={r.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-cl-teal hover:text-cl-teal-light"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    View
                  </a>
                ) : null}
                <button
                  type="button"
                  onClick={() => handleDelete(r.id)}
                  disabled={pending}
                  className="inline-flex items-center gap-1 text-xs text-cl-gray-400 hover:text-red-500 disabled:opacity-50"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Delete
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

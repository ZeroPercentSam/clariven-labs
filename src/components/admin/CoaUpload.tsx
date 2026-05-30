'use client';

import { useRef, useState, useTransition } from 'react';
import { Upload, FileText, Trash2, ExternalLink, Check } from 'lucide-react';
import { uploadCoa, deleteCoa } from '@/lib/coas/actions';
import { formatDate } from '@/lib/format-datetime';

type Props = {
  productSlug: string;
  productName: string;
  currentCoa: {
    id: string;
    file_name: string | null;
    file_bytes: number | null;
    updated_at: string;
    publicUrl: string;
  } | null;
};

export function CoaUpload({ productSlug, productName, currentCoa }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [justUploaded, setJustUploaded] = useState(false);
  const [justDeleted, setJustDeleted] = useState(false);

  const handleUpload = (file: File) => {
    setError(null);
    setJustUploaded(false);
    const formData = new FormData();
    formData.set('product_slug', productSlug);
    formData.set('strength_label', '');
    formData.set('file', file);

    startTransition(async () => {
      const res = await uploadCoa(formData);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setJustUploaded(true);
      if (inputRef.current) inputRef.current.value = '';
    });
  };

  const handleDelete = () => {
    if (!currentCoa) return;
    if (!confirm(`Delete COA for ${productName}? Customers won't see a download link until a new one is uploaded.`)) {
      return;
    }
    setError(null);
    startTransition(async () => {
      const res = await deleteCoa(currentCoa.id);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setJustDeleted(true);
    });
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleUpload(f);
  };

  return (
    <div className="bg-white border border-cl-gray-200 rounded-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="min-w-0">
          <h3 className="text-cl-navy font-medium text-sm truncate">{productName}</h3>
          <p className="text-cl-gray-400 text-xs">{productSlug}</p>
        </div>
        {currentCoa ? (
          <span className="inline-flex items-center gap-1 text-emerald-600 text-[10px] uppercase tracking-wider font-semibold shrink-0">
            <Check className="w-3 h-3" /> Active
          </span>
        ) : (
          <span className="text-cl-gray-400 text-[10px] uppercase tracking-wider font-semibold shrink-0">
            Not set
          </span>
        )}
      </div>

      {currentCoa ? (
        <div className="flex items-center gap-3 mb-3 p-2.5 rounded-lg bg-cl-gray-50 border border-cl-gray-100">
          <FileText className="w-4 h-4 text-cl-teal shrink-0" />
          <div className="min-w-0 flex-1">
            <p className="text-xs text-cl-navy truncate">
              {currentCoa.file_name ?? 'COA.pdf'}
            </p>
            <p className="text-[10px] text-cl-gray-400">
              {currentCoa.file_bytes != null
                ? `${(currentCoa.file_bytes / 1024).toFixed(0)} KB`
                : ''}{' '}
              · uploaded {formatDate(currentCoa.updated_at)}
            </p>
          </div>
          <a
            href={currentCoa.publicUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-cl-gray-500 hover:text-cl-teal p-1"
            aria-label="Open COA"
          >
            <ExternalLink className="w-4 h-4" />
          </a>
          <button
            type="button"
            onClick={handleDelete}
            disabled={pending}
            aria-label="Delete COA"
            className="text-cl-gray-400 hover:text-red-500 p-1 disabled:opacity-40"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      ) : null}

      <label className="block">
        <input
          ref={inputRef}
          type="file"
          accept="application/pdf"
          onChange={onFileChange}
          disabled={pending}
          className="hidden"
        />
        <span
          className={`inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-sm font-medium cursor-pointer w-full transition ${
            pending
              ? 'bg-cl-gray-100 text-cl-gray-400'
              : 'bg-cl-navy text-white hover:bg-cl-navy/90'
          }`}
        >
          <Upload className="w-4 h-4" />
          {pending ? 'Uploading…' : currentCoa ? 'Replace COA' : 'Upload COA (PDF)'}
        </span>
      </label>

      {error ? (
        <p className="mt-2 text-xs text-red-500">{error}</p>
      ) : justUploaded ? (
        <p className="mt-2 text-xs text-emerald-600">Uploaded.</p>
      ) : justDeleted ? (
        <p className="mt-2 text-xs text-cl-gray-500">Deleted.</p>
      ) : null}
    </div>
  );
}

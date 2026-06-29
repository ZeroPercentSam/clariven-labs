'use client';

import { ChevronDown, Copy, Download } from 'lucide-react';

type Doc = { slug: string; title: string; kind: string; body: string };

function DocCard({ title, kind, body }: Doc) {
  const filename = `${title.replace(/[^\w]+/g, '-').toLowerCase()}.txt`;
  const download = () => {
    const url = URL.createObjectURL(new Blob([body], { type: 'text/plain' }));
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };
  return (
    <details className="group bg-white border border-cl-gray-200 rounded-xl overflow-hidden">
      <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none select-none hover:bg-cl-gray-50 [&::-webkit-details-marker]:hidden">
        <span className="text-sm font-semibold text-cl-navy">
          {title}
          {kind === 'memo' ? <span className="ml-2 text-xs font-normal text-cl-gray-400">reference</span> : null}
        </span>
        <ChevronDown className="w-4 h-4 text-cl-gray-400 transition-transform group-open:rotate-180" />
      </summary>
      <div className="px-6 pb-6 pt-2 border-t border-cl-gray-100 space-y-3">
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => navigator.clipboard?.writeText(body)}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cl-gray-200 px-3 py-1.5 text-xs font-medium text-cl-navy hover:bg-cl-gray-50"
          >
            <Copy className="w-3.5 h-3.5" /> Copy
          </button>
          <button
            type="button"
            onClick={download}
            className="inline-flex items-center gap-1.5 rounded-lg border border-cl-gray-200 px-3 py-1.5 text-xs font-medium text-cl-navy hover:bg-cl-gray-50"
          >
            <Download className="w-3.5 h-3.5" /> Download .txt
          </button>
        </div>
        <div className="max-h-96 overflow-y-auto rounded-lg border border-cl-gray-200 bg-cl-gray-50 p-4 text-xs leading-relaxed text-cl-gray-700 whitespace-pre-wrap">
          {body}
        </div>
      </div>
    </details>
  );
}

export function ComplianceDocs({ docs }: { docs: Doc[] }) {
  return (
    <div className="space-y-3">
      {docs.map((d) => (
        <DocCard key={d.slug} {...d} />
      ))}
    </div>
  );
}

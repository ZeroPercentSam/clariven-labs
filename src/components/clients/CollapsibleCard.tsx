import type { ReactNode } from 'react';
import { ChevronDown, CheckCircle2 } from 'lucide-react';

// Reusable collapsible "dropdown" section for detail-entry panels across the
// portal + admin (onboarding intake, and any other Clariven process that needs
// structured detail capture). Native <details>/<summary> — no JS, works in
// server or client trees; wrap any form as children.
export function CollapsibleCard({
  title,
  subtitle,
  defaultOpen = false,
  filled = false,
  children,
}: {
  title: string;
  subtitle?: string;
  defaultOpen?: boolean;
  /** Show a check when the section already has data. */
  filled?: boolean;
  children: ReactNode;
}) {
  return (
    <details
      open={defaultOpen}
      className="group bg-white border border-cl-gray-200 rounded-xl overflow-hidden"
    >
      <summary className="flex items-center justify-between gap-3 px-6 py-4 cursor-pointer list-none select-none hover:bg-cl-gray-50 [&::-webkit-details-marker]:hidden">
        <div className="min-w-0">
          <span className="text-sm font-semibold text-cl-navy">{title}</span>
          {subtitle ? <span className="block text-xs text-cl-gray-500 mt-0.5">{subtitle}</span> : null}
        </div>
        <span className="flex items-center gap-2 shrink-0">
          {filled ? <CheckCircle2 className="w-4 h-4 text-cl-success" /> : null}
          <ChevronDown className="w-4 h-4 text-cl-gray-400 transition-transform group-open:rotate-180" />
        </span>
      </summary>
      <div className="px-6 pb-6 pt-2 border-t border-cl-gray-100">{children}</div>
    </details>
  );
}

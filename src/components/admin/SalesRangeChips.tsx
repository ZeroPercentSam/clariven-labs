'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { RANGE_OPTIONS, type RangeDays } from '@/lib/admin/sales-analytics-constants';

// The range chip changes the DB aggregation window (server-side reduce keyed on
// rangeDays), so it can't move client-side without loading every order. We keep
// the server navigation but wrap it in useTransition + router.push({scroll:
// false}) so the chips dim during the in-flight RSC stream instead of a silent
// freeze-then-jump. (Project perf pattern for server-needed chip filters.)
export function SalesRangeChips({ current }: { current: RangeDays }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-1.5" data-pending={pending ? 'true' : 'false'}>
      {RANGE_OPTIONS.map((n) => {
        const active = n === current;
        return (
          <button
            key={n}
            type="button"
            disabled={pending}
            onClick={() => {
              if (n === current) return;
              startTransition(() => {
                router.push(`/admin/sales-dashboard?range=${n}`, { scroll: false });
              });
            }}
            data-active={active ? 'true' : 'false'}
            className={`inline-flex items-center rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
              active
                ? 'bg-cl-navy text-white'
                : 'bg-white border border-cl-gray-200 text-cl-navy hover:bg-cl-gray-50'
            } ${pending ? 'cursor-wait opacity-60' : ''}`}
          >
            {n}d
          </button>
        );
      })}
    </div>
  );
}

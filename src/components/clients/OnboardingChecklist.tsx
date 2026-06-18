'use client';

import { useMemo, useState, useTransition } from 'react';
import { Check } from 'lucide-react';
import { toggleItem } from '@/lib/clients/actions';
import {
  OWNER_ROLE_LABELS,
  OWNER_ROLE_STYLES,
  type ItemStatus,
  type OwnerRole,
} from '@/lib/clients/constants';
import type { OnboardingPhaseView } from '@/lib/clients/queries';

/**
 * Interactive onboarding checklist, shared by the admin client-detail page and
 * the client portal. Anyone in the org (and admins) can check items — RLS on
 * client_item_status is the real gate; this island just does optimistic UI.
 * Only serializable props + the toggleItem server action cross the RSC boundary.
 */
export function OnboardingChecklist({
  orgId,
  phases,
}: {
  orgId: string;
  phases: OnboardingPhaseView[];
}) {
  // Live status map keyed by itemId — drives both the checkboxes and the
  // derived per-step / per-phase counts so progress updates instantly.
  const [statuses, setStatuses] = useState<Record<number, ItemStatus>>(() => {
    const m: Record<number, ItemStatus> = {};
    for (const p of phases) for (const s of p.steps) for (const it of s.items) m[it.itemId] = it.status;
    return m;
  });
  const [, startTransition] = useTransition();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);

  const counts = useMemo(() => {
    const per: Record<number, { done: number; total: number }> = {};
    let done = 0;
    let total = 0;
    for (const p of phases) {
      let pd = 0;
      let pt = 0;
      for (const s of p.steps) {
        for (const it of s.items) {
          const st = statuses[it.itemId] ?? 'pending';
          if (st === 'na') continue;
          pt += 1;
          if (st === 'done') pd += 1;
        }
      }
      per[p.phaseId] = { done: pd, total: pt };
      done += pd;
      total += pt;
    }
    return { per, done, total };
  }, [phases, statuses]);

  function toggle(itemId: number) {
    const prev = statuses[itemId] ?? 'pending';
    const next: ItemStatus = prev === 'done' ? 'pending' : 'done';
    setStatuses((m) => ({ ...m, [itemId]: next }));
    setError(null);
    setBusy(itemId);
    startTransition(async () => {
      const res = await toggleItem({ orgId, itemId, status: next });
      setBusy(null);
      if (!res.ok) {
        setStatuses((m) => ({ ...m, [itemId]: prev }));
        setError(res.error || 'Could not save. Try again.');
      }
    });
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {error}
        </p>
      ) : null}

      {phases.map((phase, idx) => {
        const c = counts.per[phase.phaseId] ?? { done: 0, total: 0 };
        const complete = c.total > 0 && c.done === c.total;
        // Open the first not-yet-complete phase by default; collapse the rest.
        const defaultOpen = !complete && phases.slice(0, idx).every((p) => {
          const pc = counts.per[p.phaseId];
          return pc && pc.total > 0 && pc.done === pc.total;
        });
        return (
          <details
            key={phase.phaseId}
            open={defaultOpen}
            className="bg-white border border-cl-gray-200 rounded-xl overflow-hidden group"
          >
            <summary className="flex items-center gap-3 px-5 py-4 cursor-pointer list-none select-none hover:bg-cl-gray-50">
              <span
                className={`flex items-center justify-center w-7 h-7 rounded-full text-[11px] font-bold shrink-0 ${
                  complete ? 'bg-cl-teal text-white' : 'bg-cl-gray-100 text-cl-gray-500'
                }`}
              >
                {complete ? <Check className="w-4 h-4" /> : phase.phaseId}
              </span>
              <span className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-cl-navy truncate">{phase.title}</span>
                {phase.subtitle ? (
                  <span className="block text-xs text-cl-gray-400 truncate">{phase.subtitle}</span>
                ) : null}
              </span>
              <span className="text-xs text-cl-gray-500 tabular-nums shrink-0">
                {c.done}/{c.total}
              </span>
            </summary>

            <div className="border-t border-cl-gray-100 divide-y divide-cl-gray-100">
              {phase.steps.map((step) => (
                <div key={step.stepId} className="px-5 py-4">
                  <div className="flex items-center gap-2 mb-3">
                    <h4 className="text-sm font-semibold text-cl-navy">{step.title}</h4>
                    <OwnerBadge role={step.ownerRole} />
                  </div>
                  {step.description ? (
                    <p className="text-xs text-cl-gray-500 mb-3 -mt-1">{step.description}</p>
                  ) : null}
                  <ul className="space-y-1.5">
                    {step.items.map((item) => {
                      const st = statuses[item.itemId] ?? 'pending';
                      const checked = st === 'done';
                      return (
                        <li key={item.itemId}>
                          <button
                            type="button"
                            onClick={() => toggle(item.itemId)}
                            disabled={busy === item.itemId}
                            className="group/item flex w-full items-start gap-3 text-left rounded-lg px-2 py-1.5 -mx-2 hover:bg-cl-gray-50 transition disabled:opacity-50"
                          >
                            <span
                              className={`mt-0.5 flex items-center justify-center w-[18px] h-[18px] rounded-md border shrink-0 transition ${
                                checked
                                  ? 'bg-cl-teal border-cl-teal text-white'
                                  : 'bg-white border-cl-gray-300 group-hover/item:border-cl-teal/60'
                              }`}
                            >
                              {checked ? <Check className="w-3 h-3" /> : null}
                            </span>
                            <span className="min-w-0">
                              <span
                                className={`block text-sm ${
                                  checked ? 'text-cl-gray-400 line-through' : 'text-cl-navy'
                                }`}
                              >
                                {item.label}
                              </span>
                              {item.helpText ? (
                                <span className="block text-xs text-cl-gray-400 mt-0.5">{item.helpText}</span>
                              ) : null}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </div>
          </details>
        );
      })}
    </div>
  );
}

function OwnerBadge({ role }: { role: OwnerRole }) {
  return (
    <span
      className={`text-[10px] font-semibold px-2 py-0.5 rounded-full whitespace-nowrap ${OWNER_ROLE_STYLES[role]}`}
    >
      {OWNER_ROLE_LABELS[role]}
    </span>
  );
}

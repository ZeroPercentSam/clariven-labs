'use client';

import { useState } from 'react';
import { startImpersonation } from '@/lib/impersonation/actions';

export type OrgMember = {
  user_id: string;
  org_role: string;
  name: string;
  email: string | null;
  role: string; // profiles.role — 'admin' members can't be impersonated
};

// A member row on /admin/organizations/[id] with an Impersonate action. The
// button is hidden for admins + the current user; the DB RPC re-enforces both,
// so the UI guard is convenience only.
export function OrgMemberRow({
  member,
  currentUserId,
  orgId,
}: {
  member: OrgMember;
  currentUserId: string;
  orgId: string;
}) {
  const [open, setOpen] = useState(false);
  const canImpersonate = member.role !== 'admin' && member.user_id !== currentUserId;

  return (
    <li className="flex items-center justify-between gap-2 py-1">
      <span className="text-cl-navy truncate">{member.name}</span>
      <div className="flex items-center gap-2 shrink-0">
        <span className="text-xs text-cl-gray-400 font-mono">{member.org_role}</span>
        {canImpersonate ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="text-xs text-cl-teal hover:text-cl-teal/80 font-medium"
          >
            Impersonate
          </button>
        ) : null}
      </div>

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-white rounded-xl border border-cl-gray-200 p-5 w-full max-w-md"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-cl-navy font-semibold mb-1">Impersonate {member.name}</h3>
            <p className="text-xs text-cl-gray-500 mb-3">
              You&rsquo;ll act as this customer for a 15-minute session — you see and do exactly
              what they can. Every action is audited to you. End the session to restore admin
              access.
            </p>
            <form action={startImpersonation} className="space-y-3">
              <input type="hidden" name="target_user_id" value={member.user_id} />
              <input type="hidden" name="org_id" value={orgId} />
              <textarea
                name="justification"
                required
                minLength={10}
                maxLength={500}
                rows={3}
                placeholder="Reason (support ticket #, what you're debugging…)"
                className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
              />
              <div className="flex items-center gap-2 justify-end">
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="text-sm px-3 py-1.5 rounded-lg border border-cl-gray-200 text-cl-navy"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="text-sm px-3 py-1.5 rounded-lg bg-cl-teal text-white font-semibold hover:bg-cl-teal/90"
                >
                  Start session
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </li>
  );
}

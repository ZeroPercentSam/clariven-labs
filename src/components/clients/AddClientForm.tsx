'use client';

import { useState, useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { createClientAccount } from '@/lib/clients/actions';
import { CLIENT_MEMBER_ROLES, CLIENT_MEMBER_ROLE_LABELS } from '@/lib/clients/constants';

const LABEL = 'block text-cl-gray-600 text-xs font-semibold tracking-wider uppercase mb-1.5';
const INPUT =
  'w-full bg-white border border-cl-gray-200 rounded-lg px-4 py-2.5 text-cl-navy text-sm focus:outline-none focus:border-cl-teal/60';

type Created = { email: string; tempPassword: string; warning?: string };

/**
 * Provision a client login. `orgId` set → adds a member to an existing client
 * (no company fields); otherwise creates a brand-new client company + owner +
 * seeds the checklist. On success it reveals the generated password ONCE for the
 * admin to relay — there is no other way to retrieve it.
 */
export function AddClientForm({ orgId, loginUrl }: { orgId?: string; loginUrl: string }) {
  const router = useRouter();
  const isMember = Boolean(orgId);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [created, setCreated] = useState<Created | null>(null);
  const [copied, setCopied] = useState(false);

  function onSubmit(formData: FormData) {
    setError(null);
    const input = {
      orgId,
      orgName: (formData.get('orgName') as string) ?? undefined,
      legalName: (formData.get('legalName') as string) ?? undefined,
      email: ((formData.get('email') as string) ?? '').trim(),
      fullName: ((formData.get('fullName') as string) ?? '').trim(),
      orgRole: (formData.get('orgRole') as string) ?? undefined,
    };
    startTransition(async () => {
      const res = await createClientAccount(input);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setCreated({ email: res.email, tempPassword: res.tempPassword, warning: res.warning });
      router.refresh();
    });
  }

  async function copyAll() {
    if (!created) return;
    const text = `Clariven Labs portal login\nEmail: ${created.email}\nTemporary password: ${created.tempPassword}\nSign in: ${loginUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  if (created) {
    return (
      <div className="max-w-lg space-y-4">
        <div className="rounded-xl border border-cl-teal/30 bg-cl-teal/5 p-5">
          <p className="text-sm font-semibold text-cl-navy mb-1">Account created ✓</p>
          <p className="text-xs text-cl-gray-500 mb-4">
            Copy these credentials and send them to the client securely. The password is shown once —
            it can&apos;t be retrieved later (you can generate a new one by adding the member again).
          </p>
          <dl className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-cl-gray-500">Email</dt>
              <dd className="font-mono text-cl-navy truncate">{created.email}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-cl-gray-500">Temporary password</dt>
              <dd className="font-mono text-cl-navy">{created.tempPassword}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-cl-gray-500">Sign in at</dt>
              <dd className="font-mono text-cl-navy truncate">{loginUrl}</dd>
            </div>
          </dl>
          <button
            type="button"
            onClick={copyAll}
            className="mt-4 px-4 py-2 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase"
          >
            {copied ? 'Copied ✓' : 'Copy credentials'}
          </button>
        </div>
        {created.warning ? (
          <p className="text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
            {created.warning}
          </p>
        ) : null}
        <button
          type="button"
          onClick={() => {
            setCreated(null);
            setCopied(false);
          }}
          className="text-sm text-cl-teal hover:text-cl-teal/80"
        >
          {isMember ? 'Add another member' : 'Add another client'}
        </button>
      </div>
    );
  }

  return (
    <form action={onSubmit} className="bg-white border border-cl-gray-200 rounded-xl p-6 space-y-4 max-w-lg">
      {error ? (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">{error}</p>
      ) : null}

      {!isMember ? (
        <>
          <label className="block">
            <span className={LABEL}>Client company name</span>
            <input name="orgName" required maxLength={160} className={INPUT} placeholder="Acme Peptides LLC" />
          </label>
          <label className="block">
            <span className={LABEL}>Legal entity name (optional)</span>
            <input name="legalName" maxLength={200} className={INPUT} />
          </label>
        </>
      ) : null}

      <label className="block">
        <span className={LABEL}>Contact name</span>
        <input name="fullName" required maxLength={160} className={INPUT} placeholder="Jane Doe" />
      </label>
      <label className="block">
        <span className={LABEL}>Contact email</span>
        <input name="email" type="email" required maxLength={200} className={INPUT} placeholder="jane@acme.com" />
      </label>
      <label className="block">
        <span className={LABEL}>Portal role</span>
        <select name="orgRole" defaultValue={isMember ? 'buyer' : 'owner'} className={INPUT}>
          {CLIENT_MEMBER_ROLES.map((r) => (
            <option key={r} value={r}>
              {CLIENT_MEMBER_ROLE_LABELS[r]}
            </option>
          ))}
        </select>
      </label>

      <button
        type="submit"
        disabled={pending}
        className="px-5 py-2.5 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition uppercase disabled:opacity-60"
      >
        {pending ? 'Creating…' : isMember ? 'Create member account' : 'Create client account'}
      </button>
    </form>
  );
}

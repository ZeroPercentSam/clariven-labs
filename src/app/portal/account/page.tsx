import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { getProfile } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

async function saveAccountAction(formData: FormData) {
  'use server';
  const supabase = await createClient();
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) redirect('/login');

  const shipping = {
    full_name: String(formData.get('full_name') ?? '').trim(),
    line1: String(formData.get('line1') ?? '').trim(),
    line2: String(formData.get('line2') ?? '').trim(),
    city: String(formData.get('city') ?? '').trim(),
    state: String(formData.get('state') ?? '').trim(),
    postal_code: String(formData.get('postal_code') ?? '').trim(),
    country: String(formData.get('country') ?? 'US').trim(),
    phone: String(formData.get('phone') ?? '').trim(),
  };

  await supabase
    .from('profiles')
    .update({
      full_name: String(formData.get('profile_name') ?? '').trim() || null,
      phone: String(formData.get('profile_phone') ?? '').trim() || null,
      shipping_address: shipping,
    })
    .eq('id', auth.user.id);

  redirect('/portal/account?saved=1');
}

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ saved?: string }>;
}) {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  const { saved } = await searchParams;
  const ship = (profile.shipping_address as Record<string, string>) ?? {};

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-6">Account</h1>
      <form action={saveAccountAction} className="space-y-6 max-w-xl">
        <section className="bg-white border border-cl-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-cl-navy font-semibold text-sm">Profile</h2>
          <Field name="profile_name" label="Full name" defaultValue={profile.full_name ?? ''} />
          <Field name="profile_phone" label="Phone" defaultValue={profile.phone ?? ''} />
          <p className="text-xs text-cl-gray-500">
            Email <span className="text-cl-navy">{profile.email}</span> — contact us to change.
          </p>
        </section>

        <section className="bg-white border border-cl-gray-200 rounded-xl p-5 space-y-3">
          <h2 className="text-cl-navy font-semibold text-sm">Default shipping</h2>
          <Field name="full_name" label="Recipient" defaultValue={ship.full_name ?? ''} />
          <Field name="line1" label="Street" defaultValue={ship.line1 ?? ''} />
          <Field name="line2" label="Apt/Suite" defaultValue={ship.line2 ?? ''} />
          <div className="grid grid-cols-2 gap-3">
            <Field name="city" label="City" defaultValue={ship.city ?? ''} />
            <Field name="state" label="State" defaultValue={ship.state ?? ''} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field name="postal_code" label="ZIP" defaultValue={ship.postal_code ?? ''} />
            <Field name="country" label="Country" defaultValue={ship.country ?? 'US'} />
          </div>
          <Field name="phone" label="Phone on label" defaultValue={ship.phone ?? ''} />
        </section>

        <div className="flex items-center gap-3">
          <button
            type="submit"
            className="px-5 py-2.5 rounded-xl bg-cl-teal text-white text-sm font-semibold hover:bg-cl-teal-light transition"
          >
            Save changes
          </button>
          {saved ? <span className="text-sm text-cl-teal">Saved.</span> : null}
        </div>
      </form>
    </div>
  );
}

function Field({ name, label, defaultValue }: { name: string; label: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-1">
        {label}
      </span>
      <input
        type="text"
        name={name}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
      />
    </label>
  );
}

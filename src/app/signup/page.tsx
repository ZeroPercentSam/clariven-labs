import Link from 'next/link';
import { redirect } from 'next/navigation';
import { cookies, headers } from 'next/headers';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Create account — Clariven Labs' };

async function signupAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim().toLowerCase();
  const password = String(formData.get('password') ?? '');
  const fullName = String(formData.get('full_name') ?? '').trim();

  if (!email || !password || password.length < 10) {
    const p = new URLSearchParams({ error: 'Email and 10+ char password required.', email });
    redirect(`/signup?${p.toString()}`);
  }

  // Read referral cookie set by src/middleware.ts when ?ref=CODE appears.
  const cookieStore = await cookies();
  const refCode = cookieStore.get('cl_ref')?.value ?? null;

  const hdrs = await headers();
  const proto = hdrs.get('x-forwarded-proto') ?? 'https';
  const host = hdrs.get('host') ?? 'localhost:3000';
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || `${proto}://${host}`;

  const supabase = await createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${siteUrl}/auth/callback`,
      data: fullName ? { full_name: fullName } : undefined,
    },
  });

  if (error || !data.user) {
    const p = new URLSearchParams({ error: error?.message ?? 'Signup failed.', email });
    redirect(`/signup?${p.toString()}`);
  }

  // Stamp referral + name. Note: auth.signUp doesn't issue a session when
  // email confirmation is required, so these RPC calls may be ignored by RLS
  // until the user confirms + logs in. The user.user_metadata carries
  // full_name from options.data above; on first login we stamp via /portal.
  // When email confirmation is OFF (dev), `supabase.auth` now has a session
  // and these calls do persist.
  try {
    if (refCode) {
      await supabase.rpc('stamp_referral', { p_code: refCode });
    }
    if (fullName) {
      await supabase.from('profiles').update({ full_name: fullName }).eq('id', data.user.id);
    }
  } catch {
    // Non-fatal — signup still succeeded.
  }

  redirect(`/signup?confirm=1&email=${encodeURIComponent(email)}`);
}

export default async function SignupPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; confirm?: string }>;
}) {
  const { error, email = '', confirm } = await searchParams;

  if (confirm) {
    return (
      <div className="min-h-screen bg-cl-navy flex items-center justify-center px-6 pt-24 pb-16">
        <div className="w-full max-w-md text-center">
          <h1 className="text-white font-bold text-2xl mb-3">Check your email</h1>
          <p className="text-white/60 text-sm leading-relaxed">
            We sent a confirmation link to <span className="text-white">{email}</span>. Click it to
            activate your account, then sign in.
          </p>
          <Link
            href="/login"
            className="inline-block mt-6 text-cl-teal text-sm hover:text-cl-teal/80"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cl-navy flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-md">
        <h1 className="text-white font-bold text-3xl tracking-wider text-center mb-2">
          CLARIVEN<span className="text-cl-teal">LABS</span>
        </h1>
        <p className="text-white/50 text-sm text-center mb-8">Create your account</p>

        <form
          action={signupAction}
          className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4"
        >
          <label className="block">
            <span className="block text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
              Full name
            </span>
            <input
              type="text"
              name="full_name"
              autoComplete="name"
              maxLength={200}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cl-teal/60"
            />
          </label>
          <label className="block">
            <span className="block text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
              Email
            </span>
            <input
              type="email"
              name="email"
              required
              autoComplete="email"
              defaultValue={email}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cl-teal/60"
            />
          </label>
          <label className="block">
            <span className="block text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
              Password
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              minLength={10}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cl-teal/60"
            />
            <span className="block mt-1 text-white/40 text-xs">10 characters minimum.</span>
          </label>

          {error ? (
            <p className="text-[13px] text-red-300 bg-red-500/10 border border-red-500/30 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full px-5 py-3 text-[12px] font-semibold tracking-wider text-white bg-cl-teal rounded-lg hover:bg-cl-teal/90 transition-all uppercase"
          >
            Create account
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Already have an account?{' '}
          <Link href="/login" className="text-cl-teal hover:text-cl-teal/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

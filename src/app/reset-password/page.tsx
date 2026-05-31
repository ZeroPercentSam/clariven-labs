import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

export const metadata = { title: 'Set a new password — Clariven Labs' };

async function resetPasswordAction(formData: FormData) {
  'use server';
  const password = String(formData.get('password') ?? '');
  const confirm = String(formData.get('confirm') ?? '');

  if (password.length < 10) {
    redirect('/reset-password?error=' + encodeURIComponent('Password must be at least 10 characters.'));
  }
  if (password !== confirm) {
    redirect('/reset-password?error=' + encodeURIComponent('Passwords do not match.'));
  }
  if (!supabaseEnvConfigured()) {
    redirect('/reset-password?error=' + encodeURIComponent('Authentication is unavailable right now. Try again shortly.'));
  }

  const supabase = await createClient();
  // The session was established by /auth/callback (PKCE exchange) before this
  // page rendered. If the link expired or was opened directly, updateUser
  // returns "Auth session missing!" which we surface below.
  const { error } = await supabase.auth.updateUser({ password });
  if (error) {
    redirect('/reset-password?error=' + encodeURIComponent(error.message));
  }
  redirect('/portal');
}

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  return (
    <div className="min-h-screen bg-cl-navy flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-md">
        <h1 className="text-white font-bold text-3xl tracking-wider text-center mb-2">
          CLARIVEN<span className="text-cl-teal">LABS</span>
        </h1>
        <p className="text-white/50 text-sm text-center mb-8">Set a new password</p>

        <form
          action={resetPasswordAction}
          className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4"
        >
          <label className="block">
            <span className="block text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
              New password
            </span>
            <input
              type="password"
              name="password"
              required
              autoComplete="new-password"
              minLength={10}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cl-teal/60"
            />
          </label>
          <label className="block">
            <span className="block text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
              Confirm password
            </span>
            <input
              type="password"
              name="confirm"
              required
              autoComplete="new-password"
              minLength={10}
              className="w-full bg-white/[0.04] border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-cl-teal/60"
            />
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
            Update password
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          Need a new link?{' '}
          <Link href="/forgot-password" className="text-cl-teal hover:text-cl-teal/80">
            Start over
          </Link>
        </p>
      </div>
    </div>
  );
}

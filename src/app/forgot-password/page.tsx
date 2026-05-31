import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';
import { supabaseEnvConfigured } from '@/lib/supabase/env';

export const metadata = { title: 'Reset password — Clariven Labs' };

async function requestResetAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim();
  if (!email || !email.includes('@')) {
    redirect('/forgot-password?error=' + encodeURIComponent('Enter a valid email.'));
  }
  if (supabaseEnvConfigured()) {
    const supabase = await createClient();
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? '';
    // Route through /auth/callback so the PKCE code is exchanged for a session
    // BEFORE /reset-password renders — otherwise the reset form sees no session
    // and errors "Auth session missing!" on submit (portable-fix #10).
    await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${siteUrl}/auth/callback?next=/reset-password`,
    });
  }
  // Always report success — never reveal whether an email is registered.
  redirect('/forgot-password?sent=1');
}

export default async function ForgotPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ sent?: string; error?: string }>;
}) {
  const { sent, error } = await searchParams;

  return (
    <div className="min-h-screen bg-cl-navy flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-md">
        <h1 className="text-white font-bold text-3xl tracking-wider text-center mb-2">
          CLARIVEN<span className="text-cl-teal">LABS</span>
        </h1>
        <p className="text-white/50 text-sm text-center mb-8">Reset your password</p>

        {sent ? (
          <div className="bg-white/[0.03] border border-white/10 rounded-xl p-6 text-center">
            <p className="text-white text-sm mb-2 font-semibold">Check your email.</p>
            <p className="text-white/60 text-[13px] leading-relaxed">
              If an account exists for that address, we sent a link to set a new password.
              The link opens your account and takes you straight to the reset form.
            </p>
            <Link
              href="/login"
              className="inline-block mt-6 text-cl-teal hover:text-cl-teal/80 text-sm"
            >
              Back to sign in
            </Link>
          </div>
        ) : (
          <form
            action={requestResetAction}
            className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4"
          >
            <label className="block">
              <span className="block text-white/70 text-xs font-semibold tracking-wider uppercase mb-2">
                Email
              </span>
              <input
                type="email"
                name="email"
                required
                autoComplete="email"
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
              Send reset link
            </button>
          </form>
        )}

        <p className="text-center text-white/40 text-sm mt-6">
          Remembered it?{' '}
          <Link href="/login" className="text-cl-teal hover:text-cl-teal/80">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}

import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export const metadata = { title: 'Sign in — Clariven Labs' };

async function loginAction(formData: FormData) {
  'use server';
  const email = String(formData.get('email') ?? '').trim();
  const password = String(formData.get('password') ?? '');
  const next = String(formData.get('next') ?? '/portal');

  const supabase = await createClient();
  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    const p = new URLSearchParams({ error: error.message, email });
    redirect(`/login?${p.toString()}`);
  }
  redirect(next);
}

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; email?: string; next?: string }>;
}) {
  const { error, email = '', next = '/portal' } = await searchParams;

  return (
    <div className="min-h-screen bg-cl-navy flex items-center justify-center px-6 pt-24 pb-16">
      <div className="w-full max-w-md">
        <h1 className="text-white font-bold text-3xl tracking-wider text-center mb-2">
          CLARIVEN<span className="text-cl-teal">LABS</span>
        </h1>
        <p className="text-white/50 text-sm text-center mb-8">Sign in to your account</p>

        <form
          action={loginAction}
          className="bg-white/[0.03] border border-white/10 rounded-xl p-6 space-y-4"
        >
          <input type="hidden" name="next" value={next} />
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
              autoComplete="current-password"
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
            Sign in
          </button>
        </form>

        <p className="text-center text-white/40 text-sm mt-6">
          No account?{' '}
          <Link href="/signup" className="text-cl-teal hover:text-cl-teal/80">
            Create one
          </Link>
        </p>
      </div>
    </div>
  );
}

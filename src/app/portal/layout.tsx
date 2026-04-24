import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth/roles';

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  if (!profile) redirect('/login');

  return (
    <div className="min-h-screen bg-cl-gray-50 pt-[96px] pb-16">
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid lg:grid-cols-[200px_1fr] gap-8">
          <aside>
            <p className="text-[11px] font-semibold tracking-[0.25em] text-cl-gray-400 uppercase mb-1">
              Portal
            </p>
            <p className="text-cl-navy font-semibold truncate mb-5">{profile.email}</p>
            <nav className="space-y-1">
              <Link href="/portal" className="block px-3 py-2 rounded-lg text-sm text-cl-navy hover:bg-white hover:shadow-sm">
                Orders
              </Link>
              <Link href="/portal/account" className="block px-3 py-2 rounded-lg text-sm text-cl-navy hover:bg-white hover:shadow-sm">
                Account
              </Link>
              {profile.role === 'admin' ? (
                <Link
                  href="/admin"
                  className="block px-3 py-2 rounded-lg text-sm text-cl-teal hover:bg-white hover:shadow-sm"
                >
                  Admin
                </Link>
              ) : null}
            </nav>
            <form action="/logout" method="POST" className="mt-8">
              <button type="submit" className="text-xs text-cl-gray-500 hover:text-red-500">
                Sign out
              </button>
            </form>
          </aside>
          <div>{children}</div>
        </div>
      </div>
    </div>
  );
}

import { redirect } from 'next/navigation';
import Link from 'next/link';
import { getProfile } from '@/lib/auth/roles';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const profile = await getProfile();
  // Middleware already gates /admin/* for admin role, but re-verify here as
  // defense-in-depth for direct Server Component / RSC render paths.
  if (!profile || profile.role !== 'admin') redirect('/portal');

  const links = [
    { href: '/admin', label: 'Overview' },
    { href: '/admin/orders', label: 'Orders' },
    { href: '/admin/pricing', label: 'Pricing' },
    { href: '/admin/affiliates', label: 'Affiliates' },
  ];

  return (
    <div className="min-h-screen bg-cl-gray-50 pt-[96px] pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <aside>
            <div className="mb-6">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-cl-gray-400 uppercase mb-1">
                Admin
              </p>
              <p className="text-cl-navy font-semibold truncate">{profile.email}</p>
            </div>
            <nav className="space-y-1">
              {links.map((l) => (
                <Link
                  key={l.href}
                  href={l.href}
                  className="block px-3 py-2 rounded-lg text-sm text-cl-navy hover:bg-white hover:shadow-sm transition"
                >
                  {l.label}
                </Link>
              ))}
            </nav>
            <form action="/logout" method="POST" className="mt-8">
              <button
                type="submit"
                className="text-xs text-cl-gray-500 hover:text-red-500"
              >
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

import { redirect } from 'next/navigation';
import { getMyRep } from '@/lib/rep/queries';
import { NavLink } from '@/components/ui/nav-link';

// Shared shell for /rep/*. Requires a sales_reps row (proxy already requires
// auth). The portal nav shows only for ACTIVE reps; onboarding routes
// (pending reps) render without it. Each portal page additionally calls
// requireActiveRep().
export default async function RepLayout({ children }: { children: React.ReactNode }) {
  const rep = await getMyRep();
  if (!rep) redirect('/');

  const active = rep.status === 'active';
  const links = [
    { href: '/rep/dashboard', label: 'Dashboard' },
    { href: '/rep/commissions', label: 'Commissions' },
    { href: '/rep/orders', label: 'Attributed orders' },
    { href: '/rep/orgs', label: 'My organizations' },
    { href: '/rep/codes', label: 'Codes' },
    { href: '/rep/support', label: 'Support' },
  ];

  if (!active) {
    // Onboarding / pending flow — no portal chrome.
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-cl-gray-50 pt-[96px] pb-16">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid lg:grid-cols-[220px_1fr] gap-8">
          <aside>
            <div className="mb-6">
              <p className="text-[11px] font-semibold tracking-[0.25em] text-cl-gray-400 uppercase mb-1">
                Sales Rep
              </p>
              <p className="text-cl-navy font-semibold truncate">{rep.legal_name || 'Rep'}</p>
            </div>
            <nav className="space-y-1">
              {links.map((l) => (
                <NavLink
                  key={l.href}
                  href={l.href}
                  exact={l.href === '/rep/dashboard'}
                  className="block px-3 py-2 rounded-lg text-sm text-cl-navy hover:bg-white hover:shadow-sm transition"
                  activeClassName="bg-white shadow-sm font-semibold"
                >
                  {l.label}
                </NavLink>
              ))}
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

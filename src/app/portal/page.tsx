import { redirect } from 'next/navigation';
import { getProfile } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

// The portal is checklist-first. /portal itself is just a router: admins go to
// the admin console, clients go straight to their onboarding checklist.
export default async function PortalIndex() {
  const profile = await getProfile();
  if (!profile) redirect('/login');
  if (profile.role === 'admin') redirect('/admin');
  redirect('/portal/onboarding');
}

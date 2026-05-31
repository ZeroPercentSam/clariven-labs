import { getClientResources } from '@/lib/resources/queries';
import { ResourceManager } from '@/components/admin/ResourceManager';

export const dynamic = 'force-dynamic';

export default async function AdminResourcesPage() {
  const resources = await getClientResources(true);
  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-2">Client Resources</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        Onboarding docs published to logged-in customers at{' '}
        <span className="font-mono text-cl-navy">/portal/resources</span>. Files live in a private
        bucket and download via short-lived signed links.
      </p>
      <ResourceManager initial={resources} />
    </div>
  );
}

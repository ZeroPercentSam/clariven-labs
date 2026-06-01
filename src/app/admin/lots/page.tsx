import { requireAdmin } from '@/lib/auth/roles';
import { listLots } from '@/lib/lots/queries';
import { products } from '@/lib/products';
import { LotManager } from '@/components/admin/LotManager';

export const dynamic = 'force-dynamic';

export default async function AdminLotsPage() {
  await requireAdmin();
  const lots = await listLots();
  const catalog = products.map((p) => ({ slug: p.slug, name: p.name, strengths: p.strengths }));

  return (
    <div>
      <h1 className="text-2xl font-semibold text-cl-navy mb-1">Lots</h1>
      <p className="text-sm text-cl-gray-500 mb-6">
        Physical lots, expiration dates, and per-lot COAs. The daily lot-expiration cron emails admins at
        90 / 60 / 30 / 14 days before a lot expires.
      </p>
      <LotManager lots={lots} catalog={catalog} />
    </div>
  );
}

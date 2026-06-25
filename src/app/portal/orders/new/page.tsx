import Link from 'next/link';
import { listProductCatalog, listMyOrderRequests } from '@/lib/orders/queries';
import { getMyIntake } from '@/lib/clients/intake-queries';
import { ProductPicker } from '@/components/clients/ProductPicker';
import { BusinessDetailsForm } from '@/components/clients/BusinessDetailsForm';
import { CollapsibleCard } from '@/components/clients/CollapsibleCard';

export const metadata = { title: 'New order request — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function NewOrderRequestPage() {
  const [options, existing, intake] = await Promise.all([
    listProductCatalog(),
    listMyOrderRequests(),
    getMyIntake(),
  ]);
  const kind = existing.length === 0 ? 'initial' : 'reorder';

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <Link href="/portal/orders" className="text-sm text-cl-teal hover:text-cl-teal/80">
          &larr; Orders
        </Link>
        <h1 className="text-2xl font-bold text-cl-navy mt-2">
          {kind === 'initial' ? 'Select your products' : 'New reorder'}
        </h1>
        <p className="text-sm text-cl-gray-500 mt-1">
          Check the products and strengths you want, then submit. Clariven reviews and brokers the order.
        </p>
      </div>

      <CollapsibleCard
        title="Business details (LLC & address)"
        subtitle="Confirm your legal entity + shipping address for this order."
        filled={!!intake?.legal_name}
        defaultOpen={!intake?.legal_name}
      >
        <BusinessDetailsForm intake={intake} />
      </CollapsibleCard>
      <ProductPicker options={options} kind={kind} />
    </div>
  );
}

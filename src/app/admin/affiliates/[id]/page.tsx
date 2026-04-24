import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { AffiliateDetail } from '@/components/admin/AffiliateDetail';

export const dynamic = 'force-dynamic';

export default async function AdminAffiliateDetail({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const [{ data: affiliate }, { data: codes }, { data: orders }] = await Promise.all([
    supabase.from('affiliates').select('*').eq('id', id).maybeSingle(),
    supabase
      .from('affiliate_codes')
      .select('*')
      .eq('affiliate_id', id)
      .order('created_at', { ascending: false }),
    supabase
      .from('orders')
      .select('id, order_number, total_cents, discount_cents, status, created_at')
      .eq('affiliate_id', id)
      .order('created_at', { ascending: false })
      .limit(100),
  ]);

  if (!affiliate) notFound();

  return (
    <div>
      <Link
        href="/admin/affiliates"
        className="inline-flex items-center gap-1 text-cl-gray-500 hover:text-cl-teal text-sm mb-4"
      >
        <ArrowLeft className="w-4 h-4" /> Affiliates
      </Link>

      <AffiliateDetail affiliate={affiliate} codes={codes ?? []} orders={orders ?? []} />
    </div>
  );
}

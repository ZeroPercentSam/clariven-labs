import 'server-only';
import { createClient } from '@/lib/supabase/server';
import type { Database } from '@/lib/database.types';
import type { OrderRequestStatus } from './constants';

export type OrderRequest = Database['public']['Tables']['order_requests']['Row'];
export type OrderRequestItem = Database['public']['Tables']['order_request_items']['Row'];
export type OrderRequestWithCount = OrderRequest & { itemCount: number };
export type OrderRequestDetail = OrderRequest & { items: OrderRequestItem[]; orgName: string | null };
export type ProductOption = {
  slug: string;
  strength: string;
  name: string | null;
  renderUrl: string | null;
  labelUrl: string | null;
};

function assetUrl(path: string | null | undefined): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  return path && base ? `${base}/storage/v1/object/public/product-assets/${path}` : null;
}

async function myOrgId(supabase: Awaited<ReturnType<typeof createClient>>): Promise<string | null> {
  const { data: auth } = await supabase.auth.getUser();
  if (!auth.user) return null;
  const { data: profile } = await supabase
    .from('profiles')
    .select('organization_id')
    .eq('id', auth.user.id)
    .maybeSingle();
  return profile?.organization_id ?? null;
}

/** Curated catalog (name + render + label, no price/cogs) via the definer RPC. */
export async function listProductCatalog(): Promise<ProductOption[]> {
  const supabase = await createClient();
  const { data } = await supabase.rpc('list_product_catalog');
  return (data ?? []).map((r) => ({
    slug: r.product_slug,
    strength: r.strength_label,
    name: r.display_name ?? null,
    renderUrl: assetUrl(r.render_path),
    labelUrl: assetUrl(r.label_path),
  }));
}

/** Client: my org's order requests with item counts. */
export async function listMyOrderRequests(): Promise<OrderRequestWithCount[]> {
  const supabase = await createClient();
  const orgId = await myOrgId(supabase);
  if (!orgId) return [];
  const { data } = await supabase
    .from('order_requests')
    .select('*, order_request_items(count)')
    .eq('organization_id', orgId)
    .order('created_at', { ascending: false })
    .limit(200);
  return ((data ?? []) as (OrderRequest & { order_request_items: { count: number }[] })[]).map(
    ({ order_request_items, ...rest }) => ({ ...rest, itemCount: order_request_items?.[0]?.count ?? 0 }),
  );
}

/** Client: one of my org's requests + its items (RLS blocks other orgs). */
export async function getMyOrderRequest(id: string): Promise<OrderRequestDetail | null> {
  const supabase = await createClient();
  const { data: req } = await supabase.from('order_requests').select('*').eq('id', id).maybeSingle();
  if (!req) return null;
  const { data: items } = await supabase
    .from('order_request_items')
    .select('*')
    .eq('request_id', id)
    .order('created_at');
  return { ...req, items: items ?? [], orgName: null };
}

/** Admin: all requests (optional status filter) + org name + item count. */
export async function listAllOrderRequests(opts?: {
  status?: OrderRequestStatus;
}): Promise<(OrderRequestWithCount & { orgName: string | null })[]> {
  const supabase = await createClient();
  let q = supabase
    .from('order_requests')
    .select('*, organizations(name), order_request_items(count)')
    .order('created_at', { ascending: false })
    .limit(500);
  if (opts?.status) q = q.eq('status', opts.status);
  const { data } = await q;
  return (
    (data ?? []) as (OrderRequest & {
      organizations: { name: string } | null;
      order_request_items: { count: number }[];
    })[]
  ).map(({ organizations, order_request_items, ...rest }) => ({
    ...rest,
    orgName: organizations?.name ?? null,
    itemCount: order_request_items?.[0]?.count ?? 0,
  }));
}

/** Admin: one request + items + org name. */
export async function getOrderRequest(id: string): Promise<OrderRequestDetail | null> {
  const supabase = await createClient();
  const { data: req } = await supabase
    .from('order_requests')
    .select('*, organizations(name)')
    .eq('id', id)
    .maybeSingle();
  if (!req) return null;
  const { organizations, ...rest } = req as OrderRequest & { organizations: { name: string } | null };
  const { data: items } = await supabase
    .from('order_request_items')
    .select('*')
    .eq('request_id', id)
    .order('created_at');
  return { ...rest, items: items ?? [], orgName: organizations?.name ?? null };
}

import { products } from '@/lib/products';
import { createClient } from '@/lib/supabase/server';
import { CoaUpload } from '@/components/admin/CoaUpload';

export const dynamic = 'force-dynamic';

export default async function AdminCoasPage() {
  const supabase = await createClient();

  // Default (product-level) COAs — strength_label = ''.
  const { data: rows } = await supabase
    .from('product_coas')
    .select('id, product_slug, strength_label, file_name, file_bytes, updated_at, file_path')
    .eq('strength_label', '');

  const bySlug = new Map<string, NonNullable<typeof rows>[number] & { publicUrl: string }>();
  for (const row of rows ?? []) {
    const publicUrl = supabase.storage.from('product-coas').getPublicUrl(row.file_path).data.publicUrl;
    bySlug.set(row.product_slug, { ...row, publicUrl });
  }

  // Group by category for navigation.
  const byCategory = new Map<string, typeof products>();
  for (const p of products) {
    const list = byCategory.get(p.category) ?? [];
    list.push(p);
    byCategory.set(p.category, list);
  }

  const setCount = bySlug.size;
  const totalProducts = products.length;

  return (
    <div>
      <div className="flex items-start justify-between flex-wrap gap-3 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-cl-navy mb-1">Certificates of Analysis</h1>
          <p className="text-cl-gray-500 text-sm">
            Upload a default COA PDF per product. Customers see a "Download COA" button on the
            product detail page once one is uploaded.
          </p>
        </div>
        <div className="text-right">
          <p className="text-[11px] uppercase tracking-wider text-cl-gray-400">Coverage</p>
          <p className="text-2xl font-semibold text-cl-navy">
            {setCount}
            <span className="text-cl-gray-400 text-base font-normal"> / {totalProducts}</span>
          </p>
        </div>
      </div>

      <div className="space-y-8">
        {Array.from(byCategory.entries()).map(([catId, items]) => (
          <section key={catId}>
            <h2 className="text-[11px] font-semibold tracking-[0.25em] uppercase text-cl-gray-400 mb-3">
              {catId.replace(/-/g, ' ')}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {items.map((p) => (
                <CoaUpload
                  key={p.slug}
                  productSlug={p.slug}
                  productName={p.name}
                  currentCoa={
                    bySlug.has(p.slug)
                      ? (() => {
                          const r = bySlug.get(p.slug)!;
                          return {
                            id: r.id,
                            file_name: r.file_name,
                            file_bytes: r.file_bytes,
                            updated_at: r.updated_at,
                            publicUrl: r.publicUrl,
                          };
                        })()
                      : null
                  }
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

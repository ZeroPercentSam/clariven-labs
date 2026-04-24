const LABEL: Record<string, { label: string; cls: string }> = {
  pending_payment: { label: 'Awaiting payment', cls: 'bg-amber-500/15 text-amber-700 border-amber-500/30' },
  processing: { label: 'Payment processing', cls: 'bg-sky-500/15 text-sky-700 border-sky-500/30' },
  paid: { label: 'Paid', cls: 'bg-emerald-500/15 text-emerald-700 border-emerald-500/30' },
  preparing: { label: 'Preparing', cls: 'bg-indigo-500/15 text-indigo-700 border-indigo-500/30' },
  shipped: { label: 'Shipped', cls: 'bg-cl-teal/15 text-cl-teal border-cl-teal/30' },
  delivered: { label: 'Delivered', cls: 'bg-emerald-600/15 text-emerald-800 border-emerald-600/30' },
  cancelled: { label: 'Cancelled', cls: 'bg-cl-gray-100 text-cl-gray-600 border-cl-gray-300' },
  failed: { label: 'Failed', cls: 'bg-red-500/15 text-red-700 border-red-500/30' },
};

export function OrderStatusBadge({ status }: { status: string }) {
  const conf = LABEL[status] ?? { label: status, cls: 'bg-cl-gray-100 text-cl-gray-600 border-cl-gray-300' };
  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${conf.cls}`}
    >
      {conf.label}
    </span>
  );
}

'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Loader2 } from 'lucide-react';
import { useCart } from '@/lib/cart/store';
import { cartSubtotalCents } from '@/lib/cart/types';

export default function CheckoutPage() {
  const router = useRouter();
  const { cart, hydrated, clear } = useCart();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const subtotal = useMemo(() => cartSubtotalCents(cart), [cart]);

  if (!hydrated) {
    return <main className="min-h-screen bg-white pt-[96px] px-6" />;
  }

  if (cart.lines.length === 0) {
    return (
      <main className="min-h-screen bg-white pt-[96px] pb-24 px-6 text-center">
        <p className="text-cl-gray-500">Your cart is empty.</p>
        <Link href="/products" className="text-cl-teal mt-4 inline-block">
          Browse peptides
        </Link>
      </main>
    );
  }

  async function handleSubmit(form: HTMLFormElement) {
    setError(null);
    setSubmitting(true);
    try {
      const fd = new FormData(form);
      const shipping = {
        full_name: String(fd.get('full_name') ?? '').trim(),
        line1: String(fd.get('line1') ?? '').trim(),
        line2: String(fd.get('line2') ?? '').trim(),
        city: String(fd.get('city') ?? '').trim(),
        state: String(fd.get('state') ?? '').trim(),
        postal_code: String(fd.get('postal_code') ?? '').trim(),
        country: String(fd.get('country') ?? 'US').trim(),
        phone: String(fd.get('phone') ?? '').trim(),
      };
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          items: cart.lines.map((l) => ({
            product_slug: l.productSlug,
            product_name: l.productName,
            strength_label: l.strengthLabel,
            quantity: l.quantity,
          })),
          shipping_address: shipping,
          affiliate_code: cart.affiliateCode ?? null,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        throw new Error(json.error ?? `Failed (HTTP ${res.status})`);
      }
      clear();
      router.push(`/portal/orders/${json.orderId}?placed=1`);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Order failed');
      setSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold text-cl-navy mb-2">Checkout</h1>
        <p className="text-cl-gray-500 text-sm mb-8">
          Enter the shipping address for this order. You'll receive a secure payment link from
          Green.Money by email. ACH / eCheck only.
        </p>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            void handleSubmit(e.currentTarget);
          }}
          className="space-y-4"
        >
          <Field name="full_name" label="Full name" required autoComplete="name" />
          <Field name="line1" label="Street address" required autoComplete="address-line1" />
          <Field name="line2" label="Apt, suite, etc. (optional)" autoComplete="address-line2" />
          <div className="grid grid-cols-2 gap-4">
            <Field name="city" label="City" required autoComplete="address-level2" />
            <Field name="state" label="State" required autoComplete="address-level1" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Field
              name="postal_code"
              label="ZIP / postal code"
              required
              autoComplete="postal-code"
            />
            <Field name="country" label="Country" defaultValue="US" required />
          </div>
          <Field name="phone" label="Phone (optional)" autoComplete="tel" />

          <div className="border-t border-cl-gray-200 pt-5 flex items-center justify-between">
            <div>
              <div className="text-cl-gray-500 text-xs uppercase tracking-wider">Order total</div>
              <div className="text-2xl font-semibold text-cl-navy">
                ${(subtotal / 100).toFixed(2)}
              </div>
              {cart.affiliateCode ? (
                <p className="text-xs text-cl-teal mt-1">Affiliate code {cart.affiliateCode} applied</p>
              ) : null}
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" /> Submitting…
                </>
              ) : (
                <>
                  Submit order <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </div>

          {error ? (
            <p className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          ) : null}
        </form>

        <p className="text-[11px] text-cl-gray-400 mt-6 inline-flex items-center gap-1">
          <Check className="w-3 h-3" /> Your order will be visible in your portal immediately.
          Payment processes via Green.Money (eCheck), typically 1–3 business days to clear.
        </p>
      </div>
    </main>
  );
}

function Field({
  name,
  label,
  required,
  autoComplete,
  defaultValue,
}: {
  name: string;
  label: string;
  required?: boolean;
  autoComplete?: string;
  defaultValue?: string;
}) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-1.5">
        {label}
      </span>
      <input
        type="text"
        name={name}
        required={required}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        className="w-full px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
      />
    </label>
  );
}

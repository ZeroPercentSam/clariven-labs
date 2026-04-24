'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Minus, Plus, ShoppingCart, Tag, Trash2, X } from 'lucide-react';
import { createClient } from '@/lib/supabase/client';
import { useCart } from '@/lib/cart/store';
import { cartLineKey, cartSubtotalCents } from '@/lib/cart/types';

type CodeState =
  | { status: 'idle' }
  | { status: 'checking' }
  | { status: 'invalid'; message: string }
  | { status: 'valid'; discountPct: number };

export default function CartPage() {
  const router = useRouter();
  const { cart, hydrated, setQuantity, removeLine, setAffiliateCode, clear } = useCart();
  const [codeInput, setCodeInput] = useState('');
  const [codeState, setCodeState] = useState<CodeState>({ status: 'idle' });

  // Keep text input in sync with saved code after hydration
  useEffect(() => {
    if (!hydrated) return;
    if (cart.affiliateCode) setCodeInput(cart.affiliateCode);
  }, [hydrated, cart.affiliateCode]);

  // Auto-validate a saved code once on hydration
  useEffect(() => {
    if (!hydrated || !cart.affiliateCode || codeState.status !== 'idle') return;
    void validateCode(cart.affiliateCode, { persistIfValid: false });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hydrated]);

  async function validateCode(code: string, opts: { persistIfValid: boolean }) {
    const clean = code.trim().toUpperCase();
    if (!clean) {
      setCodeState({ status: 'idle' });
      setAffiliateCode(null);
      return;
    }
    setCodeState({ status: 'checking' });
    const supabase = createClient();
    const { data, error } = await supabase.rpc('validate_affiliate_code', { p_code: clean });
    if (error || !data || data.length === 0) {
      setCodeState({ status: 'invalid', message: 'Could not check this code right now.' });
      return;
    }
    const row = data[0];
    if (!row.valid) {
      setCodeState({ status: 'invalid', message: 'That code isn\'t active.' });
      setAffiliateCode(null);
      return;
    }
    setCodeState({ status: 'valid', discountPct: Number(row.discount_pct) });
    if (opts.persistIfValid) setAffiliateCode(clean);
  }

  const subtotal = cartSubtotalCents(cart);
  const discountCents =
    codeState.status === 'valid' ? Math.floor((subtotal * codeState.discountPct) / 100) : 0;
  const totalCents = subtotal - discountCents;

  if (!hydrated) {
    return (
      <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
        <div className="max-w-5xl mx-auto h-64 rounded-xl bg-cl-gray-50 animate-pulse" />
      </main>
    );
  }

  if (cart.lines.length === 0) {
    return (
      <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
        <div className="max-w-3xl mx-auto text-center py-20">
          <ShoppingCart className="w-12 h-12 text-cl-gray-300 mx-auto mb-4" />
          <h1 className="text-3xl font-bold text-cl-navy mb-3">Your cart is empty</h1>
          <p className="text-cl-gray-500 mb-8">
            Browse our catalog to add peptides to your order.
          </p>
          <Link
            href="/products"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition"
          >
            Browse peptides
            <ArrowRight className="w-5 h-5" />
          </Link>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-white pt-[96px] pb-24 px-6">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold text-cl-navy mb-2">Your order</h1>
        <p className="text-cl-gray-500 text-sm mb-8">
          Review your items and apply an affiliate code. Payment is invoiced after you submit.
        </p>

        <div className="grid lg:grid-cols-[1fr_360px] gap-10">
          {/* Line items */}
          <div className="space-y-3">
            {cart.lines.map((line) => {
              const key = cartLineKey(line);
              const lineTotal = line.unitPriceCents * line.quantity;
              return (
                <div
                  key={key}
                  className="flex items-center gap-4 bg-white border border-cl-gray-200 rounded-xl p-4"
                >
                  <div className="flex-1 min-w-0">
                    <Link
                      href={`/products/${line.productSlug}`}
                      className="block text-cl-navy font-semibold hover:text-cl-teal truncate"
                    >
                      {line.productName}
                    </Link>
                    <div className="text-cl-gray-500 text-sm">{line.strengthLabel}</div>
                    <div className="text-cl-gray-500 text-sm mt-1">
                      ${(line.unitPriceCents / 100).toFixed(2)} each
                    </div>
                  </div>

                  <div className="flex items-center border border-cl-gray-200 rounded-lg overflow-hidden">
                    <button
                      type="button"
                      aria-label="Decrease"
                      onClick={() => setQuantity(key, line.quantity - 1)}
                      className="w-8 h-8 text-cl-gray-500 hover:bg-cl-gray-50"
                    >
                      <Minus className="w-4 h-4 mx-auto" />
                    </button>
                    <span className="w-10 text-center text-sm text-cl-navy">{line.quantity}</span>
                    <button
                      type="button"
                      aria-label="Increase"
                      onClick={() => setQuantity(key, line.quantity + 1)}
                      className="w-8 h-8 text-cl-gray-500 hover:bg-cl-gray-50"
                    >
                      <Plus className="w-4 h-4 mx-auto" />
                    </button>
                  </div>

                  <div className="w-24 text-right font-semibold text-cl-navy">
                    ${(lineTotal / 100).toFixed(2)}
                  </div>

                  <button
                    type="button"
                    onClick={() => removeLine(key)}
                    aria-label="Remove"
                    className="text-cl-gray-400 hover:text-red-500"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              );
            })}

            <div className="flex justify-end">
              <button
                type="button"
                onClick={clear}
                className="text-cl-gray-500 hover:text-red-500 text-sm"
              >
                Clear cart
              </button>
            </div>
          </div>

          {/* Summary */}
          <aside className="bg-cl-gray-50 border border-cl-gray-200 rounded-xl p-6 h-fit">
            <h2 className="text-cl-navy font-semibold text-lg mb-4">Summary</h2>

            <div className="space-y-2 text-sm mb-6">
              <div className="flex justify-between">
                <span className="text-cl-gray-500">Subtotal</span>
                <span className="text-cl-navy font-medium">
                  ${(subtotal / 100).toFixed(2)}
                </span>
              </div>
              {codeState.status === 'valid' ? (
                <div className="flex justify-between text-cl-teal">
                  <span>
                    Discount ({codeState.discountPct}% &middot; {cart.affiliateCode ?? codeInput})
                  </span>
                  <span>−${(discountCents / 100).toFixed(2)}</span>
                </div>
              ) : null}
              <div className="flex justify-between border-t border-cl-gray-200 pt-2">
                <span className="text-cl-navy font-semibold">Total</span>
                <span className="text-cl-navy font-semibold">
                  ${(totalCents / 100).toFixed(2)}
                </span>
              </div>
            </div>

            {/* Affiliate code */}
            <div className="mb-6">
              <label className="block text-xs font-semibold tracking-wider text-cl-gray-500 uppercase mb-2">
                <Tag className="inline w-3.5 h-3.5 mr-1 -mt-0.5" />
                Affiliate code
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={codeInput}
                  onChange={(e) => setCodeInput(e.target.value.toUpperCase())}
                  placeholder="ENTER CODE"
                  maxLength={32}
                  className="flex-1 px-3 py-2 rounded-lg border border-cl-gray-200 bg-white text-sm text-cl-navy focus:outline-none focus:border-cl-teal/60"
                />
                {cart.affiliateCode ? (
                  <button
                    type="button"
                    onClick={() => {
                      setCodeInput('');
                      setCodeState({ status: 'idle' });
                      setAffiliateCode(null);
                    }}
                    aria-label="Remove code"
                    className="px-3 rounded-lg border border-cl-gray-200 text-cl-gray-500 hover:bg-cl-gray-100"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => void validateCode(codeInput, { persistIfValid: true })}
                    disabled={codeState.status === 'checking' || codeInput.trim().length === 0}
                    className="px-4 rounded-lg bg-cl-navy text-white text-sm font-medium hover:bg-cl-navy/90 disabled:opacity-50"
                  >
                    {codeState.status === 'checking' ? 'Checking…' : 'Apply'}
                  </button>
                )}
              </div>
              {codeState.status === 'invalid' ? (
                <p className="mt-2 text-xs text-red-500">{codeState.message}</p>
              ) : codeState.status === 'valid' ? (
                <p className="mt-2 text-xs text-cl-teal">Applied.</p>
              ) : null}
            </div>

            <button
              type="button"
              onClick={() => router.push('/checkout')}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-cl-teal text-white font-semibold hover:bg-cl-teal-light transition"
            >
              Continue to checkout
              <ArrowRight className="w-5 h-5" />
            </button>
            <p className="text-[11px] text-cl-gray-400 mt-3 leading-relaxed">
              You'll receive a secure payment link by email once the order is submitted.
              ACH / eCheck only.
            </p>
          </aside>
        </div>
      </div>
    </main>
  );
}

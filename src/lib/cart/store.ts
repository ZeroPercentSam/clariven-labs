'use client';

import { useCallback, useEffect, useState } from 'react';
import type { Cart, CartLine } from './types';
import { EMPTY_CART, cartLineKey } from './types';

const STORAGE_KEY = 'cl_cart_v1';

function readStorage(): Cart {
  if (typeof window === 'undefined') return EMPTY_CART;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_CART;
    const parsed = JSON.parse(raw) as Cart;
    if (!parsed || !Array.isArray(parsed.lines)) return EMPTY_CART;
    return {
      lines: parsed.lines
        .filter(
          (l): l is CartLine =>
            !!l &&
            typeof l.productSlug === 'string' &&
            typeof l.productName === 'string' &&
            typeof l.strengthLabel === 'string' &&
            Number.isInteger(l.quantity) &&
            l.quantity > 0 &&
            Number.isInteger(l.unitPriceCents) &&
            l.unitPriceCents >= 0,
        )
        .slice(0, 50),
      affiliateCode: typeof parsed.affiliateCode === 'string' ? parsed.affiliateCode : null,
    };
  } catch {
    return EMPTY_CART;
  }
}

function writeStorage(cart: Cart) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    window.dispatchEvent(new CustomEvent('cl:cart-change'));
  } catch {
    /* quota or privacy mode — ignore */
  }
}

export function useCart() {
  const [cart, setCart] = useState<Cart>(EMPTY_CART);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setCart(readStorage());
    setHydrated(true);
    const onChange = () => setCart(readStorage());
    window.addEventListener('cl:cart-change', onChange);
    window.addEventListener('storage', onChange);
    return () => {
      window.removeEventListener('cl:cart-change', onChange);
      window.removeEventListener('storage', onChange);
    };
  }, []);

  const addLine = useCallback((line: CartLine) => {
    setCart((prev) => {
      const key = cartLineKey(line);
      const existing = prev.lines.findIndex((l) => cartLineKey(l) === key);
      let lines: CartLine[];
      if (existing >= 0) {
        lines = prev.lines.map((l, i) =>
          i === existing
            ? { ...l, quantity: Math.min(99, l.quantity + line.quantity), unitPriceCents: line.unitPriceCents }
            : l,
        );
      } else {
        lines = [...prev.lines, { ...line, quantity: Math.min(99, line.quantity) }];
      }
      const next = { ...prev, lines };
      writeStorage(next);
      return next;
    });
  }, []);

  const setQuantity = useCallback((key: string, quantity: number) => {
    setCart((prev) => {
      const lines = prev.lines
        .map((l) => (cartLineKey(l) === key ? { ...l, quantity: Math.min(99, Math.max(0, quantity)) } : l))
        .filter((l) => l.quantity > 0);
      const next = { ...prev, lines };
      writeStorage(next);
      return next;
    });
  }, []);

  const removeLine = useCallback((key: string) => {
    setCart((prev) => {
      const next = { ...prev, lines: prev.lines.filter((l) => cartLineKey(l) !== key) };
      writeStorage(next);
      return next;
    });
  }, []);

  const setAffiliateCode = useCallback((code: string | null) => {
    setCart((prev) => {
      const next = { ...prev, affiliateCode: code ? code.toUpperCase().trim() || null : null };
      writeStorage(next);
      return next;
    });
  }, []);

  const clear = useCallback(() => {
    writeStorage(EMPTY_CART);
    setCart(EMPTY_CART);
  }, []);

  return { cart, hydrated, addLine, setQuantity, removeLine, setAffiliateCode, clear };
}

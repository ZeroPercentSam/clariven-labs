export type CartLine = {
  productSlug: string;
  productName: string;
  strengthLabel: string;
  quantity: number;
  unitPriceCents: number;
};

export type Cart = {
  lines: CartLine[];
  affiliateCode: string | null;
};

export const EMPTY_CART: Cart = { lines: [], affiliateCode: null };

export function cartLineKey(line: Pick<CartLine, 'productSlug' | 'strengthLabel'>) {
  return `${line.productSlug}::${line.strengthLabel}`;
}

export function cartSubtotalCents(cart: Cart): number {
  return cart.lines.reduce((sum, l) => sum + l.unitPriceCents * l.quantity, 0);
}

export function cartCount(cart: Cart): number {
  return cart.lines.reduce((sum, l) => sum + l.quantity, 0);
}

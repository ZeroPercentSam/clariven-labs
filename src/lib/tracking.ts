const CARRIERS: Array<{
  match: RegExp;
  label: string;
  url: (n: string) => string;
}> = [
  {
    match: /\bups\b/i,
    label: 'UPS',
    url: (n) => `https://www.ups.com/track?tracknum=${encodeURIComponent(n)}`,
  },
  {
    match: /\bfedex\b/i,
    label: 'FedEx',
    url: (n) =>
      `https://www.fedex.com/fedextrack/?trknbr=${encodeURIComponent(n)}`,
  },
  {
    match: /\busps\b/i,
    label: 'USPS',
    url: (n) =>
      `https://tools.usps.com/go/TrackConfirmAction?tLabels=${encodeURIComponent(n)}`,
  },
  {
    match: /\bdhl\b/i,
    label: 'DHL',
    url: (n) =>
      `https://www.dhl.com/en/express/tracking.html?AWB=${encodeURIComponent(n)}`,
  },
];

export type TrackingLink = { carrier: string; number: string; url: string };

export function trackingUrl(
  carrier: string | null | undefined,
  number: string | null | undefined,
): TrackingLink | null {
  if (!carrier || !number) return null;
  const trimmed = number.trim();
  if (!trimmed) return null;
  for (const c of CARRIERS) {
    if (c.match.test(carrier)) {
      return { carrier: c.label, number: trimmed, url: c.url(trimmed) };
    }
  }
  return null;
}

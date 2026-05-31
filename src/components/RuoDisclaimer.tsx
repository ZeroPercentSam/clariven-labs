import { RUO_DISCLAIMER_SHORT, RUO_DISCLAIMER_LONG } from '@/lib/compliance/ruo';

/**
 * Persistent Research-Use-Only notice. `variant="short"` for cards / cart lines
 * / footers; `variant="long"` for the product detail page + checkout.
 */
export function RuoDisclaimer({
  variant = 'short',
  className = '',
}: {
  variant?: 'short' | 'long';
  className?: string;
}) {
  const text = variant === 'long' ? RUO_DISCLAIMER_LONG : RUO_DISCLAIMER_SHORT;
  return (
    <p
      className={`text-[11px] leading-relaxed text-cl-gray-500 ${className}`}
      role="note"
      data-ruo-disclaimer
    >
      <span className="font-semibold text-cl-gold">⚠ Research Use Only.</span> {text}
    </p>
  );
}

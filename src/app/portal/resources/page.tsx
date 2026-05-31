import { Download, FileText, FlaskConical, Package, ShieldCheck, Thermometer } from 'lucide-react';
import { getClientResources } from '@/lib/resources/queries';
import { RuoDisclaimer } from '@/components/RuoDisclaimer';

export const dynamic = 'force-dynamic';

// RUO Client Starter Kit — research-voice onboarding. No clinical/human-use,
// no patient/dose/administer/prescribe, no brand or clinical drug names. Frames
// everything as laboratory handling for research use only.
const STARTER_KIT = [
  {
    icon: FlaskConical,
    title: 'What Clariven supplies',
    body: 'Research-grade peptides for in-vitro and laboratory research use only. Every product is ≥98% purity, lyophilized, and ships with a batch-specific Certificate of Analysis (HPLC + mass spectrometry identity, endotoxin testing).',
  },
  {
    icon: Package,
    title: 'How ordering works',
    body: 'Browse the catalog, add the strengths you need to your order, and check out with your shipping address. Orders placed by 2 PM EST ship the same business day in temperature-controlled packaging, with carrier tracking posted to your portal.',
  },
  {
    icon: Thermometer,
    title: 'Handling & storage',
    body: 'Store lyophilized material per the storage temperature on each product page (typically 2–8 °C, or −20 °C for sensitive sequences). Reconstitute with bacteriostatic or sterile water using standard aseptic laboratory technique. Keep reconstituted material cold and protected from light.',
  },
  {
    icon: FileText,
    title: 'Documentation & lot tracking',
    body: 'Each shipment is traceable to its lot. Download the matching COA from the product page or request archived COAs from support. Retain lot numbers with your research records for reproducibility.',
  },
  {
    icon: ShieldCheck,
    title: 'Research-use-only compliance',
    body: 'All materials are sold strictly for laboratory research. They are not drugs, foods, cosmetics, or medical devices, and are not for human or animal consumption, diagnostic, or therapeutic use. By ordering you confirm your organization will use them accordingly.',
  },
];

function prettyBytes(n: number | null): string {
  if (!n) return '';
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / 1024 / 1024).toFixed(1)} MB`;
}

export default async function PortalResourcesPage() {
  const resources = await getClientResources(false);

  return (
    <div>
      <h1 className="text-2xl font-bold text-cl-navy mb-1">Resources</h1>
      <p className="text-cl-gray-500 text-sm mb-6">
        Your starter kit and reference documents for working with Clariven Labs.
      </p>

      {/* RUO Client Starter Kit */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-cl-gray-400 mb-3">
          Client Starter Kit
        </h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {STARTER_KIT.map((s) => (
            <div key={s.title} className="bg-white border border-cl-gray-200 rounded-xl p-5">
              <div className="flex items-center gap-2.5 mb-2">
                <s.icon className="w-5 h-5 text-cl-teal shrink-0" />
                <h3 className="text-sm font-semibold text-cl-navy">{s.title}</h3>
              </div>
              <p className="text-sm text-cl-gray-600 leading-relaxed">{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Downloadable documents */}
      <section className="mb-8">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-cl-gray-400 mb-3">
          Documents
        </h2>
        {resources.length === 0 ? (
          <div className="bg-white border border-cl-gray-200 rounded-xl p-6 text-sm text-cl-gray-500">
            No documents have been published yet. Your account team will add onboarding materials
            and reference sheets here.
          </div>
        ) : (
          <ul className="bg-white border border-cl-gray-200 rounded-xl divide-y divide-cl-gray-100 overflow-hidden">
            {resources.map((r) => (
              <li key={r.id} className="flex items-center gap-3 px-4 py-3">
                <FileText className="w-5 h-5 text-cl-teal shrink-0" />
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-medium text-cl-navy truncate">{r.title}</div>
                  {r.description ? (
                    <div className="text-xs text-cl-gray-500 truncate">{r.description}</div>
                  ) : null}
                </div>
                <span className="text-xs text-cl-gray-400 hidden sm:inline">
                  {prettyBytes(r.fileBytes)}
                </span>
                {r.signedUrl ? (
                  <a
                    href={r.signedUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cl-teal/30 text-cl-teal text-xs font-medium hover:bg-cl-teal/5"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-cl-gray-400">Unavailable</span>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>

      <RuoDisclaimer variant="long" className="rounded-lg bg-cl-gray-50 border border-cl-gray-200 p-4" />
    </div>
  );
}

import { getMyIntake } from '@/lib/clients/intake-queries';
import { COMPLIANCE_DOCS } from '@/lib/compliance/templates';
import { fillCompany } from '@/lib/compliance/fill';
import { ComplianceDocs } from '@/components/clients/ComplianceDocs';

export const metadata = { title: 'Compliance documents — Clariven Labs' };
export const dynamic = 'force-dynamic';

export default async function PortalCompliancePage() {
  const intake = await getMyIntake();
  const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const company = intake
    ? {
        legal_name: intake.legal_name,
        address_line1: intake.address_line1,
        address_line2: intake.address_line2,
        city: intake.city,
        state: intake.state,
        postal_code: intake.postal_code,
        country: intake.country,
        domain: intake.desired_domain,
      }
    : null;

  const docs = COMPLIANCE_DOCS.map((d) => ({
    slug: d.slug,
    title: d.title,
    kind: d.kind,
    body: d.kind === 'template' ? fillCompany(d.body, company, today) : d.body,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-cl-navy">Compliance documents</h1>
        <p className="text-sm text-cl-gray-500 mt-1">
          RUO policy templates pre-filled with your business details (from your onboarding intake),
          plus your counsel compliance guide. Copy or download to publish on your site. Any
          remaining <span className="font-mono text-cl-gray-600">[BRACKETED]</span> fields need your
          input. These are templates, not legal advice — review with counsel before publishing.
        </p>
      </div>
      <ComplianceDocs docs={docs} />
    </div>
  );
}

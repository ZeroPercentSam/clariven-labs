import 'server-only';
import { appendFile } from 'node:fs/promises';

// DocuSign agreement-send seam. Mock-aware like the GBP/Twilio integrations
// (invariant #5): when DOCUSIGN_MOCK==='true' or no integration key is set, the
// send is a no-op that logs to .docusign-log.jsonl and returns a stub envelope
// id, so the membership flow ships before live creds exist. Flip to live by
// implementing the JWT-grant + Envelopes::create branch and unsetting the mock.

export type AgreementKind = 'consulting' | 'brokering';

export type SendAgreementInput = {
  toEmail: string;
  toName: string;
  agreement: AgreementKind;
};

export type SendAgreementResult =
  | { ok: true; envelopeId: string; mock: boolean }
  | { ok: false; error: string };

function mockMode(): boolean {
  return process.env.DOCUSIGN_MOCK === 'true' || !process.env.DOCUSIGN_INTEGRATION_KEY;
}

/** healthz reporting: mock | configured | missing. */
export function docusignStatus(): 'mock' | 'configured' | 'missing' {
  if (process.env.DOCUSIGN_MOCK === 'true') return 'mock';
  return process.env.DOCUSIGN_INTEGRATION_KEY ? 'configured' : 'missing';
}

export async function sendAgreement(input: SendAgreementInput): Promise<SendAgreementResult> {
  if (mockMode()) {
    const envelopeId = `mock_${input.agreement}_${Date.now().toString(36)}`;
    try {
      await appendFile(
        '.docusign-log.jsonl',
        JSON.stringify({ ts: new Date().toISOString(), ...input, envelopeId }) + '\n',
      );
    } catch (e) {
      // Serverless FS is read-only outside /tmp — best-effort, never throw.
      console.warn('[docusign:mock] log write failed', e instanceof Error ? e.message : e);
    }
    console.info('[docusign:mock]', { to: input.toEmail, agreement: input.agreement, envelopeId });
    return { ok: true, envelopeId, mock: true };
  }

  // ponytail: live DocuSign eSignature send goes here once creds + template ids
  // exist (JWT OAuth grant → Envelopes::create from a DOCUSIGN_*_TEMPLATE_ID
  // against DOCUSIGN_BASE_URL). Until then mockMode() short-circuits above.
  return { ok: false, error: 'DocuSign live mode not configured' };
}

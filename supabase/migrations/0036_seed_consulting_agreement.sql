-- Seed the Consulting Services Agreement (v1) clients e-sign in-portal.
-- This is a faithful condensed rendering of the standard Clariven Consulting
-- Services Agreement (all 14 sections + material terms). Per §13.7, the full
-- executed agreement/PDF governs; typing the signer's legal name in the portal
-- constitutes an E-SIGN signature. Counsel can replace body_md with the exact
-- verbatim text via an admin edit or a follow-up migration at any time.
-- Bracket placeholders ([Client Legal Name], [State], [Client Address],
-- [Effective Date]) are filled at render from the client's intake.
-- Brokering agreement is NOT seeded yet (pending Alletia).
insert into public.client_agreements (slug, label, body_md)
select 'consulting', 'Consulting Services Agreement v1', $body$CLARIVEN LABS LLC
1309 Coffeen Avenue, Suite 1200, Sheridan, Wyoming 82801

CONSULTING SERVICES AGREEMENT

This Consulting Services Agreement (this "Agreement") is entered into as of [Effective Date] (the "Effective Date") by and between Clariven Labs LLC, a Wyoming limited liability company with its principal address at 1309 Coffeen Avenue, Suite 1200, Sheridan, Wyoming 82801 (the "Consultant"), and [Client Legal Name], a [State] [entity type] with its principal address at [Client Address] (the "Client"). Consultant and Client are each referred to as a "Party" and collectively as the "Parties".

RECITALS
WHEREAS, Consultant provides business consulting and advisory services in the areas of product sourcing, payment processing, third-party logistics, and advertising and marketing strategy; WHEREAS, Client desires to engage Consultant to provide such services; and WHEREAS, the Parties wish to set forth the terms under which Consultant will provide the services. NOW, THEREFORE, the Parties agree as follows:

1. ENGAGEMENT AND SCOPE OF SERVICES
1.1 Engagement. Client engages Consultant to provide the consulting and advisory services described in Section 1.2 (the "Services"), in two phases: (i) the initial onboarding/organization work covered by the Initial Engagement Fee (the "Initial Phase"); and (ii) ongoing consulting performed during any Active Month (the "Ongoing Services").
1.2 Scope of Services. (a) Direct Product Sourcing — identification, evaluation, and vetting of suppliers/manufacturers; review of credentials and COAs where applicable; supply chain mapping; supplier introductions. Consultant shall not negotiate or execute supplier agreements on Client's behalf. (b) Payment Processing — evaluation/selection of processors; introductions to merchant providers and ACH/wire/digital-asset rails; review of underwriting materials; chargeback protocols. (c) Third-Party Logistics and Shipping — identification/evaluation of 3PL, warehousing, fulfillment; cold-chain evaluation; carrier-agreement and rate-negotiation support; labeling/packaging review. (d) Advertising and Marketing Recommendations — channel/platform selection (Meta, Google, TikTok, programmatic, affiliate, influencer); creative/landing-page review against platform policy; substantiation file coordination.
1.3 Initial Phase. Covers Consultant's onboarding work, fully covered by the Initial Engagement Fee; no Monthly Retainer is owed for Initial-Phase-only months.
1.5 Services Not Included. No (i) legal advice/practice of law; (ii) accounting/tax/audit; (iii) medicine, pharmacy, nursing, or other licensed health profession; (iv) brokering/sale of securities; (v) direct negotiation/execution of contracts on Client's behalf.

2. TERM AND TERMINATION
2.1 Term. Commences on the Effective Date and continues until terminated. 2.2 Termination for Convenience. Either Party on thirty (30) days' written notice. 2.3 Termination for Cause. Immediately for uncured material breach (10 business days), insolvency, or cessation of business; a Section 14 breach is a material breach permitting immediate termination without cure. 2.4 Effect. Accrued fees due within 30 days; the Initial Engagement Fee is non-refundable and non-proratable; Sections 4, 7, 8, 10, 11, 12, 13, and 14 survive.

3. FEES AND PAYMENT
3.1 Initial Engagement Fee. One-time fee of Twelve Thousand Five Hundred Dollars ($12,500.00), due upon execution, non-refundable and earned upon receipt. 3.2 Monthly Retainer; Active Months. Following the Initial Phase, Client may elect Ongoing Services month-to-month; each elected month (an "Active Month") carries a monthly retainer of Five Thousand Dollars ($5,000.00), payable in advance, non-refundable. 3.3 No Obligation to Elect. Non-election does not terminate the Agreement; Section 14 remains in force. 3.5 Retainer Time. Covers up to ten (10) hours of Ongoing Services per Active Month; excess billed at Five Hundred Dollars ($500.00) per hour. 3.7 Invoicing. Invoices due upon receipt, past due after 30 days, 1.5%/month interest. 3.8 Suspension for Non-Payment after 30 days past due on 10 days' notice.

4. ACKNOWLEDGMENT OF LIMITATIONS; NOT LEGAL OR PROFESSIONAL ADVICE
4.1 Business consulting/advisory services only; Consultant is not a law firm, accounting firm, medical practice, or pharmacy. 4.2 Client is solely responsible for engaging its own independent legal, accounting, tax, regulatory, and other licensed professionals; any Consultant suggestion of a professional is informational only, not a referral or endorsement. 4.3 Client shall not rely on the Services as the sole basis for any legal/regulatory/tax/licensure determination. 4.4 Consultant disclaims warranties as to legal/regulatory/licensing status and as to any specific business result. 4.5 Client retains exclusive responsibility for all aspects of its operations and the legality of its products, marketing, payment processing, and logistics.

5. CONSULTANT OBLIGATIONS — professional/workmanlike performance; may assign to qualified personnel; complies with applicable law.
6. CLIENT OBLIGATIONS — cooperation/true information; exclusive decision authority; designate an authorized representative; conduct business and implement recommendations in compliance with law.

7. CONFIDENTIALITY. Mutual confidentiality of non-public information (business plans, supplier relationships, vendor lists, pricing, financials, marketing strategies, customer lists). 7.2 Consultant's supplier lists, vendor introductions, negotiated pricing, methodologies, and frameworks are trade secrets under the California Uniform Trade Secrets Act and the federal Defend Trade Secrets Act. 7.5 Survives five (5) years; trade secrets for so long as they remain trade secrets.

8. WORK PRODUCT AND INTELLECTUAL PROPERTY. 8.1 Client-specific Deliverables are work made for hire upon full payment. 8.2 Consultant retains its Pre-Existing Materials (templates, methodologies, vendor lists, supplier introductions); a non-exclusive perpetual license for embedded Pre-Existing Materials is granted to Client, subject to Section 14. 8.3 Deliverables are for Client's exclusive use.

9. INDEPENDENT CONTRACTOR STATUS. Consultant is an independent contractor; no partnership/agency/employment. 9.2 Consultant may serve other clients, including competitors. 9.3 Consultant responsible for its own taxes/benefits.

10. LIMITATION OF LIABILITY. 10.1 Except for gross negligence/willful misconduct, breach of Section 7, indemnification under Section 11, or Client's Section 14 obligations, Consultant's aggregate liability shall not exceed the total fees paid in the 12 months preceding the claim. 10.2 No indirect, incidental, special, consequential, or punitive damages.

11. INDEMNIFICATION. 11.1 Client indemnifies Consultant for claims arising from Client's products/operations, breach, violation of law, or implementation decisions, except to the extent of Consultant's gross negligence/willful misconduct. 11.2 Consultant indemnifies Client for its gross negligence/willful misconduct, subject to Section 10.1.

12. DISPUTE RESOLUTION. 12.1 Governing law: California. 12.2 Good-faith informal resolution (30 days). 12.3 Binding arbitration administered by JAMS in Orange County, California, before a single arbitrator. 12.4 Equitable relief available for Sections 7, 8, and 14. 12.5 Prevailing party recovers reasonable attorneys' fees. 12.6 Jury trial waived.

13. GENERAL PROVISIONS. 13.1 Entire agreement. 13.2 Amendment in writing signed by both Parties. 13.4 No assignment without consent (except to a successor). 13.6 Severability with reformation. 13.7 Counterparts and Electronic Signatures — electronic signatures (including PDF and DocuSign) are valid; typing the signer's legal name in the Client portal and submitting the agreement constitutes a valid electronic signature under the E-SIGN Act (15 U.S.C. Sections 7001 et seq.) and applicable state law. 13.8 Force majeure. 13.10 No third-party beneficiaries.

14. EXCLUSIVITY, ORDERING, AND NON-CIRCUMVENTION
14.1 Exclusivity During Term. Consultant is Client's exclusive provider for the Section 1.2 Services categories throughout the Term, whether or not an Active Month. Without Consultant's consent, Client shall not engage another consultant/agency/broker for substantially similar services, build in-house capability to replace Consultant, or contract a third-party intermediary to a Consultant-Sourced Vendor.
14.2 Consultant-Sourced Vendor — any supplier, manufacturer, packager, payment processor/facilitator, banking partner, 3PL/fulfillment partner, carrier, advertising platform, agency, influencer network, affiliate program, or other vendor identified, introduced, sourced, evaluated, recommended, or negotiated with by Consultant, or made known to Client through Consultant's Confidential Information or Pre-Existing Materials.
14.3 Ordering Through Consultant. During the Term, all orders, supply commitments, payment-processing and logistics arrangements, advertising buys, and other transactions with any Consultant-Sourced Vendor shall be placed through, or with the prior knowledge and operational coordination of, Consultant. Client shall not bypass Consultant.
14.4 Recurring Order Commitments. Client maintains recurring/replenishment orders with Consultant-Sourced Vendors consistent with good-faith operations and shall not restructure them to avoid Consultant's involvement or fees.
14.5 Consultant Commissions/Rebates/Overrides. Consultant may receive commissions, rebates, overrides, finder's/referral fees, or marketing development funds from Consultant-Sourced Vendors based on Client's purchases; such compensation is in addition to the Initial Engagement Fee and Monthly Retainer.
14.6 No Side Arrangements that exclude Consultant or reduce its compensation.
14.7 Non-Circumvention. During the Term and for twelve (12) months after termination (the "Restricted Period"), Client shall not circumvent Consultant with Consultant-Sourced Vendors, solicit Consultant's personnel, or use Consultant's Confidential Information/Pre-Existing Materials to replicate the Services.
14.8 Carve-Outs for pre-existing relationships documented on Schedule A and for publicly available relationships engaged independently.
14.9 Reporting. Monthly report (within 15 days) of orders with Consultant-Sourced Vendors and material vendor changes, continuing through the Restricted Period.
14.10 Liquidated Damages for breach of 14.1/14.3/14.4/14.6/14.7: the greatest of (i) One Hundred Thousand Dollars ($100,000.00); (ii) two (2) times amounts paid to Consultant in the preceding 12 months; or (iii) the Initial Engagement Fee — a reasonable estimate, not a penalty.
14.11 Equitable Relief available without bond. 14.12 Blue-pencil reformation. 14.13 No restraint on lawful trade outside the Services or non-Consultant-Sourced Vendors.

IN WITNESS WHEREOF, the Parties have executed this Agreement as of the Effective Date.

CONSULTANT: CLARIVEN LABS LLC — Victor Bartley, Managing Member
CLIENT: [Client Legal Name] — signed electronically in the Clariven portal by the authorized signatory named below.

NOTE: This is the standard Clariven Labs Consulting Services Agreement. Bracketed fields are completed from your onboarding intake. The full executed PDF governs; by typing your legal name and submitting, you adopt this as your electronic signature under the E-SIGN Act.$body$
where not exists (select 1 from public.client_agreements where slug = 'consulting');

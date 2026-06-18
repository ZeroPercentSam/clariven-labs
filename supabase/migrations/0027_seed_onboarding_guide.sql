-- 0027_seed_onboarding_guide.sql
-- The canonical Clariven Labs onboarding blueprint — authored 1:1 from the guide
-- (New Brand · Onboarding Guide). 9 phases → 21 steps → ~120 checklist items.
-- Content only, no DDL. Idempotent (re-runnable): phases/steps upsert by id;
-- items upsert by (step_id, sort_order), so guide-text corrections re-apply
-- cleanly. owner_role marks who drives each step (client / Clariven team /
-- web_dev / legal / marketing / threepl). RUO-clean — no clinical language.

-- ── Phases ──────────────────────────────────────────────────────────────────
insert into public.onboarding_phases (id, title, subtitle, sort_order) values
  (1, 'Business Formation & Contracting', 'Stand up the legal entity and execute the partnership', 1),
  (2, 'Technology Infrastructure',        'Domains, email, and the e-commerce platform',           2),
  (3, 'Compliance & Legal',               'Policies, disclosures, and the website compliance review', 3),
  (4, 'Fulfillment & Logistics',          'Kentro 3PL account and product selection',              4),
  (5, 'Product Setup & Labeling',         'Product data, QR codes, labels, and printing',          5),
  (6, 'Payment Infrastructure',           'Merchant processing and gateway integration',           6),
  (7, 'Marketing & Customer Acquisition', 'Agencies, email platform, and campaign planning',       7),
  (8, 'Staffing & Operations',            'Hire the team and run end-to-end testing',              8),
  (9, 'Launch Readiness',                 'Final go-live checklist',                               9)
on conflict (id) do update
  set title = excluded.title, subtitle = excluded.subtitle,
      sort_order = excluded.sort_order, active = true;

-- ── Steps ───────────────────────────────────────────────────────────────────
insert into public.onboarding_steps (id, phase_id, title, owner_role, sort_order, description) values
  (1,  1, 'Execute Partnership Agreement', 'client',    1, 'Review and sign all Clariven Labs agreements and submit executed contracts.'),
  (2,  1, 'Submit Initial Funding',        'client',    2, 'Wire startup funds per the agreement and establish your operating budget.'),
  (3,  1, 'Establish Legal Entity',        'client',    3, 'Form the company, obtain an EIN, and open a business bank account.'),
  (4,  2, 'Secure Digital Assets',         'web_dev',   1, 'Work with your web development team to secure the domain, DNS, and business email.'),
  (5,  2, 'Build E-Commerce Platform',     'web_dev',   2, 'Stand up the storefront, accounts, catalog, and notifications.'),
  (6,  3, 'Obtain Compliance Documentation','legal',    1, 'Coordinate with legal counsel to obtain all required policies and disclosures.'),
  (7,  3, 'Website Compliance Review',     'web_dev',   2, 'Verify policies, consent, security, and accessibility are live. Compliance disclosures must be visible throughout the website, and an age gate must be active via email, SMS, or another OTP verification process.'),
  (8,  4, 'Create Kentro 3PL Account',     'client',    1, 'Register and self-onboard with Kentro. Ensure the account connects to the e-commerce platform and billing information is current.'),
  (9,  4, 'Product Selection',             'clariven',  2, 'Meet with the Clariven Labs team to review available products and select your launch lineup.'),
  (10, 5, 'Product Data Collection',       'client',    1, 'Gather everything required for Product Detail Pages (PDPs).'),
  (11, 5, 'Generate QR Codes',             'web_dev',   2, 'Create and wire QR codes to verification pages and COAs.'),
  (12, 5, 'Create Product Labels',         'clariven',  3, 'Internal team designs and verifies label artwork.'),
  (13, 5, 'Printing & Procurement',        'clariven',  4, 'Send approved artwork to Harut Printing Services; purchase and ship labels to Kentro.'),
  (14, 6, 'Payment Processing',            'client',    1, 'Apply for merchant processing with an approved provider.'),
  (15, 6, 'Payment Gateway Integration',   'web_dev',   2, 'Connect the processor, configure checkout, and test transactions.'),
  (16, 7, 'Marketing Agency Setup',        'marketing', 1, 'Identify and engage marketing partners; create accounts with each agency.'),
  (17, 7, 'Email Marketing Platform',      'marketing', 2, 'Select an email capture platform (e.g. Klaviyo, Mailchimp, ActiveCampaign) and configure it.'),
  (18, 7, 'Campaign Planning',             'marketing', 3, 'Plan the launch, promotional, and retention campaigns.'),
  (19, 8, 'Team Development',              'client',    1, 'Hire and onboard key personnel.'),
  (20, 8, 'Operational Testing',           'client',    2, 'Complete end-to-end testing across the full order lifecycle.'),
  (21, 9, 'Final Launch Checklist',        'clariven',  1, 'Confirm every readiness criterion before go-live.')
on conflict (id) do update
  set phase_id = excluded.phase_id, title = excluded.title, owner_role = excluded.owner_role,
      sort_order = excluded.sort_order, description = excluded.description, active = true;

-- ── Items (the □ checklist lines) ────────────────────────────────────────────
insert into public.onboarding_items (step_id, label, sort_order, help_text, category) values
  -- Step 1 · Execute Partnership Agreement
  (1, 'Review and sign all Clariven Labs agreements', 1, null, null),
  (1, 'Complete necessary legal documentation',       2, null, null),
  (1, 'Submit executed contracts',                    3, null, null),
  -- Step 2 · Submit Initial Funding
  (2, 'Wire startup funds according to agreement',     1, null, null),
  (2, 'Confirm receipt of funds with Clariven Labs',   2, null, null),
  (2, 'Establish startup operating budget',            3, null, null),
  -- Step 3 · Establish Legal Entity
  (3, 'Create LLC or Corporation',                     1, null, null),
  (3, 'Obtain EIN',                                    2, null, null),
  (3, 'Open business bank account',                    3, null, null),
  (3, 'Obtain state registrations as required',        4, null, null),
  (3, 'Gather all formation documents',                5, 'Articles of Organization, EIN Letter, Operating Agreement, Business License(s).', null),
  -- Step 4 · Secure Digital Assets
  (4, 'Secure company domain name',                    1, null, null),
  (4, 'Configure DNS records',                         2, null, null),
  (4, 'Set up business email accounts',                3, 'e.g. support@yourcompany.com, billing@yourcompany.com, plus any employee emails. A dedicated support email must be created and monitored.', null),
  (4, 'Publish support contact information on website',4, null, null),
  -- Step 5 · Build E-Commerce Platform
  (5, 'Stand up e-commerce website',                   1, null, null),
  (5, 'Configure customer account page',               2, null, null),
  (5, 'Configure product catalog',                     3, null, null),
  (5, 'Configure inventory management',                4, null, null),
  (5, 'Configure customer support tools',              5, null, null),
  (5, 'Configure email notifications',                 6, null, null),
  (5, 'Configure mobile responsiveness',               7, null, null),
  (5, 'Configure analytics tracking',                  8, null, null),
  -- Step 6 · Obtain Compliance Documentation
  (6, 'Terms & Conditions',                            1, null, null),
  (6, 'Privacy Policy',                                2, null, null),
  (6, 'Shipping Policy',                               3, null, null),
  (6, 'Return Policy',                                 4, null, null),
  (6, 'Disclaimer language',                           5, null, null),
  (6, 'Product compliance documents',                  6, null, null),
  (6, 'Customer consent language',                     7, null, null),
  -- Step 7 · Website Compliance Review
  (7, 'Privacy Policy published',                      1, null, null),
  (7, 'Terms of Service published',                    2, null, null),
  (7, 'Cookie consent implemented',                    3, null, null),
  (7, 'SSL certificate active',                        4, null, null),
  (7, 'HIPAA-compliant forms where required',          5, null, null),
  (7, 'Data security standards implemented',           6, null, null),
  (7, 'ADA accessibility review completed',            7, null, null),
  -- Step 8 · Create Kentro 3PL Account
  (8, 'Register with Kentro',                          1, null, null),
  (8, 'Complete self-onboarding process',              2, null, null),
  (8, 'Submit company information',                     3, null, null),
  (8, 'Establish shipping profiles',                   4, null, null),
  (8, 'Establish receiving procedures',                5, null, null),
  (8, 'Configure inventory management settings',       6, null, null),
  (8, 'Review fulfillment service levels',             7, null, null),
  -- Step 9 · Product Selection
  (9, 'Research products',                             1, null, null),
  (9, 'Confirm pricing for each selected product',     2, null, null),
  (9, 'Confirm MOQ requirements',                      3, null, null),
  (9, 'Generate QR codes for each compound',           4, null, null),
  -- Step 10 · Product Data Collection
  (10, 'Product name',                                 1, null, null),
  (10, 'Product description',                          2, null, null),
  (10, 'Research information and documentation',       3, null, null),
  (10, 'Storage requirements',                         4, null, null),
  (10, 'Compliance language',                          5, null, null),
  (10, 'Product images',                               6, null, null),
  (10, 'Certificates of Analysis (COAs)',              7, null, null),
  (10, 'QR code links',                                8, null, null),
  -- Step 11 · Generate QR Codes
  (11, 'Create QR codes for each product',             1, null, null),
  (11, 'Connect QR codes to product verification pages',2, null, null),
  (11, 'Connect QR codes to COAs',                     3, null, null),
  (11, 'Add QR codes to website',                      4, null, null),
  (11, 'Add QR codes to label artwork',                5, null, null),
  -- Step 12 · Create Product Labels
  (12, 'Generate label designs',                       1, null, null),
  (12, 'Verify regulatory language',                   2, null, null),
  (12, 'Verify QR code placement',                     3, null, null),
  (12, 'Verify QR code functionality with 3PL',        4, null, null),
  (12, 'Verify SKU placement',                         5, null, null),
  (12, 'Approve final artwork',                        6, null, null),
  -- Step 13 · Printing & Procurement
  (13, 'Request label quotation',                      1, 'Send approved artwork to Harut, Printing Services.', null),
  (13, 'Request production timeline',                  2, null, null),
  (13, 'Purchase labels',                              3, null, null),
  (13, 'Ship labels directly to Kentro 3PL facility',  4, null, null),
  (13, 'Confirm receipt',                              5, null, null),
  -- Step 14 · Payment Processing
  (14, 'Business entity established',                  1, null, null),
  (14, 'EIN obtained',                                 2, null, null),
  (14, 'Bank account active',                          3, null, null),
  (14, 'Website operational',                          4, null, null),
  (14, 'Compliance documents published',               5, null, null),
  -- Step 15 · Payment Gateway Integration
  (15, 'Connect payment processor',                    1, null, null),
  (15, 'Configure checkout',                           2, null, null),
  (15, 'Configure fraud controls',                     3, null, null),
  (15, 'Test transactions',                            4, null, null),
  (15, 'Verify connection and reporting to Kentro',    5, null, null),
  -- Step 16 · Marketing Agency Setup
  (16, 'Paid Media Agency',                            1, null, null),
  (16, 'SEO Agency',                                   2, null, null),
  (16, 'Creative Agency',                              3, null, null),
  (16, 'Social Media Agency',                          4, null, null),
  (16, 'Email Marketing Agency',                       5, null, null),
  -- Step 17 · Email Marketing Platform
  (17, 'Create account',                               1, null, null),
  (17, 'Configure capture forms',                      2, null, null),
  (17, 'Configure welcome sequence',                   3, null, null),
  (17, 'Configure abandoned cart sequence',            4, null, null),
  (17, 'Configure promotional campaigns',              5, null, null),
  (17, 'Configure customer segmentation',              6, null, null),
  -- Step 18 · Campaign Planning
  (18, 'Welcome campaigns',                            1, null, null),
  (18, 'Product launch campaigns',                     2, null, null),
  (18, 'Promotional campaigns',                        3, null, null),
  (18, 'Retention campaigns',                          4, null, null),
  -- Step 19 · Team Development
  (19, 'Customer Support Representative',              1, null, null),
  (19, 'Operations Manager',                           2, null, null),
  (19, 'Marketing Coordinator',                        3, null, null),
  (19, 'Technical Support Specialist',                 4, null, null),
  -- Step 20 · Operational Testing
  (20, 'Website functionality',                        1, null, null),
  (20, 'Product ordering',                             2, null, null),
  (20, 'Payment processing',                           3, null, null),
  (20, 'Order routing',                                4, null, null),
  (20, 'Fulfillment workflow',                         5, null, null),
  (20, 'Shipping notifications',                       6, null, null),
  (20, 'Customer support response process',            7, null, null),
  (20, 'Inventory synchronization',                    8, null, null),
  -- Step 21 · Final Launch Checklist (grouped by category)
  (21, 'LLC active',                                   1,  null, 'Business'),
  (21, 'Banking established',                          2,  null, 'Business'),
  (21, 'Contracts complete',                           3,  null, 'Business'),
  (21, 'Website live',                                 4,  null, 'Technology'),
  (21, 'Emails active',                                5,  null, 'Technology'),
  (21, 'Support system operational',                   6,  null, 'Technology'),
  (21, 'Legal documents published',                    7,  null, 'Compliance'),
  (21, 'Compliance review complete',                   8,  null, 'Compliance'),
  (21, 'Kentro connected',                             9,  null, 'Operations'),
  (21, 'Inventory received',                           10, null, 'Operations'),
  (21, 'Labels available for application',             11, null, 'Operations'),
  (21, 'Agency accounts established',                  12, 'Proper ad accounts set up.', 'Marketing'),
  (21, 'Email platform active',                        13, null, 'Marketing'),
  (21, 'Campaigns scheduled',                          14, null, 'Marketing'),
  (21, 'Support team hired',                           15, null, 'Staffing'),
  (21, 'Operations team trained',                      16, null, 'Staffing'),
  (21, 'Processor approved',                           17, null, 'Payments'),
  (21, 'Transactions tested',                          18, null, 'Payments')
on conflict (step_id, sort_order) do update
  set label = excluded.label, help_text = excluded.help_text,
      category = excluded.category, active = true;

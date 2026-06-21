-- 0030: Remove onboarding checklist items Sam crossed out (screenshots 2026-06-20).
-- Matched by phase+step+label so this is replay-safe regardless of serial ids.
-- The FK client_item_status.item_id -> onboarding_items is ON DELETE CASCADE, so
-- existing clients' per-item status rows are removed automatically and the
-- client_onboarding_progress counts/percentages stay correct. start_client_onboarding
-- seeds from onboarding_items, so removed items are not re-seeded for new clients.
delete from public.onboarding_items i
using public.onboarding_steps s, public.onboarding_phases p
where i.step_id = s.id
  and s.phase_id = p.id
  and (
       (p.title = 'Compliance & Legal'      and s.title = 'Website Compliance Review'
          and i.label in ('HIPAA-compliant forms where required',
                          'ADA accessibility review completed'))
    or (p.title = 'Fulfillment & Logistics' and s.title = 'Create Kentro 3PL Account'
          and i.label in ('Establish shipping profiles',
                          'Establish receiving procedures',
                          'Review fulfillment service levels'))
    or (p.title = 'Fulfillment & Logistics' and s.title = 'Product Selection'
          and i.label = 'Research products')
  );

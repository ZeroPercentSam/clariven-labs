-- 0034_brokering_agreement_item.sql
-- Phase 4: surface the second (peptide brokering) agreement as a checklist item
-- in the existing "Execute Partnership Agreement" step. The DocuSign seam already
-- supports the 'brokering' agreement kind; this makes the two-agreement flow
-- visible + tracked now, before Alletia delivers the document.

insert into public.onboarding_items (step_id, label, sort_order, help_text, category) values
  (1, 'Sign the peptide brokering agreement', 4,
      'Provided separately by Clariven once available.', null)
on conflict (step_id, sort_order) do update
  set label = excluded.label, help_text = excluded.help_text, active = true;

-- Back-fill for existing onboarding clients.
insert into public.client_item_status (organization_id, item_id)
  select co.organization_id, i.id
    from public.client_onboarding co
    cross join public.onboarding_items i
   where i.step_id = 1 and i.sort_order = 4 and i.active
on conflict (organization_id, item_id) do nothing;

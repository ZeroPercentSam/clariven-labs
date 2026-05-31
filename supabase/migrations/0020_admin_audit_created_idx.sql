-- Phase 5 c1 — /admin/audit log viewer.
-- The viewer orders by created_at DESC (unfiltered "latest N") and supports a
-- created_at date-range filter. The two existing indexes lead with
-- (actor_id) / (target_type, target_id), so neither serves a pure created_at
-- sort or a date-window scan. Add a dedicated descending created_at index.
-- Additive, index-only: no table/RLS/type changes.
create index if not exists admin_audit_created_idx
  on public.admin_audit_log (created_at desc);

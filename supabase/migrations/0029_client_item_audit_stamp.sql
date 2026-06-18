-- 0029_client_item_audit_stamp.sql
-- Harden stamp_item_done so done_by/done_at can never be forged by a client.
--
-- The 0026 version only acted on a status TRANSITION (into/out of 'done'). A
-- raw PostgREST update on an already-'done' row ({status:'done', done_by:<other
-- uuid>}) hit neither branch, so the client-supplied done_by passed through. Now
-- the trigger is authoritative for EVERY update: a transition into 'done' stamps
-- the effective user + now(); staying 'done' preserves the ORIGINAL audit pair
-- (ignoring any client-supplied values); leaving 'done' clears both.
create or replace function public.stamp_item_done() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  new.updated_at := now();
  if new.status = 'done' and old.status is distinct from 'done' then
    -- transition into done → record who/when
    new.done_by := public.effective_user_id();
    new.done_at := now();
  elsif new.status = 'done' then
    -- already done → keep the original attribution; never trust client input
    new.done_by := old.done_by;
    new.done_at := old.done_at;
  else
    -- not done → no attribution
    new.done_by := null;
    new.done_at := null;
  end if;
  return new;
end $$;

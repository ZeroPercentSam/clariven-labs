/**
 * Consulting client onboarding — client-safe constants + zod schemas. Imported
 * by BOTH server actions and React (client) components, so this file MUST NOT
 * import any server-only module (no next/headers, no supabase server client,
 * no node:crypto). Mirrors lib/rep/constants.ts.
 */
import { z } from 'zod';

// ── Engagement status (the per-client header) ────────────────────────────────
export const ENGAGEMENT_STATUSES = ['onboarding', 'launch_ready', 'live', 'paused'] as const;
export type EngagementStatus = (typeof ENGAGEMENT_STATUSES)[number];

export const ENGAGEMENT_STATUS_LABELS: Record<EngagementStatus, string> = {
  onboarding: 'Onboarding',
  launch_ready: 'Launch ready',
  live: 'Live',
  paused: 'Paused',
};

// Tailwind classes for the status pill (clinical-premium tokens in globals.css).
export const ENGAGEMENT_STATUS_STYLES: Record<EngagementStatus, string> = {
  onboarding: 'bg-cl-blue/10 text-cl-blue ring-1 ring-cl-blue/20',
  launch_ready: 'bg-cl-gold/15 text-cl-navy ring-1 ring-cl-gold/30',
  live: 'bg-emerald-500/10 text-emerald-700 ring-1 ring-emerald-600/20',
  paused: 'bg-cl-gray-200 text-cl-gray-600 ring-1 ring-cl-gray-300',
};

// ── Item status (the source of truth for completion) ─────────────────────────
export const ITEM_STATUSES = ['pending', 'in_progress', 'done', 'blocked', 'na'] as const;
export type ItemStatus = (typeof ITEM_STATUSES)[number];

export const ITEM_STATUS_LABELS: Record<ItemStatus, string> = {
  pending: 'To do',
  in_progress: 'In progress',
  done: 'Done',
  blocked: 'Blocked',
  na: 'N/A',
};

// ── Owner roles (who drives a step) ──────────────────────────────────────────
export const OWNER_ROLES = ['client', 'clariven', 'web_dev', 'legal', 'marketing', 'threepl'] as const;
export type OwnerRole = (typeof OWNER_ROLES)[number];

export const OWNER_ROLE_LABELS: Record<OwnerRole, string> = {
  client: 'You',
  clariven: 'Clariven team',
  web_dev: 'Web developer',
  legal: 'Legal counsel',
  marketing: 'Marketing',
  threepl: 'Kentro 3PL',
};

export const OWNER_ROLE_STYLES: Record<OwnerRole, string> = {
  client: 'bg-cl-blue/10 text-cl-blue ring-1 ring-cl-blue/20',
  clariven: 'bg-cl-teal/10 text-cl-teal ring-1 ring-cl-teal/20',
  web_dev: 'bg-cl-gray-100 text-cl-gray-600 ring-1 ring-cl-gray-300',
  legal: 'bg-cl-gray-100 text-cl-gray-600 ring-1 ring-cl-gray-300',
  marketing: 'bg-cl-gray-100 text-cl-gray-600 ring-1 ring-cl-gray-300',
  threepl: 'bg-cl-gray-100 text-cl-gray-600 ring-1 ring-cl-gray-300',
};

// ── Org member roles (reused from the org model) ─────────────────────────────
export const CLIENT_MEMBER_ROLES = ['owner', 'admin', 'buyer', 'viewer'] as const;
export type ClientMemberRole = (typeof CLIENT_MEMBER_ROLES)[number];

export const CLIENT_MEMBER_ROLE_LABELS: Record<ClientMemberRole, string> = {
  owner: 'Owner',
  admin: 'Admin',
  buyer: 'Member',
  viewer: 'Viewer',
};

// ── Friendly mapping for the provisioning RPC error codes (0026) ─────────────
export const CLIENT_ERROR_MESSAGES: Record<string, string> = {
  FORBIDDEN_NOT_ADMIN: 'Admin access is required to provision client accounts.',
  USER_NOT_FOUND: "The account could not be created. Please try again.",
  BAD_ORG_ROLE: 'Choose a valid member role.',
  ORG_NAME_REQUIRED: 'Enter the client company name.',
  ORG_NOT_FOUND: "We couldn't find that client.",
};

export function friendlyClientError(raw: string | undefined): string {
  if (!raw) return 'Something went wrong. Please try again.';
  for (const key of Object.keys(CLIENT_ERROR_MESSAGES)) {
    if (raw.includes(key)) return CLIENT_ERROR_MESSAGES[key];
  }
  return raw;
}

// ── Validators ───────────────────────────────────────────────────────────────
const emailSchema = z
  .string()
  .min(3, 'Enter an email address.')
  .max(200)
  .email('Enter a valid email address.')
  .transform((s) => s.trim().toLowerCase());

const fullNameSchema = z
  .string()
  .min(2, "Enter the person's full name.")
  .max(160)
  .transform((s) => s.trim());

/** New client: create the company org + its first user (owner). */
export const CreateClientSchema = z.object({
  orgName: z.string().min(2, 'Enter the client company name.').max(160).transform((s) => s.trim()),
  legalName: z.string().max(200).optional().transform((s) => s?.trim() ?? ''),
  email: emailSchema,
  fullName: fullNameSchema,
  orgRole: z.enum(CLIENT_MEMBER_ROLES).default('owner'),
});
export type CreateClientInput = z.infer<typeof CreateClientSchema>;

/** Add another member to an existing client org. */
export const AddMemberSchema = z.object({
  orgId: z.string().uuid('Missing client.'),
  email: emailSchema,
  fullName: fullNameSchema,
  orgRole: z.enum(CLIENT_MEMBER_ROLES).default('buyer'),
});
export type AddMemberInput = z.infer<typeof AddMemberSchema>;

export const ToggleItemSchema = z.object({
  orgId: z.string().uuid(),
  itemId: z.number().int().positive(),
  status: z.enum(ITEM_STATUSES),
});

export const EngagementStatusSchema = z.object({
  orgId: z.string().uuid(),
  status: z.enum(ENGAGEMENT_STATUSES),
});

// ── Shared action result shapes ──────────────────────────────────────────────
export type ActionResult =
  | { ok: true }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

export type CreateClientResult =
  | { ok: true; orgId: string; email: string; tempPassword: string; warning?: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string[] | undefined> };

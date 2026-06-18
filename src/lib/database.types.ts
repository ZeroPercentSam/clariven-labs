export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_audit_log: {
        Row: {
          action: string
          actor_id: string
          created_at: string
          id: string
          impersonated_user_id: string | null
          payload: Json | null
          target_id: string
          target_type: string
        }
        Insert: {
          action: string
          actor_id: string
          created_at?: string
          id?: string
          impersonated_user_id?: string | null
          payload?: Json | null
          target_id: string
          target_type: string
        }
        Update: {
          action?: string
          actor_id?: string
          created_at?: string
          id?: string
          impersonated_user_id?: string | null
          payload?: Json | null
          target_id?: string
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_audit_log_actor_id_fkey"
            columns: ["actor_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_audit_log_impersonated_user_id_fkey"
            columns: ["impersonated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliate_codes: {
        Row: {
          active: boolean
          affiliate_id: string | null
          approval_status: string
          approved_at: string | null
          approved_by: string | null
          code: string
          created_at: string
          discount_pct: number
          expires_at: string | null
          id: string
          rejected_at: string | null
          rejected_by: string | null
          rejected_reason: string | null
          rep_user_id: string | null
        }
        Insert: {
          active?: boolean
          affiliate_id?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          code: string
          created_at?: string
          discount_pct: number
          expires_at?: string | null
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_reason?: string | null
          rep_user_id?: string | null
        }
        Update: {
          active?: boolean
          affiliate_id?: string | null
          approval_status?: string
          approved_at?: string | null
          approved_by?: string | null
          code?: string
          created_at?: string
          discount_pct?: number
          expires_at?: string | null
          id?: string
          rejected_at?: string | null
          rejected_by?: string | null
          rejected_reason?: string | null
          rep_user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_codes_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_codes_rep_user_id_fkey"
            columns: ["rep_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      affiliates: {
        Row: {
          active: boolean
          commission_pct: number | null
          created_at: string
          email: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          commission_pct?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          commission_pct?: number | null
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_item_status: {
        Row: {
          created_at: string
          done_at: string | null
          done_by: string | null
          item_id: number
          label_override: string | null
          notes: string | null
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          item_id: number
          label_override?: string | null
          notes?: string | null
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          done_at?: string | null
          done_by?: string | null
          item_id?: number
          label_override?: string | null
          notes?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_item_status_done_by_fkey"
            columns: ["done_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_item_status_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "onboarding_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_item_status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_onboarding: {
        Row: {
          created_at: string
          launched_at: string | null
          notes: string | null
          organization_id: string
          started_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          launched_at?: string | null
          notes?: string | null
          organization_id: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          launched_at?: string | null
          notes?: string | null
          organization_id?: string
          started_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      client_resources: {
        Row: {
          active: boolean
          category: string
          created_at: string
          description: string | null
          file_bytes: number | null
          file_name: string | null
          file_path: string
          id: string
          sort_order: number
          title: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          file_bytes?: number | null
          file_name?: string | null
          file_path: string
          id?: string
          sort_order?: number
          title: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          active?: boolean
          category?: string
          created_at?: string
          description?: string | null
          file_bytes?: number | null
          file_name?: string | null
          file_path?: string
          id?: string
          sort_order?: number
          title?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      client_step_status: {
        Row: {
          created_at: string
          flag: string | null
          notes: string | null
          organization_id: string
          owner_override: string | null
          step_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          flag?: string | null
          notes?: string | null
          organization_id: string
          owner_override?: string | null
          step_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          flag?: string | null
          notes?: string | null
          organization_id?: string
          owner_override?: string | null
          step_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_step_status_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_step_status_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "onboarding_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      email_log: {
        Row: {
          created_at: string
          error: string | null
          id: string
          kind: string
          resend_message_id: string | null
          status: string
          subject: string | null
          to_address: string
        }
        Insert: {
          created_at?: string
          error?: string | null
          id?: string
          kind: string
          resend_message_id?: string | null
          status: string
          subject?: string | null
          to_address: string
        }
        Update: {
          created_at?: string
          error?: string | null
          id?: string
          kind?: string
          resend_message_id?: string | null
          status?: string
          subject?: string | null
          to_address?: string
        }
        Relationships: []
      }
      gbp_notifications: {
        Row: {
          entry_client_id: number | null
          id: number
          invoice_id: string | null
          message: string
          processed_at: string | null
          pulled_at: string
          time_created: string | null
        }
        Insert: {
          entry_client_id?: number | null
          id: number
          invoice_id?: string | null
          message: string
          processed_at?: string | null
          pulled_at?: string
          time_created?: string | null
        }
        Update: {
          entry_client_id?: number | null
          id?: number
          invoice_id?: string | null
          message?: string
          processed_at?: string | null
          pulled_at?: string
          time_created?: string | null
        }
        Relationships: []
      }
      impersonation_sessions: {
        Row: {
          admin_user_id: string
          created_at: string
          ended_at: string | null
          ended_reason: string | null
          expires_at: string
          id: string
          impersonated_user_id: string
          justification: string
          started_at: string
          updated_at: string
        }
        Insert: {
          admin_user_id: string
          created_at?: string
          ended_at?: string | null
          ended_reason?: string | null
          expires_at: string
          id?: string
          impersonated_user_id: string
          justification: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          admin_user_id?: string
          created_at?: string
          ended_at?: string | null
          ended_reason?: string | null
          expires_at?: string
          id?: string
          impersonated_user_id?: string
          justification?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      invitation_requests: {
        Row: {
          admin_notes: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          organization_name: string | null
          reason: string | null
          research_context: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
        }
        Insert: {
          admin_notes?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          organization_name?: string | null
          reason?: string | null
          research_context?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Update: {
          admin_notes?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          organization_name?: string | null
          reason?: string | null
          research_context?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invitation_requests_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      lot_alert_notifications: {
        Row: {
          id: string
          lot_id: string
          sent_at: string
          threshold_days: number
        }
        Insert: {
          id?: string
          lot_id: string
          sent_at?: string
          threshold_days: number
        }
        Update: {
          id?: string
          lot_id?: string
          sent_at?: string
          threshold_days?: number
        }
        Relationships: [
          {
            foreignKeyName: "lot_alert_notifications_lot_id_fkey"
            columns: ["lot_id"]
            isOneToOne: false
            referencedRelation: "product_lots"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_items: {
        Row: {
          active: boolean
          category: string | null
          created_at: string
          help_text: string | null
          id: number
          label: string
          sort_order: number
          step_id: number
          updated_at: string
        }
        Insert: {
          active?: boolean
          category?: string | null
          created_at?: string
          help_text?: string | null
          id?: never
          label: string
          sort_order: number
          step_id: number
          updated_at?: string
        }
        Update: {
          active?: boolean
          category?: string | null
          created_at?: string
          help_text?: string | null
          id?: never
          label?: string
          sort_order?: number
          step_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_items_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "onboarding_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_phases: {
        Row: {
          active: boolean
          created_at: string
          id: number
          sort_order: number
          subtitle: string | null
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          id: number
          sort_order: number
          subtitle?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          id?: number
          sort_order?: number
          subtitle?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      onboarding_steps: {
        Row: {
          active: boolean
          created_at: string
          description: string | null
          id: number
          owner_role: string
          phase_id: number
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          created_at?: string
          description?: string | null
          id: number
          owner_role: string
          phase_id: number
          sort_order: number
          title: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          created_at?: string
          description?: string | null
          id?: number
          owner_role?: string
          phase_id?: number
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_steps_phase_id_fkey"
            columns: ["phase_id"]
            isOneToOne: false
            referencedRelation: "onboarding_phases"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          created_at: string
          id: string
          line_total_cents: number
          order_id: string
          product_name: string
          product_slug: string
          quantity: number
          strength_label: string
          unit_cost_cents: number
          unit_price_cents: number
        }
        Insert: {
          created_at?: string
          id?: string
          line_total_cents: number
          order_id: string
          product_name: string
          product_slug: string
          quantity: number
          strength_label: string
          unit_cost_cents?: number
          unit_price_cents: number
        }
        Update: {
          created_at?: string
          id?: string
          line_total_cents?: number
          order_id?: string
          product_name?: string
          product_slug?: string
          quantity?: number
          strength_label?: string
          unit_cost_cents?: number
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      order_messages: {
        Row: {
          author_id: string
          author_role: string
          body: string
          created_at: string
          id: string
          order_id: string
        }
        Insert: {
          author_id: string
          author_role: string
          body: string
          created_at?: string
          id?: string
          order_id: string
        }
        Update: {
          author_id?: string
          author_role?: string
          body?: string
          created_at?: string
          id?: string
          order_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_messages_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          affiliate_id: string | null
          applied_code_id: string | null
          created_at: string
          discount_cents: number
          gbp_check_id: string | null
          gbp_invoice_id: string | null
          gbp_last_polled_at: string | null
          gbp_paid_at: string | null
          gbp_payment_result: number | null
          id: string
          notes_internal: string | null
          order_number: number
          organization_id: string
          shipping_address: Json
          status: string
          subtotal_cents: number
          total_cents: number
          tracking_carrier: string | null
          tracking_number: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          affiliate_id?: string | null
          applied_code_id?: string | null
          created_at?: string
          discount_cents?: number
          gbp_check_id?: string | null
          gbp_invoice_id?: string | null
          gbp_last_polled_at?: string | null
          gbp_paid_at?: string | null
          gbp_payment_result?: number | null
          id?: string
          notes_internal?: string | null
          order_number?: number
          organization_id: string
          shipping_address: Json
          status?: string
          subtotal_cents?: number
          total_cents?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          affiliate_id?: string | null
          applied_code_id?: string | null
          created_at?: string
          discount_cents?: number
          gbp_check_id?: string | null
          gbp_invoice_id?: string | null
          gbp_last_polled_at?: string | null
          gbp_paid_at?: string | null
          gbp_payment_result?: number | null
          id?: string
          notes_internal?: string | null
          order_number?: number
          organization_id?: string
          shipping_address?: Json
          status?: string
          subtotal_cents?: number
          total_cents?: number
          tracking_carrier?: string | null
          tracking_number?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_affiliate_id_fkey"
            columns: ["affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_applied_code_id_fkey"
            columns: ["applied_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "orders_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_attestations: {
        Row: {
          created_at: string
          file_bytes: number | null
          file_name: string | null
          file_path: string | null
          id: string
          institutional_affiliation: string | null
          legal_entity_name: string
          orcid_or_inst_id: string | null
          organization_id: string
          rejection_reason: string | null
          research_context: string
          reviewed_at: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          file_bytes?: number | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          institutional_affiliation?: string | null
          legal_entity_name: string
          orcid_or_inst_id?: string | null
          organization_id: string
          rejection_reason?: string | null
          research_context: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          file_bytes?: number | null
          file_name?: string | null
          file_path?: string | null
          id?: string
          institutional_affiliation?: string | null
          legal_entity_name?: string
          orcid_or_inst_id?: string | null
          organization_id?: string
          rejection_reason?: string | null
          research_context?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_attestations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_attestations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      org_invitations: {
        Row: {
          accepted_at: string | null
          accepted_by: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string | null
          org_role: string
          organization_id: string
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_role: string
          organization_id: string
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_by?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string | null
          org_role?: string
          organization_id?: string
          status?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_invitations_accepted_by_fkey"
            columns: ["accepted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invitations_invited_by_fkey"
            columns: ["invited_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_invitations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      org_members: {
        Row: {
          created_at: string
          org_role: string
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          org_role: string
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          org_role?: string
          organization_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "org_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "org_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          approval_status: string
          billing_email: string | null
          created_at: string
          id: string
          legal_name: string | null
          name: string
          notes: string | null
          phone: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          approval_status?: string
          billing_email?: string | null
          created_at?: string
          id?: string
          legal_name?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          approval_status?: string
          billing_email?: string | null
          created_at?: string
          id?: string
          legal_name?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      product_coas: {
        Row: {
          created_at: string
          file_bytes: number | null
          file_name: string | null
          file_path: string
          id: string
          product_slug: string
          strength_label: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_bytes?: number | null
          file_name?: string | null
          file_path: string
          id?: string
          product_slug: string
          strength_label?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_bytes?: number | null
          file_name?: string | null
          file_path?: string
          id?: string
          product_slug?: string
          strength_label?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      product_lots: {
        Row: {
          active: boolean
          coa_file_bytes: number | null
          coa_file_name: string | null
          coa_file_path: string | null
          coa_uploaded_at: string | null
          created_at: string
          expiration_date: string
          id: string
          lot_number: string
          notes: string | null
          product_slug: string
          received_at: string | null
          strength_label: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          active?: boolean
          coa_file_bytes?: number | null
          coa_file_name?: string | null
          coa_file_path?: string | null
          coa_uploaded_at?: string | null
          created_at?: string
          expiration_date: string
          id?: string
          lot_number: string
          notes?: string | null
          product_slug: string
          received_at?: string | null
          strength_label?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          active?: boolean
          coa_file_bytes?: number | null
          coa_file_name?: string | null
          coa_file_path?: string | null
          coa_uploaded_at?: string | null
          created_at?: string
          expiration_date?: string
          id?: string
          lot_number?: string
          notes?: string | null
          product_slug?: string
          received_at?: string | null
          strength_label?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: []
      }
      product_prices: {
        Row: {
          active: boolean
          cogs_cents: number | null
          created_at: string
          currency: string
          id: string
          price_cents: number
          product_slug: string
          strength_label: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          cogs_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          price_cents: number
          product_slug: string
          strength_label: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          cogs_cents?: number | null
          created_at?: string
          currency?: string
          id?: string
          price_cents?: number
          product_slug?: string
          strength_label?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string | null
          id: string
          organization_id: string | null
          phone: string | null
          referred_by_affiliate_id: string | null
          referred_by_code_id: string | null
          role: string
          shipping_address: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          organization_id?: string | null
          phone?: string | null
          referred_by_affiliate_id?: string | null
          referred_by_code_id?: string | null
          role?: string
          shipping_address?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          organization_id?: string | null
          phone?: string | null
          referred_by_affiliate_id?: string | null
          referred_by_code_id?: string | null
          role?: string
          shipping_address?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_affiliate_id_fkey"
            columns: ["referred_by_affiliate_id"]
            isOneToOne: false
            referencedRelation: "affiliates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_referred_by_code_id_fkey"
            columns: ["referred_by_code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_agreement_consents: {
        Row: {
          created_at: string
          id: string
          ip: string | null
          rep_user_id: string
          signed_at: string
          signed_legal_name: string
          user_agent: string | null
          version_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          ip?: string | null
          rep_user_id: string
          signed_at?: string
          signed_legal_name: string
          user_agent?: string | null
          version_id: string
        }
        Update: {
          created_at?: string
          id?: string
          ip?: string | null
          rep_user_id?: string
          signed_at?: string
          signed_legal_name?: string
          user_agent?: string | null
          version_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_agreement_consents_rep_user_id_fkey"
            columns: ["rep_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_agreement_consents_version_id_fkey"
            columns: ["version_id"]
            isOneToOne: false
            referencedRelation: "rep_agreement_versions"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_agreement_versions: {
        Row: {
          body_md: string
          created_at: string
          created_by: string | null
          effective_at: string
          id: string
          label: string
          retired_at: string | null
        }
        Insert: {
          body_md: string
          created_at?: string
          created_by?: string | null
          effective_at?: string
          id?: string
          label: string
          retired_at?: string | null
        }
        Update: {
          body_md?: string
          created_at?: string
          created_by?: string | null
          effective_at?: string
          id?: string
          label?: string
          retired_at?: string | null
        }
        Relationships: []
      }
      rep_commissions: {
        Row: {
          assignment_id: string | null
          base_cents: number
          code_id: string | null
          cogs_cents: number
          commission_cents: number
          created_at: string
          earned_at: string
          id: string
          order_id: string
          organization_id: string
          paid_at: string | null
          paid_batch_id: string | null
          paid_note: string | null
          parent_commission_id: string | null
          rate: number
          rep_user_id: string
          reversed_at: string | null
          reversed_reason: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          assignment_id?: string | null
          base_cents: number
          code_id?: string | null
          cogs_cents?: number
          commission_cents: number
          created_at?: string
          earned_at?: string
          id?: string
          order_id: string
          organization_id: string
          paid_at?: string | null
          paid_batch_id?: string | null
          paid_note?: string | null
          parent_commission_id?: string | null
          rate: number
          rep_user_id: string
          reversed_at?: string | null
          reversed_reason?: string | null
          source: string
          status?: string
          updated_at?: string
        }
        Update: {
          assignment_id?: string | null
          base_cents?: number
          code_id?: string | null
          cogs_cents?: number
          commission_cents?: number
          created_at?: string
          earned_at?: string
          id?: string
          order_id?: string
          organization_id?: string
          paid_at?: string | null
          paid_batch_id?: string | null
          paid_note?: string | null
          parent_commission_id?: string | null
          rate?: number
          rep_user_id?: string
          reversed_at?: string | null
          reversed_reason?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_commissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "rep_org_assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_commissions_code_id_fkey"
            columns: ["code_id"]
            isOneToOne: false
            referencedRelation: "affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_commissions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_commissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_commissions_parent_commission_id_fkey"
            columns: ["parent_commission_id"]
            isOneToOne: false
            referencedRelation: "rep_commissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_commissions_rep_user_id_fkey"
            columns: ["rep_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      rep_invitations: {
        Row: {
          accepted_at: string | null
          accepted_user_id: string | null
          created_at: string
          email: string
          expires_at: string
          id: string
          invitation_note: string | null
          invited_by_admin_id: string | null
          revoked_at: string | null
          revoked_reason: string | null
          status: string
          token: string
        }
        Insert: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invitation_note?: string | null
          invited_by_admin_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: string
          token?: string
        }
        Update: {
          accepted_at?: string | null
          accepted_user_id?: string | null
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invitation_note?: string | null
          invited_by_admin_id?: string | null
          revoked_at?: string | null
          revoked_reason?: string | null
          status?: string
          token?: string
        }
        Relationships: []
      }
      rep_org_assignments: {
        Row: {
          commission_enabled: boolean
          commission_pct: number | null
          created_at: string
          created_by_admin_id: string | null
          ended_at: string | null
          ended_reason: string | null
          id: string
          organization_id: string
          rep_user_id: string
          started_at: string
          updated_at: string
        }
        Insert: {
          commission_enabled?: boolean
          commission_pct?: number | null
          created_at?: string
          created_by_admin_id?: string | null
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          organization_id: string
          rep_user_id: string
          started_at?: string
          updated_at?: string
        }
        Update: {
          commission_enabled?: boolean
          commission_pct?: number | null
          created_at?: string
          created_by_admin_id?: string | null
          ended_at?: string | null
          ended_reason?: string | null
          id?: string
          organization_id?: string
          rep_user_id?: string
          started_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rep_org_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rep_org_assignments_rep_user_id_fkey"
            columns: ["rep_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_reps: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_line1: string | null
          address_line2: string | null
          address_postal_code: string | null
          address_state: string | null
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          business_type: string | null
          created_at: string
          headshot_url: string | null
          id: string
          legal_name: string | null
          linkedin_url: string | null
          onboarding_completed_at: string | null
          payout_account_masked: string | null
          payout_account_ref: string | null
          payout_method: string | null
          phone: string | null
          specialty_categories: string[]
          status: string
          suspended_at: string | null
          suspended_reason: string | null
          tax_id: string | null
          tax_id_kind: string | null
          territory_states: string[]
          updated_at: string
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          business_type?: string | null
          created_at?: string
          headshot_url?: string | null
          id: string
          legal_name?: string | null
          linkedin_url?: string | null
          onboarding_completed_at?: string | null
          payout_account_masked?: string | null
          payout_account_ref?: string | null
          payout_method?: string | null
          phone?: string | null
          specialty_categories?: string[]
          status?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          tax_id?: string | null
          tax_id_kind?: string | null
          territory_states?: string[]
          updated_at?: string
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          business_type?: string | null
          created_at?: string
          headshot_url?: string | null
          id?: string
          legal_name?: string | null
          linkedin_url?: string | null
          onboarding_completed_at?: string | null
          payout_account_masked?: string | null
          payout_account_ref?: string | null
          payout_method?: string | null
          phone?: string | null
          specialty_categories?: string[]
          status?: string
          suspended_at?: string | null
          suspended_reason?: string | null
          tax_id?: string | null
          tax_id_kind?: string | null
          territory_states?: string[]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_reps_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_to: string | null
          body: string
          category: string | null
          created_at: string
          created_by: string
          id: string
          order_id: string | null
          organization_id: string | null
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          ticket_number: number
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          body: string
          category?: string | null
          created_at?: string
          created_by?: string
          id?: string
          order_id?: string | null
          organization_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          ticket_number?: never
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          body?: string
          category?: string | null
          created_at?: string
          created_by?: string
          id?: string
          order_id?: string | null
          organization_id?: string | null
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          ticket_number?: never
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "support_tickets_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ticket_messages: {
        Row: {
          author_id: string
          body: string
          created_at: string
          id: string
          is_internal: boolean
          ticket_id: string
        }
        Insert: {
          author_id?: string
          body: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id: string
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          id?: string
          is_internal?: boolean
          ticket_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ticket_messages_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      client_onboarding_progress: {
        Row: {
          current_phase_title: string | null
          items_blocked: number | null
          items_done: number | null
          items_na: number | null
          items_total: number | null
          launched_at: string | null
          organization_id: string | null
          organization_name: string | null
          organization_slug: string | null
          pct_complete: number | null
          started_at: string | null
          status: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_onboarding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sales_reps_safe: {
        Row: {
          address_city: string | null
          address_country: string | null
          address_line1: string | null
          address_line2: string | null
          address_postal_code: string | null
          address_state: string | null
          approved_at: string | null
          approved_by: string | null
          bio: string | null
          business_type: string | null
          created_at: string | null
          headshot_url: string | null
          id: string | null
          legal_name: string | null
          linkedin_url: string | null
          onboarding_completed_at: string | null
          payout_account_masked: string | null
          payout_method: string | null
          phone: string | null
          specialty_categories: string[] | null
          status: string | null
          suspended_at: string | null
          suspended_reason: string | null
          tax_id_kind: string | null
          territory_states: string[] | null
          updated_at: string | null
        }
        Insert: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          business_type?: string | null
          created_at?: string | null
          headshot_url?: string | null
          id?: string | null
          legal_name?: string | null
          linkedin_url?: string | null
          onboarding_completed_at?: string | null
          payout_account_masked?: string | null
          payout_method?: string | null
          phone?: string | null
          specialty_categories?: string[] | null
          status?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          tax_id_kind?: string | null
          territory_states?: string[] | null
          updated_at?: string | null
        }
        Update: {
          address_city?: string | null
          address_country?: string | null
          address_line1?: string | null
          address_line2?: string | null
          address_postal_code?: string | null
          address_state?: string | null
          approved_at?: string | null
          approved_by?: string | null
          bio?: string | null
          business_type?: string | null
          created_at?: string | null
          headshot_url?: string | null
          id?: string | null
          legal_name?: string | null
          linkedin_url?: string | null
          onboarding_completed_at?: string | null
          payout_account_masked?: string | null
          payout_method?: string | null
          phone?: string | null
          specialty_categories?: string[] | null
          status?: string | null
          suspended_at?: string | null
          suspended_reason?: string | null
          tax_id_kind?: string | null
          territory_states?: string[] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sales_reps_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      accept_invitation: { Args: { p_token: string }; Returns: Json }
      accept_rep_invitation: { Args: { p_token: string }; Returns: Json }
      attach_invoice_to_order: {
        Args: {
          p_check_id: string
          p_invoice_id: string
          p_order_id: string
          p_payment_result: number
        }
        Returns: undefined
      }
      bootstrap_organization: {
        Args: {
          p_billing_email?: string
          p_legal_name?: string
          p_name: string
          p_phone?: string
        }
        Returns: string
      }
      create_order_with_items: {
        Args: { p_code: string; p_items: Json; p_shipping: Json }
        Returns: {
          discount_cents: number
          order_id: string
          subtotal_cents: number
          total_cents: number
        }[]
      }
      current_impersonated_user_id: { Args: never; Returns: string }
      effective_user_id: { Args: never; Returns: string }
      end_impersonation: { Args: never; Returns: undefined }
      get_impersonation_context: {
        Args: never
        Returns: {
          email: string
          expires_at: string
          full_name: string
          impersonated_user_id: string
          session_id: string
          started_at: string
        }[]
      }
      get_invitation_preview: { Args: { p_token: string }; Returns: Json }
      get_rep_invitation_preview: { Args: { p_token: string }; Returns: Json }
      is_active_rep: { Args: never; Returns: boolean }
      is_admin: { Args: never; Returns: boolean }
      is_org_admin: { Args: never; Returns: boolean }
      list_public_lot_coas: {
        Args: { p_slug: string }
        Returns: {
          coa_file_name: string
          coa_file_path: string
          expiration_date: string
          lot_number: string
          strength_label: string
        }[]
      }
      list_public_prices: {
        Args: { p_slug?: string }
        Returns: {
          currency: string
          price_cents: number
          product_slug: string
          strength_label: string
        }[]
      }
      provision_client_member: {
        Args: {
          p_full_name?: string
          p_legal_name?: string
          p_name?: string
          p_org_id?: string
          p_org_role?: string
          p_user_id: string
        }
        Returns: string
      }
      rep_my_orgs: {
        Args: never
        Returns: {
          id: string
          name: string
          slug: string
        }[]
      }
      stamp_referral: { Args: { p_code: string }; Returns: undefined }
      start_client_onboarding: {
        Args: { p_org_id: string }
        Returns: undefined
      }
      start_impersonation: {
        Args: { p_justification: string; p_target: string }
        Returns: string
      }
      submit_invitation_request: {
        Args: {
          p_email: string
          p_full_name: string
          p_organization_name?: string
          p_reason?: string
          p_research_context?: string
        }
        Returns: string
      }
      user_org_id: { Args: never; Returns: string }
      user_org_role: { Args: never; Returns: string }
      validate_affiliate_code: {
        Args: { p_code: string }
        Returns: {
          discount_pct: number
          valid: boolean
        }[]
      }
      write_rep_commission_for_order: {
        Args: { p_order_id: string }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      budget_items: {
        Row: {
          amount: number
          created_at: string
          description: string | null
          group_id: string
          id: string
          name: string
          source_poll_id: string | null
          source_type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id: string
          id?: string
          name: string
          source_poll_id?: string | null
          source_type?: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string | null
          group_id?: string
          id?: string
          name?: string
          source_poll_id?: string | null
          source_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_items_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "budget_items_source_poll_id_fkey"
            columns: ["source_poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      budget_payment_schedule: {
        Row: {
          amount: number
          budget_item_id: string
          created_at: string
          description: string
          due_date: string
          id: string
          status: string
        }
        Insert: {
          amount?: number
          budget_item_id: string
          created_at?: string
          description?: string
          due_date: string
          id?: string
          status?: string
        }
        Update: {
          amount?: number
          budget_item_id?: string
          created_at?: string
          description?: string
          due_date?: string
          id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "budget_payment_schedule_budget_item_id_fkey"
            columns: ["budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_channels: {
        Row: {
          created_at: string
          created_by: string | null
          group_id: string
          id: string
          name: string
          participants: string[] | null
          supplier_id: string | null
          type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          group_id: string
          id?: string
          name: string
          participants?: string[] | null
          supplier_id?: string | null
          type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          group_id?: string
          id?: string
          name?: string
          participants?: string[] | null
          supplier_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "chat_channels_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_channels_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      chat_messages: {
        Row: {
          channel_id: string
          content: string
          created_at: string
          deleted_at: string | null
          edited_at: string | null
          forwarded_from: string | null
          id: string
          member_id: string | null
          reply_to: string | null
          supplier_contact_id: string | null
        }
        Insert: {
          channel_id: string
          content: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          forwarded_from?: string | null
          id?: string
          member_id?: string | null
          reply_to?: string | null
          supplier_contact_id?: string | null
        }
        Update: {
          channel_id?: string
          content?: string
          created_at?: string
          deleted_at?: string | null
          edited_at?: string | null
          forwarded_from?: string | null
          id?: string
          member_id?: string | null
          reply_to?: string | null
          supplier_contact_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "chat_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "chat_channels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_forwarded_from_fkey"
            columns: ["forwarded_from"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "chat_messages_supplier_contact_id_fkey"
            columns: ["supplier_contact_id"]
            isOneToOne: false
            referencedRelation: "supplier_contacts"
            referencedColumns: ["id"]
          },
        ]
      }
      contract_signatures: {
        Row: {
          contract_id: string
          id: string
          member_id: string
          opened_at: string | null
          sent_at: string
          signed_at: string | null
        }
        Insert: {
          contract_id: string
          id?: string
          member_id: string
          opened_at?: string | null
          sent_at?: string
          signed_at?: string | null
        }
        Update: {
          contract_id?: string
          id?: string
          member_id?: string
          opened_at?: string | null
          sent_at?: string
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contract_signatures_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "contract_signatures_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      contracts: {
        Row: {
          created_at: string
          group_id: string
          id: string
          parties: string | null
          signed_at: string | null
          status: string
          template_id: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          group_id: string
          id?: string
          parties?: string | null
          signed_at?: string | null
          status?: string
          template_id?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          group_id?: string
          id?: string
          parties?: string | null
          signed_at?: string | null
          status?: string
          template_id?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "contracts_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          event_date: string
          event_type: string
          group_id: string
          id: string
          title: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          event_date: string
          event_type?: string
          group_id: string
          id?: string
          title: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          event_date?: string
          event_type?: string
          group_id?: string
          id?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "events_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      groups: {
        Row: {
          archived_at: string | null
          city: string | null
          created_at: string
          created_by: string
          id: string
          invite_code: string
          logo_url: string | null
          member_count: number
          name: string
          total_budget: number | null
          year: number
        }
        Insert: {
          archived_at?: string | null
          city?: string | null
          created_at?: string
          created_by: string
          id?: string
          invite_code: string
          logo_url?: string | null
          member_count?: number
          name: string
          total_budget?: number | null
          year: number
        }
        Update: {
          archived_at?: string | null
          city?: string | null
          created_at?: string
          created_by?: string
          id?: string
          invite_code?: string
          logo_url?: string | null
          member_count?: number
          name?: string
          total_budget?: number | null
          year?: number
        }
        Relationships: []
      }
      members: {
        Row: {
          avatar_url: string | null
          email: string | null
          group_id: string
          id: string
          invited_email: string | null
          joined_at: string
          last_login_at: string | null
          name: string
          phone: string | null
          removed_at: string | null
          role: string
          role_id: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          email?: string | null
          group_id: string
          id?: string
          invited_email?: string | null
          joined_at?: string
          last_login_at?: string | null
          name: string
          phone?: string | null
          removed_at?: string | null
          role?: string
          role_id?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          email?: string | null
          group_id?: string
          id?: string
          invited_email?: string | null
          joined_at?: string
          last_login_at?: string | null
          name?: string
          phone?: string | null
          removed_at?: string | null
          role?: string
          role_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "members_role_id_fkey"
            columns: ["role_id"]
            isOneToOne: false
            referencedRelation: "roles"
            referencedColumns: ["id"]
          },
        ]
      }
      message_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number
          file_type: string
          file_url: string
          id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number
          file_type?: string
          file_url: string
          id?: string
          message_id: string
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number
          file_type?: string
          file_url?: string
          id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_attachments_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reactions: {
        Row: {
          created_at: string
          emoji: string
          id: string
          member_id: string
          message_id: string
        }
        Insert: {
          created_at?: string
          emoji: string
          id?: string
          member_id: string
          message_id: string
        }
        Update: {
          created_at?: string
          emoji?: string
          id?: string
          member_id?: string
          message_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reactions_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      message_reads: {
        Row: {
          id: string
          member_id: string
          message_id: string
          read_at: string
        }
        Insert: {
          id?: string
          member_id: string
          message_id: string
          read_at?: string
        }
        Update: {
          id?: string
          member_id?: string
          message_id?: string
          read_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_reads_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "message_reads_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "chat_messages"
            referencedColumns: ["id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          member_id: string
          notification_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          member_id: string
          notification_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          member_id?: string
          notification_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "notification_preferences_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          description: string
          group_id: string
          icon: string
          id: string
          link: string
          member_id: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          description?: string
          group_id: string
          icon?: string
          id?: string
          link?: string
          member_id: string
          read_at?: string | null
          title: string
          type?: string
        }
        Update: {
          created_at?: string
          description?: string
          group_id?: string
          icon?: string
          id?: string
          link?: string
          member_id?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_plan: {
        Row: {
          amount_per_member: number
          created_at: string
          due_date: string
          effective_from: string | null
          group_id: string
          id: string
        }
        Insert: {
          amount_per_member?: number
          created_at?: string
          due_date: string
          effective_from?: string | null
          group_id: string
          id?: string
        }
        Update: {
          amount_per_member?: number
          created_at?: string
          due_date?: string
          effective_from?: string | null
          group_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_plan_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      plan_change_log: {
        Row: {
          created_at: string
          created_by: string
          effective_from: string
          group_id: string
          id: string
          new_amount: number
          old_amount: number
          reason: string | null
        }
        Insert: {
          created_at?: string
          created_by: string
          effective_from: string
          group_id: string
          id?: string
          new_amount?: number
          old_amount?: number
          reason?: string | null
        }
        Update: {
          created_at?: string
          created_by?: string
          effective_from?: string
          group_id?: string
          id?: string
          new_amount?: number
          old_amount?: number
          reason?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "plan_change_log_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_options: {
        Row: {
          id: string
          label: string
          poll_id: string
          sort_order: number
        }
        Insert: {
          id?: string
          label: string
          poll_id: string
          sort_order?: number
        }
        Update: {
          id?: string
          label?: string
          poll_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "poll_options_poll_id_fkey"
            columns: ["poll_id"]
            isOneToOne: false
            referencedRelation: "polls"
            referencedColumns: ["id"]
          },
        ]
      }
      poll_votes: {
        Row: {
          created_at: string
          id: string
          member_id: string
          poll_option_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          member_id: string
          poll_option_id: string
        }
        Update: {
          created_at?: string
          id?: string
          member_id?: string
          poll_option_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "poll_votes_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "poll_votes_poll_option_id_fkey"
            columns: ["poll_option_id"]
            isOneToOne: false
            referencedRelation: "poll_options"
            referencedColumns: ["id"]
          },
        ]
      }
      polls: {
        Row: {
          created_at: string
          created_by: string
          deadline: string
          financial_amount: number | null
          financial_budget_item_id: string | null
          financial_due_date: string | null
          group_id: string
          has_financial_impact: boolean
          id: string
          question: string
          threshold: number
        }
        Insert: {
          created_at?: string
          created_by: string
          deadline: string
          financial_amount?: number | null
          financial_budget_item_id?: string | null
          financial_due_date?: string | null
          group_id: string
          has_financial_impact?: boolean
          id?: string
          question: string
          threshold?: number
        }
        Update: {
          created_at?: string
          created_by?: string
          deadline?: string
          financial_amount?: number | null
          financial_budget_item_id?: string | null
          financial_due_date?: string | null
          group_id?: string
          has_financial_impact?: boolean
          id?: string
          question?: string
          threshold?: number
        }
        Relationships: [
          {
            foreignKeyName: "polls_financial_budget_item_id_fkey"
            columns: ["financial_budget_item_id"]
            isOneToOne: false
            referencedRelation: "budget_items"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "polls_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      roles: {
        Row: {
          color: string
          created_at: string
          group_id: string
          id: string
          is_default: boolean
          name: string
          permission_level: string
        }
        Insert: {
          color?: string
          created_at?: string
          group_id: string
          id?: string
          is_default?: boolean
          name: string
          permission_level?: string
        }
        Update: {
          color?: string
          created_at?: string
          group_id?: string
          id?: string
          is_default?: boolean
          name?: string
          permission_level?: string
        }
        Relationships: [
          {
            foreignKeyName: "roles_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
        ]
      }
      supplier_contacts: {
        Row: {
          avatar_color: string
          created_at: string
          id: string
          name: string
          role: string
          supplier_id: string
        }
        Insert: {
          avatar_color?: string
          created_at?: string
          id?: string
          name: string
          role?: string
          supplier_id: string
        }
        Update: {
          avatar_color?: string
          created_at?: string
          id?: string
          name?: string
          role?: string
          supplier_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supplier_contacts_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          category: string
          complaint_count: number | null
          contact_email: string | null
          contact_phone: string | null
          description: string | null
          id: string
          location: string | null
          logo_color: string | null
          logo_initials: string | null
          name: string
          org_nr: string | null
          price_guide: Json | null
          rating: number | null
          tags: string[] | null
          verified: boolean
          warnings: string[] | null
          website: string | null
        }
        Insert: {
          address?: string | null
          category: string
          complaint_count?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          description?: string | null
          id?: string
          location?: string | null
          logo_color?: string | null
          logo_initials?: string | null
          name: string
          org_nr?: string | null
          price_guide?: Json | null
          rating?: number | null
          tags?: string[] | null
          verified?: boolean
          warnings?: string[] | null
          website?: string | null
        }
        Update: {
          address?: string | null
          category?: string
          complaint_count?: number | null
          contact_email?: string | null
          contact_phone?: string | null
          description?: string | null
          id?: string
          location?: string | null
          logo_color?: string | null
          logo_initials?: string | null
          name?: string
          org_nr?: string | null
          price_guide?: Json | null
          rating?: number | null
          tags?: string[] | null
          verified?: boolean
          warnings?: string[] | null
          website?: string | null
        }
        Relationships: []
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          description: string
          group_id: string
          id: string
          member_id: string | null
          type: string
        }
        Insert: {
          amount?: number
          created_at?: string
          description: string
          group_id: string
          id?: string
          member_id?: string | null
          type: string
        }
        Update: {
          amount?: number
          created_at?: string
          description?: string
          group_id?: string
          id?: string
          member_id?: string | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "transactions_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "groups"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      is_admin_of_group: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_bussjef_of_group: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
      }
      is_member_of_group: {
        Args: { _group_id: string; _user_id: string }
        Returns: boolean
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

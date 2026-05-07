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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      accountant_client_links: {
        Row: {
          accountant_id: string
          client_id: string
          created_at: string
          id: string
          permissions: Json | null
          status: string | null
          updated_at: string
        }
        Insert: {
          accountant_id: string
          client_id: string
          created_at?: string
          id?: string
          permissions?: Json | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          accountant_id?: string
          client_id?: string
          created_at?: string
          id?: string
          permissions?: Json | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      accountant_notes: {
        Row: {
          accountant_id: string
          client_id: string
          content: string
          created_at: string
          id: string
        }
        Insert: {
          accountant_id: string
          client_id: string
          content: string
          created_at?: string
          id?: string
        }
        Update: {
          accountant_id?: string
          client_id?: string
          content?: string
          created_at?: string
          id?: string
        }
        Relationships: []
      }
      accountant_profiles: {
        Row: {
          created_at: string
          id: string
          is_verified: boolean | null
          license_number: string | null
          specialization: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          specialization?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_verified?: boolean | null
          license_number?: string | null
          specialization?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      declaration_drafts: {
        Row: {
          created_at: string
          form_data: Json | null
          id: string
          pdf_url: string | null
          status: string | null
          tax_period_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          form_data?: Json | null
          id?: string
          pdf_url?: string | null
          status?: string | null
          tax_period_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          form_data?: Json | null
          id?: string
          pdf_url?: string | null
          status?: string | null
          tax_period_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "declaration_drafts_tax_period_id_fkey"
            columns: ["tax_period_id"]
            isOneToOne: false
            referencedRelation: "tax_periods"
            referencedColumns: ["id"]
          },
        ]
      }
      document_types: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          is_required: boolean | null
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          is_required?: boolean | null
          name?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          created_at: string
          document_type_id: string | null
          file_name: string
          file_size: number | null
          file_url: string
          id: string
          mime_type: string | null
          notes: string | null
          ocr_extracted: Json | null
          ocr_raw: Json | null
          status: string | null
          updated_at: string
          user_id: string
          verification_status: string | null
        }
        Insert: {
          created_at?: string
          document_type_id?: string | null
          file_name: string
          file_size?: number | null
          file_url: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          ocr_extracted?: Json | null
          ocr_raw?: Json | null
          status?: string | null
          updated_at?: string
          user_id: string
          verification_status?: string | null
        }
        Update: {
          created_at?: string
          document_type_id?: string | null
          file_name?: string
          file_size?: number | null
          file_url?: string
          id?: string
          mime_type?: string | null
          notes?: string | null
          ocr_extracted?: Json | null
          ocr_raw?: Json | null
          status?: string | null
          updated_at?: string
          user_id?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_document_type_id_fkey"
            columns: ["document_type_id"]
            isOneToOne: false
            referencedRelation: "document_types"
            referencedColumns: ["id"]
          },
        ]
      }
      expense_records: {
        Row: {
          amount: number
          attachment_url: string | null
          category_id: string | null
          category_name: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          is_deductible: boolean | null
          period_month: number
          period_year: number
          status: string | null
          taxpayer_profile_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_deductible?: boolean | null
          period_month?: number
          period_year?: number
          status?: string | null
          taxpayer_profile_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          is_deductible?: boolean | null
          period_month?: number
          period_year?: number
          status?: string | null
          taxpayer_profile_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "expense_records_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "expense_records_taxpayer_profile_id_fkey"
            columns: ["taxpayer_profile_id"]
            isOneToOne: false
            referencedRelation: "taxpayer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      income_records: {
        Row: {
          amount: number
          attachment_url: string | null
          category_id: string | null
          category_name: string | null
          created_at: string
          date: string
          description: string | null
          id: string
          period_month: number
          period_year: number
          status: string | null
          taxpayer_profile_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          attachment_url?: string | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          period_month?: number
          period_year?: number
          status?: string | null
          taxpayer_profile_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          attachment_url?: string | null
          category_id?: string | null
          category_name?: string | null
          created_at?: string
          date?: string
          description?: string | null
          id?: string
          period_month?: number
          period_year?: number
          status?: string | null
          taxpayer_profile_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "income_records_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "transaction_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "income_records_taxpayer_profile_id_fkey"
            columns: ["taxpayer_profile_id"]
            isOneToOne: false
            referencedRelation: "taxpayer_profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_transactions: {
        Row: {
          amount: number
          created_at: string
          id: string
          payment_method: string | null
          payment_reference: string | null
          provider_data: Json | null
          status: string | null
          subscription_id: string | null
          user_id: string
        }
        Insert: {
          amount: number
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          provider_data?: Json | null
          status?: string | null
          subscription_id?: string | null
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          payment_method?: string | null
          payment_reference?: string | null
          provider_data?: Json | null
          status?: string | null
          subscription_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_transactions_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string
          id: string
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string
          id?: string
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          interval: string | null
          is_active: boolean | null
          name: string
          price: number
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          name: string
          price: number
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          interval?: string | null
          is_active?: boolean | null
          name?: string
          price?: number
        }
        Relationships: []
      }
      support_applications: {
        Row: {
          created_at: string
          id: string
          notes: string | null
          program_id: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          notes?: string | null
          program_id: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          notes?: string | null
          program_id?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_applications_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "support_programs"
            referencedColumns: ["id"]
          },
        ]
      }
      support_programs: {
        Row: {
          created_at: string
          description: string | null
          id: string
          institution: string
          is_active: boolean | null
          max_amount: number | null
          name: string
          program_type: string | null
          requirements: Json | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          institution: string
          is_active?: boolean | null
          max_amount?: number | null
          name: string
          program_type?: string | null
          requirements?: Json | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          institution?: string
          is_active?: boolean | null
          max_amount?: number | null
          name?: string
          program_type?: string | null
          requirements?: Json | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          created_at: string
          id: string
          message: string
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          message: string
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          message?: string
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sync_queue: {
        Row: {
          action: string
          created_at: string
          id: string
          record_data: Json
          status: string | null
          synced_at: string | null
          table_name: string
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          record_data: Json
          status?: string | null
          synced_at?: string | null
          table_name: string
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          record_data?: Json
          status?: string | null
          synced_at?: string | null
          table_name?: string
          user_id?: string
        }
        Relationships: []
      }
      tax_periods: {
        Row: {
          created_at: string
          estimated_tax: number | null
          id: string
          period_month: number
          period_year: number
          status: string | null
          total_expenses: number | null
          total_income: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          estimated_tax?: number | null
          id?: string
          period_month: number
          period_year: number
          status?: string | null
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          estimated_tax?: number | null
          id?: string
          period_month?: number
          period_year?: number
          status?: string | null
          total_expenses?: number | null
          total_income?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      taxpayer_profiles: {
        Row: {
          created_at: string
          curp: string | null
          economic_activity: string | null
          fiscal_address: string | null
          fiscal_status: string | null
          id: string
          onboarding_completed: boolean | null
          rfc: string | null
          tax_regime: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          curp?: string | null
          economic_activity?: string | null
          fiscal_address?: string | null
          fiscal_status?: string | null
          id?: string
          onboarding_completed?: boolean | null
          rfc?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          curp?: string | null
          economic_activity?: string | null
          fiscal_address?: string | null
          fiscal_status?: string | null
          id?: string
          onboarding_completed?: boolean | null
          rfc?: string | null
          tax_regime?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      transaction_categories: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          is_default: boolean | null
          name: string
          type: string
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          type: string
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          type?: string
        }
        Relationships: []
      }
      tutorial_progress: {
        Row: {
          completed: boolean | null
          completed_at: string | null
          created_at: string
          id: string
          tutorial_id: string
          user_id: string
        }
        Insert: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          tutorial_id: string
          user_id: string
        }
        Update: {
          completed?: boolean | null
          completed_at?: string | null
          created_at?: string
          id?: string
          tutorial_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tutorial_progress_tutorial_id_fkey"
            columns: ["tutorial_id"]
            isOneToOne: false
            referencedRelation: "tutorials"
            referencedColumns: ["id"]
          },
        ]
      }
      tutorials: {
        Row: {
          content: string | null
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_published: boolean | null
          order_index: number | null
          title: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          title: string
        }
        Update: {
          content?: string | null
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          title?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string
          ends_at: string | null
          id: string
          is_subsidized: boolean | null
          plan_id: string | null
          starts_at: string
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_subsidized?: boolean | null
          plan_id?: string | null
          starts_at?: string
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ends_at?: string | null
          id?: string
          is_subsidized?: boolean | null
          plan_id?: string | null
          starts_at?: string
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "taxpayer" | "accountant" | "admin" | "supervisor"
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
    Enums: {
      app_role: ["taxpayer", "accountant", "admin", "supervisor"],
    },
  },
} as const

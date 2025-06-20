export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      agent_creations: {
        Row: {
          agent_name: string
          company_name: string
          created_at: string
          elevenlabs_agent_id: string | null
          email: string
          id: string
          status: string
          updated_at: string
          user_id: string | null
          website_url: string
        }
        Insert: {
          agent_name: string
          company_name: string
          created_at?: string
          elevenlabs_agent_id?: string | null
          email: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          website_url: string
        }
        Update: {
          agent_name?: string
          company_name?: string
          created_at?: string
          elevenlabs_agent_id?: string | null
          email?: string
          id?: string
          status?: string
          updated_at?: string
          user_id?: string | null
          website_url?: string
        }
        Relationships: []
      }
      call_logs: {
        Row: {
          agent_name: string | null
          audio_url: string | null
          client_name: string | null
          created_at: string | null
          date: string | null
          duration: string | null
          evaluation_result: string | null
          history_item_id: string
          id: string
          messages_count: number | null
          status: string | null
          time: string | null
          transcript: string | null
          type: string | null
          updated_at: string | null
          user_id: string
          voice_id: string | null
          voice_name: string | null
        }
        Insert: {
          agent_name?: string | null
          audio_url?: string | null
          client_name?: string | null
          created_at?: string | null
          date?: string | null
          duration?: string | null
          evaluation_result?: string | null
          history_item_id: string
          id?: string
          messages_count?: number | null
          status?: string | null
          time?: string | null
          transcript?: string | null
          type?: string | null
          updated_at?: string | null
          user_id: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Update: {
          agent_name?: string | null
          audio_url?: string | null
          client_name?: string | null
          created_at?: string | null
          date?: string | null
          duration?: string | null
          evaluation_result?: string | null
          history_item_id?: string
          id?: string
          messages_count?: number | null
          status?: string | null
          time?: string | null
          transcript?: string | null
          type?: string | null
          updated_at?: string | null
          user_id?: string
          voice_id?: string | null
          voice_name?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          role: string
          updated_at: string
          username: string
          vip_access: boolean
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          role?: string
          updated_at?: string
          username: string
          vip_access?: boolean
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          role?: string
          updated_at?: string
          username?: string
          vip_access?: boolean
        }
        Relationships: []
      }
      waitlist_emails: {
        Row: {
          id: string
          email: string
          created_at: string
          status: string
          contacted_at: string | null
          notes: string | null
        }
        Insert: {
          id?: string
          email: string
          created_at?: string
          status?: string
          contacted_at?: string | null
          notes?: string | null
        }
        Update: {
          id?: string
          email?: string
          created_at?: string
          status?: string
          contacted_at?: string | null
          notes?: string | null
        }
        Relationships: []
      }
      access_codes: {
        Row: {
          id: string
          code: string
          description: string | null
          max_uses: number
          current_uses: number
          is_active: boolean
          created_at: string
          expires_at: string | null
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          code: string
          description?: string | null
          max_uses?: number
          current_uses?: number
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          code?: string
          description?: string | null
          max_uses?: number
          current_uses?: number
          is_active?: boolean
          created_at?: string
          expires_at?: string | null
          created_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      access_code_usage: {
        Row: {
          id: string
          access_code_id: string
          used_at: string
          user_email: string | null
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          access_code_id: string
          used_at?: string
          user_email?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          access_code_id?: string
          used_at?: string
          user_email?: string | null
          ip_address?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "access_code_usage_access_code_id_fkey"
            columns: ["access_code_id"]
            isOneToOne: false
            referencedRelation: "access_codes"
            referencedColumns: ["id"]
          }
        ]
      }
      agent_visit_limits: {
        Row: {
          id: string
          agent_id: string
          max_visits: number
          current_visits: number
          is_active: boolean
          created_at: string
          updated_at: string
          notes: string | null
        }
        Insert: {
          id?: string
          agent_id: string
          max_visits?: number
          current_visits?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Update: {
          id?: string
          agent_id?: string
          max_visits?: number
          current_visits?: number
          is_active?: boolean
          created_at?: string
          updated_at?: string
          notes?: string | null
        }
        Relationships: []
      }
      agent_visits: {
        Row: {
          id: string
          agent_id: string
          visited_at: string
          ip_address: string | null
          user_agent: string | null
          referrer: string | null
          session_id: string | null
          blocked: boolean
        }
        Insert: {
          id?: string
          agent_id: string
          visited_at?: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          session_id?: string | null
          blocked?: boolean
        }
        Update: {
          id?: string
          agent_id?: string
          visited_at?: string
          ip_address?: string | null
          user_agent?: string | null
          referrer?: string | null
          session_id?: string | null
          blocked?: boolean
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      validate_and_use_access_code: {
        Args: {
          p_code: string
          p_user_email?: string
          p_ip_address?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      check_and_record_agent_visit: {
        Args: {
          p_agent_id: string
          p_ip_address?: string
          p_user_agent?: string
          p_referrer?: string
          p_session_id?: string
        }
        Returns: Json
      }
      get_agent_visit_stats: {
        Args: {
          p_agent_id: string
        }
        Returns: Json
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

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const

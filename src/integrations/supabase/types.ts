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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      characters: {
        Row: {
          avatar_url: string | null
          background: string | null
          charisma: number
          class: string
          constitution: number
          created_at: string
          dexterity: number
          experience: number
          hit_points: number
          id: string
          intelligence: number
          level: number
          max_hit_points: number
          name: string
          race: string
          strength: number
          updated_at: string
          user_id: string
          wisdom: number
        }
        Insert: {
          avatar_url?: string | null
          background?: string | null
          charisma: number
          class: string
          constitution: number
          created_at?: string
          dexterity: number
          experience?: number
          hit_points: number
          id?: string
          intelligence: number
          level?: number
          max_hit_points: number
          name: string
          race: string
          strength: number
          updated_at?: string
          user_id: string
          wisdom: number
        }
        Update: {
          avatar_url?: string | null
          background?: string | null
          charisma?: number
          class?: string
          constitution?: number
          created_at?: string
          dexterity?: number
          experience?: number
          hit_points?: number
          id?: string
          intelligence?: number
          level?: number
          max_hit_points?: number
          name?: string
          race?: string
          strength?: number
          updated_at?: string
          user_id?: string
          wisdom?: number
        }
        Relationships: []
      }
      conversation_summaries: {
        Row: {
          conversation_id: string
          created_at: string
          id: string
          message_count: number
          messages_end_at: string
          messages_start_at: string
          summary_level: number
          summary_text: string
        }
        Insert: {
          conversation_id: string
          created_at?: string
          id?: string
          message_count?: number
          messages_end_at: string
          messages_start_at: string
          summary_level?: number
          summary_text: string
        }
        Update: {
          conversation_id?: string
          created_at?: string
          id?: string
          message_count?: number
          messages_end_at?: string
          messages_start_at?: string
          summary_level?: number
          summary_text?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_summaries_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          character_id: string | null
          created_at: string
          id: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          character_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          character_id?: string | null
          created_at?: string
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      game_rules: {
        Row: {
          content: string
          created_at: string
          id: string
          keywords: string[]
          priority: number
          section_name: string
          updated_at: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          keywords?: string[]
          priority?: number
          section_name: string
          updated_at?: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          keywords?: string[]
          priority?: number
          section_name?: string
          updated_at?: string
        }
        Relationships: []
      }
      inventory: {
        Row: {
          character_id: string
          created_at: string
          description: string | null
          equipped: boolean
          id: string
          item_name: string
          item_type: string
          quantity: number
        }
        Insert: {
          character_id: string
          created_at?: string
          description?: string | null
          equipped?: boolean
          id?: string
          item_name: string
          item_type?: string
          quantity?: number
        }
        Update: {
          character_id?: string
          created_at?: string
          description?: string | null
          equipped?: boolean
          id?: string
          item_name?: string
          item_type?: string
          quantity?: number
        }
        Relationships: [
          {
            foreignKeyName: "inventory_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          is_archived: boolean
          role: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          is_archived?: boolean
          role: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          is_archived?: boolean
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          character_name: string | null
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          character_name?: string | null
          created_at?: string
          id: string
          updated_at?: string
        }
        Update: {
          character_name?: string | null
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      spell_slots: {
        Row: {
          character_id: string
          created_at: string
          id: string
          slot_level: number
          slots_used: number
          updated_at: string
        }
        Insert: {
          character_id: string
          created_at?: string
          id?: string
          slot_level: number
          slots_used?: number
          updated_at?: string
        }
        Update: {
          character_id?: string
          created_at?: string
          id?: string
          slot_level?: number
          slots_used?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "spell_slots_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
        ]
      }
      story_events: {
        Row: {
          character_id: string
          conversation_id: string | null
          created_at: string
          description: string
          event_type: string
          id: string
          importance: number
          metadata: Json | null
          title: string
        }
        Insert: {
          character_id: string
          conversation_id?: string | null
          created_at?: string
          description: string
          event_type: string
          id?: string
          importance?: number
          metadata?: Json | null
          title: string
        }
        Update: {
          character_id?: string
          conversation_id?: string | null
          created_at?: string
          description?: string
          event_type?: string
          id?: string
          importance?: number
          metadata?: Json | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "story_events_character_id_fkey"
            columns: ["character_id"]
            isOneToOne: false
            referencedRelation: "characters"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "story_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
